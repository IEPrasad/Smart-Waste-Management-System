import { supabase } from '@/lib/supabase';

export interface RewardTransaction {
  id: string;
  pickup_id: string;
  status: 'completed' | 'skipped';
  collected_date: string;
  collected_time: string;
  compost_weight: number;
  recycling_weight: number;
  compost_earnings: number;
  recycling_earnings: number;
  total_earnings: number;
  driver_name: string;
  note: string | null;
}

export interface RewardSummary {
  total_earnings: number;
  compost_earnings: number;
  recycling_earnings: number;
  completed_count: number;
  skipped_count: number;
  total_weight: number;
}

interface ServiceResponse<T> {
  data: T | null;
  error: string | null;
}

// Reward rates (Rs per gram)
const REWARD_RATES = {
  compost: 0.01,    // Rs 0.01 per gram (Rs 10 per kg)
  recycling: 0.012,  // Rs 0.012 per gram (Rs 12 per kg)
};

async function getCitizenName(citizenId: string): Promise<ServiceResponse<string>> {
  try {
    const { data, error } = await supabase
      .from('citizens')
      .select('full_name')
      .eq('id', citizenId)
      .single();

    if (error) {
      return { data: null, error: error.message || 'Failed to fetch citizen name' };
    }

    if (!data?.full_name) {
      return { data: null, error: 'Citizen not found' };
    }

    return { data: data.full_name as string, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to fetch citizen name',
    };
  }
}

export const RewardCalculationService = {
  /**
   * Calculate earnings for a single pickup
   */
  calculateEarnings(
    compost_weight: number,
    recycling_weight: number,
    status: string
  ): { compost: number; recycling: number; total: number } {
    // If skipped, no earnings
    if (status === 'skipped') {
      return {
        compost: 0,
        recycling: 0,
        total: 0,
      };
    }

    const compost_earnings = compost_weight * REWARD_RATES.compost;
    const recycling_earnings = recycling_weight * REWARD_RATES.recycling;

    return {
      compost: compost_earnings,
      recycling: recycling_earnings,
      total: compost_earnings + recycling_earnings,
    };
  },

  /**
   * Get reward transactions history for a citizen
   */
  async getRewardTransactions(citizenId: string): Promise<ServiceResponse<RewardTransaction[]>> {
    try {
      const citizenNameRes = await getCitizenName(citizenId);
      if (citizenNameRes.error || !citizenNameRes.data) {
        return { data: null, error: citizenNameRes.error || 'Citizen not found' };
      }

      const citizenName = citizenNameRes.data;

      const { data, error } = await supabase
        .from('pickup_logs')
        .select(
          `
          id,
          pickup_id,
          compost_weight,
          recycling_weight,
          status,
          note,
          created_at,
          driver (
            full_name
          )
        `
        )
        .eq('citizen_name', citizenName)
        .in('status', ['completed', 'skipped'])
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching reward transactions:', error);
        return {
          data: null,
          error: error.message || 'Failed to fetch reward transactions',
        };
      }

      if (!data || data.length === 0) {
        return {
          data: [],
          error: null,
        };
      }

      const transactions: RewardTransaction[] = data.map((log: any) => {
        const date = new Date(log.created_at);
        
        // Calculate earnings
        const earnings = RewardCalculationService.calculateEarnings(
          log.compost_weight || 0,
          log.recycling_weight || 0,
          log.status
        );

        return {
          id: log.id,
          pickup_id: log.pickup_id,
          status: log.status as 'completed' | 'skipped',
          collected_date: date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          }),
          collected_time: date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          compost_weight: log.compost_weight || 0,
          recycling_weight: log.recycling_weight || 0,
          compost_earnings: earnings.compost,
          recycling_earnings: earnings.recycling,
          total_earnings: earnings.total,
          driver_name: log.driver?.full_name || 'Unknown Driver',
          note: log.note,
        };
      });

      return {
        data: transactions,
        error: null,
      };
    } catch (error) {
      console.error('Exception in getRewardTransactions:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch reward transactions',
      };
    }
  },

  /**
   * Get reward summary (total earnings, counts, etc.)
   */
  async getRewardSummary(citizenId: string): Promise<ServiceResponse<RewardSummary>> {
    try {
      const citizenNameRes = await getCitizenName(citizenId);
      if (citizenNameRes.error || !citizenNameRes.data) {
        return { data: null, error: citizenNameRes.error || 'Citizen not found' };
      }

      const citizenName = citizenNameRes.data;

      const { data, error } = await supabase
        .from('pickup_logs')
        .select('compost_weight, recycling_weight, status')
        .eq('citizen_name', citizenName)
        .in('status', ['completed', 'skipped']);

      if (error) {
        console.error('Error fetching reward summary:', error);
        return {
          data: null,
          error: error.message || 'Failed to fetch reward summary',
        };
      }

      if (!data || data.length === 0) {
        return {
          data: {
            total_earnings: 0,
            compost_earnings: 0,
            recycling_earnings: 0,
            completed_count: 0,
            skipped_count: 0,
            total_weight: 0,
          },
          error: null,
        };
      }

      let total_compost_earnings = 0;
      let total_recycling_earnings = 0;
      let completed_count = 0;
      let skipped_count = 0;
      let total_weight = 0;

      data.forEach((log: any) => {
        const earnings = RewardCalculationService.calculateEarnings(
          log.compost_weight || 0,
          log.recycling_weight || 0,
          log.status
        );

        total_compost_earnings += earnings.compost;
        total_recycling_earnings += earnings.recycling;

        if (log.status === 'completed') {
          completed_count++;
          total_weight += (log.compost_weight || 0) + (log.recycling_weight || 0);
        } else if (log.status === 'skipped') {
          skipped_count++;
        }
      });

      return {
        data: {
          total_earnings: total_compost_earnings + total_recycling_earnings,
          compost_earnings: total_compost_earnings,
          recycling_earnings: total_recycling_earnings,
          completed_count,
          skipped_count,
          total_weight,
        },
        error: null,
      };
    } catch (error) {
      console.error('Exception in getRewardSummary:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch reward summary',
      };
    }
  },

  /**
   * Get current user ID
   */
  async getCurrentUserId(): Promise<string | null> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      return user?.id || null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  /**
   * Get reward rates
   */
  getRewardRates() {
    return REWARD_RATES;
  },
};

// Export individual functions
export const getRewardTransactions = RewardCalculationService.getRewardTransactions;
export const getRewardSummary = RewardCalculationService.getRewardSummary;
export const getCurrentUserId = RewardCalculationService.getCurrentUserId;
export const getRewardRates = RewardCalculationService.getRewardRates;
export const calculateEarnings = RewardCalculationService.calculateEarnings;
