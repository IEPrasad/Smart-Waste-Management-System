import { supabase } from '@/lib/supabase';

export type WithdrawalStatus = 'pending' | 'approved' | 'rejected';

export interface WithdrawalRequest {
    id: string;
    user_id: string;
    amount: number;
    bank_name: string;
    account_number: string;
    account_holder_name: string;
    branch?: string;
    status: WithdrawalStatus;
    requested_at: string;
    processed_at?: string;
    admin_notes?: string;
}

export interface CreateWithdrawalData {
    user_id: string;
    amount: number;
    bank_name: string;
    account_number: string;
    account_holder_name: string;
    branch?: string;
}

interface ServiceResponse<T> {
    data: T | null;
    error: string | null;
}

const mapErrorMessage = (error: unknown, fallback: string) => {
    if (error instanceof Error) return error.message;
    return fallback;
};

export const WalletService = {
    // Get user's available balance = total earnings - approved withdrawals
    async getUserRewards(userId: string): Promise<ServiceResponse<number>> {
        try {
            // 1. Get total earnings from pickup_logs via rewardCalculationService
            const { getRewardSummary } = await import('./rewardCalculationService');
            const summaryResult = await getRewardSummary(userId);

            if (summaryResult.error || !summaryResult.data) {
                console.error('Error fetching reward summary:', summaryResult.error);
                return { data: 0, error: null }; // No earnings yet
            }

            const totalEarnings = summaryResult.data.total_earnings;

            // 2. Get total approved withdrawals
            const { data: withdrawals, error: withdrawError } = await supabase
                .from('withdrawal_requests')
                .select('amount')
                .eq('user_id', userId)
                .eq('status', 'approved');

            if (withdrawError) {
                console.error('Error fetching withdrawals:', withdrawError);
                return { data: totalEarnings, error: null };
            }

            // 3. Available balance = Earnings - Approved Withdrawals
            const totalWithdrawn = withdrawals?.reduce((sum, w) => sum + w.amount, 0) ?? 0;
            const availableBalance = totalEarnings - totalWithdrawn;

            console.log('💰 Balance calculation:', { totalEarnings, totalWithdrawn, availableBalance });

            return { data: Math.max(0, availableBalance), error: null };
        } catch (error) {
            console.error('Error in getUserRewards:', error);
            return {
                data: null,
                error: mapErrorMessage(error, 'Unable to fetch rewards'),
            };
        }
    },

    // Create withdrawal request
    async createWithdrawal(
        data: CreateWithdrawalData
    ): Promise<ServiceResponse<WithdrawalRequest>> {
        try {
            // Adjust to Sri Lanka timezone (UTC+5:30)
            const sriLankaOffset = 5.5 * 60 * 60 * 1000;
            const requestedAt = new Date(Date.now() + sriLankaOffset);

            const payload = {
                user_id: data.user_id,
                amount: data.amount,
                bank_name: data.bank_name,
                account_number: data.account_number,
                account_holder_name: data.account_holder_name,
                branch: data.branch || null,
                status: 'pending',
                requested_at: requestedAt.toISOString(),
            };

            const { data: result, error } = await supabase
                .from('withdrawal_requests')
                .insert([payload])
                .select()
                .single();

            if (error) throw error;

            return { data: result as WithdrawalRequest, error: null };
        } catch (error) {
            return {
                data: null,
                error: mapErrorMessage(error, 'Unable to create withdrawal request'),
            };
        }
    },

    // Get user's withdrawal history
    async getWithdrawalHistory(
        userId: string
    ): Promise<ServiceResponse<WithdrawalRequest[]>> {
        try {
            const { data, error } = await supabase
                .from('withdrawal_requests')
                .select('*')
                .eq('user_id', userId)
                .order('requested_at', { ascending: false });

            if (error) throw error;

            return { data: (data || []) as WithdrawalRequest[], error: null };
        } catch (error) {
            return {
                data: null,
                error: mapErrorMessage(error, 'Unable to fetch withdrawal history'),
            };
        }
    },

    // Format amount for display (Sri Lankan Rupees)
    formatAmount(amount: number): string {
        return `Rs. ${amount.toLocaleString('en-LK', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    },

    // Format date/time for Sri Lanka
    formatDateTime(isoString: string): { date: string; time: string } {
        const date = new Date(isoString);
        const dateStr = date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
        const timeStr = date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });
        return { date: dateStr, time: timeStr };
    },
};

export const getUserRewards = WalletService.getUserRewards;
export const createWithdrawal = WalletService.createWithdrawal;
export const getWithdrawalHistory = WalletService.getWithdrawalHistory;
export const formatAmount = WalletService.formatAmount;
export const formatDateTime = WalletService.formatDateTime;
