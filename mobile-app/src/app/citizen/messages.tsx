import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  getActivePickup,
  getDriverInfo,
  getMessages,
  sendMessage,
  markMessagesAsRead,
  subscribeToMessages,
  unsubscribeFromMessages,
  getCurrentUserId,
} from '@/services/pickupChatService';
import type { ChatMessage, PickupInfo } from '@/services/pickupChatService';

export default function MessagesScreen() {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);

  // State
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [pickup, setPickup] = useState<PickupInfo | null>(null);
  const [driverInfo, setDriverInfo] = useState<any>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [channel, setChannel] = useState<any>(null);

  const quickMessages = [
    'When will you arrive?',
    'Please collect from the gate',
    'Running 5 minutes late',
  ];

  // Load data on mount
  useEffect(() => {
    loadChatData();

    return () => {
      // Cleanup subscription on unmount
      if (channel) {
        unsubscribeFromMessages(channel);
      }
    };
  }, []);

  const loadChatData = async () => {
    try {
      setLoading(true);

      // Get current user ID
      const userId = await getCurrentUserId();
      if (!userId) {
        Alert.alert('Error', 'User not found. Please log in again.');
        router.back();
        return;
      }
      setCurrentUserId(userId);

      // Get active pickup
      const { data: pickupData, error: pickupError } = await getActivePickup(userId);

      if (pickupError || !pickupData) {
        Alert.alert(
          'No Active Pickup',
          'You do not have an active pickup. Chat will be available once a driver is assigned.',
          [{ text: 'OK', onPress: () => router.back() }]
        );
        return;
      }

      setPickup(pickupData);

      // Get driver info
      if (pickupData.driver_id) {
        const { data: driver } = await getDriverInfo(pickupData.driver_id);
        setDriverInfo(driver);
      }

      // Load existing messages
      const { data: messagesData } = await getMessages(pickupData.id);
      if (messagesData) {
        setMessages(messagesData);
        // Mark messages as read
        await markMessagesAsRead(pickupData.id, userId);
      }

      // Subscribe to new messages
      const messageChannel = subscribeToMessages(pickupData.id, (newMessage) => {
        setMessages((prev) => [...prev, newMessage]);
        // Mark as read if from driver
        if (newMessage.receiver_id === userId) {
          markMessagesAsRead(pickupData.id, userId);
        }
        // Scroll to bottom
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      });
      setChannel(messageChannel);
    } catch (error) {
      console.error('Error loading chat data:', error);
      Alert.alert('Error', 'Failed to load chat');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (text?: string) => {
    const messageText = text || messageInput;

    if (!messageText.trim() || !pickup || !currentUserId) return;

    try {
      setSending(true);

      const { data, error } = await sendMessage(
        pickup.id,
        currentUserId,
        pickup.driver_id,
        messageText
      );

      if (error) {
        Alert.alert('Error', error);
        return;
      }

      if (data) {
        // Message will be added via subscription
        setMessageInput('');
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleQuickMessage = (message: string) => {
    handleSendMessage(message);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={styles.loadingText}>Loading chat...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Contact Driver</Text>
      </View>

      {/* Driver Info Card */}
      <View style={styles.driverCard}>
        <View style={styles.driverInfo}>
          <View style={styles.driverDetails}>
            <Text style={styles.driverName}>
              {driverInfo?.full_name || 'Driver'}
            </Text>
            <Text style={styles.driverId}>
              {driverInfo?.vehicles?.vehicle_no || 'No vehicle assigned'}
            </Text>
          </View>
        </View>
      </View>

      {/* Messages List */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="chatbubbles-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyStateText}>No messages yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Start a conversation with your driver
            </Text>
          </View>
        ) : (
          messages.map((message) => {
            const isSentByMe = message.sender_id === currentUserId;
            return (
              <View
                key={message.id}
                style={[
                  styles.messageBubble,
                  isSentByMe ? styles.myMessage : styles.theirMessage,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    isSentByMe ? styles.myMessageText : styles.theirMessageText,
                  ]}
                >
                  {message.text}
                </Text>
                <Text
                  style={[
                    styles.messageTime,
                    isSentByMe ? styles.myMessageTime : styles.theirMessageTime,
                  ]}
                >
                  {formatTime(message.created_at)}
                </Text>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Quick Messages */}
      <View style={styles.quickMessagesContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickMessagesContent}
        >
          {quickMessages.map((message, index) => (
            <TouchableOpacity
              key={index}
              style={styles.quickMessageChip}
              onPress={() => handleQuickMessage(message)}
              disabled={sending}
            >
              <Text style={styles.quickMessageChipText}>{message}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Message Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.messageInput}
          placeholder="Type your message..."
          placeholderTextColor="#9CA3AF"
          value={messageInput}
          onChangeText={setMessageInput}
          multiline
          maxLength={500}
          editable={!sending}
        />
        <TouchableOpacity
          style={[styles.sendButton, sending && styles.sendButtonDisabled]}
          onPress={() => handleSendMessage()}
          disabled={sending || !messageInput.trim()}
        >
          {sending ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Ionicons name="send" size={18} color="#FFFFFF" />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: '#6B7280',
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
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
  },
  driverCard: {
    backgroundColor: '#10B981',
    marginHorizontal: 14,
    marginTop: 12,
    marginBottom: 8,
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
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 14,
  },
  messagesContent: {
    paddingVertical: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#10B981',
    borderBottomRightRadius: 4,
  },
  theirMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  myMessageText: {
    color: '#FFFFFF',
  },
  theirMessageText: {
    color: '#000000',
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
  },
  myMessageTime: {
    color: '#FFFFFF',
    opacity: 0.8,
    textAlign: 'right',
  },
  theirMessageTime: {
    color: '#6B7280',
  },
  quickMessagesContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  quickMessagesContent: {
    paddingHorizontal: 14,
    gap: 8,
  },
  quickMessageChip: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  quickMessageChipText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 40,
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
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 15,
    maxHeight: 100,
    color: '#000000',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
});