import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, ScrollView, TextInput, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getActivePickup, getDriverInfo, getMessages, sendMessage, markMessagesAsRead, subscribeToMessages, unsubscribeFromMessages, getCurrentUserId } from '@/services/pickupChatService';
import type { ChatMessage, PickupInfo } from '@/services/pickupChatService';

const QUICK_MESSAGES = ['When will you arrive?', 'Please collect from the gate', 'Running 5 minutes late', 'I am at home'];

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
      if (!userId) { Alert.alert('Error', 'Please log in again.'); router.back(); return; }
      setCurrentUserId(userId);

      const { data: pickupData, error: pickupError } = await getActivePickup(userId);
      if (pickupError || !pickupData) {
        Alert.alert('No Active Pickup', 'Chat will be available once a driver is assigned.', [{ text: 'OK', onPress: () => router.back() }]);
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
    } catch { Alert.alert('Error', 'Failed to load chat'); } finally { setLoading(false); }
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
    } catch { Alert.alert('Error', 'Failed to send message'); } finally { setSending(false); }
  };

  const formatTime = (ts: string) => new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  if (loading) {
    return (
      <View style={s.loadWrap}>
        <ActivityIndicator size="large" color="#059669" />
        <Text style={s.loadText}>Loading chat…</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={s.root} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar barStyle="light-content" backgroundColor="#065F46" />

      <LinearGradient colors={['#065F46', '#047857']} style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.btn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>Contact Driver</Text>
          <Text style={s.headerSub}>Pickup chat</Text>
        </View>
        <View style={s.btn}>
          <Ionicons name="chatbubbles-outline" size={22} color="rgba(255,255,255,0.8)" />
        </View>
      </LinearGradient>

      <View style={s.driverCard}>
        <LinearGradient colors={['#065F46', '#059669']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.driverGrad}>
          <View style={s.avatar}>
            <Ionicons name="person" size={22} color="#059669" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.driverName}>{driverInfo?.full_name || 'Driver'}</Text>
            <View style={s.row}>
              <Ionicons name="car-outline" size={13} color="rgba(255,255,255,0.85)" />
              <Text style={s.vehicle}>{driverInfo?.vehicles?.vehicle_no || 'No vehicle assigned'}</Text>
            </View>
          </View>
          <View style={s.onlineDot} />
        </LinearGradient>
      </View>

      <ScrollView ref={scrollViewRef} style={s.msgScroll} contentContainerStyle={s.msgContent} showsVerticalScrollIndicator={false} onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}>
        {messages.length === 0 ? (
          <View style={s.empty}>
            <View style={s.emptyIcon}>
              <Ionicons name="chatbubbles-outline" size={36} color="#059669" />
            </View>
            <Text style={s.emptyTitle}>No messages yet</Text>
            <Text style={s.emptySub}>Start a conversation with your driver</Text>
          </View>
        ) : (
          messages.map(msg => {
            const mine = msg.sender_id === currentUserId;
            return (
              <View key={msg.id} style={[s.bubbleWrap, mine ? s.bubbleWrapMine : s.row]}>
                {!mine && <View style={s.avatarMini}><Ionicons name="person" size={14} color="#fff" /></View>}
                <View style={[s.bubble, mine ? s.bubbleMine : s.bubbleTheirs]}>
                  <Text style={[s.bubbleText, mine ? s.textWhite : s.textDark]}>{msg.text}</Text>
                  <Text style={[s.bubbleTime, mine ? s.timeWhite : s.timeGray]}>
                    {formatTime(msg.created_at)}
                    {mine && <Text>  <Ionicons name="checkmark-done" size={11} color="rgba(255,255,255,0.8)" /></Text>}
                  </Text>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      <View style={s.quickBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.quickContent}>
          {QUICK_MESSAGES.map((m, i) => (
            <TouchableOpacity key={i} style={s.quickChip} onPress={() => handleSend(m)} disabled={sending} activeOpacity={0.75}>
              <Ionicons name="flash-outline" size={12} color="#059669" />
              <Text style={s.quickText}>{m}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={s.inputBar}>
        <View style={s.inputWrap}>
          <Ionicons name="chatbox-outline" size={18} color="#9CA3AF" style={{ marginRight: 8 }} />
          <TextInput style={s.input} placeholder="Type your message…" placeholderTextColor="#9CA3AF" value={messageInput} onChangeText={setMessageInput} multiline maxLength={500} editable={!sending} />
        </View>
        <TouchableOpacity style={[s.sendBtn, (!messageInput.trim() || sending) && { opacity: 0.5 }]} onPress={() => handleSend()} disabled={sending || !messageInput.trim()} activeOpacity={0.85}>
          <LinearGradient colors={['#065F46', '#059669']} style={s.sendGrad}>
            {sending ? <ActivityIndicator size="small" color="#fff" /> : <Ionicons name="send" size={18} color="#fff" />}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F3F4F6' },
  loadWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F3F4F6' },
  loadText: { marginTop: 12, fontSize: 14, color: '#6B7280' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: Platform.OS === 'ios' ? 52 : (StatusBar.currentHeight ?? 24) + 8, paddingBottom: 14 },
  btn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  headerCenter: { flex: 1, marginLeft: 8 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#fff', letterSpacing: 0.3 },
  headerSub: { fontSize: 11, color: 'rgba(255,255,255,0.75)', marginTop: 1 },
  driverCard: { marginHorizontal: 14, marginTop: 12, marginBottom: 8, borderRadius: 16, overflow: 'hidden', elevation: 5 },
  driverGrad: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  avatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  driverName: { fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  vehicle: { fontSize: 13, color: 'rgba(255,255,255,0.9)' },
  onlineDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#34D399', borderWidth: 2, borderColor: '#fff' },
  msgScroll: { flex: 1, paddingHorizontal: 14 },
  msgContent: { paddingVertical: 16 },
  empty: { alignItems: 'center', paddingVertical: 52 },
  emptyIcon: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#D1FAE5', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#374151', marginBottom: 6 },
  emptySub: { fontSize: 13, color: '#9CA3AF', textAlign: 'center' },
  bubbleWrap: { marginBottom: 10, alignItems: 'flex-end' },
  bubbleWrapMine: { justifyContent: 'flex-end' },
  avatarMini: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#059669', justifyContent: 'center', alignItems: 'center', marginBottom: 2, marginRight: 8 },
  bubble: { maxWidth: '75%', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18 },
  bubbleMine: { backgroundColor: '#047857', borderBottomRightRadius: 4, elevation: 2 },
  bubbleTheirs: { backgroundColor: '#fff', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#E5E7EB' },
  bubbleText: { fontSize: 15, lineHeight: 21 },
  textWhite: { color: '#fff' },
  textDark: { color: '#111827' },
  bubbleTime: { fontSize: 11, marginTop: 4 },
  timeWhite: { color: 'rgba(255,255,255,0.75)', textAlign: 'right' },
  timeGray: { color: '#9CA3AF' },
  quickBar: { backgroundColor: '#fff', paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  quickContent: { paddingHorizontal: 14, gap: 8 },
  quickChip: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#ECFDF5', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: '#A7F3D0' },
  quickText: { fontSize: 13, color: '#065F46', fontWeight: '500' },
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, paddingHorizontal: 14, paddingTop: 10, paddingBottom: Platform.OS === 'ios' ? 28 : 36, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  inputWrap: { flex: 1, flexDirection: 'row', alignItems: 'flex-end', backgroundColor: '#F3F4F6', borderRadius: 24, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1.5, borderColor: '#E5E7EB' },
  input: { flex: 1, fontSize: 15, color: '#111827', maxHeight: 100, paddingVertical: 0 },
  sendBtn: { borderRadius: 24, overflow: 'hidden' },
  sendGrad: { width: 46, height: 46, justifyContent: 'center', alignItems: 'center' },
});