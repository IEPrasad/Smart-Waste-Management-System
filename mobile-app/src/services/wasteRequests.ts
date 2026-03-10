import { supabase } from '@/lib/supabase';

export type WasteRequestStatus = 'pending' | 'scheduled' | 'collected';

export interface WasteRequest {
  id: number;
  user_id: string;
  waste_type: string[];
  status: WasteRequestStatus;
  date: string;
  division?: string;
  comment?: string;
  created_at?: string;
}

export interface CreateWasteRequestData {
  user_id: string;
  waste_type: string[];
  status?: WasteRequestStatus;
  date: string;
  division?: string;
  comment?: string;
}

interface ServiceResponse<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

const mapErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === 'string') return message;
  }
  return fallback;
};

export const WasteRequestsService = {
  async createWasteRequest(
    userId: string,
    wasteTypes: string[],
    scheduledDate: Date,
    comment?: string
  ): Promise<ServiceResponse<WasteRequest>> {
    let loading = true;

    try {
      // Fetch user's division from citizens table
    const { data: citizen, error: citizenError } = await supabase
        .from('citizens')
        .select('division')
      .eq('id', userId)
        .single();

      if (citizenError) {
        throw citizenError;
      }

      const userDivision = citizen?.division ?? undefined;

      // Adjust scheduled date to Sri Lanka timezone (UTC+5:30)
      const sriLankaOffset = 5.5 * 60 * 60 * 1000;
      const sriLankaDate = new Date(scheduledDate.getTime() + sriLankaOffset);

      const payload: CreateWasteRequestData = {
        user_id: userId,
        waste_type: wasteTypes,
        status: 'pending',
        date: sriLankaDate.toISOString(),
        division: userDivision,
        ...(comment ? { comment } : {}),
      };

      const { data, error } = await supabase
        .from('waste_requests')
        .insert([payload])
        .select()
        .single();

      if (error) {
        throw error;
      }

      loading = false;
      return { data: data as WasteRequest, error: null, loading };
    } catch (error) {
      loading = false;
      return {
        data: null,
        error: mapErrorMessage(error, 'Unable to create waste request'),
        loading,
      };
    }
  },

  async getUserWasteRequests(userId: string): Promise<ServiceResponse<WasteRequest[]>> {
    let loading = true;

    try {
      const { data, error } = await supabase
        .from('waste_requests')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (error) {
        throw error;
      }

      loading = false;
      return { data: (data || []) as WasteRequest[], error: null, loading };
    } catch (error) {
      loading = false;
      return {
        data: null,
        error: mapErrorMessage(error, 'Unable to fetch waste requests'),
        loading,
      };
    }
  },

  async updateWasteRequestStatus(
    requestId: number,
    status: WasteRequestStatus
  ): Promise<ServiceResponse<WasteRequest>> {
    let loading = true;

    try {
      const { data, error } = await supabase
        .from('waste_requests')
        .update({ status })
        .eq('id', requestId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      loading = false;
      return { data: data as WasteRequest, error: null, loading };
    } catch (error) {
      loading = false;
      return {
        data: null,
        error: mapErrorMessage(error, 'Unable to update waste request'),
        loading,
      };
    }
  },
};

export const createWasteRequest = WasteRequestsService.createWasteRequest;
export const getUserWasteRequests = WasteRequestsService.getUserWasteRequests;
export const updateWasteRequestStatus = WasteRequestsService.updateWasteRequestStatus;
