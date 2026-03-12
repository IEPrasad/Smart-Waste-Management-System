import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, Modal, TouchableOpacity, FlatList, ActivityIndicator
} from 'react-native';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { supabase } from '../../../../lib/supabase';


interface DriverMessagesModalProps {
    visible: boolean;
    onClose: () => void;
    onOpenChat: (pickup: any) => void; // Parent handles opening the actual chat
    driverId: string | null;
}

// Data shape for our list
interface ConversationRow {
    pickup_id: string;
    citizen_name: string;
    gn_division: string;
    last_message: string;
    last_message_time: string | null; // For sorting
    unread_count: number;
    pickup_data: any; // Store full object to pass to chat
}

export default function DriverMessagesModal({ visible, onClose, onOpenChat }: DriverMessagesModalProps) {
    const [conversations, setConversations] = useState<ConversationRow[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (visible) {
            fetchConversations();
        }
    }, [visible]);

    const fetchConversations = async () => {
        setLoading(true);
        const today = new Date().toISOString().split('T')[0];

        // 1. Get Current Driver
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // 2. Get ALL Pickups for TODAY (Assigned to this driver)
        const { data: pickups, error } = await supabase
            .from('pickups')
            .select(`
                *,
                citizens ( full_name, gn_division )
            `)
            .eq('driver_id', user.id)
            .eq('scheduled_date', today);

        if (!pickups || error) {
            console.error("Error fetching pickups for chat:", error);
            setLoading(false);
            return;
        }

        // 3. For each pickup, fetch the LATEST message & Unread count
        // (Using Promise.all to do it in parallel for speed)
        const rows = await Promise.all(pickups.map(async (p: any) => {
            // A. Get Last Message
            const { data: msgs } = await supabase
                .from('messages')
                .select('*')
                .eq('pickup_id', p.id)
                .order('created_at', { ascending: false })
                .limit(1);

            // B. Get Unread Count (Messages sent TO me, NOT read)
            const { count } = await supabase
                .from('messages')
                .select('*', { count: 'exact', head: true })
                .eq('pickup_id', p.id)
                .eq('receiver_id', user.id)
                .eq('is_read', false);

            const lastMsg = msgs?.[0];

            return {
                pickup_id: p.id,
                citizen_name: p.citizens?.full_name || "Unknown Citizen",
                gn_division: p.citizens?.gn_division || "Unknown Area",
                last_message: lastMsg?.text || "No messages yet",
                last_message_time: lastMsg?.created_at || null, // Null means older than any message
                unread_count: count || 0,
                pickup_data: { ...p, citizen_name: p.citizens?.full_name } // Flatten for easier use
            };
        }));

        // 4. Sort: Recent messages at top. If no messages, put them at bottom.
        const sorted = rows.sort((a, b) => {
            if (!a.last_message_time) return 1;
            if (!b.last_message_time) return -1;
            return new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime();
        });

        setConversations(sorted);
        setLoading(false);
    };

    // Helper to format time like WhatsApp (12:45 PM)
    const formatTime = (isoString: string | null) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const renderItem = ({ item }: { item: ConversationRow }) => {
        const hasUnread = item.unread_count > 0;

        return (
            <TouchableOpacity
                style={[styles.row, hasUnread && styles.rowUnread]}
                onPress={() => {
                    onClose(); // Close this list
                    onOpenChat(item.pickup_data); // Open actual chat
                }}
            >
                {/* Avatar */}
                <View style={styles.avatarContainer}>
                    <FontAwesome5 name="user" size={20} color="#fff" />
                </View>

                {/* Text Content */}
                <View style={styles.contentContainer}>
                    <View style={styles.topLine}>
                        <Text style={[styles.name, hasUnread && styles.boldText]}>
                            {item.citizen_name}
                        </Text>
                        <Text style={[styles.time, hasUnread && styles.greenText]}>
                            {formatTime(item.last_message_time)}
                        </Text>
                    </View>

                    <View style={styles.bottomLine}>
                        <Text style={[styles.messagePreview, hasUnread && styles.blackText]} numberOfLines={1}>
                            {item.last_message}
                        </Text>
                        {hasUnread && (
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>{item.unread_count}</Text>
                            </View>
                        )}
                    </View>
                    <Text style={styles.areaText}>{item.gn_division}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Messages</Text>
                    <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                        <MaterialIcons name="close" size={28} color="#333" />
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color="#00e5bc" style={{ marginTop: 50 }} />
                ) : (
                    <FlatList
                        data={conversations}
                        keyExtractor={(item) => item.pickup_id}
                        renderItem={renderItem}
                        contentContainerStyle={styles.list}
                        ListEmptyComponent={
                            <View style={styles.emptyState}>
                                <Ionicons name="chatbubbles-outline" size={50} color="#ccc" />
                                <Text style={styles.emptyText}>No pickups scheduled for today.</Text>
                            </View>
                        }
                    />
                )}
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        padding: 20, borderBottomWidth: 1, borderBottomColor: '#eee', paddingTop: 20
    },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#333' },
    closeBtn: { padding: 5 },

    list: { paddingBottom: 50 },

    // ROW STYLES
    row: {
        flexDirection: 'row', padding: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
        alignItems: 'center'
    },
    rowUnread: { backgroundColor: '#F0FDF4' }, // Very light green background for unread

    avatarContainer: {
        width: 50, height: 50, borderRadius: 25, backgroundColor: '#ccc',
        justifyContent: 'center', alignItems: 'center', marginRight: 15
    },

    contentContainer: { flex: 1 },

    topLine: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
    name: { fontSize: 16, color: '#333', fontWeight: '600' },
    time: { fontSize: 12, color: '#999' },

    bottomLine: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    messagePreview: { fontSize: 14, color: '#666', flex: 1, marginRight: 10 },

    areaText: { fontSize: 11, color: '#999', marginTop: 2 },

    // Unread Styles
    boldText: { fontWeight: 'bold', color: '#000' },
    blackText: { color: '#000', fontWeight: '500' },
    greenText: { color: '#25D366', fontWeight: 'bold' },

    badge: {
        backgroundColor: '#25D366', borderRadius: 10, minWidth: 20, height: 20,
        justifyContent: 'center', alignItems: 'center', paddingHorizontal: 6
    },
    badgeText: { color: 'white', fontSize: 10, fontWeight: 'bold' },

    emptyState: { alignItems: 'center', marginTop: 100 },
    emptyText: { color: '#999', fontSize: 16, marginTop: 10 }
});