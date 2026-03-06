import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  getPickupHistory,
  getWasteSummary,
  getCurrentUserId,
} from '@/services/pickupHistoryService';
import type { PickupHistoryItem, WasteSummary } from '@/services/pickupHistoryService';

type Category = 'compost' | 'recycling';

const CAT_CONFIG: Record<Category, {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  color: string;
  bg: string;
  gradientColors: [string, string];
}> = {
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

      const [histRes, sumRes] = await Promise.all([
        getPickupHistory(userId),
        getWasteSummary(userId),
      ]);

      if (histRes.data) setPickupHistory(histRes.data);
      if (sumRes.data) setWasteSummary(sumRes.data);
    } catch {
      Alert.alert('Error', 'Failed to load pickup history');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => { setRefreshing(true); loadData(); };

  const handleHelp = () => {
    Alert.alert(
      '♻️ Sorting Guide',
      'Compost: Food waste, vegetable scraps, coffee grounds, yard waste\n\nRecycling: Plastic bottles, paper, cardboard, metal cans, glass'
    );
  };

  const filteredItems = pickupHistory.filter(item =>
    selectedCategory === 'compost' ? item.compost_weight > 0 : item.recycling_weight > 0
  );

  const totalCombinedWeight = wasteSummary?.total_overall ?? 0;
  const cfg = CAT_CONFIG[selectedCategory];

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={styles.loadingText}>Loading history…</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#065F46" />

      {/* ── Gradient header ── */}
      <LinearGradient colors={cfg.gradientColors} style={styles.headerGradient}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Waste History</Text>
        <TouchableOpacity onPress={handleHelp} style={styles.helpBtn}>
          <Ionicons name="help-circle-outline" size={24} color="rgba(255,255,255,0.85)" />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh}
            colors={[cfg.color]} tintColor={cfg.color} />
        }
      >
        {/* ── Hero stats card ── */}
        <LinearGradient
          colors={cfg.gradientColors}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroDecorCircle} />

          <View style={styles.heroTop}>
            <View style={styles.heroIconBox}>
              <Ionicons name={cfg.icon} size={22} color="#fff" />
            </View>
            <Text style={styles.heroTopLabel}>Total Waste Weight</Text>
          </View>

          <Text style={styles.heroValue}>{totalCombinedWeight.toFixed(0)} g</Text>

          <View style={styles.statsStrip}>
            <View style={styles.statItem}>
              <Text style={styles.statVal}>{(wasteSummary?.total_compost ?? 0).toFixed(0)} g</Text>
              <Text style={styles.statLbl}>Compost</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statVal}>{(wasteSummary?.total_recycling ?? 0).toFixed(0)} g</Text>
              <Text style={styles.statLbl}>Recycling</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statVal}>{wasteSummary?.pickup_count ?? 0}</Text>
              <Text style={styles.statLbl}>Pickups</Text>
            </View>
          </View>
        </LinearGradient>

        {/* ── Category tabs ── */}
        <View style={styles.tabRow}>
          {(Object.entries(CAT_CONFIG) as [Category, typeof CAT_CONFIG[Category]][]).map(([key, c]) => {
            const active = selectedCategory === key;
            return (
              <TouchableOpacity
                key={key}
                style={[styles.tab, active && { backgroundColor: c.bg, borderColor: c.color }]}
                onPress={() => setSelectedCategory(key)}
                activeOpacity={0.75}
              >
                <View style={[styles.tabIconWrap, active && { backgroundColor: c.color }]}>
                  <Ionicons name={c.icon} size={16} color={active ? '#fff' : '#6B7280'} />
                </View>
                <View>
                  <Text style={[styles.tabLabel, active && { color: c.color }]}>{c.label}</Text>
                  <Text style={[styles.tabWeight, active && { color: c.color }]}>
                    {key === 'compost'
                      ? (wasteSummary?.total_compost ?? 0).toFixed(0)
                      : (wasteSummary?.total_recycling ?? 0).toFixed(0)} g
                  </Text>
                </View>
                {active && (
                  <View style={[styles.tabActiveDot, { backgroundColor: c.color }]} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── List header ── */}
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>Pickup Records</Text>
          <View style={[styles.countPill, { backgroundColor: cfg.bg }]}>
            <Text style={[styles.countText, { color: cfg.color }]}>{filteredItems.length}</Text>
          </View>
        </View>

        {/* ── Empty state ── */}
        {filteredItems.length === 0 ? (
          <View style={styles.emptyWrap}>
            <View style={[styles.emptyIconCircle, { backgroundColor: cfg.bg }]}>
              <Ionicons name={cfg.icon === 'leaf' ? 'leaf-outline' : 'sync-outline'} size={36} color={cfg.color} />
            </View>
            <Text style={styles.emptyTitle}>No {cfg.label} Records Yet</Text>
            <Text style={styles.emptySub}>Your {cfg.label.toLowerCase()} pickup history will appear here</Text>
          </View>
        ) : (
          filteredItems.map(item => {
            const done = item.status === 'completed';
            const accent = done ? cfg.color : '#DC2626';
            const iconBg = done ? cfg.bg : '#FEE2E2';
            const weight = selectedCategory === 'compost' ? item.compost_weight : item.recycling_weight;

            return (
              <View key={item.id} style={styles.itemCard}>
                {/* Left accent bar */}
                <View style={[styles.itemAccent, { backgroundColor: accent }]} />

                {/* Category icon */}
                <View style={[styles.itemIconWrap, { backgroundColor: iconBg }]}>
                  <Ionicons name={cfg.icon} size={22} color={accent} />
                </View>

                <View style={styles.itemBody}>
                  {/* Top row: weight + status */}
                  <View style={styles.itemTopRow}>
                    <View style={styles.itemWeightRow}>
                      <Ionicons name="scale-outline" size={15} color={accent} />
                      <Text style={[styles.itemWeight, { color: accent }]}>
                        {weight.toFixed(0)} g
                      </Text>
                    </View>
                    <View style={[styles.statusPill, { backgroundColor: done ? cfg.bg : '#FEE2E2' }]}>
                      <Ionicons
                        name={done ? 'checkmark-circle' : 'close-circle'}
                        size={13} color={accent}
                      />
                      <Text style={[styles.statusPillText, { color: accent }]}>
                        {done ? 'Collected' : 'Skipped'}
                      </Text>
                    </View>
                  </View>

                  {/* Date / time */}
                  <View style={styles.itemMetaRow}>
                    <View style={styles.itemMetaItem}>
                      <Ionicons name="calendar-outline" size={12} color="#9CA3AF" />
                      <Text style={styles.itemMetaText}>{item.collected_date}</Text>
                    </View>
                    <View style={styles.itemMetaItem}>
                      <Ionicons name="time-outline" size={12} color="#9CA3AF" />
                      <Text style={styles.itemMetaText}>{item.collected_time}</Text>
                    </View>
                  </View>

                  {/* Driver */}
                  <View style={styles.itemDriverRow}>
                    <Ionicons name="person-outline" size={13} color="#6B7280" />
                    <Text style={styles.itemDriverText}>{item.driver_name}</Text>
                  </View>

                  {/* Note */}
                  {item.note && (
                    <View style={styles.noteBox}>
                      <Ionicons name="chatbox-outline" size={13} color="#92400E" />
                      <Text style={styles.noteText}>{item.note}</Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F3F4F6' },

  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F3F4F6' },
  loadingText: { marginTop: 12, fontSize: 14, color: '#6B7280' },

  // Header
  headerGradient: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 52 : (StatusBar.currentHeight ?? 24) + 8,
    paddingBottom: 16,
  },
  backBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  helpBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#fff', letterSpacing: 0.3 },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 20 },

  // Hero card
  heroCard: {
    borderRadius: 20, padding: 22, marginBottom: 20, overflow: 'hidden',
    shadowColor: '#059669', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3, shadowRadius: 10, elevation: 7,
  },
  heroDecorCircle: {
    position: 'absolute', width: 180, height: 180, borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.07)', top: -50, right: -40,
  },
  heroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  heroIconBox: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center', marginRight: 10,
  },
  heroTopLabel: { fontSize: 13, color: 'rgba(255,255,255,0.85)', fontWeight: '500' },
  heroValue: {
    fontSize: 40, fontWeight: '800', color: '#fff',
    textAlign: 'center', letterSpacing: -0.5, marginVertical: 12,
  },
  statsStrip: {
    flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.15)',
    borderRadius: 12, paddingVertical: 12, paddingHorizontal: 6,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: 17, fontWeight: '700', color: '#fff' },
  statLbl: { fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.25)', marginVertical: 4 },

  // Tabs
  tabRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  tab: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 14, borderRadius: 14,
    backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#E5E7EB',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 3, elevation: 1,
  },
  tabIconWrap: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center', alignItems: 'center',
  },
  tabLabel: { fontSize: 14, fontWeight: '700', color: '#374151' },
  tabWeight: { fontSize: 12, color: '#9CA3AF', marginTop: 1 },
  tabActiveDot: { width: 7, height: 7, borderRadius: 4, marginLeft: 'auto' },

  // List header
  listHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  listTitle: { fontSize: 20, fontWeight: '700', color: '#111827' },
  countPill: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  countText: { fontSize: 12, fontWeight: '600' },

  // Empty
  emptyWrap: { alignItems: 'center', paddingVertical: 52 },
  emptyIconCircle: { width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#374151', marginBottom: 6 },
  emptySub: { fontSize: 13, color: '#9CA3AF', textAlign: 'center', paddingHorizontal: 24 },

  // Item card
  itemCard: {
    backgroundColor: '#fff', borderRadius: 14, marginBottom: 12,
    flexDirection: 'row', alignItems: 'center', overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  itemAccent: { width: 4, alignSelf: 'stretch' },
  itemIconWrap: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', margin: 12 },
  itemBody: { flex: 1, paddingVertical: 12, paddingRight: 12 },

  itemTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  itemWeightRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  itemWeight: { fontSize: 18, fontWeight: '800' },

  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 9, paddingVertical: 3, borderRadius: 20 },
  statusPillText: { fontSize: 12, fontWeight: '700' },

  itemMetaRow: { flexDirection: 'row', gap: 14, marginBottom: 6 },
  itemMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  itemMetaText: { fontSize: 12, color: '#9CA3AF' },

  itemDriverRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  itemDriverText: { fontSize: 13, color: '#6B7280' },

  noteBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 6,
    marginTop: 8, backgroundColor: '#FEF3C7',
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 7,
  },
  noteText: { flex: 1, fontSize: 12, color: '#92400E', lineHeight: 18 },
});
