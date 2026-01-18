import React, { useEffect, useState, useRef } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput,
    KeyboardAvoidingView, Platform, ActivityIndicator, StatusBar
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';

export default function CitizenChatScreen() {
    const router = useRouter();
    const { pickupId, driverId, driverName } = useLocalSearchParams();

    const [messages, setMessages] = useState<any[]>([]);
    const [text, setText] = useState('');
    const [isExpired, setIsExpired] = useState(false);
    const [loading, setLoading] = useState(true);
    const [myId, setMyId] = useState<string | null>(null);
    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
        // 🛑 CHANGE: Declare as any
        let pollInterval: any;

        const initChat = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setMyId(user.id);
                fetchMessages(true);
                checkExpiry();
                markAsRead(user.id);

                const channel = supabase
                    .channel(`chat:${pickupId}`)
                    .on(
                        'postgres_changes',
                        { event: 'INSERT', schema: 'public', table: 'messages', filter: `pickup_id=eq.${pickupId}` },
                        (payload) => {
                            setMessages((currentMessages) => {
                                const exists = currentMessages.find(m => m.id === payload.new.id);
                                return exists ? currentMessages : [payload.new, ...currentMessages];
                            });
                            markAsRead(user.id);
                        }
                    )
                    .subscribe();

                // ✅ FIX: Use setInterval here
                pollInterval = setInterval(() => {
                    fetchMessages(false);
                    markAsRead(user.id);
                }, 5000);

                return channel;
            }
        };

        const channelPromise = initChat();

        return () => {
            channelPromise.then(channel => {
                if (channel) supabase.removeChannel(channel);
            });
            // ✅ Ensure clearInterval works with the 'any' type
            if (pollInterval) clearInterval(pollInterval);
        };
    }, [pickupId]);

    const checkExpiry = async () => {
        const { data: pickup } = await supabase
            .from('pickups')
            .select('status, completed_at')
            .eq('id', pickupId)
            .single();

        if (pickup?.status === 'completed' && pickup.completed_at) {
            const completedTime = new Date(pickup.completed_at).getTime();
            const now = Date.now();
            const diffMinutes = (now - completedTime) / (1000 * 60);
            if (diffMinutes > 60) setIsExpired(true);
        }
    };

    const fetchMessages = async (showLoading = false) => {
        if (showLoading) setLoading(true);
        const { data } = await supabase
            .from('messages')
            .select('*')
            .eq('pickup_id', pickupId)
            .order('created_at', { ascending: false });

        if (data) {
            setMessages(data);
        }
        setLoading(false);
    };

    const markAsRead = async (userId: string) => {
        if (!userId || !pickupId) return;
        await supabase
            .from('messages')
            .update({ is_read: true })
            .eq('pickup_id', pickupId)
            .eq('receiver_id', userId)
            .eq('is_read', false);
    };

    const handleSend = async () => {
        if (!text.trim() || !myId || !driverId) return;

        const msgText = text.trim();
        setText('');

        const { error } = await supabase.from('messages').insert({
            pickup_id: pickupId,
            sender_id: myId,
            receiver_id: driverId,
            text: msgText,
            is_read: false
        });

        if (error) {
            console.error("Send Error:", error);
        } else {
            fetchMessages(false); // Immediate update after sending
        }
    };

    const renderMessage = ({ item }: { item: any }) => {
        const isMe = item.sender_id === myId;
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
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <MaterialIcons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <View style={styles.headerInfo}>
                    <Text style={styles.headerName}>Collector: {driverName || 'Driver'}</Text>
                    <Text style={styles.headerStatus}>{isExpired ? 'Chat Closed' : 'Live Chat'}</Text>
                </View>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
            >
                {loading ? (
                    <ActivityIndicator size="large" color="#10B981" style={{ marginTop: 50 }} />
                ) : (
                    <FlatList
                        ref={flatListRef}
                        data={messages}
                        renderItem={renderMessage}
                        keyExtractor={item => item.id}
                        inverted
                        contentContainerStyle={styles.chatList}
                        ListEmptyComponent={
                            <Text style={styles.emptyText}>Send a message to coordinate your pickup!</Text>
                        }
                    />
                )}

                {/* Input Bar */}
                <View style={styles.inputBar}>
                    {isExpired ? (
                        <View style={styles.lockedContainer}>
                            <MaterialIcons name="lock" size={16} color="#666" />
                            <Text style={styles.lockedText}>Chat closed (60 min after pickup).</Text>
                        </View>
                    ) : (
                        <>
                            <TextInput
                                style={styles.textInput}
                                placeholder="Message collector..."
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
    );
}

const styles = StyleSheet.create({
<<<<<<< HEAD
    container: { flex: 1, backgroundColor: '#F3F4F6' },
    header: {
        flexDirection: 'row', alignItems: 'center', padding: 15,
        backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E5E7EB',
        paddingTop: Platform.OS === 'ios' ? 50 : 15
    },
    backBtn: { marginRight: 15 },
    headerInfo: { flex: 1 },
    headerName: { fontSize: 16, fontWeight: '700', color: '#111827' },
    headerStatus: { fontSize: 12, color: '#10B981', fontWeight: '500' },
    chatList: { padding: 15 },
    emptyText: { textAlign: 'center', color: '#9CA3AF', marginTop: 20, transform: [{ scaleY: -1 }] },
    msgRow: { marginBottom: 12, flexDirection: 'row' },
    msgRowMe: { justifyContent: 'flex-end' },
    msgRowThem: { justifyContent: 'flex-start' },
    bubble: { maxWidth: '80%', padding: 12, borderRadius: 18, elevation: 1 },
    bubbleMe: { backgroundColor: '#10B981', borderBottomRightRadius: 2 },
    bubbleThem: { backgroundColor: '#FFFFFF', borderBottomLeftRadius: 2 },
    msgText: { fontSize: 15, lineHeight: 20 },
    textMe: { color: '#fff' },
    textThem: { color: '#111827' },
    msgTime: { fontSize: 10, alignSelf: 'flex-end', marginTop: 4 },
    timeMe: { color: '#D1FAE5' },
    timeThem: { color: '#9CA3AF' },
    inputBar: {
        flexDirection: 'row', alignItems: 'center', padding: 12,
        backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#E5E7EB'
    },
    textInput: {
        flex: 1, backgroundColor: '#F9FAFB', borderRadius: 24,
        paddingHorizontal: 16, paddingVertical: 10, fontSize: 15, maxHeight: 100,
        borderWidth: 1, borderColor: '#E5E7EB'
    },
    sendBtn: {
        backgroundColor: '#10B981', width: 44, height: 44, borderRadius: 22,
        justifyContent: 'center', alignItems: 'center', marginLeft: 10
    },
    sendBtnDisabled: { backgroundColor: '#D1FAE5' },
    lockedContainer: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 10 },
    lockedText: { color: '#6B7280', fontSize: 13, marginLeft: 6, fontStyle: 'italic' }
});
=======
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
  },
  scrollView: {
    flex: 1,
  },
  driverCard: {
    backgroundColor: '#10B981',
    marginHorizontal: 14,
    marginTop: 12,
    borderRadius: 14,
    padding: 16,
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  driverDetails: {
    flex: 1,
  },
  driverName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  driverId: {
    fontSize: 13,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  actionButtons: {
    flexDirection: 'row',
    marginHorizontal: 14,
    marginTop: 12,
    gap: 10,
  },
  callButton: {
    flex: 1,
    backgroundColor: '#3B82F6',
    borderRadius: 10,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  callButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  smsButton: {
    flex: 1,
    backgroundColor: '#10B981',
    borderRadius: 10,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  smsButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  section: {
    paddingHorizontal: 14,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 10,
  },
  quickMessageButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  quickMessageText: {
    fontSize: 14,
    color: '#000000',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 50,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 8,
  },
  messageInput: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',

>>>>>>> e7393df1d1cc80afebee49cc1c0fda8c9ef114a5
