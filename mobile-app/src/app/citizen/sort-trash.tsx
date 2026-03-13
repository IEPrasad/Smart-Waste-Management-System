import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, ScrollView, Alert, ActivityIndicator, RefreshControl, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getPickupHistory, getWasteSummary, getCurrentUserId } from '@/services/pickupHistoryService';
import type { PickupHistoryItem, WasteSummary } from '@/services/pickupHistoryService';

type Category = 'compost' | 'recycling';

const CAT_CONFIG: Record<Category, { icon: React.ComponentProps<typeof Ionicons>['name']; label: string; color: string; bg: string; gradientColors: [string, string] }> = {
  compost: { icon: 'leaf', label: 'Compost', color: '#059669', bg: '#D1FAE5', gradientColors: ['#065F46', '#047857'] },
  recycling: { icon: 'sync', label: 'Recycling', color: '#0369A1', bg: '#DBEAFE', gradientColors: ['#1E3A5F', '#1D4ED8'] },
};

export default function SortTrashScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<Category>('compost');
  const [pickupHistory, setPickupHistory] = useState<PickupHistoryItem[]>([]);
  const [wasteSummary, setWasteSummary] = useState<WasteSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const userId = await getCurrentUserId();
      if (!userId) { Alert.alert('Error', 'Please log in again.'); return; }
      const [histRes, sumRes] = await Promise.all([getPickupHistory(userId), getWasteSummary(userId)]);
      if (histRes.data) setPickupHistory(histRes.data);
      if (sumRes.data) setWasteSummary(sumRes.data);
    } catch { Alert.alert('Error', 'Failed to load pickup history'); } finally { setLoading(false); setRefreshing(false); }
  };

  const onRefresh = () => { setRefreshing(true); loadData(); };
  const handleHelp = () => Alert.alert('♻️ Sorting Guide', 'Compost: Food waste, vegetable scraps, coffee grounds, yard waste\n\nRecycling: Plastic bottles, paper, cardboard, metal cans, glass');

  const filteredItems = pickupHistory.filter(item => selectedCategory === 'compost' ? item.compost_weight > 0 : item.recycling_weight > 0);
  const totalCombinedWeight = wasteSummary?.total_overall ?? 0;
  const cfg = CAT_CONFIG[selectedCategory];

  if (loading) return (<View style={s.loadWrap}><ActivityIndicator size="large" color="#10B981" /><Text style={s.loadText}>Loading history…</Text></View>);

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="#065F46" />

      <LinearGradient colors={cfg.gradientColors} style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.btn}><Ionicons name="arrow-back" size={22} color="#fff" /></TouchableOpacity>
        <Text style={s.headerTitle}>Waste History</Text>
        <TouchableOpacity onPress={handleHelp} style={s.btn}><Ionicons name="help-circle-outline" size={24} color="rgba(255,255,255,0.85)" /></TouchableOpacity>
      </LinearGradient>

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[cfg.color]} tintColor={cfg.color} />}>
        <LinearGradient colors={cfg.gradientColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.heroCard}>
          <View style={s.heroDecor} />
          <View style={s.heroTop}>
            <View style={s.heroIcon}><Ionicons name={cfg.icon} size={22} color="#fff" /></View>
            <Text style={s.heroLabel}>Total Waste Weight</Text>
          </View>
          <Text style={s.heroValue}>{totalCombinedWeight.toFixed(0)} g</Text>
          <View style={s.statsStrip}>
            <View style={s.statItem}><Text style={s.statVal}>{(wasteSummary?.total_compost ?? 0).toFixed(0)} g</Text><Text style={s.statLbl}>Compost</Text></View>
            <View style={s.statDiv} />
            <View style={s.statItem}><Text style={s.statVal}>{(wasteSummary?.total_recycling ?? 0).toFixed(0)} g</Text><Text style={s.statLbl}>Recycling</Text></View>
            <View style={s.statDiv} />
            <View style={s.statItem}><Text style={s.statVal}>{wasteSummary?.pickup_count ?? 0}</Text><Text style={s.statLbl}>Pickups</Text></View>
          </View>
        </LinearGradient>

        <View style={s.tabRow}>
          {(Object.entries(CAT_CONFIG) as [Category, typeof CAT_CONFIG[Category]][]).map(([key, c]) => {
            const active = selectedCategory === key;
            return (
              <TouchableOpacity key={key} style={[s.tab, active && { backgroundColor: c.bg, borderColor: c.color }]} onPress={() => setSelectedCategory(key)} activeOpacity={0.75}>
                <View style={[s.tabIcon, active && { backgroundColor: c.color }]}><Ionicons name={c.icon} size={16} color={active ? '#fff' : '#6B7280'} /></View>
                <View>
                  <Text style={[s.tabLabel, active && { color: c.color }]}>{c.label}</Text>
                  <Text style={[s.tabWeight, active && { color: c.color }]}>{key === 'compost' ? (wasteSummary?.total_compost ?? 0).toFixed(0) : (wasteSummary?.total_recycling ?? 0).toFixed(0)} g</Text>
                </View>
                {active && <View style={[s.tabDot, { backgroundColor: c.color }]} />}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={s.listHeader}>
          <Text style={s.listTitle}>Pickup Records</Text>
          <View style={[s.countPill, { backgroundColor: cfg.bg }]}><Text style={[s.countText, { color: cfg.color }]}>{filteredItems.length}</Text></View>
        </View>

        {filteredItems.length === 0 ? (
          <View style={s.empty}>
            <View style={[s.emptyIcon, { backgroundColor: cfg.bg }]}><Ionicons name={cfg.icon === 'leaf' ? 'leaf-outline' : 'sync-outline'} size={36} color={cfg.color} /></View>
            <Text style={s.emptyTitle}>No {cfg.label} Records Yet</Text>
            <Text style={s.emptySub}>Your {cfg.label.toLowerCase()} pickup history will appear here</Text>
          </View>
        ) : (
          filteredItems.map(item => (
            <View key={item.id} style={s.card}>
              <View style={[s.accent, { backgroundColor: cfg.color }]} />
              <View style={[s.iconWrap, { backgroundColor: cfg.bg }]}><Ionicons name={cfg.icon} size={22} color={cfg.color} /></View>
              <View style={s.details}>
                <Text style={[s.category, { color: cfg.color }]}>{cfg.label}</Text>
                <Text style={s.dateTime}>{item.collected_date}  ·  {item.collected_time}</Text>
                <View style={s.metaRow}>
                  <View style={s.chip}><Ionicons name="scale-outline" size={12} color="#6B7280" /><Text style={s.chipText}>{(selectedCategory === 'compost' ? item.compost_weight : item.recycling_weight).toFixed(0)} g</Text></View>
                  {item.driver_name && <View style={s.chip}><Ionicons name="person-outline" size={12} color="#6B7280" /><Text style={s.chipText}>{item.driver_name}</Text></View>}
                </View>
              </View>
            </View>
          ))
        )}
        <View style={{ height: 4 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F3F4F6' },
  loadWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F3F4F6' },
  loadText: { marginTop: 12, fontSize: 14, color: '#6B7280' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: Platform.OS === 'ios' ? 52 : (StatusBar.currentHeight ?? 24) + 8, paddingBottom: 16 },
  btn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#fff', letterSpacing: 0.3 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 20 },
  heroCard: { borderRadius: 20, padding: 22, marginBottom: 20, overflow: 'hidden', elevation: 7 },
  heroDecor: { position: 'absolute', width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(255,255,255,0.07)', top: -50, right: -40 },
  heroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  heroIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  heroLabel: { fontSize: 13, color: 'rgba(255,255,255,0.85)', fontWeight: '500' },
  heroValue: { fontSize: 40, fontWeight: '800', color: '#fff', textAlign: 'center', letterSpacing: -0.5, marginVertical: 12 },
  statsStrip: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.15)', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 6 },
  statItem: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: 19, fontWeight: '700', color: '#fff' },
  statLbl: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  statDiv: { width: 1, backgroundColor: 'rgba(255,255,255,0.25)', marginVertical: 4 },
  tabRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 12, backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#E5E7EB', elevation: 1 },
  tabIcon: { width: 32, height: 32, borderRadius: 10, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
  tabLabel: { fontSize: 14, fontWeight: '700', color: '#6B7280' },
  tabWeight: { fontSize: 12, color: '#9CA3AF', marginTop: 1 },
  tabDot: { width: 6, height: 6, borderRadius: 3, marginLeft: 'auto' },
  listHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  listTitle: { fontSize: 20, fontWeight: '700', color: '#111827' },
  countPill: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  countText: { fontSize: 12, fontWeight: '600' },
  empty: { alignItems: 'center', paddingVertical: 52 },
  emptyIcon: { width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#374151', marginBottom: 6 },
  emptySub: { fontSize: 13, color: '#9CA3AF', textAlign: 'center', paddingHorizontal: 24 },
  card: { backgroundColor: '#fff', borderRadius: 14, marginBottom: 12, flexDirection: 'row', alignItems: 'center', overflow: 'hidden', elevation: 2 },
  accent: { width: 4, alignSelf: 'stretch' },
  iconWrap: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', margin: 12 },
  details: { flex: 1, paddingVertical: 12, paddingRight: 12 },
  category: { fontSize: 17, fontWeight: '700', marginBottom: 3 },
  dateTime: { fontSize: 14, color: '#9CA3AF', marginBottom: 8 },
  metaRow: { flexDirection: 'row', gap: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F3F4F6', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  chipText: { fontSize: 13, color: '#6B7280' },
});