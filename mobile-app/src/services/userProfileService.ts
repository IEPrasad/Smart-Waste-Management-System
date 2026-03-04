import { supabase } from '@/lib/supabase';

export interface CitizenProfile {
  id: string;
  full_name: string;
  email: string;
  mobile_number: string;
  nic_number: string;
  assessment_number: string;
  division: string | null;
  gn_division: string | null;
  latitude: number | null;
  longitude: number | null;
  account_status: string;
  created_at: string;
}

export interface UpdateProfileData {
  email: string;
  mobile_number: string;
}

interface ServiceResponse<T> {
  data: T | null;
  error: string | null;
}

export const UserProfileService = {
  /**
   * Get citizen profile data by user ID
   */
  async getCitizenProfile(userId: string): Promise<ServiceResponse<CitizenProfile>> {
    try {
      const { data, error } = await supabase
        .from('citizens')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching citizen profile:', error);
        return {
          data: null,
          error: error.message || 'Failed to fetch profile',
        };
      }

      return {
        data: data as CitizenProfile,
        error: null,
      };
    } catch (error) {
      console.error('Exception in getCitizenProfile:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  },

  /**
   * Update citizen profile data
   */
  async updateCitizenProfile(
    userId: string,
    updates: UpdateProfileData
  ): Promise<ServiceResponse<CitizenProfile>> {
    try {
      // Validate inputs
      if (!updates.email || updates.email.trim() === '') {
        return {
          data: null,
          error: 'Email is required',
        };
      }

      if (!updates.mobile_number || updates.mobile_number.trim() === '') {
        return {
          data: null,
          error: 'Mobile number is required',
        };
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(updates.email)) {
        return {
          data: null,
          error: 'Invalid email format',
        };
      }

      // Mobile number validation (Sri Lankan format)
      const mobileRegex = /^(\+94|0)?[0-9]{9}$/;
      if (!mobileRegex.test(updates.mobile_number.replace(/\s/g, ''))) {
        return {
          data: null,
          error: 'Invalid mobile number format',
        };
      }

      // Update citizen record
      const { data, error } = await supabase
        .from('citizens')
        .update({
          email: updates.email.trim().toLowerCase(),
          mobile_number: updates.mobile_number.trim(),
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating citizen profile:', error);
        return {
          data: null,
          error: error.message || 'Failed to update profile',
        };
      }

      return {
        data: data as CitizenProfile,
        error: null,
      };
    } catch (error) {
      console.error('Exception in updateCitizenProfile:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  },

  /**
   * Update user password in auth system
   */
  async updatePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<ServiceResponse<boolean>> {
    try {
      // Validate inputs
      if (!currentPassword || currentPassword.trim() === '') {
        return {
          data: null,
          error: 'Current password is required',
        };
      }

      if (!newPassword || newPassword.trim() === '') {
        return {
          data: null,
          error: 'New password is required',
        };
      }

      if (newPassword.length < 6) {
        return {
          data: null,
          error: 'Password must be at least 6 characters long',
        };
      }

      // Check if new password is same as current
      if (currentPassword === newPassword) {
        return {
          data: null,
          error: 'New password must be different from current password',
        };
      }

      // Get current user email
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || !user.email) {
        return {
          data: null,
          error: 'User not found. Please log in again.',
        };
      }

      // Verify current password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (signInError) {
        console.error('Current password verification failed:', signInError);
        return {
          data: null,
          error: 'Current password is incorrect',
        };
      }

      // Update to new password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        console.error('Error updating password:', updateError);
        return {
          data: null,
          error: updateError.message || 'Failed to update password',
        };
      }

      return {
        data: true,
        error: null,
      };
    } catch (error) {
      console.error('Exception in updatePassword:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  },

  /**
   * Get current logged-in user ID
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

// Export individual functions for convenience
export const getCitizenProfile = UserProfileService.getCitizenProfile;
export const updateCitizenProfile = UserProfileService.updateCitizenProfile;
export const updatePassword = UserProfileService.updatePassword;
export const getCurrentUserId = UserProfileService.getCurrentUserId;
