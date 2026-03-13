import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, ScrollView, TextInput, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '@/lib/supabase';
import { createWasteRequest } from '@/services/wasteRequests';

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function SchedulePickupScreen() {
  const router = useRouter();
  const today = new Date();
  const todayDate = today.getDate();
  const todayMonth = today.getMonth();
  const todayYear = today.getFullYear();
  const [selectedDate, setSelectedDate] = useState(todayDate);
  const [currentMonth] = useState(todayMonth);
  const [currentYear] = useState(todayYear);
  const [wasteTypes, setWasteTypes] = useState({ compost: false, recycling: false });
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getDaysInMonth = (m: number, y: number) => new Date(y, m + 1, 0).getDate();
  const getFirstDay = (m: number, y: number) => new Date(y, m, 1).getDay();

  const calendarDays = (() => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDay(currentMonth, currentYear);
    const days: { day: number; isCurrentMonth: boolean; isToday: boolean; isPast: boolean; isFuture: boolean }[] = [];
    const prevDays = getDaysInMonth(currentMonth - 1, currentYear);
    for (let i = firstDay - 1; i >= 0; i--) days.push({ day: prevDays - i, isCurrentMonth: false, isToday: false, isPast: true, isFuture: false });
    const isCurMonth = currentMonth === today.getMonth() && currentYear === today.getFullYear();
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, isCurrentMonth: true, isToday: isCurMonth && i === today.getDate(), isPast: isCurMonth && i < today.getDate(), isFuture: isCurMonth && i > today.getDate() });
    }
    return days;
  })();

  const toggleWaste = (type: 'compost' | 'recycling') => setWasteTypes(p => ({ ...p, [type]: !p[type] }));

  const handleConfirm = async () => {
    if (!selectedDate) { Alert.alert('Required', 'Please select a date.'); return; }
    const types: string[] = [];
    if (wasteTypes.compost) types.push('Compost');
    if (wasteTypes.recycling) types.push('Recycling');
    if (!types.length) { Alert.alert('Required', 'Please select at least one waste type.'); return; }
    setIsSubmitting(true);
    try {
      const { data: userData, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userData?.user?.id) throw new Error(userErr?.message || 'Unable to find your account');
      const { error } = await createWasteRequest(userData.user.id, types, new Date(), comment || undefined);
      if (error) throw new Error(error);
      const now = new Date();
      const h = now.getHours() % 12 || 12;
      const m = now.getMinutes().toString().padStart(2, '0');
      const ap = now.getHours() >= 12 ? 'PM' : 'AM';
      Alert.alert('✅ Pickup Scheduled!', `Date: ${MONTH_NAMES[currentMonth]} ${selectedDate}, ${currentYear}\nTime: ${h}:${m} ${ap}\nWaste Types: ${types.join(', ')}`, [{ text: 'OK', onPress: () => router.back() }]);
    } catch (e) { Alert.alert('Error', e instanceof Error ? e.message : 'Something went wrong.'); } finally { setIsSubmitting(false); }
  };

  const bothSelected = wasteTypes.compost && wasteTypes.recycling;
  const anySelected = wasteTypes.compost || wasteTypes.recycling;

  return (
    <KeyboardAvoidingView style={s.root} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar barStyle="light-content" backgroundColor="#065F46" />

      <LinearGradient colors={['#065F46', '#047857']} style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.btn}><Ionicons name="arrow-back" size={22} color="#fff" /></TouchableOpacity>
        <View><Text style={s.headerTitle}>Schedule Pickup</Text><Text style={s.headerSub}>Today's pickup request</Text></View>
        <View style={s.btn}><Ionicons name="calendar-outline" size={22} color="rgba(255,255,255,0.8)" /></View>
      </LinearGradient>

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={s.infoBanner}>
          <View style={s.infoIcon}><Ionicons name="information-circle" size={20} color="#059669" /></View>
          <Text style={s.infoText}>Only <Text style={s.bold}>today</Text> is available for pickup scheduling. Please select <Text style={s.bold}>one</Text> type of waste below.</Text>
        </View>

        <View style={s.card}>
          <View style={s.cardHeader}><Ionicons name="calendar" size={18} color="#059669" /><Text style={s.cardTitle}>Select Date</Text></View>
          <View style={s.monthRow}>
            <View style={s.monthPill}><Ionicons name="calendar-outline" size={14} color="#059669" /><Text style={s.monthText}>{MONTH_NAMES[currentMonth]} {currentYear}</Text></View>
          </View>
          <View style={s.dayLabelRow}>{DAY_LABELS.map(d => <Text key={d} style={s.dayLabel}>{d}</Text>)}</View>
          <View style={s.calGrid}>
            {calendarDays.map((item, idx) => {
              const isSelected = selectedDate === item.day && item.isCurrentMonth;
              return (
                <TouchableOpacity key={idx} style={s.dayCell} onPress={() => { if (item.isToday) setSelectedDate(item.day); }} disabled={!item.isToday} activeOpacity={0.7}>
                  <View style={[s.dayCellInner, item.isToday && s.todayCell, isSelected && s.selectedCell]}>
                    <Text style={[s.dayText, !item.isCurrentMonth && s.dayTextGhost, (item.isPast || item.isFuture) && s.dayTextMuted, item.isToday && s.dayTextToday, isSelected && s.dayTextSelected]}>{item.day}</Text>
                    {item.isToday && <View style={s.todayDot} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={s.card}>
          <View style={s.cardHeader}><Ionicons name="trash-outline" size={18} color="#059669" /><Text style={s.cardTitle}>Waste Type <Text style={s.req}>*</Text></Text></View>
          <TouchableOpacity style={[s.wasteRow, wasteTypes.compost && s.wasteActive]} onPress={() => toggleWaste('compost')} activeOpacity={0.8}>
            <View style={[s.wasteIcon, { backgroundColor: wasteTypes.compost ? '#D1FAE5' : '#F3F4F6' }]}><Ionicons name="leaf" size={22} color={wasteTypes.compost ? '#059669' : '#9CA3AF'} /></View>
            <View style={s.wasteInfo}><Text style={[s.wasteName, wasteTypes.compost && { color: '#059669' }]}>Compost</Text><Text style={s.wasteDesc}>Food scraps, yard waste, organic material</Text></View>
            <View style={[s.checkBox, wasteTypes.compost && { backgroundColor: '#059669', borderColor: '#059669' }]}>{wasteTypes.compost && <Ionicons name="checkmark" size={14} color="#fff" />}</View>
          </TouchableOpacity>
          <TouchableOpacity style={[s.wasteRow, wasteTypes.recycling && s.wasteActiveBlue, { marginBottom: 0 }]} onPress={() => toggleWaste('recycling')} activeOpacity={0.8}>
            <View style={[s.wasteIcon, { backgroundColor: wasteTypes.recycling ? '#DBEAFE' : '#F3F4F6' }]}><Ionicons name="sync" size={22} color={wasteTypes.recycling ? '#1D4ED8' : '#9CA3AF'} /></View>
            <View style={s.wasteInfo}><Text style={[s.wasteName, wasteTypes.recycling && { color: '#1D4ED8' }]}>Recycling</Text><Text style={s.wasteDesc}>Plastic, paper, cardboard, glass, metal</Text></View>
            <View style={[s.checkBox, wasteTypes.recycling && { backgroundColor: '#1D4ED8', borderColor: '#1D4ED8' }]}>{wasteTypes.recycling && <Ionicons name="checkmark" size={14} color="#fff" />}</View>
          </TouchableOpacity>
          {anySelected && <View style={s.selectionPill}><Ionicons name="checkmark-circle" size={14} color="#059669" /><Text style={s.selectionText}>{bothSelected ? 'Both types selected' : wasteTypes.compost ? 'Compost selected' : 'Recycling selected'}</Text></View>}
        </View>

        <View style={s.card}>
          <View style={s.cardHeader}><Ionicons name="chatbox-outline" size={18} color="#059669" /><Text style={s.cardTitle}>Comment <Text style={s.opt}>(optional)</Text></Text></View>
          <TextInput style={s.textArea} placeholder="Add any special instructions…" placeholderTextColor="#9CA3AF" multiline numberOfLines={3} value={comment} onChangeText={setComment} textAlignVertical="top" maxLength={150} />
          <Text style={s.charCount}>{comment.length} / 150</Text>
        </View>

        <TouchableOpacity style={[s.confirmBtn, isSubmitting && { opacity: 0.65 }]} onPress={handleConfirm} disabled={isSubmitting} activeOpacity={0.85}>
          <LinearGradient colors={['#047857', '#059669']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.confirmGrad}>
            {isSubmitting ? <><ActivityIndicator color="#fff" /><Text style={s.confirmText}>Submitting…</Text></> : <><Ionicons name="checkmark-circle-outline" size={18} color="#fff" /><Text style={s.confirmText}>Confirm Pickup</Text></>}
          </LinearGradient>
        </TouchableOpacity>
        <View style={{ height: 32 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F3F4F6' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: Platform.OS === 'ios' ? 52 : (StatusBar.currentHeight ?? 24) + 8, paddingBottom: 16 },
  btn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#fff', letterSpacing: 0.3 },
  headerSub: { fontSize: 11, color: 'rgba(255,255,255,0.75)', marginTop: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 20 },
  infoBanner: { flexDirection: 'row', backgroundColor: '#ECFDF5', borderRadius: 12, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: '#A7F3D0' },
  infoIcon: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#D1FAE5', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  infoText: { flex: 1, fontSize: 13, color: '#047857', lineHeight: 18 },
  bold: { fontWeight: '700' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 14, elevation: 2 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#111827' },
  req: { color: '#DC2626' },
  opt: { fontSize: 12, fontWeight: '400', color: '#9CA3AF' },
  monthRow: { marginBottom: 14 },
  monthPill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#ECFDF5', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, alignSelf: 'flex-start', borderWidth: 1, borderColor: '#A7F3D0' },
  monthText: { fontSize: 13, fontWeight: '600', color: '#059669' },
  dayLabelRow: { flexDirection: 'row', marginBottom: 8 },
  dayLabel: { flex: 1, fontSize: 12, fontWeight: '600', color: '#6B7280', textAlign: 'center' },
  calGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: { width: '14.2857%', aspectRatio: 1, padding: 2 },
  dayCellInner: { flex: 1, justifyContent: 'center', alignItems: 'center', borderRadius: 8 },
  todayCell: { backgroundColor: '#ECFDF5', borderWidth: 1.5, borderColor: '#A7F3D0' },
  selectedCell: { backgroundColor: '#059669', borderColor: '#047857' },
  dayText: { fontSize: 14, fontWeight: '500', color: '#374151' },
  dayTextGhost: { color: '#D1D5DB' },
  dayTextMuted: { color: '#9CA3AF' },
  dayTextToday: { color: '#059669', fontWeight: '700' },
  dayTextSelected: { color: '#fff', fontWeight: '700' },
  todayDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#059669', marginTop: 2 },
  wasteRow: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, borderWidth: 1.5, borderColor: '#E5E7EB', marginBottom: 10, backgroundColor: '#F9FAFB' },
  wasteActive: { borderColor: '#A7F3D0', backgroundColor: '#ECFDF5' },
  wasteActiveBlue: { borderColor: '#BFDBFE', backgroundColor: '#EFF6FF' },
  wasteIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  wasteInfo: { flex: 1 },
  wasteName: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 2 },
  wasteDesc: { fontSize: 12, color: '#6B7280', lineHeight: 16 },
  checkBox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: '#D1D5DB', backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  selectionPill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#ECFDF5', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, alignSelf: 'flex-start', borderWidth: 1, borderColor: '#A7F3D0' },
  selectionText: { fontSize: 12, color: '#059669', fontWeight: '600' },
  textArea: { borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 12, padding: 12, fontSize: 14, color: '#111827', minHeight: 80, backgroundColor: '#F9FAFB' },
  charCount: { fontSize: 11, color: '#9CA3AF', marginTop: 6, textAlign: 'right' },
  confirmBtn: { borderRadius: 14, overflow: 'hidden', marginBottom: 14 },
  confirmGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 15 },
  confirmText: { fontSize: 16, fontWeight: '700', color: '#fff', letterSpacing: 0.2 },
});