import { supabase } from '@/lib/supabase';

export interface ChatMessage {
  id: string;
  pickup_id: string;
  sender_id: string;
  receiver_id: string;
  text: string;
  is_read: boolean;
  created_at: string;
}

export interface PickupInfo {
  id: string;
  citizen_id: string;
  driver_id: string;
  status: string;
  scheduled_date: string;
  completed_at?: string | null;
}

interface ServiceResponse<T> {
  data: T | null;
  error: string | null;
}

export const PickupChatService = {
  /**
   * Get active pickup for a citizen (status = 'pending' OR recently completed within 1 hour)
   * This allows users to continue chatting for 1 hour after pickup completion
   */
  async getActivePickup(citizenId: string): Promise<ServiceResponse<PickupInfo>> {
    try {
      // Calculate timestamp for 1 hour ago
      const oneHourAgo = new Date();
      oneHourAgo.setHours(oneHourAgo.getHours() - 1);

      // Get pickups that are either:
      // 1. Status = 'pending' (active pickup)
      // 2. Status = 'completed' AND completed within last 1 hour
      const { data, error } = await supabase
        .from('pickups')
        .select('id, citizen_id, driver_id, status, scheduled_date, completed_at')
        .eq('citizen_id', citizenId)
        .or(`status.eq.pending,and(status.eq.completed,completed_at.gte.${oneHourAgo.toISOString()})`)
        .order('scheduled_date', { ascending: false })
        .limit(1);

      // Handle query error
      if (error) {
        console.error('Error fetching active pickup:', error);
        return {
          data: null,
          error: 'Failed to fetch pickup information',
        };
      }

      // No active pickup found (normal state - user has no pending pickups)
      if (!data || data.length === 0) {
        return {
          data: null,
          error: 'No active pickup found',
        };
      }

      const pickup = data[0];

      // Pickup exists but no driver assigned yet
      if (!pickup.driver_id) {
        return {
          data: null,
          error: 'No driver assigned yet',
        };
      }

      return {
        data: pickup as PickupInfo,
        error: null,
      };
    } catch (error) {
      console.error('Exception in getActivePickup:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch active pickup',
      };
    }
  },

  /**
   * Get driver information
   */
  async getDriverInfo(driverId: string): Promise<ServiceResponse<any>> {
    try {
      const { data, error } = await supabase
        .from('driver')
        .select(`
          id,
          full_name,
          mobile_number,
          vehicles (
            vehicle_no
          )
        `)
        .eq('id', driverId)
        .single();

      if (error) {
        console.error('Error fetching driver info:', error);
        return {
          data: null,
          error: 'Failed to fetch driver information',
        };
      }

      return {
        data: data,
        error: null,
      };
    } catch (error) {
      console.error('Exception in getDriverInfo:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch driver info',
      };
    }
  },

  /**
   * Fetch all messages for a pickup
   */
  async getMessages(pickupId: string): Promise<ServiceResponse<ChatMessage[]>> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('pickup_id', pickupId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        return {
          data: null,
          error: error.message || 'Failed to fetch messages',
        };
      }

      return {
        data: (data as ChatMessage[]) || [],
        error: null,
      };
    } catch (error) {
      console.error('Exception in getMessages:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch messages',
      };
    }
  },

  /**
   * Send a new message
   */
  async sendMessage(
    pickupId: string,
    senderId: string,
    receiverId: string,
    text: string
  ): Promise<ServiceResponse<ChatMessage>> {
    try {
      if (!text || text.trim() === '') {
        return {
          data: null,
          error: 'Message cannot be empty',
        };
      }

      const { data, error } = await supabase
        .from('messages')
        .insert({
          pickup_id: pickupId,
          sender_id: senderId,
          receiver_id: receiverId,
          text: text.trim(),
          is_read: false,
        })
        .select()
        .single();

      if (error) {
        console.error('Error sending message:', error);
        return {
          data: null,
          error: error.message || 'Failed to send message',
        };
      }

      return {
        data: data as ChatMessage,
        error: null,
      };
    } catch (error) {
      console.error('Exception in sendMessage:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to send message',
      };
    }
  },

  /**
   * Mark messages as read
   */
  async markMessagesAsRead(pickupId: string, userId: string): Promise<ServiceResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('pickup_id', pickupId)
        .eq('receiver_id', userId)
        .eq('is_read', false);

      if (error) {
        console.error('Error marking messages as read:', error);
        return {
          data: null,
          error: error.message || 'Failed to mark messages as read',
        };
      }

      return {
        data: true,
        error: null,
      };
    } catch (error) {
      console.error('Exception in markMessagesAsRead:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to mark messages as read',
      };
    }
  },

  /**
   * Subscribe to new messages in real-time
   */
  subscribeToMessages(pickupId: string, callback: (message: ChatMessage) => void) {
    const channel = supabase
      .channel(`messages:${pickupId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `pickup_id=eq.${pickupId}`,
        },
        (payload) => {
          console.log('New message received:', payload.new);
          callback(payload.new as ChatMessage);
        }
      )
      .subscribe();

    return channel;
  },

  /**
   * Unsubscribe from messages
   */
  unsubscribeFromMessages(channel: any) {
    if (channel) {
      supabase.removeChannel(channel);
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
export const getActivePickup = PickupChatService.getActivePickup;
export const getDriverInfo = PickupChatService.getDriverInfo;
export const getMessages = PickupChatService.getMessages;
export const sendMessage = PickupChatService.sendMessage;
export const markMessagesAsRead = PickupChatService.markMessagesAsRead;
export const subscribeToMessages = PickupChatService.subscribeToMessages;
export const unsubscribeFromMessages = PickupChatService.unsubscribeFromMessages;
export const getCurrentUserId = PickupChatService.getCurrentUserId;
