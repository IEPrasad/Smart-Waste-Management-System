import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    View,
    StatusBar,
    ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { CitizenService, Transaction } from '@/services/citizen';
import { supabase } from '@/lib/supabase';

export default function RewardHistoryScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const themeColors = Colors[colorScheme ?? 'light'];
    const isDark = colorScheme === 'dark';

    const [selectedCategory, setSelectedCategory] = useState<'all' | 'recycling' | 'compost'>('all');
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const data = await CitizenService.getRewardsHistory(user.id);
                setTransactions(data);
            }
        } catch (error) {
            console.error('Error fetching transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredTransactions = selectedCategory === 'all'
        ? transactions
        : transactions.filter(t => t.category === selectedCategory);

    const totalEarnings = transactions.reduce((sum, t) => sum + t.earnings, 0);

    const handleSendRequest = () => {
        //router.push('/citizen/wallet');
    };

    const getCategoryColor = (category: string) => {
        return themeColors.tint;
    };

    const getCategoryBgColor = (category: string) => {
        return isDark ? '#1E1E1E' : '#E0F2FE';
    };

    const getCategoryIcon = (category: string) => {
        return category === 'recycling' ? 'sync' : 'leaf';
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#151718' : '#F9FAFB' }}>

            {/* Header */}
            <ThemedView style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={24} color={themeColors.text} />
                </TouchableOpacity>
                <ThemedText type="subtitle">Rewards History</ThemedText>
                <View style={styles.headerSpacer} />
            </ThemedView>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Earnings Card */}
                <View style={[styles.earningsCard, { backgroundColor: themeColors.tint }]}>
                    <ThemedText style={styles.earningsLabel}>Total Earnings</ThemedText>
                    <ThemedText style={styles.earningsValue}>Rs. {totalEarnings.toFixed(2)}</ThemedText>
                </View>

                {/* Category Tabs */}
                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[
                            styles.tab,
                            selectedCategory === 'all' && { backgroundColor: themeColors.tint, borderColor: themeColors.tint },
                            isDark && selectedCategory !== 'all' && { backgroundColor: '#1E1E1E', borderColor: '#333' }
                        ]}
                        onPress={() => setSelectedCategory('all')}
                    >
                        <ThemedText style={[
                            styles.tabText,
                            selectedCategory === 'all' && styles.tabTextActive,
                            isDark && selectedCategory !== 'all' && { color: '#9BA1A6' }
                        ]}>
                            All
                        </ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.tab,
                            selectedCategory === 'recycling' && { backgroundColor: themeColors.tint, borderColor: themeColors.tint },
                            isDark && selectedCategory !== 'recycling' && { backgroundColor: '#1E1E1E', borderColor: '#333' }
                        ]}
                        onPress={() => setSelectedCategory('recycling')}
                    >
                        <ThemedText style={[
                            styles.tabText,
                            selectedCategory === 'recycling' && styles.tabTextActive,
                            isDark && selectedCategory !== 'recycling' && { color: '#9BA1A6' }
                        ]}>
                            Recycling
                        </ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.tab,
                            selectedCategory === 'compost' && { backgroundColor: themeColors.tint, borderColor: themeColors.tint },
                            isDark && selectedCategory !== 'compost' && { backgroundColor: '#1E1E1E', borderColor: '#333' }
                        ]}
                        onPress={() => setSelectedCategory('compost')}
                    >
                        <ThemedText style={[
                            styles.tabText,
                            selectedCategory === 'compost' && styles.tabTextActive,
                            isDark && selectedCategory !== 'compost' && { color: '#9BA1A6' }
                        ]}>
                            Compost
                        </ThemedText>
                    </TouchableOpacity>
                </View>

                {/* Transactions List */}
                <View style={styles.transactionsSection}>
                    <ThemedText type="subtitle" style={styles.sectionTitle}>Recent Pickups</ThemedText>

                    {loading ? (
                        <ActivityIndicator color={themeColors.tint} size="large" />
                    ) : filteredTransactions.length === 0 ? (
                        <ThemedText style={{ textAlign: 'center', marginTop: 20, color: '#9CA3AF' }}>No transactions found.</ThemedText>
                    ) : (
                        filteredTransactions.map((transaction) => (
                            <ThemedView
                                key={transaction.id}
                                style={[
                                    styles.transactionCard,
                                    { borderLeftColor: getCategoryColor(transaction.category) },
                                    isDark && { backgroundColor: '#1E1E1E', shadowColor: '#000' }
                                ]}
                                lightColor="#FFFFFF"
                                darkColor="#1E1E1E"
                            >
                                <View style={styles.transactionLeft}>
                                    <View style={[
                                        styles.transactionIcon,
                                        { backgroundColor: getCategoryBgColor(transaction.category) }
                                    ]}>
                                        <Ionicons
                                            name={getCategoryIcon(transaction.category) as any}
                                            size={24}
                                            color={getCategoryColor(transaction.category)}
                                        />
                                    </View>
                                    <View style={styles.transactionDetails}>
                                        <ThemedText style={[styles.transactionCategory, { color: themeColors.tint }]}>
                                            {transaction.category === 'compost' ? 'Compost' : 'Recycling'}
                                        </ThemedText>
                                        <ThemedText style={styles.transactionDateTime}>
                                            {transaction.date} • {transaction.time}
                                        </ThemedText>
                                        <ThemedText style={styles.transactionInfo}>
                                            Weight: {transaction.weight.toFixed(1)} kg • Rate: Rs {transaction.rate.toFixed(2)}/kg
                                        </ThemedText>
                                    </View>
                                </View>
                                <View style={styles.transactionRight}>
                                    <ThemedText style={[styles.transactionEarnings, { color: themeColors.tint }]}>+Rs {transaction.earnings.toFixed(2)}</ThemedText>
                                    <View style={[styles.completedBadge, { backgroundColor: isDark ? '#0D2B36' : '#E0F2FE' }]}>
                                        <ThemedText style={[styles.completedText, { color: themeColors.tint }]}>Completed</ThemedText>
                                    </View>
                                </View>
                            </ThemedView>
                        ))
                    )}
                </View>

                <View style={{ height: 20 }} />
            </ScrollView>

            {/* Wallet Button */}
            <ThemedView style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.sendButton, { backgroundColor: themeColors.tint }]}
                    onPress={handleSendRequest}
                    activeOpacity={0.8}
                >
                    <ThemedText style={styles.sendButtonText}>Enter My Wallet</ThemedText>
                </TouchableOpacity>
            </ThemedView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerSpacer: {
        width: 40,
    },
    scrollView: {
        flex: 1,
    },
    earningsCard: {
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
        marginBottom: 16,
    },
    transactionCard: {
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
    },
    completedBadge: {
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    completedText: {
        fontSize: 11,
        fontWeight: '600',
    },
    buttonContainer: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        paddingBottom: 20,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    sendButton: {
        borderRadius: 12,
        paddingVertical: 14,
        shadowColor: '#000',
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
