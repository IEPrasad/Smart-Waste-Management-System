import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, ScrollView, TextInput, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '@/lib/supabase';
import { getUserRewards, createWithdrawal, getWithdrawalHistory, formatAmount, formatDateTime } from '@/services/walletService';
import type { WithdrawalRequest } from '@/services/walletService';

function InputRow({ icon, label, optional, ...props }: { icon: React.ComponentProps<typeof Ionicons>['name']; label: string; optional?: boolean } & React.ComponentProps<typeof TextInput>) {
    return (
        <View style={s.inputRow}>
            <View style={s.inputIcon}><Ionicons name={icon} size={18} color="#059669" /></View>
            <View style={s.inputInner}>
                <Text style={s.inputLabel}>{label}{optional && <Text style={s.opt}> (optional)</Text>}</Text>
                <TextInput style={s.input} placeholderTextColor="#9CA3AF" {...props} />
            </View>
        </View>
    );
}

const STATUS_CONFIG: Record<string, { color: string; bg: string; icon: React.ComponentProps<typeof Ionicons>['name']; label: string }> = {
    approved: { color: '#059669', bg: '#D1FAE5', icon: 'checkmark-circle', label: 'Approved' },
    rejected: { color: '#DC2626', bg: '#FEE2E2', icon: 'close-circle', label: 'Rejected' },
    pending: { color: '#D97706', bg: '#FEF3C7', icon: 'time', label: 'Pending' },
};

