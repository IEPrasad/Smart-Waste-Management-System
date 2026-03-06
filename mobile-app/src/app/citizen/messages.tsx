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
import { LinearGradient } from 'expo-linear-gradient';
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

const QUICK_MESSAGES = [
  'When will you arrive?',
  'Please collect from the gate',
  'Running 5 minutes late',
  'I am at home',
];

export default function MessagesScreen() {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);

  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [pickup, setPickup] = useState<PickupInfo | null>(null);
  const [driverInfo, setDriverInfo] = useState<any>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [channel, setChannel] = useState<any>(null);

  useEffect(() => {
    loadChatData();
    return () => { if (channel) unsubscribeFromMessages(channel); };
  }, []);

  const loadChatData = async () => {
    try {
      setLoading(true);
      const userId = await getCurrentUserId();
      if (!userId) {
        Alert.alert('Error', 'Please log in again.');
        router.back(); return;
      }
      setCurrentUserId(userId);

      const { data: pickupData, error: pickupError } = await getActivePickup(userId);
      if (pickupError || !pickupData) {
        Alert.alert(
          'No Active Pickup',
          'Chat will be available once a driver is assigned.',
          [{ text: 'OK', onPress: () => router.back() }]
        );
        return;
      }
      setPickup(pickupData);

      if (pickupData.driver_id) {
        const { data: driver } = await getDriverInfo(pickupData.driver_id);
        setDriverInfo(driver);
      }

      const { data: msgs } = await getMessages(pickupData.id);
      if (msgs) {
        setMessages(msgs);
        await markMessagesAsRead(pickupData.id, userId);
      }

      const ch = subscribeToMessages(pickupData.id, (newMsg) => {
        setMessages(p => [...p, newMsg]);
        if (newMsg.receiver_id === userId) markMessagesAsRead(pickupData.id, userId);
        setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
      });
      setChannel(ch);
    } catch {
      Alert.alert('Error', 'Failed to load chat');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (text?: string) => {
    const msg = text || messageInput;
    if (!msg.trim() || !pickup || !currentUserId) return;

    try {
      setSending(true);
      const { data, error } = await sendMessage(pickup.id, currentUserId, pickup.driver_id, msg);
      if (error) { Alert.alert('Error', error); return; }
      if (data) {
        setMessageInput('');
        setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
      }
    } catch {
      Alert.alert('Error', 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (ts: string) =>
    new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" color="#059669" />
        <Text style={styles.loadingText}>Loading chat…</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <StatusBar barStyle="light-content" backgroundColor="#065F46" />

      {/* ── Gradient header ── */}
      <LinearGradient colors={['#065F46', '#047857']} style={styles.headerGradient}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Contact Driver</Text>
          <Text style={styles.headerSub}>Pickup chat</Text>
        </View>
        <View style={styles.headerIconBox}>
          <Ionicons name="chatbubbles-outline" size={22} color="rgba(255,255,255,0.8)" />
        </View>
      </LinearGradient>

      {/* ── Driver info card ── */}
      <View style={styles.driverCard}>
        <LinearGradient
          colors={['#065F46', '#059669']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={styles.driverGradient}
        >
          <View style={styles.driverAvatarCircle}>
            <Ionicons name="person" size={22} color="#059669" />
          </View>
          <View style={styles.driverMeta}>
            <Text style={styles.driverName}>{driverInfo?.full_name || 'Driver'}</Text>
            <View style={styles.driverVehicleRow}>
              <Ionicons name="car-outline" size={13} color="rgba(255,255,255,0.85)" />
              <Text style={styles.driverVehicle}>
                {driverInfo?.vehicles?.vehicle_no || 'No vehicle assigned'}
              </Text>
            </View>
          </View>
          <View style={styles.onlineDot} />
        </LinearGradient>
      </View>

      {/* ── Messages ── */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.msgScroll}
        contentContainerStyle={styles.msgContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.length === 0 ? (
          <View style={styles.emptyWrap}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="chatbubbles-outline" size={36} color="#059669" />
            </View>
            <Text style={styles.emptyTitle}>No messages yet</Text>
            <Text style={styles.emptySub}>Start a conversation with your driver</Text>
          </View>
        ) : (
          messages.map(msg => {
            const mine = msg.sender_id === currentUserId;
            return (
              <View key={msg.id} style={[styles.bubbleWrap, mine ? styles.bubbleWrapMine : styles.bubbleWrapTheirs]}>
                {!mine && (
                  <View style={styles.avatarMini}>
                    <Ionicons name="person" size={14} color="#fff" />
                  </View>
                )}
                <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleTheirs]}>
                  <Text style={[styles.bubbleText, mine ? styles.bubbleTextMine : styles.bubbleTextTheirs]}>
                    {msg.text}
                  </Text>
                  <Text style={[styles.bubbleTime, mine ? styles.bubbleTimeMine : styles.bubbleTimeTheirs]}>
                    {formatTime(msg.created_at)}
                    {mine && (
                      <Text>  <Ionicons name="checkmark-done" size={11} color="rgba(255,255,255,0.8)" /></Text>
                    )}
                  </Text>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* ── Quick replies ── */}
      <View style={styles.quickBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickContent}
        >
          {QUICK_MESSAGES.map((m, i) => (
            <TouchableOpacity
              key={i}
              style={styles.quickChip}
              onPress={() => handleSend(m)}
              disabled={sending}
              activeOpacity={0.75}
            >
              <Ionicons name="flash-outline" size={12} color="#059669" />
              <Text style={styles.quickChipText}>{m}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* ── Input bar ── */}
      <View style={styles.inputBar}>
        <View style={styles.inputWrap}>
          <Ionicons name="chatbox-outline" size={18} color="#9CA3AF" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Type your message…"
            placeholderTextColor="#9CA3AF"
            value={messageInput}
            onChangeText={setMessageInput}
            multiline
            maxLength={500}
            editable={!sending}
          />
        </View>
        <TouchableOpacity
          style={[styles.sendBtn, (!messageInput.trim() || sending) && styles.sendBtnDisabled]}
          onPress={() => handleSend()}
          disabled={sending || !messageInput.trim()}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={['#065F46', '#059669']}
            style={styles.sendGradient}
          >
            {sending
              ? <ActivityIndicator size="small" color="#fff" />
              : <Ionicons name="send" size={18} color="#fff" />
            }
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F3F4F6' },

  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F3F4F6' },
  loadingText: { marginTop: 12, fontSize: 14, color: '#6B7280' },

  // Header
  headerGradient: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 52 : (StatusBar.currentHeight ?? 24) + 8,
    paddingBottom: 14,
  },
  backBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  headerCenter: { flex: 1, marginLeft: 8 },
  headerIconBox: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#fff', letterSpacing: 0.3 },
  headerSub: { fontSize: 11, color: 'rgba(255,255,255,0.75)', marginTop: 1 },

  // Driver card
  driverCard: {
    marginHorizontal: 14, marginTop: 12, marginBottom: 8,
    borderRadius: 16, overflow: 'hidden',
    shadowColor: '#059669', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 8, elevation: 5,
  },
  driverGradient: {
    flexDirection: 'row', alignItems: 'center',
    padding: 14, gap: 12,
  },
  driverAvatarCircle: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: '#fff',
    justifyContent: 'center', alignItems: 'center',
  },
  driverMeta: { flex: 1 },
  driverName: { fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 4 },
  driverVehicleRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  driverVehicle: { fontSize: 13, color: 'rgba(255,255,255,0.9)' },
  onlineDot: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: '#34D399',
    borderWidth: 2, borderColor: '#fff',
  },

  // Messages
  msgScroll: { flex: 1, paddingHorizontal: 14 },
  msgContent: { paddingVertical: 16 },

  emptyWrap: { alignItems: 'center', paddingVertical: 52 },
  emptyIconCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#D1FAE5', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#374151', marginBottom: 6 },
  emptySub: { fontSize: 13, color: '#9CA3AF', textAlign: 'center' },

  bubbleWrap: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 10 },
  bubbleWrapMine: { justifyContent: 'flex-end' },
  bubbleWrapTheirs: { justifyContent: 'flex-start', gap: 8 },

  avatarMini: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#059669',
    justifyContent: 'center', alignItems: 'center', marginBottom: 2,
  },

  bubble: {
    maxWidth: '75%', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18,
  },
  bubbleMine: {
    backgroundColor: '#047857', borderBottomRightRadius: 4,
    shadowColor: '#065F46', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2, shadowRadius: 4, elevation: 2,
  },
  bubbleTheirs: {
    backgroundColor: '#fff', borderBottomLeftRadius: 4,
    borderWidth: 1, borderColor: '#E5E7EB',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 3, elevation: 1,
  },

  bubbleText: { fontSize: 15, lineHeight: 21 },
  bubbleTextMine: { color: '#fff' },
  bubbleTextTheirs: { color: '#111827' },

  bubbleTime: { fontSize: 11, marginTop: 4 },
  bubbleTimeMine: { color: 'rgba(255,255,255,0.75)', textAlign: 'right' },
  bubbleTimeTheirs: { color: '#9CA3AF' },

  // Quick messages
  quickBar: {
    backgroundColor: '#fff', paddingVertical: 10,
    borderTopWidth: 1, borderTopColor: '#E5E7EB',
  },
  quickContent: { paddingHorizontal: 14, gap: 8 },
  quickChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#ECFDF5', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 8,
    borderWidth: 1, borderColor: '#A7F3D0',
  },
  quickChipText: { fontSize: 13, color: '#065F46', fontWeight: '500' },

  // Input bar
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 10,
    paddingHorizontal: 14, paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 28 : 36,
    backgroundColor: '#fff',
    borderTopWidth: 1, borderTopColor: '#E5E7EB',
  },
  inputWrap: {
    flex: 1, flexDirection: 'row', alignItems: 'flex-end',
    backgroundColor: '#F3F4F6', borderRadius: 24,
    paddingHorizontal: 14, paddingVertical: 8,
    borderWidth: 1.5, borderColor: '#E5E7EB',
  },
  inputIcon: { marginRight: 8, marginBottom: 2 },
  input: {
    flex: 1, fontSize: 15, color: '#111827',
    maxHeight: 100, paddingVertical: 0,
  },

  sendBtn: { borderRadius: 24, overflow: 'hidden' },
  sendBtnDisabled: { opacity: 0.5 },
  sendGradient: { width: 46, height: 46, justifyContent: 'center', alignItems: 'center' },
});