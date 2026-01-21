import { supabase } from '../lib/supabase';

export interface Profile {
    id: string;
    full_name: string;
    email: string;
    phone?: string;
    address?: string;
    avatar_url?: string;
    role: 'citizen' | 'driver' | 'admin';
}

export interface Pickup {
    id?: string;
    user_id: string;
    pickup_date: string; // YYYY-MM-DD
    waste_types: string[];
    comment?: string;
    status: 'pending' | 'accepted' | 'completed' | 'cancelled';
    created_at?: string;
}

export interface Issue {
    id?: string;
    user_id: string;
    issue_type: string;
    description: string;
    photo_url?: string;
    priority: 'low' | 'medium' | 'high';
    status: 'open' | 'in-progress' | 'resolved';
    contact_phone?: string;
    contact_email?: string;
    created_at?: string;
}

export interface Transaction {
    id: string;
    user_id: string;
    category: 'recycling' | 'compost';
    weight: number;
    rate: number;
    earnings: number;
    date: string;
    time: string;
    status: 'completed' | 'processing';
}

export interface Message {
    id: string;
    sender_id: string;
    receiver_id?: string;
    content: string;
    is_read: boolean;
    created_at: string;
}

export const CitizenService = {
    // Profiles
    async getProfile(userId: string) {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
        if (error) throw error;
        return data as Profile;
    },

    async updateProfile(userId: string, updates: Partial<Profile>) {
        const { data, error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', userId)
            .select()
            .single();
        if (error) throw error;
        return data as Profile;
    },

    // Pickups
    async createPickup(pickup: Omit<Pickup, 'id' | 'created_at' | 'status'>) {
        const { data, error } = await supabase
            .from('pickups')
            .insert([{ ...pickup, status: 'pending' }])
            .select()
            .single();
        if (error) throw error;
        return data as Pickup;
    },

    async getPickups(userId: string) {
        const { data, error } = await supabase
            .from('pickups')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data as Pickup[];
    },

    // Issues
    async reportIssue(issue: Omit<Issue, 'id' | 'created_at' | 'status'>) {
        const { data, error } = await supabase
            .from('issues')
            .insert([{ ...issue, status: 'open' }])
            .select()
            .single();
        if (error) throw error;
        return data as Issue;
    },

    async getIssues(userId: string) {
        const { data, error } = await supabase
            .from('issues')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data as Issue[];
    },

    // Rewards
    async getRewardsHistory(userId: string) {
        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', userId)
            .order('date', { ascending: false });
        if (error) throw error;
        return data as Transaction[];
    },

    // Messages
    async sendMessage(senderId: string, content: string, receiverId?: string) {
        const { data, error } = await supabase
            .from('messages')
            .insert([{ sender_id: senderId, receiver_id: receiverId, content }])
            .select()
            .single();
        if (error) throw error;
        return data as Message;
    },

    async getMessages(userId: string) {
        // Determine how we want to fetch messages. For now, all messages involving the user.
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
            .order('created_at', { ascending: true });
        if (error) throw error;
        return data as Message[];
    }
};