export default function WalletScreen() {
    const router = useRouter();
    const [totalRewards, setTotalRewards] = useState(0);
    const [withdrawalHistory, setWithdrawalHistory] = useState<WithdrawalRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
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
            const [rewardsResult, historyResult] = await Promise.all([getUserRewards(user.id), getWithdrawalHistory(user.id)]);
            if (rewardsResult.data !== null) setTotalRewards(rewardsResult.data);
            if (historyResult.data) setWithdrawalHistory(historyResult.data);
        } catch { } finally { setLoading(false); }
    };

    const pendingTotal = withdrawalHistory.filter(w => w.status === 'pending').reduce((s, w) => s + w.amount, 0);
    const approvedTotal = withdrawalHistory.filter(w => w.status === 'approved').reduce((s, w) => s + w.amount, 0);
    const actualAvail = Math.max(0, totalRewards - pendingTotal);

    const handleSubmit = async () => {
        const amt = parseFloat(amount);
        if (!amount || isNaN(amt) || amt <= 0) { Alert.alert('Invalid Amount', 'Please enter a valid positive amount.'); return; }
        if (amt > actualAvail) { Alert.alert('Insufficient Balance', `You can withdraw up to ${formatAmount(actualAvail)} after pending requests.`); return; }
        if (!bankName.trim()) { Alert.alert('Required', 'Please enter your bank name.'); return; }
        if (!accountNumber.trim()) { Alert.alert('Required', 'Please enter your account number.'); return; }
        if (!accountHolderName.trim()) { Alert.alert('Required', 'Please enter the account holder name.'); return; }
        setIsSubmitting(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');
            const { error } = await createWithdrawal({ user_id: user.id, amount: amt, bank_name: bankName.trim(), account_number: accountNumber.trim(), account_holder_name: accountHolderName.trim(), branch: branch.trim() || undefined });
            if (error) throw new Error(error);
            Alert.alert('✅ Request Submitted', `Your withdrawal of ${formatAmount(amt)} is now pending admin review.`, [{ text: 'OK', onPress: () => { setAmount(''); setBankName(''); setAccountNumber(''); setAccountHolderName(''); setBranch(''); fetchData(); } }]);
        } catch (e) { Alert.alert('Error', e instanceof Error ? e.message : 'Failed to submit.'); } finally { setIsSubmitting(false); }
    };

    if (loading) return (<View style={s.loadWrap}><ActivityIndicator size="large" color="#059669" /><Text style={s.loadText}>Loading wallet…</Text></View>);

    return (
        <KeyboardAvoidingView style={s.root} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <StatusBar barStyle="light-content" backgroundColor="#065F46" />

            <LinearGradient colors={['#065F46', '#047857']} style={s.header}>
                <TouchableOpacity onPress={() => router.back()} style={s.btn}><Ionicons name="arrow-back" size={22} color="#fff" /></TouchableOpacity>
                <Text style={s.headerTitle}>My Wallet</Text>
                <TouchableOpacity onPress={fetchData} style={s.btn}><Ionicons name="refresh" size={20} color="#A7F3D0" /></TouchableOpacity>
            </LinearGradient>

            <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <LinearGradient colors={['#065F46', '#047857']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.balanceCard}>
                    <View style={s.balanceDecor} />
                    <Text style={s.balanceLabel}>Total Available Balance</Text>
                    <Text style={s.balanceVal}>{formatAmount(actualAvail)}</Text>
                    <View style={s.balanceStrip}>
                        <View style={s.balanceItem}><Text style={s.balanceItemVal}>{formatAmount(totalRewards)}</Text><Text style={s.balanceItemLbl}>Total Earned</Text></View>
                        <View style={s.balanceDivider} />
                        <View style={s.balanceItem}><Text style={s.balanceItemVal}>{formatAmount(pendingTotal)}</Text><Text style={s.balanceItemLbl}>Pending</Text></View>
                        <View style={s.balanceDivider} />
                        <View style={s.balanceItem}><Text style={s.balanceItemVal}>{formatAmount(approvedTotal)}</Text><Text style={s.balanceItemLbl}>Approved</Text></View>
                    </View>
                </LinearGradient>

                <View style={s.card}>
                    <View style={s.cardHeader}><Ionicons name="wallet-outline" size={18} color="#059669" /><Text style={s.cardTitle}>Request Withdrawal</Text></View>
                    <InputRow icon="cash-outline" label="Amount (Rs)" placeholder="Enter amount" keyboardType="numeric" value={amount} onChangeText={setAmount} />
                    <InputRow icon="business-outline" label="Bank Name" placeholder="Enter bank name" value={bankName} onChangeText={setBankName} />
                    <InputRow icon="card-outline" label="Account Number" placeholder="Enter account number" keyboardType="number-pad" value={accountNumber} onChangeText={setAccountNumber} />
                    <InputRow icon="person-outline" label="Account Holder Name" placeholder="Enter account holder name" value={accountHolderName} onChangeText={setAccountHolderName} />
                    <InputRow icon="location-outline" label="Branch" placeholder="Enter branch name" optional value={branch} onChangeText={setBranch} />
                    <TouchableOpacity style={[s.submitBtn, isSubmitting && { opacity: 0.65 }]} onPress={handleSubmit} disabled={isSubmitting} activeOpacity={0.85}>
                        <LinearGradient colors={['#047857', '#059669']} style={s.submitGrad}>
                            {isSubmitting ? <><ActivityIndicator size="small" color="#fff" /><Text style={s.submitText}>Submitting…</Text></> : <><Ionicons name="send-outline" size={18} color="#fff" /><Text style={s.submitText}>Submit Request</Text></>}
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                <View style={s.card}>
                    <View style={s.cardHeader}><Ionicons name="time-outline" size={18} color="#059669" /><Text style={s.cardTitle}>Withdrawal History</Text><View style={s.countPill}><Text style={s.countText}>{withdrawalHistory.length}</Text></View></View>
                    {withdrawalHistory.length === 0 ? (
                        <View style={s.empty}>
                            <View style={s.emptyIcon}><Ionicons name="receipt-outline" size={36} color="#059669" /></View>
                            <Text style={s.emptyTitle}>No Withdrawal Requests Yet</Text>
                            <Text style={s.emptySub}>Your withdrawal history will appear here</Text>
                        </View>
                    ) : (
                        withdrawalHistory.map(req => {
                            const cfg = STATUS_CONFIG[req.status] ?? STATUS_CONFIG.pending;
                            return (
                                <View key={req.id} style={s.historyCard}>
                                    <View style={[s.historyAccent, { backgroundColor: cfg.color }]} />
                                    <View style={s.historyContent}>
                                        <View style={s.historyTop}>
                                            <Text style={s.historyAmt}>{formatAmount(req.amount)}</Text>
                                            <View style={[s.statusPill, { backgroundColor: cfg.bg }]}>
                                                <Ionicons name={cfg.icon} size={12} color={cfg.color} />
                                                <Text style={[s.statusText, { color: cfg.color }]}>{cfg.label}</Text>
                                            </View>
                                        </View>
                                        <Text style={s.historyBank}>{req.bank_name} · {req.account_number}</Text>
                                        <Text style={s.historyDate}>
                                            {formatDateTime(req.requested_at).date} · {formatDateTime(req.requested_at).time}
                                        </Text>
                                    </View>
                                </View>
                            );
                        })
                    )}
                </View>
                <View style={{ height: 48 }} />
            </ScrollView>
        </KeyboardAvoidingView>
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
    balanceCard: { borderRadius: 20, padding: 22, marginBottom: 20, overflow: 'hidden', elevation: 7 },
    balanceDecor: { position: 'absolute', width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(255,255,255,0.07)', top: -50, right: -40 },
    balanceLabel: { fontSize: 13, color: 'rgba(255,255,255,0.85)', fontWeight: '500', textAlign: 'center', marginBottom: 8 },
    balanceVal: { fontSize: 42, fontWeight: '800', color: '#fff', textAlign: 'center', letterSpacing: -0.5, marginBottom: 16 },
    balanceStrip: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.15)', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 6 },
    balanceItem: { flex: 1, alignItems: 'center' },
    balanceItemVal: { fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 2 },
    balanceItemLbl: { fontSize: 11, color: 'rgba(255,255,255,0.75)' },
    balanceDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.25)', marginVertical: 4 },
    card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 14, elevation: 2 },
    cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
    cardTitle: { flex: 1, fontSize: 15, fontWeight: '700', color: '#111827' },
    countPill: { backgroundColor: '#D1FAE5', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
    countText: { fontSize: 12, fontWeight: '600', color: '#059669' },
    inputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 12, overflow: 'hidden', backgroundColor: '#F9FAFB' },
    inputIcon: { width: 44, height: 50, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ECFDF5' },
    inputInner: { flex: 1, paddingHorizontal: 12, paddingVertical: 6 },
    inputLabel: { fontSize: 12, fontWeight: '600', color: '#6B7280', marginBottom: 2 },
    opt: { fontSize: 11, fontWeight: '400', color: '#9CA3AF' },
    input: { fontSize: 15, color: '#111827', paddingVertical: 0 },
    submitBtn: { borderRadius: 12, overflow: 'hidden', marginTop: 8 },
    submitGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14 },
    submitText: { fontSize: 16, fontWeight: '700', color: '#fff' },
    empty: { alignItems: 'center', paddingVertical: 40 },
    emptyIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#D1FAE5', justifyContent: 'center', alignItems: 'center', marginBottom: 14 },
    emptyTitle: { fontSize: 15, fontWeight: '700', color: '#374151', marginBottom: 4 },
    emptySub: { fontSize: 13, color: '#9CA3AF', textAlign: 'center' },
    historyCard: { backgroundColor: '#F9FAFB', borderRadius: 12, marginBottom: 10, flexDirection: 'row', overflow: 'hidden', borderWidth: 1, borderColor: '#E5E7EB' },
    historyAccent: { width: 4, alignSelf: 'stretch' },
    historyContent: { flex: 1, padding: 12 },
    historyTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
    historyAmt: { fontSize: 18, fontWeight: '800', color: '#111827' },
    statusPill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
    statusText: { fontSize: 11, fontWeight: '700' },
    historyBank: { fontSize: 14, color: '#6B7280', marginBottom: 4 },
    historyDate: { fontSize: 12, color: '#9CA3AF' },
});