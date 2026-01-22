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
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  getRewardTransactions,
  getRewardSummary,
  getCurrentUserId,
} from '@/services/rewardCalculationService';
import type { RewardTransaction, RewardSummary } from '@/services/rewardCalculationService';

export default function RewardHistoryScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'compost' | 'recycling'>('all');
  const [transactions, setTransactions] = useState<RewardTransaction[]>([]);
  const [rewardSummary, setRewardSummary] = useState<RewardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Get current user ID
      const userId = await getCurrentUserId();
      if (!userId) {
        Alert.alert('Error', 'User not found. Please log in again.');
        return;
      }

      // Load reward transactions and summary
      const [transactionsResponse, summaryResponse] = await Promise.all([
        getRewardTransactions(userId),
        getRewardSummary(userId),
      ]);

      if (transactionsResponse.error) {
        console.error('Error loading transactions:', transactionsResponse.error);
      } else if (transactionsResponse.data) {
        setTransactions(transactionsResponse.data);
      }

      if (summaryResponse.error) {
        console.error('Error loading summary:', summaryResponse.error);
      } else if (summaryResponse.data) {
        setRewardSummary(summaryResponse.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load reward history');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleSendRequest = () => {
    router.push('/citizen/wallet');
  };

  // Filter transactions based on selected category
  const filteredTransactions = transactions.filter((transaction) => {
    if (selectedCategory === 'all') {
      return true;
    } else if (selectedCategory === 'compost') {
      return transaction.compost_weight > 0;
    } else {
      return transaction.recycling_weight > 0;
    }
  });

  // Calculate category-specific earnings for header
  const getCategoryEarnings = (): number => {
    if (!rewardSummary) return 0;

    if (selectedCategory === 'all') {
      return rewardSummary.total_earnings;
    } else if (selectedCategory === 'compost') {
      return rewardSummary.compost_earnings;
    } else {
      return rewardSummary.recycling_earnings;
    }
  };

  // Get category label for header
  const getCategoryLabel = (): string => {
    if (selectedCategory === 'all') {
      return 'Total Earnings';
    } else if (selectedCategory === 'compost') {
      return 'Compost Earnings';
    } else {
      return 'Recycling Earnings';
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={styles.loadingText}>Loading rewards...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rewards History</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#10B981']} />
        }
      >
        {/* Earnings Card - Dynamic based on category */}
        <View style={styles.earningsCard}>
          <Text style={styles.earningsLabel}>{getCategoryLabel()}</Text>
          <Text style={styles.earningsValue}>Rs. {getCategoryEarnings().toFixed(2)}</Text>
          <View style={styles.earningsStats}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Completed</Text>
              <Text style={styles.statValue}>{rewardSummary?.completed_count || 0}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Skipped</Text>
              <Text style={styles.statValue}>{rewardSummary?.skipped_count || 0}</Text>
            </View>
          </View>
        </View>

        {/* Category Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, selectedCategory === 'all' && styles.tabActive]}
            onPress={() => setSelectedCategory('all')}
          >
            <Text style={[styles.tabText, selectedCategory === 'all' && styles.tabTextActive]}>
              All
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, selectedCategory === 'recycling' && styles.tabActive]}
            onPress={() => setSelectedCategory('recycling')}
          >
            <Ionicons
              name="sync"
              size={16}
              color={selectedCategory === 'recycling' ? '#FFFFFF' : '#6B7280'}
            />
            <Text
              style={[styles.tabText, selectedCategory === 'recycling' && styles.tabTextActive]}
            >
              Recycling
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, selectedCategory === 'compost' && styles.tabActive]}
            onPress={() => setSelectedCategory('compost')}
          >
            <Ionicons
              name="leaf"
              size={16}
              color={selectedCategory === 'compost' ? '#FFFFFF' : '#6B7280'}
            />
            <Text
              style={[styles.tabText, selectedCategory === 'compost' && styles.tabTextActive]}
            >
              Compost
            </Text>
          </TouchableOpacity>
        </View>

        {/* Transactions List */}
        <View style={styles.transactionsSection}>
          <Text style={styles.sectionTitle}>Recent Pickups</Text>

          {filteredTransactions.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons
                name={selectedCategory === 'all' ? 'wallet-outline' : selectedCategory === 'compost' ? 'leaf-outline' : 'sync-outline'}
                size={64}
                color="#D1D5DB"
              />
              <Text style={styles.emptyStateText}>
                No {selectedCategory === 'all' ? '' : selectedCategory + ' '}rewards yet
              </Text>
              <Text style={styles.emptyStateSubtext}>
                Your reward history will appear here after pickups
              </Text>
            </View>
          ) : (
            filteredTransactions.map((transaction) => {
              const isCompleted = transaction.status === 'completed';
              const borderColor = isCompleted ? '#10B981' : '#EF4444';
              const iconBgColor = isCompleted ? '#D1FAE5' : '#FEE2E2';
              const iconColor = isCompleted ? '#10B981' : '#EF4444';
              const earningsColor = isCompleted ? '#10B981' : '#EF4444';
              const badgeBgColor = isCompleted ? '#D1FAE5' : '#FEE2E2';
              const badgeTextColor = isCompleted ? '#10B981' : '#EF4444';

              // Determine which category this transaction belongs to
              const hasCompost = transaction.compost_weight > 0;
              const hasRecycling = transaction.recycling_weight > 0;
              const categoryIcon = hasCompost && hasRecycling
                ? 'layers'
                : hasCompost
                  ? 'leaf'
                  : 'sync';
              const categoryName = hasCompost && hasRecycling
                ? 'Mixed'
                : hasCompost
                  ? 'Compost'
                  : 'Recycling';

              // Show weight based on selected category filter
              const displayWeight =
                selectedCategory === 'compost'
                  ? transaction.compost_weight
                  : selectedCategory === 'recycling'
                    ? transaction.recycling_weight
                    : transaction.compost_weight + transaction.recycling_weight;

              // Show earnings based on selected category filter
              const displayEarnings =
                selectedCategory === 'compost'
                  ? transaction.compost_earnings
                  : selectedCategory === 'recycling'
                    ? transaction.recycling_earnings
                    : transaction.total_earnings;

              return (
                <View
                  key={transaction.id}
                  style={[styles.transactionCard, { borderLeftColor: borderColor }]}
                >
                  <View style={styles.transactionLeft}>
                    <View style={[styles.transactionIcon, { backgroundColor: iconBgColor }]}>
                      <Ionicons name={categoryIcon as any} size={24} color={iconColor} />
                    </View>
                    <View style={styles.transactionDetails}>
                      <Text style={[styles.transactionCategory, { color: iconColor }]}>
                        {categoryName}
                      </Text>
                      <Text style={styles.transactionDateTime}>
                        {transaction.collected_date} • {transaction.collected_time}
                      </Text>
                      <Text style={styles.transactionInfo}>
                        Weight: {displayWeight.toFixed(0)} g
                      </Text>
                      {transaction.driver_name && (
                        <Text style={styles.transactionDriver}>
                          Driver: {transaction.driver_name}
                        </Text>
                      )}
                    </View>
                  </View>
                  <View style={styles.transactionRight}>
                    <Text style={[styles.transactionEarnings, { color: earningsColor }]}>
                      {isCompleted ? '+' : ''}Rs {displayEarnings.toFixed(2)}
                    </Text>
                    <View style={[styles.statusBadge, { backgroundColor: badgeBgColor }]}>
                      <Text style={[styles.statusText, { color: badgeTextColor }]}>
                        {isCompleted ? 'Completed' : 'Skipped'}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Wallet Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.sendButton}
          onPress={handleSendRequest}
          activeOpacity={0.8}
        >
          <Text style={styles.sendButtonText}>Enter My Wallet</Text>
        </TouchableOpacity>
      </View>
    </View>
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  earningsCard: {
    backgroundColor: '#10B981',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 32,
  },
  earningsLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    opacity: 0.9,
    textAlign: 'center',
    marginBottom: 8,
  },
  earningsValue: {
    fontSize: 42,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  earningsStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 20,
    gap: 10,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  tabActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  transactionsSection: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
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
    textAlign: 'center',
  },
  transactionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  transactionLeft: {
    flexDirection: 'row',
    flex: 1,
  },
  transactionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionDetails: {
    marginLeft: 12,
    flex: 1,
  },
  transactionCategory: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  transactionDateTime: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  transactionInfo: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 2,
  },
  transactionDriver: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  transactionRight: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  transactionEarnings: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  buttonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 50,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  sendButton: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingVertical: 14,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
});
