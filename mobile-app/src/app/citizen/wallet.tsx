import React, { useState, useEffect } from 'react';
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
import {
    getUserRewards,
    createWithdrawal,
    getWithdrawalHistory,
    formatAmount,
    formatDateTime,
} from '@/services/walletService';
import type { WithdrawalRequest } from '@/services/walletService';

// ─── Themed input row ────────────────────────────────────────────────────────
function InputRow({
    icon,
    label,
    optional,
    ...props
}: {
    icon: React.ComponentProps<typeof Ionicons>['name'];
    label: string;
    optional?: boolean;
} & React.ComponentProps<typeof TextInput>) {
    return (
        <View style={styles.inputRow}>
            <View style={styles.inputIconWrap}>
                <Ionicons name={icon} size={18} color="#059669" />
            </View>
            <View style={styles.inputInner}>
                <Text style={styles.inputLabel}>
                    {label}
                    {optional && <Text style={styles.optionalTag}> (optional)</Text>}
                </Text>
                <TextInput style={styles.input} placeholderTextColor="#9CA3AF" {...props} />
            </View>
        </View>
    );
}

// ─── Status helpers ───────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { color: string; bg: string; icon: React.ComponentProps<typeof Ionicons>['name']; label: string }> = {
    approved: { color: '#059669', bg: '#D1FAE5', icon: 'checkmark-circle', label: 'Approved' },
    rejected: { color: '#DC2626', bg: '#FEE2E2', icon: 'close-circle', label: 'Rejected' },
    pending: { color: '#D97706', bg: '#FEF3C7', icon: 'time', label: 'Pending' },
};

