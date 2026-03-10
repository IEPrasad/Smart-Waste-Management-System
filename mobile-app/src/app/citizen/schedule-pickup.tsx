import React, { useState } from 'react';
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
import { supabase } from '@/lib/supabase';
import { createWasteRequest } from '@/services/wasteRequests';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
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

  // ── Calendar helpers ──────────────────────────────────────────────────────
  const getDaysInMonth = (m: number, y: number) => new Date(y, m + 1, 0).getDate();
  const getFirstDay = (m: number, y: number) => new Date(y, m, 1).getDay();

  const calendarDays = (() => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDay(currentMonth, currentYear);
    const days: { day: number; isCurrentMonth: boolean; isToday: boolean; isPast: boolean; isFuture: boolean }[] = [];

    const prevDays = getDaysInMonth(currentMonth - 1, currentYear);
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({ day: prevDays - i, isCurrentMonth: false, isToday: false, isPast: true, isFuture: false });
    }

    const isCurMonth = currentMonth === today.getMonth() && currentYear === today.getFullYear();
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i, isCurrentMonth: true,
        isToday: isCurMonth && i === today.getDate(),
        isPast: isCurMonth && i < today.getDate(),
        isFuture: isCurMonth && i > today.getDate(),
      });
    }
    return days;
  })();

  const toggleWaste = (type: 'compost' | 'recycling') =>
    setWasteTypes(p => ({ ...p, [type]: !p[type] }));

  // ── Submit ────────────────────────────────────────────────────────────────
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

      Alert.alert(
        '✅ Pickup Scheduled!',
        `Date: ${MONTH_NAMES[currentMonth]} ${selectedDate}, ${currentYear}\nTime: ${h}:${m} ${ap}\nWaste Types: ${types.join(', ')}`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const bothSelected = wasteTypes.compost && wasteTypes.recycling;
  const anySelected = wasteTypes.compost || wasteTypes.recycling;

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar barStyle="light-content" backgroundColor="#065F46" />

      {/* ── Gradient header ── */}
      <LinearGradient colors={['#065F46', '#047857']} style={styles.headerGradient}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Schedule Pickup</Text>
          <Text style={styles.headerSub}>Today's pickup request</Text>
        </View>
        <View style={styles.headerIcon}>
          <Ionicons name="calendar-outline" size={22} color="rgba(255,255,255,0.8)" />
        </View>
      </LinearGradient>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* ── Pickup info banner ── */}
        <View style={styles.infoBanner}>
          <View style={styles.infoBannerIcon}>
            <Ionicons name="information-circle" size={20} color="#059669" />
          </View>
          <Text style={styles.infoBannerText}>
            Only <Text style={styles.infoBold}>today</Text> is available for pickup scheduling. Please select <Text style={styles.infoBold}>one</Text> type of waste below.
          </Text>
          
        </View>

        {/* ── Calendar card ── */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="calendar" size={18} color="#059669" />
            <Text style={styles.cardTitle}>Select Date</Text>
          </View>

          {/* Month display */}
          <View style={styles.monthRow}>
            <View style={styles.monthPill}>
              <Ionicons name="calendar-outline" size={14} color="#059669" />
              <Text style={styles.monthPillText}>{MONTH_NAMES[currentMonth]} {currentYear}</Text>
            </View>
          </View>

          {/* Day labels */}
          <View style={styles.dayLabelRow}>
            {DAY_LABELS.map(d => (
              <Text key={d} style={styles.dayLabel}>{d}</Text>
            ))}
          </View>

          {/* Calendar grid */}
          <View style={styles.calGrid}>
            {calendarDays.map((item, idx) => {
              const isSelected = selectedDate === item.day && item.isCurrentMonth;
              return (
                <TouchableOpacity
                  key={idx}
                  style={styles.dayCell}
                  onPress={() => { if (item.isToday) setSelectedDate(item.day); }}
                  disabled={!item.isToday}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.dayCellInner,
                    item.isToday && styles.todayCell,
                    isSelected && styles.selectedCell,
                  ]}>
                    <Text style={[
                      styles.dayText,
                      !item.isCurrentMonth && styles.dayTextGhost,
                      (item.isPast || item.isFuture) && styles.dayTextMuted,
                      item.isToday && styles.dayTextToday,
                      isSelected && styles.dayTextSelected,
                    ]}>
                      {item.day}
                    </Text>
                    {item.isToday && <View style={styles.todayDot} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ── Waste type card ── */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="trash-outline" size={18} color="#059669" />
            <Text style={styles.cardTitle}>Waste Type <Text style={styles.req}>*</Text></Text>
          </View>

          {/* Compost */}
          <TouchableOpacity
            style={[styles.wasteRow, wasteTypes.compost && styles.wasteRowActiveGreen]}
            onPress={() => toggleWaste('compost')}
            activeOpacity={0.8}
          >
            <View style={[styles.wasteIconBox, { backgroundColor: wasteTypes.compost ? '#D1FAE5' : '#F3F4F6' }]}>
              <Ionicons name="leaf" size={22} color={wasteTypes.compost ? '#059669' : '#9CA3AF'} />
            </View>
            <View style={styles.wasteInfo}>
              <Text style={[styles.wasteName, wasteTypes.compost && { color: '#059669' }]}>Compost</Text>
              <Text style={styles.wasteDesc}>Food scraps, yard waste, organic material</Text>
            </View>
            <View style={[styles.checkBox, wasteTypes.compost && { backgroundColor: '#059669', borderColor: '#059669' }]}>
              {wasteTypes.compost && <Ionicons name="checkmark" size={14} color="#fff" />}
            </View>
          </TouchableOpacity>

          {/* Recycling */}
          <TouchableOpacity
            style={[styles.wasteRow, wasteTypes.recycling && styles.wasteRowActiveBlue, { marginBottom: 0 }]}
            onPress={() => toggleWaste('recycling')}
            activeOpacity={0.8}
          >
            <View style={[styles.wasteIconBox, { backgroundColor: wasteTypes.recycling ? '#DBEAFE' : '#F3F4F6' }]}>
              <Ionicons name="sync" size={22} color={wasteTypes.recycling ? '#1D4ED8' : '#9CA3AF'} />
            </View>
            <View style={styles.wasteInfo}>
              <Text style={[styles.wasteName, wasteTypes.recycling && { color: '#1D4ED8' }]}>Recycling</Text>
              <Text style={styles.wasteDesc}>Plastic, paper, cardboard, glass, metal</Text>
            </View>
            <View style={[styles.checkBox, wasteTypes.recycling && { backgroundColor: '#1D4ED8', borderColor: '#1D4ED8' }]}>
              {wasteTypes.recycling && <Ionicons name="checkmark" size={14} color="#fff" />}
            </View>
          </TouchableOpacity>

          {/* Selection summary pill */}
          {anySelected && (
            <View style={styles.selectionPill}>
              <Ionicons name="checkmark-circle" size={14} color="#059669" />
              <Text style={styles.selectionPillText}>
                {bothSelected ? 'Both types selected' : wasteTypes.compost ? 'Compost selected' : 'Recycling selected'}
              </Text>
            </View>
          )}
        </View>

        {/* ── Comment card ── */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="chatbox-outline" size={18} color="#059669" />
            <Text style={styles.cardTitle}>Comment <Text style={styles.opt}>(optional)</Text></Text>
          </View>
          <TextInput
            style={styles.textArea}
            placeholder="Any special instructions for the driver…"
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={4}
            value={comment}
            onChangeText={setComment}
            textAlignVertical="top"
          />
          {comment.length > 0 && (
            <Text style={styles.charHint}>{comment.length} characters</Text>
          )}
        </View>

        {/* ── Confirm button ── */}
        <TouchableOpacity
          style={[styles.confirmBtn, isSubmitting && { opacity: 0.65 }]}
          onPress={handleConfirm}
          disabled={isSubmitting}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={['#10B981', '#059669']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.confirmGradient}
          >
            {isSubmitting
              ? <ActivityIndicator color="#fff" />
              : <>
                <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                <Text style={styles.confirmText}>Confirm Pickup</Text>
              </>
            }
          </LinearGradient>
        </TouchableOpacity>

        {/* Footer note */}
        <View style={styles.footer}>
          <Ionicons name="shield-checkmark-outline" size={14} color="#9CA3AF" />
          <Text style={styles.footerText}>Pickup requests are processed same-day</Text>
        </View>

        <View style={{ height: 48 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F3F4F6' },

  // Header
  headerGradient: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 52 : (StatusBar.currentHeight ?? 24) + 8,
    paddingBottom: 16,
  },
  backBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  headerIcon: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#fff', letterSpacing: 0.3 },
  headerSub: { fontSize: 11, color: 'rgba(255,255,255,0.75)', marginTop: 1 },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 18 },

  // Info banner
  infoBanner: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: '#ECFDF5', borderRadius: 12, padding: 14, marginBottom: 16,
    borderWidth: 1, borderColor: '#A7F3D0',
  },
  infoBannerIcon: { marginTop: 1 },
  infoBannerText: { flex: 1, fontSize: 13, color: '#065F46', lineHeight: 19 },
  infoBold: { fontWeight: '700' },

  // Card
  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  req: { color: '#DC2626' },
  opt: { fontSize: 12, fontWeight: '400', color: '#9CA3AF' },

  // Calendar
  monthRow: { alignItems: 'center', marginBottom: 14 },
  monthPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#ECFDF5', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
  },
  monthPillText: { fontSize: 14, fontWeight: '700', color: '#059669' },
  dayLabelRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 6 },
  dayLabel: { width: 36, textAlign: 'center', fontSize: 11, fontWeight: '600', color: '#9CA3AF' },

  calGrid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: -34 },
  dayCell: { width: '14.28%', aspectRatio: 1, justifyContent: 'center', alignItems: 'center' },
  dayCellInner: { width: 34, height: 34, justifyContent: 'center', alignItems: 'center', borderRadius: 10 },

  todayCell: { borderWidth: 2, borderColor: '#10B981', backgroundColor: '#ECFDF5' },
  selectedCell: { backgroundColor: '#10B981' },
  todayDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#059669', position: 'absolute', bottom: 3 },

  dayText: { fontSize: 13, fontWeight: '400', color: '#374151' },
  dayTextGhost: { color: '#E5E7EB' },
  dayTextMuted: { color: '#D1D5DB' },
  dayTextToday: { color: '#059669', fontWeight: '700' },
  dayTextSelected: { color: '#fff', fontWeight: '700' },

  // Waste type
  wasteRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 14, borderRadius: 12, marginBottom: 10,
    borderWidth: 1.5, borderColor: '#E5E7EB', backgroundColor: '#F9FAFB',
  },
  wasteRowActiveGreen: { borderColor: '#10B981', backgroundColor: '#F0FDF4' },
  wasteRowActiveBlue: { borderColor: '#3B82F6', backgroundColor: '#EFF6FF' },
  wasteIconBox: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  wasteInfo: { flex: 1 },
  wasteName: { fontSize: 17, fontWeight: '700', color: '#111827', marginBottom: 2 },
  wasteDesc: { fontSize: 14, color: '#9CA3AF' },
  checkBox: {
    width: 24, height: 24, borderRadius: 7,
    borderWidth: 2, borderColor: '#D1D5DB',
    justifyContent: 'center', alignItems: 'center',
  },
  selectionPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#ECFDF5', borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 7, marginTop: 10, alignSelf: 'flex-start',
  },
  selectionPillText: { fontSize: 12, fontWeight: '600', color: '#059669' },

  // Comment
  textArea: {
    borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 12,
    padding: 12, fontSize: 16, color: '#111827',
    minHeight: 100, backgroundColor: '#F9FAFB',
  },
  charHint: { fontSize: 11, color: '#9CA3AF', marginTop: 6, textAlign: 'right' },

  // Confirm button
  confirmBtn: { borderRadius: 14, overflow: 'hidden', marginBottom: 14 },
  confirmGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 15 },
  confirmText: { fontSize: 16, fontWeight: '700', color: '#fff', letterSpacing: 0.2 },

  // Footer
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  footerText: { fontSize: 12, color: '#9CA3AF' },
});
