import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface Transaction {
  id: string;
  name: string;
  date: string;
  time: string;
  weight: number;
  rate: number;
  earnings: number;
  category: 'recycling' | 'compost';
  icon: string;
}

export default function RewardHistoryScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'recycling' | 'compost'>('all');
  const [startDate, setStartDate] = useState('2025-01-01');
  const [endDate, setEndDate] = useState('2025-01-31');

  // Transactions based on sort-trash items
  const transactions: Transaction[] = [
    {
      id: '1',
      name: 'Plastic Bottle',
      date: 'Jan 15, 2025',
      time: '2:30 PM',
      weight: 0.50,
      rate: 20.00,
      earnings: 10.00,
      category: 'recycling',
      icon: 'sync',
    },
    {
      id: '2',
      name: 'Paper',
      date: 'Jan 14, 2025',
      time: '4:45 PM',
      weight: 2.20,
      rate: 20.00,
      earnings: 44.00,
      category: 'recycling',
      icon: 'sync',
    },
    {
      id: '3',
      name: 'Apple Core',
      date: 'Jan 12, 2025',
      time: '10:15 AM',
      weight: 10.10,
      rate: 30.00,
      earnings: 303.00,
      category: 'compost',
      icon: 'leaf',
    },
    {
      id: '4',
      name: 'Vegetable Scraps',
      date: 'Jan 10, 2025',
      time: '3:20 PM',
      weight: 1.50,
      rate: 30.00,
      earnings: 45.00,
      category: 'compost',
      icon: 'leaf',
    },
    {
      id: '5',
      name: 'Coffee Grounds',
      date: 'Jan 08, 2025',
      time: '9:00 AM',
      weight: 3.40,
      rate: 30.00,
      earnings: 102.00,
      category: 'compost',
      icon: 'leaf',
    },
  ];

  const filteredTransactions = selectedCategory === 'all' 
    ? transactions 
    : transactions.filter(t => t.category === selectedCategory);

  const totalEarnings = transactions.reduce((sum, t) => sum + t.earnings, 0);
  const monthEarnings = filteredTransactions.reduce((sum, t) => sum + t.earnings, 0);
  const transactionCount = transactions.length;

  const handleSendRequest = () => {
    //router.push('/citizen/wallet');
  };

  const getCategoryColor = (category: string) => {
    return '#10B981'; // Green for both
  };

  const getCategoryBgColor = (category: string) => {
    return category === 'recycling' ? '#D1FAE5' : '#D1FAE5'; // Light green for both
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rewards History</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Earnings Card */}
        <View style={styles.earningsCard}>
          <Text style={styles.earningsLabel}>Total Earnings</Text>
          <Text style={styles.earningsValue}>Rs. {totalEarnings.toFixed(2)}</Text>
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
            <Text style={[styles.tabText, selectedCategory === 'recycling' && styles.tabTextActive]}>
              Recycling
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, selectedCategory === 'compost' && styles.tabActive]}
            onPress={() => setSelectedCategory('compost')}
          >
            <Text style={[styles.tabText, selectedCategory === 'compost' && styles.tabTextActive]}>
              Compost
            </Text>
          </TouchableOpacity>
        </View>

        {/* Transactions List */}
        <View style={styles.transactionsSection}>
          <Text style={styles.sectionTitle}>Recent Pickups</Text>
          
          {filteredTransactions.map((transaction) => (
            <View 
              key={transaction.id} 
              style={[
                styles.transactionCard,
                { borderLeftColor: getCategoryColor(transaction.category) }
              ]}
            >
              <View style={styles.transactionLeft}>
                <View style={[
                  styles.transactionIcon,
                  { backgroundColor: getCategoryBgColor(transaction.category) }
                ]}>
                  <Ionicons 
                    name={transaction.icon as any} 
                    size={24} 
                    color={getCategoryColor(transaction.category)} 
                  />
                </View>
                <View style={styles.transactionDetails}>
                  <Text style={styles.transactionCategory}>
                    {transaction.category === 'compost' ? 'Compost' : 'Recycling'}
                  </Text>
                  <Text style={styles.transactionDateTime}>
                    {transaction.date} • {transaction.time}
                  </Text>
                  <Text style={styles.transactionInfo}>
                    Weight: {transaction.weight.toFixed(1)} kg • Rate: Rs {transaction.rate.toFixed(2)}/kg
                  </Text>
                </View>
              </View>
              <View style={styles.transactionRight}>
                <Text style={styles.transactionEarnings}>+Rs {transaction.earnings.toFixed(2)}</Text>
                <View style={styles.completedBadge}>
                  <Text style={styles.completedText}>Completed</Text>
                </View>
              </View>
            </View>
          ))}
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
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
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
  dateRangeContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 16,
    gap: 10,
  },
  dateBox: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  dateText: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '500',
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
    color: '#10B981',
    marginBottom: 4,
  },
  transactionDateTime: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 6,
  },
  transactionInfo: {
    fontSize: 13,
    color: '#6B7280',
  },
  transactionRight: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  transactionEarnings: {
    fontSize: 16,
    fontWeight: '700',
    color: '#10B981',
  },
  completedBadge: {
    backgroundColor: '#D1FAE5',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  completedText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#10B981',
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
