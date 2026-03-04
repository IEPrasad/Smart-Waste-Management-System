import { supabase } from '@/lib/supabase';

export type WasteIssueType =
  | 'missed-pickup'
  | 'damaged-bin'
  | 'incorrect-sorting'
  | 'other';

export type WasteIssuePriority = 'low' | 'medium' | 'high';

export type WasteIssueStatus = 'open' | 'in_progress' | 'resolved' | 'rejected';

export interface WasteIssue {
  id: string;
  created_at: string;
  citizen_id: string | null;
  issue_type: WasteIssueType;
  description: string;
  priority: WasteIssuePriority;
  status: WasteIssueStatus;
  photo_url?: string | null;
  admin_response?: string | null;
  email?: string | null;
  mobile_no?: string | null;
}

export interface CreateWasteIssueData {
  citizen_id: string | null;
  issue_type: WasteIssueType;
  description: string;
  priority: WasteIssuePriority;
  photo_url?: string | null;
  email?: string | null;
  mobile_no?: string | null;
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

export const WasteIssuesService = {
  async createWasteIssue(
    citizenId: string | null,
    issueType: WasteIssueType,
    description: string,
    priority: WasteIssuePriority,
    options?: {
      email?: string;
      mobileNo?: string;
      photoUrl?: string;
    }
  ): Promise<ServiceResponse<WasteIssue>> {
    let loading = true;

    try {
      const payload: CreateWasteIssueData = {
        citizen_id: citizenId,
        issue_type: issueType,
        description,
        priority,
        email: options?.email ?? null,
        mobile_no: options?.mobileNo ?? null,
        photo_url: options?.photoUrl ?? null,
      };

      // Status is always controlled by the backend / admin.
      // We explicitly set it to 'open' on insert and never take it from the user.

      const { data, error } = await supabase
        .from('waste_issues')
        .insert([{ ...payload, status: 'open' }])
        .select()
        .single();

      if (error) {
        throw error;
      }

      loading = false;
      return { data: data as WasteIssue, error: null, loading };
    } catch (error) {
      loading = false;
      return {
        data: null,
        error: mapErrorMessage(error, 'Unable to submit issue report'),
        loading,
      };
    }
  },
};

export const createWasteIssue = WasteIssuesService.createWasteIssue;

