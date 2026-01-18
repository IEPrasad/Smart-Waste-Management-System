import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    View,
    TextInput,
    Alert,
    ActivityIndicator,
    FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { CitizenService, Message } from '@/services/citizen';
import { supabase } from '@/lib/supabase';

export default function MessagesScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const themeColors = Colors[colorScheme ?? 'light'];
    const isDark = colorScheme === 'dark';

    const [messageInput, setMessageInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);

    // Placeholder Driver ID (in real app, this would come from a selected pickup or assignment)
    const DRIVER_ID = '00000000-0000-0000-0000-000000000000';

    useEffect(() => {
        loadMessages();
    }, []);

    const loadMessages = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserId(user.id);
                const data = await CitizenService.getMessages(user.id);
                setMessages(data);
            }
        } catch (error) {
            console.error('Error loading messages:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async (text: string = messageInput) => {
        if (!text.trim() || !userId) return;

        setSending(true);
        try {
            await CitizenService.sendMessage(userId, text, DRIVER_ID);
            setMessageInput('');
            await loadMessages(); // Refresh messages
        } catch (error) {
            console.error('Error sending message:', error);
            Alert.alert('Error', 'Failed to send message');
        } finally {
            setSending(false);
        }
    };

    const quickMessages = [
        'When will you arrive?',
        'Please collect from the gate',
        'Running 5 minutes late',
    ];

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#151718' : '#F9FAFB' }}>

            {/* Header */}
            <ThemedView style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={24} color={themeColors.text} />
                </TouchableOpacity>
                <ThemedText type="subtitle">Contact Driver</ThemedText>
                <View style={{ width: 40 }} />
            </ThemedView>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Driver Info Card */}
                <View style={[styles.driverCard, { backgroundColor: themeColors.tint }]}>
                    <View style={styles.driverInfo}>
                        <View style={styles.driverDetails}>
                            <ThemedText style={styles.driverName}>Rasara Heshan</ThemedText>
                            <ThemedText style={styles.driverId}>Driver ID: DRV001</ThemedText>
                        </View>
                    </View>
                </View>

                {/* Previous Messages (Simple List) */}
                <View style={styles.section}>
                    <ThemedText type="defaultSemiBold" style={{ marginBottom: 10 }}>Recent Messages</ThemedText>
                    {loading ? (
                        <ActivityIndicator color={themeColors.tint} />
                    ) : messages.length === 0 ? (
                        <ThemedText style={{ color: '#9CA3AF', fontStyle: 'italic' }}>No messages yet</ThemedText>
                    ) : (
                        messages.map((msg) => (
                            <View
                                key={msg.id}
                                style={[
                                    styles.messageBubble,
                                    msg.sender_id === userId ? styles.sentBubble : styles.receivedBubble,
                                    msg.sender_id === userId ? { backgroundColor: themeColors.tint } : (isDark ? { backgroundColor: '#333' } : { backgroundColor: '#E5E7EB' })
                                ]}
                            >
                                <ThemedText style={{ color: msg.sender_id === userId ? '#FFFFFF' : themeColors.text }}>
                                    {msg.content}
                                </ThemedText>
                            </View>
                        ))
                    )}
                </View>

                {/* Quick Messages */}
                <View style={styles.section}>
                    <ThemedText type="subtitle" style={styles.sectionTitle}>Quick Messages</ThemedText>
                    {quickMessages.map((message, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.quickMessageButton,
                                isDark && { backgroundColor: '#1E1E1E', borderColor: '#333' }
                            ]}
                            onPress={() => handleSendMessage(message)}
                            disabled={sending}
                        >
                            <ThemedText style={styles.quickMessageText}>{message}</ThemedText>
                            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={{ height: 80 }} />
            </ScrollView>

            {/* Message Input */}
            <ThemedView style={styles.inputContainer}>
                <TextInput
                    style={[
                        styles.messageInput,
                        isDark && { backgroundColor: '#1E1E1E', color: '#ECEDEE' }
                    ]}
                    placeholder="Type your message..."
                    placeholderTextColor="#9CA3AF"
                    value={messageInput}
                    onChangeText={setMessageInput}
                    multiline
                />
                <TouchableOpacity
                    style={[styles.sendButton, { backgroundColor: themeColors.tint }]}
                    onPress={() => handleSendMessage()}
                    disabled={sending}
                >
                    {sending ? (
                        <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                        <Ionicons name="send" size={18} color="#FFFFFF" />
                    )}
                </TouchableOpacity>
            </ThemedView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollView: {
        flex: 1,
    },
    driverCard: {
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
    section: {
        paddingHorizontal: 14,
        marginTop: 16,
    },
    sectionTitle: {
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
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingTop: 12,
        paddingBottom: 20,
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
        justifyContent: 'center',
        alignItems: 'center',
    },
    messageBubble: {
        padding: 10,
        borderRadius: 10,
        marginBottom: 8,
        maxWidth: '80%',
    },
    sentBubble: {
        alignSelf: 'flex-end',
        borderBottomRightRadius: 0,
    },
    receivedBubble: {
        alignSelf: 'flex-start',
        borderBottomLeftRadius: 0,
    },
});