// ─── Main screen ─────────────────────────────────────────────────────────────
export default function WalletScreen() {
    const router = useRouter();

    const [totalRewards, setTotalRewards] = useState(0);
    const [withdrawalHistory, setWithdrawalHistory] = useState<WithdrawalRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form
    const [amount, setAmount] = useState('');
    const [bankName, setBankName] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [accountHolderName, setAccountHolderName] = useState('');
    const [branch, setBranch] = useState('');

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const [rewardsResult, historyResult] = await Promise.all([
                getUserRewards(user.id),
                getWithdrawalHistory(user.id),
            ]);

            if (rewardsResult.data !== null) setTotalRewards(rewardsResult.data);
            if (historyResult.data) setWithdrawalHistory(historyResult.data);
        } catch (e) {
            console.error('Error fetching wallet data:', e);
        } finally {
            setLoading(false);
        }
    };

    // Derived stats
    const pendingTotal = withdrawalHistory.filter(w => w.status === 'pending').reduce((s, w) => s + w.amount, 0);
    const approvedTotal = withdrawalHistory.filter(w => w.status === 'approved').reduce((s, w) => s + w.amount, 0);
    const actualAvail = Math.max(0, totalRewards - pendingTotal);

    const handleSubmit = async () => {
        const amt = parseFloat(amount);

        if (!amount || isNaN(amt) || amt <= 0) {
            Alert.alert('Invalid Amount', 'Please enter a valid positive amount.'); return;
        }
        if (amt > actualAvail) {
            Alert.alert(
                'Insufficient Balance',
                `You can withdraw up to ${formatAmount(actualAvail)} after pending requests.`
            ); return;
        }
        if (!bankName.trim()) {
            Alert.alert('Required', 'Please enter your bank name.'); return;
        }
        if (!accountNumber.trim()) {
            Alert.alert('Required', 'Please enter your account number.'); return;
        }
        if (!accountHolderName.trim()) {
            Alert.alert('Required', 'Please enter the account holder name.'); return;
        }

        setIsSubmitting(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');

            const { error } = await createWithdrawal({
                user_id: user.id,
                amount: amt,
                bank_name: bankName.trim(),
                account_number: accountNumber.trim(),
                account_holder_name: accountHolderName.trim(),
                branch: branch.trim() || undefined,
            });

            if (error) throw new Error(error);

            Alert.alert(
                '✅ Request Submitted',
                `Your withdrawal of ${formatAmount(amt)} is now pending admin review.`,
                [{
                    text: 'OK',
                    onPress: () => {
                        setAmount(''); setBankName(''); setAccountNumber('');
                        setAccountHolderName(''); setBranch('');
                        fetchData();
                    },
                }]
            );
        } catch (e) {
            Alert.alert('Error', e instanceof Error ? e.message : 'Failed to submit.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#059669" />
                <Text style={styles.loadingText}>Loading wallet…</Text>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={styles.root}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <StatusBar barStyle="light-content" backgroundColor="#065F46" />

            {/* ── Dark header ── */}
            <LinearGradient colors={['#065F46', '#047857']} style={styles.headerGradient}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={22} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Wallet</Text>
                <TouchableOpacity onPress={fetchData} style={styles.refreshBtn}>
                    <Ionicons name="refresh" size={20} color="#A7F3D0" />
                </TouchableOpacity>
            </LinearGradient>

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* ── Balance card ── */}
                <LinearGradient
                    colors={['#065F46', '#047857']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.balanceCard}
                >
                    {/* Decorative circle */}
                    <View style={styles.decorCircle} />

                    <View style={styles.balanceCardTop}>
                        <View style={styles.balanceIconBox}>
                            <Ionicons name="wallet-outline" size={22} color="#fff" />
                        </View>
                        <Text style={styles.balanceCardLabel}>Available Balance</Text>
                    </View>

                    <Text style={styles.balanceAmount}>{formatAmount(actualAvail)}</Text>

                    {/* Three-stat strip */}
                    <View style={styles.statsStrip}>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{formatAmount(totalRewards)}</Text>
                            <Text style={styles.statLabel}>Total Earned</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{formatAmount(pendingTotal)}</Text>
                            <Text style={styles.statLabel}>Pending</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{formatAmount(approvedTotal)}</Text>
                            <Text style={styles.statLabel}>Withdrawn</Text>
                        </View>
                    </View>
                </LinearGradient>

                {/* ── Withdrawal form ── */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="arrow-up-circle-outline" size={20} color="#059669" />
                        <Text style={styles.cardTitle}>Request Withdrawal</Text>
                    </View>

                    <InputRow
                        icon="cash-outline"
                        label="Amount (Rs.)"
                        placeholder="0.00"
                        keyboardType="numeric"
                        value={amount}
                        onChangeText={setAmount}
                    />
                    <InputRow
                        icon="business-outline"
                        label="Bank Name"
                        placeholder="e.g. Bank of Ceylon"
                        value={bankName}
                        onChangeText={setBankName}
                    />
                    <InputRow
                        icon="card-outline"
                        label="Account Number"
                        placeholder="Enter account number"
                        keyboardType="numeric"
                        value={accountNumber}
                        onChangeText={setAccountNumber}
                    />
                    <InputRow
                        icon="person-outline"
                        label="Account Holder Name"
                        placeholder="Full name as per bank"
                        value={accountHolderName}
                        onChangeText={setAccountHolderName}
                    />
                    <InputRow
                        icon="location-outline"
                        label="Branch"
                        placeholder="e.g. Colombo Fort"
                        optional
                        value={branch}
                        onChangeText={setBranch}
                    />

                    {/* Hint bar */}
                    <View style={styles.hintBar}>
                        <Ionicons name="information-circle-outline" size={15} color="#6B7280" />
                        <Text style={styles.hintText}>
                            Max withdrawal: {formatAmount(actualAvail)}
                        </Text>
                    </View>

                    <TouchableOpacity
                        style={[styles.submitBtn, isSubmitting && { opacity: 0.65 }]}
                        onPress={handleSubmit}
                        disabled={isSubmitting}
                        activeOpacity={0.85}
                    >
                        <LinearGradient
                            colors={['#059669', '#047857']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.submitGradient}
                        >
                            {isSubmitting
                                ? <ActivityIndicator color="#fff" />
                                : <>
                                    <Ionicons name="arrow-forward-circle-outline" size={20} color="#fff" />
                                    <Text style={styles.submitText}>Submit Request</Text>
                                </>
                            }
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {/* ── History ── */}
                <View style={styles.historyHeader}>
                    <Text style={styles.historyTitle}>Transaction History</Text>
                    <Text style={styles.historyCount}>{withdrawalHistory.length} requests</Text>
                </View>

                {withdrawalHistory.length === 0 ? (
                    <View style={styles.emptyState}>
                        <View style={styles.emptyIconWrap}>
                            <Ionicons name="receipt-outline" size={36} color="#059669" />
                        </View>
                        <Text style={styles.emptyTitle}>No Transactions Yet</Text>
                        <Text style={styles.emptySubtitle}>Your withdrawal requests will appear here</Text>
                    </View>
                ) : (
                    withdrawalHistory.map((req) => {
                        const cfg = STATUS_CONFIG[req.status] ?? STATUS_CONFIG.pending;
                        const { date, time } = formatDateTime(req.requested_at);
                        return (
                            <View key={req.id} style={styles.txCard}>
                                {/* Left colour accent */}
                                <View style={[styles.txAccent, { backgroundColor: cfg.color }]} />

                                <View style={styles.txBody}>
                                    {/* Top row */}
                                    <View style={styles.txTopRow}>
                                        <Text style={styles.txAmount}>{formatAmount(req.amount)}</Text>
                                        <View style={[styles.statusPill, { backgroundColor: cfg.bg }]}>
                                            <Ionicons name={cfg.icon} size={13} color={cfg.color} />
                                            <Text style={[styles.statusPillText, { color: cfg.color }]}>{cfg.label}</Text>
                                        </View>
                                    </View>

                                    {/* Bank info */}
                                    <View style={styles.txBankRow}>
                                        <Ionicons name="business-outline" size={14} color="#6B7280" />
                                        <Text style={styles.txBankText}>
                                            {req.bank_name}
                                            {req.branch ? ` · ${req.branch}` : ''}
                                        </Text>
                                    </View>

                                    <Text style={styles.txAcctText}>Acct: {req.account_number}</Text>

                                    {/* Date / time */}
                                    <View style={styles.txMeta}>
                                        <View style={styles.txMetaItem}>
                                            <Ionicons name="calendar-outline" size={12} color="#9CA3AF" />
                                            <Text style={styles.txMetaText}>{date}</Text>
                                        </View>
                                        <View style={styles.txMetaItem}>
                                            <Ionicons name="time-outline" size={12} color="#9CA3AF" />
                                            <Text style={styles.txMetaText}>{time}</Text>
                                        </View>
                                    </View>

                                    {/* Admin note */}
                                    {req.admin_notes && (
                                        <View style={styles.noteBox}>
                                            <Ionicons name="chatbox-outline" size={13} color="#92400E" />
                                            <Text style={styles.noteText}>{req.admin_notes}</Text>
                                        </View>
                                    )}
                                </View>
                            </View>
                        );
                    })
                )}

                <View style={{ height: 48 }} />
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#F3F4F6' },

    // Loading
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F3F4F6' },
    loadingText: { marginTop: 12, fontSize: 14, color: '#6B7280' },

    // Header
    headerGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: Platform.OS === 'ios' ? 52 : (StatusBar.currentHeight ?? 24) + 8,
        paddingBottom: 16,
    },
    backBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
    refreshBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#fff', letterSpacing: 0.3 },

    // Scroll
    scroll: { flex: 1 },
    scrollContent: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 8 },

    // Balance card
    balanceCard: {
        borderRadius: 20,
        padding: 22,
        marginBottom: 20,
        overflow: 'hidden',
        shadowColor: '#059669',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
        elevation: 8,
    },
    decorCircle: {
        position: 'absolute',
        width: 180,
        height: 180,
        borderRadius: 90,
        backgroundColor: 'rgba(255,255,255,0.07)',
        top: -50,
        right: -40,
    },
    balanceCardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
    balanceIconBox: {
        width: 36, height: 36, borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center', alignItems: 'center', marginRight: 10,
    },
    balanceCardLabel: { fontSize: 13, color: 'rgba(255,255,255,0.85)', fontWeight: '500' },
    balanceAmount: {
        fontSize: 38, fontWeight: '800', color: '#fff',
        letterSpacing: -0.5, marginVertical: 12, textAlign: 'center',
    },
    statsStrip: {
        flexDirection: 'row',
        backgroundColor: 'rgba(0,0,0,0.15)',
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 6,
        marginTop: 4,
    },
    statItem: { flex: 1, alignItems: 'center' },
    statValue: { fontSize: 16, fontWeight: '700', color: '#fff' },
    statLabel: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
    statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.25)', marginVertical: 2 },

    // Generic card
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 18,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
    },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 18, gap: 8 },
    cardTitle: { fontSize: 17, fontWeight: '700', color: '#111827' },

    // Input rows
    inputRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
        paddingBottom: 14,
    },
    inputIconWrap: {
        width: 36, height: 36, borderRadius: 10,
        backgroundColor: '#D1FAE5',
        justifyContent: 'center', alignItems: 'center',
        marginRight: 12, marginTop: 16,
    },
    inputInner: { flex: 1 },
    inputLabel: { fontSize: 12, fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
    optionalTag: { fontSize: 11, fontWeight: '400', color: '#9CA3AF', textTransform: 'none' },
    input: {
        fontSize: 16, color: '#111827', paddingVertical: 6,
    },

    // Hint bar
    hintBar: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        backgroundColor: '#F9FAFB', borderRadius: 8,
        paddingHorizontal: 12, paddingVertical: 8, marginBottom: 14,
    },
    hintText: { fontSize: 13, color: '#6B7280' },

    // Submit button
    submitBtn: { borderRadius: 12, overflow: 'hidden' },
    submitGradient: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 8, paddingVertical: 15,
    },
    submitText: { fontSize: 16, fontWeight: '700', color: '#fff', letterSpacing: 0.2 },

    // History header
    historyHeader: {
        flexDirection: 'row', alignItems: 'center',
        justifyContent: 'space-between', marginBottom: 12,
    },
    historyTitle: { fontSize: 20, fontWeight: '700', color: '#111827' },
    historyCount: {
        fontSize: 12, fontWeight: '600', color: '#059669',
        backgroundColor: '#D1FAE5', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20,
    },

    // Empty state
    emptyState: { alignItems: 'center', paddingVertical: 48 },
    emptyIconWrap: {
        width: 72, height: 72, borderRadius: 36,
        backgroundColor: '#D1FAE5', justifyContent: 'center', alignItems: 'center', marginBottom: 16,
    },
    emptyTitle: { fontSize: 16, fontWeight: '700', color: '#374151', marginBottom: 6 },
    emptySubtitle: { fontSize: 13, color: '#9CA3AF', textAlign: 'center' },

    // Transaction card
    txCard: {
        backgroundColor: '#fff',
        borderRadius: 14,
        marginBottom: 12,
        flexDirection: 'row',
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    txAccent: { width: 4 },
    txBody: { flex: 1, padding: 14 },
    txTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    txAmount: { fontSize: 21, fontWeight: '800', color: '#111827' },
    statusPill: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
    },
    statusPillText: { fontSize: 13, fontWeight: '700' },
    txBankRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 2 },
    txBankText: { fontSize: 15, color: '#374151', fontWeight: '500' },
    txAcctText: { fontSize: 14, color: '#9CA3AF', marginBottom: 10 },
    txMeta: { flexDirection: 'row', gap: 14 },
    txMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    txMetaText: { fontSize: 13, color: '#9CA3AF' },

    // Admin note
    noteBox: {
        flexDirection: 'row', alignItems: 'flex-start', gap: 6,
        marginTop: 10, backgroundColor: '#FEF3C7',
        borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8,
    },
    noteText: { flex: 1, fontSize: 12, color: '#92400E', lineHeight: 18 },
});
