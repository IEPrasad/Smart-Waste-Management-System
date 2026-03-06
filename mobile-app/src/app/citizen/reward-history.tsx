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
  getRewardTransactions,
  getRewardSummary,
  getCurrentUserId,
} from '@/services/rewardCalculationService';
import type { RewardTransaction, RewardSummary } from '@/services/rewardCalculationService';

type Category = 'all' | 'compost' | 'recycling';

// ── Dynamic theme config per category ────────────────────────────────────────
const CAT_CONFIG: Record<Category, {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  color: string;
  bg: string;
  gradient: [string, string];
}> = {
  all: { icon: 'grid-outline', label: 'All', color: '#059669', bg: '#D1FAE5', gradient: ['#065F46', '#047857'] },
  compost: { icon: 'leaf-outline', label: 'Compost', color: '#059669', bg: '#D1FAE5', gradient: ['#065F46', '#047857'] },
  recycling: { icon: 'sync-outline', label: 'Recycling', color: '#1D4ED8', bg: '#DBEAFE', gradient: ['#1E3A5F', '#1D4ED8'] },
};

const TABS: Category[] = ['all', 'compost', 'recycling'];

export default function RewardHistoryScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const [transactions, setTransactions] = useState<RewardTransaction[]>([]);
  const [rewardSummary, setRewardSummary] = useState<RewardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const userId = await getCurrentUserId();
      if (!userId) { Alert.alert('Error', 'Please log in again.'); return; }

      const [txRes, sumRes] = await Promise.all([
        getRewardTransactions(userId),
        getRewardSummary(userId),
      ]);

      if (txRes.data) setTransactions(txRes.data);
      if (sumRes.data) setRewardSummary(sumRes.data);
    } catch {
      Alert.alert('Error', 'Failed to load reward history');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => { setRefreshing(true); loadData(); };

  // ── Derived values ────────────────────────────────────────────────────────
  const cfg = CAT_CONFIG[selectedCategory];

  const filtered = transactions.filter(t => {
    if (selectedCategory === 'compost') return t.compost_weight > 0;
    if (selectedCategory === 'recycling') return t.recycling_weight > 0;
    return true;
  });

  const headerEarnings =
    selectedCategory === 'compost' ? (rewardSummary?.compost_earnings ?? 0) :
      selectedCategory === 'recycling' ? (rewardSummary?.recycling_earnings ?? 0) :
        (rewardSummary?.total_earnings ?? 0);

  const headerLabel =
    selectedCategory === 'compost' ? 'Compost Earnings' :
      selectedCategory === 'recycling' ? 'Recycling Earnings' : 'Total Earnings';

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={styles.loadingText}>Loading rewards…</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#065F46" />

      {/* ── Dynamic gradient header ── */}
      <LinearGradient colors={cfg.gradient} style={styles.headerGradient}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reward History</Text>
        <TouchableOpacity onPress={onRefresh} style={styles.refreshBtn}>
          <Ionicons name="refresh" size={20} color="rgba(255,255,255,0.85)" />
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
        {/* ── Dynamic hero earnings card ── */}
        <LinearGradient
          colors={cfg.gradient}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroDecorCircle} />

          <View style={styles.heroTop}>
            <View style={styles.heroIconBox}>
              <Ionicons name={cfg.icon} size={22} color="#fff" />
            </View>
            <Text style={styles.heroTopLabel}>{headerLabel}</Text>
          </View>

          <Text style={styles.heroAmount}>Rs. {headerEarnings.toFixed(2)}</Text>

          <View style={styles.statsStrip}>
            <View style={styles.statItem}>
              <Text style={styles.statVal}>{rewardSummary?.completed_count ?? 0}</Text>
              <Text style={styles.statLbl}>Completed</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statVal}>{rewardSummary?.skipped_count ?? 0}</Text>
              <Text style={styles.statLbl}>Skipped</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statVal}>{transactions.length}</Text>
              <Text style={styles.statLbl}>Total</Text>
            </View>
          </View>
        </LinearGradient>

        {/* ── Category tabs ── */}
        <View style={styles.tabRow}>
          {TABS.map(key => {
            const c = CAT_CONFIG[key];
            const active = selectedCategory === key;
            return (
              <TouchableOpacity
                key={key}
                style={[styles.tab, active && { backgroundColor: c.bg, borderColor: c.color }]}
                onPress={() => setSelectedCategory(key)}
                activeOpacity={0.75}
              >
                <View style={[styles.tabIconWrap, active && { backgroundColor: c.color }]}>
                  <Ionicons name={c.icon} size={14} color={active ? '#fff' : '#6B7280'} />
                </View>
                <Text style={[styles.tabText, active && { color: c.color }]}>{c.label}</Text>
                {active && <View style={[styles.tabDot, { backgroundColor: c.color }]} />}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── List header ── */}
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>Pickup Records</Text>
          <View style={[styles.countPill, { backgroundColor: cfg.bg }]}>
            <Text style={[styles.countText, { color: cfg.color }]}>{filtered.length}</Text>
          </View>
        </View>

        {/* ── Empty state ── */}
        {filtered.length === 0 ? (
          <View style={styles.emptyWrap}>
            <View style={[styles.emptyIconCircle, { backgroundColor: cfg.bg }]}>
              <Ionicons name={cfg.icon} size={36} color={cfg.color} />
            </View>
            <Text style={styles.emptyTitle}>No Records Yet</Text>
            <Text style={styles.emptySub}>
              {selectedCategory === 'all'
                ? 'Your reward history will appear here after pickups.'
                : `No ${cfg.label.toLowerCase()} pickups recorded yet.`}
            </Text>
          </View>
        ) : (
          filtered.map(tx => {
            const done = tx.status === 'completed';

            // Per-row colour: category colour if done, red if skipped
            const hasCompost = tx.compost_weight > 0;
            const hasRecycling = tx.recycling_weight > 0;
            const rowCat: Category =
              selectedCategory !== 'all' ? selectedCategory :
                hasCompost && hasRecycling ? 'all' :
                  hasCompost ? 'compost' : 'recycling';

            const rowCfg = CAT_CONFIG[rowCat === 'all' ? 'compost' : rowCat];
            const accent = done ? rowCfg.color : '#DC2626';
            const iconBg = done ? rowCfg.bg : '#FEE2E2';

            const catIcon: React.ComponentProps<typeof Ionicons>['name'] =
              hasCompost && hasRecycling ? 'layers' :
                hasCompost ? 'leaf' : 'sync';
            const catName =
              hasCompost && hasRecycling ? 'Mixed' :
                hasCompost ? 'Compost' : 'Recycling';

            const weight =
              selectedCategory === 'compost' ? tx.compost_weight :
                selectedCategory === 'recycling' ? tx.recycling_weight :
                  tx.compost_weight + tx.recycling_weight;
            const earnings =
              selectedCategory === 'compost' ? tx.compost_earnings :
                selectedCategory === 'recycling' ? tx.recycling_earnings :
                  tx.total_earnings;

            return (
              <View key={tx.id} style={styles.txCard}>
                <View style={[styles.txAccent, { backgroundColor: accent }]} />

                <View style={[styles.txIconWrap, { backgroundColor: iconBg }]}>
                  <Ionicons name={catIcon} size={22} color={accent} />
                </View>

                <View style={styles.txDetails}>
                  <View style={styles.txTopRow}>
                    <Text style={[styles.txCategory, { color: accent }]}>{catName}</Text>
                    <View style={[styles.statusPill, { backgroundColor: done ? rowCfg.bg : '#FEE2E2' }]}>
                      <Ionicons name={done ? 'checkmark-circle' : 'close-circle'} size={12} color={accent} />
                      <Text style={[styles.statusPillText, { color: accent }]}>
                        {done ? 'Completed' : 'Skipped'}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.txDateTime}>
                    {tx.collected_date}  ·  {tx.collected_time}
                  </Text>

                  <View style={styles.txMetaRow}>
                    <View style={styles.txChip}>
                      <Ionicons name="scale-outline" size={12} color="#6B7280" />
                      <Text style={styles.txChipText}>{weight.toFixed(0)} g</Text>
                    </View>
                    {tx.driver_name && (
                      <View style={styles.txChip}>
                        <Ionicons name="person-outline" size={12} color="#6B7280" />
                        <Text style={styles.txChipText}>{tx.driver_name}</Text>
                      </View>
                    )}
                  </View>
                </View>

                <Text style={[styles.txEarnings, { color: accent }]}>
                  {done ? '+' : ''}Rs {earnings.toFixed(2)}
                </Text>
              </View>
            );
          })
        )}

        <View style={{ height: 4 }} />
      </ScrollView>

      {/* ── Bottom CTA ── */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.walletBtn}
          onPress={() => router.push('/citizen/wallet')}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={cfg.gradient}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.walletBtnGradient}
          >
            <Ionicons name="wallet-outline" size={20} color="#fff" />
            <Text style={styles.walletBtnText}>Go to Wallet</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
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
  refreshBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
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
  heroAmount: {
    fontSize: 40, fontWeight: '800', color: '#fff',
    textAlign: 'center', letterSpacing: -0.5, marginVertical: 12,
  },
  statsStrip: {
    flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.15)',
    borderRadius: 12, paddingVertical: 12, paddingHorizontal: 6,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: 19, fontWeight: '700', color: '#fff' },
  statLbl: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.25)', marginVertical: 4 },

  // Tabs
  tabRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  tab: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 11, borderRadius: 12,
    backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#E5E7EB',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3, elevation: 1,
  },
  tabIconWrap: {
    width: 26, height: 26, borderRadius: 8,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center', alignItems: 'center',
  },
  tabText: { fontSize: 13, fontWeight: '600', color: '#6B7280' },
  tabDot: { width: 6, height: 6, borderRadius: 3, marginLeft: 2 },

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

  // Transaction card
  txCard: {
    backgroundColor: '#fff', borderRadius: 14, marginBottom: 12,
    flexDirection: 'row', alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  txAccent: { width: 4, alignSelf: 'stretch' },
  txIconWrap: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', margin: 12 },
  txDetails: { flex: 1, paddingVertical: 12 },
  txTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginRight: 10, marginBottom: 3 },
  txCategory: { fontSize: 17, fontWeight: '700' },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  statusPillText: { fontSize: 12, fontWeight: '700' },
  txDateTime: { fontSize: 14, color: '#9CA3AF', marginBottom: 8 },
  txMetaRow: { flexDirection: 'row', gap: 8 },
  txChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F3F4F6', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  txChipText: { fontSize: 13, color: '#6B7280' },
  txEarnings: { fontSize: 18, fontWeight: '800', paddingRight: 14 },

  // Bottom bar
  bottomBar: {
    paddingHorizontal: 16, paddingTop: 12, paddingBottom: Platform.OS === 'ios' ? 36 : 38,
    backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#E5E7EB',
  },
  walletBtn: { borderRadius: 12, overflow: 'hidden' },
  walletBtnGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14 },
  walletBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
