import { supabase } from '@/lib/supabase';

export interface PickupLog {
  id: string;
  pickup_id: string;
  driver_id: string;
  citizen_name: string;
  gn_division: string;
  lat: number;
  lng: number;
  compost_weight: number;
  recycling_weight: number;
  status: string;
  note: string | null;
  created_at: string;
  driver_name?: string;
}

export interface PickupHistoryItem {
  id: string;
  status: 'completed' | 'skipped';
  collected_date: string;
  collected_time: string;
  compost_weight: number;
  recycling_weight: number;
  total_weight: number;
  driver_name: string;
  note: string | null;
}

export interface WasteSummary {
  total_compost: number;
  total_recycling: number;
  total_overall: number;
  pickup_count: number;
}

interface ServiceResponse<T> {
  data: T | null;
  error: string | null;
}

export const PickupHistoryService = {
  /**
   * Get pickup history for a citizen from pickup_logs table
   */
  async getPickupHistory(citizenId: string): Promise<ServiceResponse<PickupHistoryItem[]>> {
    try {
      // First get citizen name
      const { data: citizenData } = await supabase
        .from('citizens')
        .select('full_name')
        .eq('id', citizenId)
        .single();

      if (!citizenData) {
        return {
          data: null,
          error: 'Citizen not found',
        };
      }

      // Get pickup logs for this citizen
      const { data, error } = await supabase
        .from('pickup_logs')
        .select(`
          id,
          pickup_id,
          driver_id,
          citizen_name,
          gn_division,
          compost_weight,
          recycling_weight,
          status,
          note,
          created_at
        `)
        .eq('citizen_name', citizenData.full_name)
        .in('status', ['completed', 'skipped'])
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching pickup history:', error);
        return {
          data: null,
          error: error.message || 'Failed to fetch pickup history',
        };
      }

      if (!data || data.length === 0) {
        return {
          data: [],
          error: null,
        };
      }

      const driverIds = [...new Set(data.map(d => d.driver_id).filter(Boolean))];
      let driversMap: Record<string, string> = {};
      
      if (driverIds.length > 0) {
        const { data: driversData } = await supabase
          .from('driver')
          .select('id, full_name')
          .in('id', driverIds);
          
        if (driversData) {
          driversData.forEach(d => {
            driversMap[d.id] = d.full_name;
          });
        }
      }

      // Transform data to PickupHistoryItem format
      const historyItems: PickupHistoryItem[] = data.map((log: any) => {
        const date = new Date(log.created_at);
        
        return {
          id: log.id,
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
          total_weight: (log.compost_weight || 0) + (log.recycling_weight || 0),
          driver_name: (log.driver_id && driversMap[log.driver_id]) ? driversMap[log.driver_id] : 'Unknown Driver',
          note: log.note,
        };
      });

      return {
        data: historyItems,
        error: null,
      };
    } catch (error) {
      console.error('Exception in getPickupHistory:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch pickup history',
      };
    }
  },

  /**
   * Get waste summary (total weights) for a citizen
   */
  async getWasteSummary(citizenId: string): Promise<ServiceResponse<WasteSummary>> {
    try {
      // First get citizen name
      const { data: citizenData } = await supabase
        .from('citizens')
        .select('full_name')
        .eq('id', citizenId)
        .single();

      if (!citizenData) {
        return {
          data: null,
          error: 'Citizen not found',
        };
      }

      // Get all completed pickups for this citizen
      const { data, error } = await supabase
        .from('pickup_logs')
        .select('compost_weight, recycling_weight')
        .eq('citizen_name', citizenData.full_name)
        .eq('status', 'completed');

      if (error) {
        console.error('Error fetching waste summary:', error);
        return {
          data: null,
          error: error.message || 'Failed to fetch waste summary',
        };
      }

      if (!data || data.length === 0) {
        return {
          data: {
            total_compost: 0,
            total_recycling: 0,
            total_overall: 0,
            pickup_count: 0,
          },
          error: null,
        };
      }

      // Calculate totals
      const total_compost = data.reduce((sum, log) => sum + (log.compost_weight || 0), 0);
      const total_recycling = data.reduce((sum, log) => sum + (log.recycling_weight || 0), 0);

      return {
        data: {
          total_compost: total_compost,
          total_recycling: total_recycling,
          total_overall: total_compost + total_recycling,
          pickup_count: data.length,
        },
        error: null,
      };
    } catch (error) {
      console.error('Exception in getWasteSummary:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch waste summary',
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
};

// Export individual functions
export const getPickupHistory = PickupHistoryService.getPickupHistory;
export const getWasteSummary = PickupHistoryService.getWasteSummary;
export const getCurrentUserId = PickupHistoryService.getCurrentUserId;
