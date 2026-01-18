import React, { useEffect, useState, useRef } from 'react';
import {
    View, Text, StyleSheet, Modal, TouchableOpacity, FlatList, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator
} from 'react-native';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { supabase } from '../../../../lib/supabase';

interface DriverChatModalProps {
    visible: boolean;
    pickup: any; // Contains pickup_id, citizen info, completed_at, status
    driverId: string | null;
    onClose: () => void;
}

export default function DriverChatModal({ visible, pickup, driverId, onClose }: DriverChatModalProps) {
    const [messages, setMessages] = useState<any[]>([]);
    const [text, setText] = useState('');
    const [isExpired, setIsExpired] = useState(false);
    const [loading, setLoading] = useState(true);
    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
        // 🛑 CHANGE: Use 'any' or 'number' to avoid the TS2322 error
        let pollInterval: any;

        if (visible && pickup?.id && driverId) {
            checkExpiry();
            fetchMessages(true);
            markAsRead();

            const channel = supabase
                .channel(`chat:${pickup.id}`)
                .on(
                    'postgres_changes',
                    { event: 'INSERT', schema: 'public', table: 'messages', filter: `pickup_id=eq.${pickup.id}` },
                    (payload) => {
                        setMessages((currentMessages) => {
                            const exists = currentMessages.find(m => m.id === payload.new.id);
                            return exists ? currentMessages : [payload.new, ...currentMessages];
                        });
                        markAsRead();
                    }
                )
                .subscribe();

            // ✅ FIX: Using window.setInterval ensures it treats the ID as a number
            pollInterval = setInterval(() => {
                fetchMessages(false);
                markAsRead();
            }, 5000);

            return () => {
                supabase.removeChannel(channel);
                if (pollInterval) clearInterval(pollInterval);
            };
        }
    }, [visible, pickup?.id]);

    // 1. Check if chat should be locked (60 min rule)
    const checkExpiry = () => {
        if (pickup.status === 'completed' && pickup.completed_at) {
            const completedTime = new Date(pickup.completed_at).getTime();
            const now = Date.now();
            const diffMinutes = (now - completedTime) / (1000 * 60);

            if (diffMinutes > 60) {
                setIsExpired(true);
            } else {
                setIsExpired(false);
            }
        } else {
            setIsExpired(false);
        }
    };

    // 2. Fetch Messages (with optional loading state)
    const fetchMessages = async (showLoading = false) => {
        if (showLoading) setLoading(true);

        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('pickup_id', pickup.id)
            .order('created_at', { ascending: false });

        if (data) {
            setMessages(data);
        }
        setLoading(false);
    };

    // 3. Mark messages as read
    const markAsRead = async () => {
        if (!driverId || !pickup?.id) return;
        await supabase
            .from('messages')
            .update({ is_read: true })
            .eq('pickup_id', pickup.id)
            .eq('receiver_id', driverId)
            .eq('is_read', false);
    };

    // 4. Send Message
    const handleSend = async () => {
        if (!text.trim() || !driverId) return;

        const msgText = text.trim();
        setText('');

        const { error } = await supabase.from('messages').insert({
            pickup_id: pickup.id,
            sender_id: driverId,
            receiver_id: pickup.citizen_id,
            text: msgText,
            is_read: false
        });

        if (error) {
            alert("Failed to send");
            console.error(error);
        } else {
            // Immediately refresh local state after sending for better feel
            fetchMessages(false);
        }
    };

    // Render a single message bubble
    const renderMessage = ({ item }: { item: any }) => {
        const isMe = item.sender_id === driverId;
        const time = new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        return (
            <View style={[styles.msgRow, isMe ? styles.msgRowMe : styles.msgRowThem]}>
                <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
                    <Text style={[styles.msgText, isMe ? styles.textMe : styles.textThem]}>{item.text}</Text>
                    <Text style={[styles.msgTime, isMe ? styles.timeMe : styles.timeThem]}>
                        {time} {isMe && (item.is_read ? ' • Read' : ' • Sent')}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose} style={styles.backBtn}>
                        <MaterialIcons name="arrow-back" size={24} color="#333" />
                    </TouchableOpacity>

                    <View style={styles.headerInfo}>
                        <Text style={styles.headerName}>{pickup?.citizen_name || "Citizen"}</Text>
                        <Text style={styles.headerSub}>{pickup?.gn_division}</Text>
                    </View>

                    {isExpired && (
                        <View style={styles.expiredBadge}>
                            <Text style={styles.expiredText}>CLOSED</Text>
                        </View>
                    )}
                </View>

                {/* Messages Area */}
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : undefined}
                    style={{ flex: 1 }}
                    keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
                >
                    {loading ? (
                        <ActivityIndicator size="large" color="#00e5bc" style={{ marginTop: 50 }} />
                    ) : (
                        <FlatList
                            ref={flatListRef}
                            data={messages}
                            renderItem={renderMessage}
                            keyExtractor={item => item.id}
                            inverted
                            contentContainerStyle={styles.chatList}
                            ListEmptyComponent={
                                <Text style={styles.emptyText}>No messages yet. Start the conversation!</Text>
                            }
                        />
                    )}

                    {/* Input Bar */}
                    <View style={styles.inputBar}>
                        {isExpired ? (
                            <Text style={styles.lockedText}>Chat closed (60 min grace period ended).</Text>
                        ) : (
                            <>
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="Type a message..."
                                    value={text}
                                    onChangeText={setText}
                                    multiline
                                />
                                <TouchableOpacity
                                    style={[styles.sendBtn, !text.trim() && styles.sendBtnDisabled]}
                                    onPress={handleSend}
                                    disabled={!text.trim()}
                                >
                                    <Ionicons name="send" size={20} color="white" />
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#EFE7DE' },
    header: {
        flexDirection: 'row', alignItems: 'center', padding: 15,
        backgroundColor: '#fff', elevation: 4, borderBottomWidth: 1, borderBottomColor: '#ddd', paddingTop: 20
    },
    backBtn: { marginRight: 15 },
    headerInfo: { flex: 1 },
    headerName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    headerSub: { fontSize: 12, color: '#666' },
    expiredBadge: { backgroundColor: '#FFEBEE', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
    expiredText: { color: '#D32F2F', fontSize: 10, fontWeight: 'bold' },
    chatList: { padding: 15 },
    emptyText: { textAlign: 'center', color: '#999', marginTop: 20, transform: [{ scaleY: -1 }] },
    msgRow: { marginBottom: 10, flexDirection: 'row' },
    msgRowMe: { justifyContent: 'flex-end' },
    msgRowThem: { justifyContent: 'flex-start' },
    bubble: { maxWidth: '80%', padding: 10, borderRadius: 10, elevation: 1 },
    bubbleMe: { backgroundColor: '#DCF8C6', borderTopRightRadius: 0 },
    bubbleThem: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 0 },
    msgText: { fontSize: 16 },
    textMe: { color: '#000' },
    textThem: { color: '#000' },
    msgTime: { fontSize: 10, alignSelf: 'flex-end', marginTop: 4 },
    timeMe: { color: '#555' },
    timeThem: { color: '#999' },
    inputBar: {
        flexDirection: 'row', alignItems: 'center', padding: 10,
        backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#ddd'
    },
    textInput: {
        flex: 1, backgroundColor: '#f0f0f0', borderRadius: 20,
        paddingHorizontal: 15, paddingVertical: 10, fontSize: 16, maxHeight: 100
    },
    sendBtn: {
        backgroundColor: '#00e5bc', width: 45, height: 45, borderRadius: 22.5,
        justifyContent: 'center', alignItems: 'center', marginLeft: 10
    },
    sendBtnDisabled: { backgroundColor: '#ccc' },
    lockedText: { color: '#666', fontStyle: 'italic', textAlign: 'center', flex: 1, padding: 10 }
});