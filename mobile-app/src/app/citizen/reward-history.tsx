import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, ScrollView, Alert, ActivityIndicator, RefreshControl, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getRewardTransactions, getRewardSummary, getCurrentUserId } from '@/services/rewardCalculationService';
import type { RewardTransaction, RewardSummary } from '@/services/rewardCalculationService';

type Category = 'all' | 'compost' | 'recycling';

const CAT_CONFIG: Record<Category, { icon: React.ComponentProps<typeof Ionicons>['name']; label: string; color: string; bg: string; gradient: [string, string] }> = {
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
      const [txRes, sumRes] = await Promise.all([getRewardTransactions(userId), getRewardSummary(userId)]);
      if (txRes.data) setTransactions(txRes.data);
      if (sumRes.data) setRewardSummary(sumRes.data);
    } catch { Alert.alert('Error', 'Failed to load reward history'); } finally { setLoading(false); setRefreshing(false); }
  };

  const onRefresh = () => { setRefreshing(true); loadData(); };

  const cfg = CAT_CONFIG[selectedCategory];
  const filtered = transactions.filter(t => {
    if (selectedCategory === 'compost') return t.compost_weight > 0;
    if (selectedCategory === 'recycling') return t.recycling_weight > 0;
    return true;
  });
  const headerEarnings = selectedCategory === 'compost' ? (rewardSummary?.compost_earnings ?? 0) : selectedCategory === 'recycling' ? (rewardSummary?.recycling_earnings ?? 0) : (rewardSummary?.total_earnings ?? 0);
  const headerLabel = selectedCategory === 'compost' ? 'Compost Earnings' : selectedCategory === 'recycling' ? 'Recycling Earnings' : 'Total Earnings';

  if (loading) return (<View style={s.loadWrap}><ActivityIndicator size="large" color="#10B981" /><Text style={s.loadText}>Loading rewards…</Text></View>);

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="#065F46" />

      <LinearGradient colors={cfg.gradient} style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.btn}><Ionicons name="arrow-back" size={22} color="#fff" /></TouchableOpacity>
        <Text style={s.headerTitle}>Reward History</Text>
        <TouchableOpacity onPress={onRefresh} style={s.btn}><Ionicons name="refresh" size={20} color="rgba(255,255,255,0.85)" /></TouchableOpacity>
      </LinearGradient>

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[cfg.color]} tintColor={cfg.color} />}>
        <LinearGradient colors={cfg.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.heroCard}>
          <View style={s.heroDecor} />
          <View style={s.heroTop}>
            <View style={s.heroIcon}><Ionicons name={cfg.icon} size={22} color="#fff" /></View>
            <Text style={s.heroLabel}>{headerLabel}</Text>
          </View>
          <Text style={s.heroAmount}>Rs. {headerEarnings.toFixed(2)}</Text>
          <View style={s.statsStrip}>
            <View style={s.statItem}><Text style={s.statVal}>{rewardSummary?.completed_count ?? 0}</Text><Text style={s.statLbl}>Completed</Text></View>
            <View style={s.statDiv} />
            <View style={s.statItem}><Text style={s.statVal}>{rewardSummary?.skipped_count ?? 0}</Text><Text style={s.statLbl}>Skipped</Text></View>
            <View style={s.statDiv} />
            <View style={s.statItem}><Text style={s.statVal}>{transactions.length}</Text><Text style={s.statLbl}>Total</Text></View>
          </View>
        </LinearGradient>

        <View style={s.tabRow}>
          {TABS.map(key => {
            const c = CAT_CONFIG[key];
            const active = selectedCategory === key;
            return (
              <TouchableOpacity key={key} style={[s.tab, active && { backgroundColor: c.bg, borderColor: c.color }]} onPress={() => setSelectedCategory(key)} activeOpacity={0.75}>
                <View style={[s.tabIcon, active && { backgroundColor: c.color }]}><Ionicons name={c.icon} size={14} color={active ? '#fff' : '#6B7280'} /></View>
                <Text style={[s.tabText, active && { color: c.color }]}>{c.label}</Text>
                {active && <View style={[s.tabDot, { backgroundColor: c.color }]} />}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={s.listHeader}>
          <Text style={s.listTitle}>Pickup Records</Text>
          <View style={[s.countPill, { backgroundColor: cfg.bg }]}><Text style={[s.countText, { color: cfg.color }]}>{filtered.length}</Text></View>
        </View>

        {filtered.length === 0 ? (
          <View style={s.empty}>
            <View style={[s.emptyIcon, { backgroundColor: cfg.bg }]}><Ionicons name={cfg.icon} size={36} color={cfg.color} /></View>
            <Text style={s.emptyTitle}>No Records Yet</Text>
            <Text style={s.emptySub}>{selectedCategory === 'all' ? 'Your reward history will appear here after pickups.' : `No ${cfg.label.toLowerCase()} pickups recorded yet.`}</Text>
          </View>
        ) : (
          filtered.map(tx => {
            const done = tx.status === 'completed';
            const hasCompost = tx.compost_weight > 0;
            const hasRecycling = tx.recycling_weight > 0;
            const rowCat: Category = selectedCategory !== 'all' ? selectedCategory : hasCompost && hasRecycling ? 'all' : hasCompost ? 'compost' : 'recycling';
            const rowCfg = CAT_CONFIG[rowCat === 'all' ? 'compost' : rowCat];
            const accent = done ? rowCfg.color : '#DC2626';
            const iconBg = done ? rowCfg.bg : '#FEE2E2';
            const catIcon: React.ComponentProps<typeof Ionicons>['name'] = hasCompost && hasRecycling ? 'layers' : hasCompost ? 'leaf' : 'sync';
            const catName = hasCompost && hasRecycling ? 'Mixed' : hasCompost ? 'Compost' : 'Recycling';
            const weight = selectedCategory === 'compost' ? tx.compost_weight : selectedCategory === 'recycling' ? tx.recycling_weight : tx.compost_weight + tx.recycling_weight;
            const earnings = selectedCategory === 'compost' ? tx.compost_earnings : selectedCategory === 'recycling' ? tx.recycling_earnings : tx.total_earnings;

            return (
              <View key={tx.id} style={s.txCard}>
                <View style={[s.txAccent, { backgroundColor: accent }]} />
                <View style={[s.txIconWrap, { backgroundColor: iconBg }]}><Ionicons name={catIcon} size={22} color={accent} /></View>
                <View style={s.txDetails}>
                  <View style={s.txTopRow}>
                    <Text style={[s.txCategory, { color: accent }]}>{catName}</Text>
                    <View style={[s.statusPill, { backgroundColor: done ? rowCfg.bg : '#FEE2E2' }]}>
                      <Ionicons name={done ? 'checkmark-circle' : 'close-circle'} size={12} color={accent} />
                      <Text style={[s.statusPillText, { color: accent }]}>{done ? 'Completed' : 'Skipped'}</Text>
                    </View>
                  </View>
                  <Text style={s.txDateTime}>{tx.collected_date}  ·  {tx.collected_time}</Text>
                  <View style={s.txMetaRow}>
                    <View style={s.txChip}><Ionicons name="scale-outline" size={12} color="#6B7280" /><Text style={s.txChipText}>{weight.toFixed(0)} g</Text></View>
                    {tx.driver_name && <View style={s.txChip}><Ionicons name="person-outline" size={12} color="#6B7280" /><Text style={s.txChipText}>{tx.driver_name}</Text></View>}
                  </View>
                </View>
                <Text style={[s.txEarnings, { color: accent }]}>{done ? '+' : ''}Rs {earnings.toFixed(2)}</Text>
              </View>
            );
          })
        )}
        <View style={{ height: 4 }} />
      </ScrollView>

      <View style={s.bottomBar}>
        <TouchableOpacity style={s.walletBtn} onPress={() => router.push('/citizen/wallet')} activeOpacity={0.85}>
          <LinearGradient colors={cfg.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.walletGrad}>
            <Ionicons name="wallet-outline" size={20} color="#fff" />
            <Text style={s.walletText}>Go to Wallet</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
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
  heroAmount: { fontSize: 40, fontWeight: '800', color: '#fff', textAlign: 'center', letterSpacing: -0.5, marginVertical: 12 },
  statsStrip: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.15)', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 6 },
  statItem: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: 19, fontWeight: '700', color: '#fff' },
  statLbl: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  statDiv: { width: 1, backgroundColor: 'rgba(255,255,255,0.25)', marginVertical: 4 },
  tabRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 11, borderRadius: 12, backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#E5E7EB', elevation: 1 },
  tabIcon: { width: 26, height: 26, borderRadius: 8, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
  tabText: { fontSize: 13, fontWeight: '600', color: '#6B7280' },
  tabDot: { width: 6, height: 6, borderRadius: 3, marginLeft: 2 },
  listHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  listTitle: { fontSize: 20, fontWeight: '700', color: '#111827' },
  countPill: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  countText: { fontSize: 12, fontWeight: '600' },
  empty: { alignItems: 'center', paddingVertical: 52 },
  emptyIcon: { width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#374151', marginBottom: 6 },
  emptySub: { fontSize: 13, color: '#9CA3AF', textAlign: 'center', paddingHorizontal: 24 },
  txCard: { backgroundColor: '#fff', borderRadius: 14, marginBottom: 12, flexDirection: 'row', alignItems: 'center', overflow: 'hidden', elevation: 2 },
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
  bottomBar: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: Platform.OS === 'ios' ? 36 : 38, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  walletBtn: { borderRadius: 12, overflow: 'hidden' },
  walletGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14 },
  walletText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});