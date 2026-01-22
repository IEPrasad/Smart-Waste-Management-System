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
  getPickupHistory,
  getWasteSummary,
  getCurrentUserId,
} from '@/services/pickupHistoryService';
import type { PickupHistoryItem, WasteSummary } from '@/services/pickupHistoryService';

export default function SortTrashScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<'compost' | 'recycling'>('compost');
  const [pickupHistory, setPickupHistory] = useState<PickupHistoryItem[]>([]);
  const [wasteSummary, setWasteSummary] = useState<WasteSummary | null>(null);
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

      // Load pickup history and waste summary
      const [historyResponse, summaryResponse] = await Promise.all([
        getPickupHistory(userId),
        getWasteSummary(userId),
      ]);

      if (historyResponse.error) {
        console.error('Error loading history:', historyResponse.error);
      } else if (historyResponse.data) {
        setPickupHistory(historyResponse.data);
      }

      if (summaryResponse.error) {
        console.error('Error loading summary:', summaryResponse.error);
      } else if (summaryResponse.data) {
        setWasteSummary(summaryResponse.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load pickup history');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleHelp = () => {
    Alert.alert(
      'Sorting Help',
      'Compost: Food waste, vegetable scraps, coffee grounds, yard waste\n\nRecycling: Plastic bottles, paper, cardboard, metal cans, glass'
    );
  };

  const filteredItems = pickupHistory.filter((item) => {
    if (selectedCategory === 'compost') {
      return item.compost_weight > 0;
    } else {
      return item.recycling_weight > 0;
    }
  });

  // Total combined weight (compost + recycling)
  const totalCombinedWeight = wasteSummary?.total_overall || 0;

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={styles.loadingText}>Loading history...</Text>
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
        <Text style={styles.headerTitle}>Waste History</Text>
        <TouchableOpacity style={styles.helpButton} onPress={handleHelp}>
          <Ionicons name="help-circle" size={28} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#10B981']} />
        }
      >
        {/* Total Weight Card - Shows Combined Total */}
        <View style={styles.weightCard}>
          <Text style={styles.weightLabel}>Total Waste Weight</Text>
          <Text style={styles.weightValue}>{totalCombinedWeight.toFixed(0)} g</Text>
          <Text style={styles.weightSubtext}>
            From {wasteSummary?.pickup_count || 0} completed pickups
          </Text>
        </View>

        {/* Category Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, selectedCategory === 'compost' && styles.tabActive]}
            onPress={() => setSelectedCategory('compost')}
          >
            <Ionicons
              name="leaf"
              size={20}
              color={selectedCategory === 'compost' ? '#10B981' : '#6B7280'}
            />
            <Text
              style={[styles.tabText, selectedCategory === 'compost' && styles.tabTextActive]}
            >
              Compost
            </Text>
            <View style={styles.tabBadge}>
              <Text style={styles.tabBadgeText}>
                {wasteSummary?.total_compost.toFixed(0) || '0'}g
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, selectedCategory === 'recycling' && styles.tabActive]}
            onPress={() => setSelectedCategory('recycling')}
          >
            <Ionicons
              name="sync"
              size={20}
              color={selectedCategory === 'recycling' ? '#10B981' : '#6B7280'}
            />
            <Text
              style={[styles.tabText, selectedCategory === 'recycling' && styles.tabTextActive]}
            >
              Recycling
            </Text>
            <View style={styles.tabBadge}>
              <Text style={styles.tabBadgeText}>
                {wasteSummary?.total_recycling.toFixed(0) || '0'}g
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Pickup History List */}
        <View style={styles.itemsList}>
          {filteredItems.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons
                name={selectedCategory === 'compost' ? 'leaf-outline' : 'sync-outline'}
                size={64}
                color="#D1D5DB"
              />
              <Text style={styles.emptyStateText}>No {selectedCategory} waste collected yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Your waste collection history will appear here
              </Text>
            </View>
          ) : (
            filteredItems.map((item) => {
              const isCompleted = item.status === 'completed';
              const borderColor = isCompleted ? '#10B981' : '#EF4444';
              
              return (
              <View key={item.id} style={[styles.itemCard, { borderLeftColor: borderColor }]}>
                <View
                  style={[
                    styles.itemIcon,
                    item.status === 'skipped' && styles.itemIconSkipped,
                  ]}
                >
                  <Ionicons
                    name={selectedCategory === 'compost' ? 'leaf' : 'sync'}
                    size={32}
                    color={item.status === 'skipped' ? '#EF4444' : '#10B981'}
                  />
                </View>
                <View style={styles.itemDetails}>
                  <View style={styles.itemHeader}>
                    <View
                      style={[
                        styles.statusBadge,
                        item.status === 'skipped' && styles.statusBadgeSkipped,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          item.status === 'skipped' && styles.statusTextSkipped,
                        ]}
                      >
                        {item.status === 'completed' ? 'Collected' : 'Skipped'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.itemDateTime}>
                    {item.collected_date} • {item.collected_time}
                  </Text>
                  <View style={styles.itemWeight}>
                    <Ionicons name="scale-outline" size={16} color="#10B981" />
                    <Text style={styles.itemWeightText}>
                      {selectedCategory === 'compost'
                        ? item.compost_weight.toFixed(0)
                        : item.recycling_weight.toFixed(0)}{' '}
                      g
                    </Text>
                  </View>
                  <View style={styles.driverInfo}>
                    <Ionicons name="person-outline" size={14} color="#6B7280" />
                    <Text style={styles.driverText}>Driver: {item.driver_name}</Text>
                  </View>
                  {item.note && (
                    <View style={styles.noteContainer}>
                      <Ionicons name="information-circle-outline" size={14} color="#6B7280" />
                      <Text style={styles.noteText}>{item.note}</Text>
                    </View>
                  )}
                </View>
              </View>
              );
            })
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
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
  helpButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  weightCard: {
    backgroundColor: '#10B981',
    marginHorizontal: 0,
    marginTop: 0,
    paddingVertical: 32,
    alignItems: 'center',
  },
  weightLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  weightValue: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  weightSubtext: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 20,
    gap: 12,
  },
  tab: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  tabActive: {
    backgroundColor: '#D1FAE5',
    borderColor: '#10B981',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#10B981',
  },
  tabBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  tabBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  itemsList: {
    paddingHorizontal: 16,
    marginTop: 20,
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
  itemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  itemIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemIconSkipped: {
    backgroundColor: '#FEE2E2',
  },
  itemDetails: {
    flex: 1,
    marginLeft: 14,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeSkipped: {
    backgroundColor: '#FEE2E2',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
  },
  statusTextSkipped: {
    color: '#EF4444',
  },
  itemDateTime: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 6,
  },
  itemWeight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  itemWeightText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#10B981',
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  driverText: {
    fontSize: 13,
    color: '#6B7280',
  },
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 4,
    marginTop: 6,
    backgroundColor: '#F9FAFB',
    padding: 8,
    borderRadius: 8,
  },
  noteText: {
    flex: 1,
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
  },
});
