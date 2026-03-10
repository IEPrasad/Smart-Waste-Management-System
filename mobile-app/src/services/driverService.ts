import { supabase } from '../lib/supabase';
import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';

export const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
};

export const fetchTodayPickups = async (uid: string) => {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
        .from('pickups')
        .select(`*, citizens(full_name, assessment_number, gn_division)`)
        .eq('driver_id', uid)
        .eq('status', 'pending')
        .eq('scheduled_date', today);

    if (error) throw error;
    return data.map((p: any) => ({
        ...p,
        citizen_name: p.citizens?.full_name,
        assessment_no: p.citizens?.assessment_number,
        gn_division: p.citizens?.gn_division
    }));
};

export const uploadDriverPhoto = async (driverId: string, supabase: any) => {
    // 1. Ask for permission and pick image
    const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: true, // We use base64 for easy upload
    });

    if (result.canceled || !result.assets[0].base64) return null;

    const fileExt = 'jpg';
    const fileName = `${driverId}.${fileExt}`;
    const filePath = `${fileName}`;

    // 2. Upload to Supabase Storage Bucket
    const { error: uploadError } = await supabase.storage
        .from('driver-images')
        .upload(filePath, decode(result.assets[0].base64), {
            contentType: 'image/jpeg',
            upsert: true, // This overwrites the old photo
        });

    if (uploadError) throw uploadError;

    // 3. Get the Public URL
    const { data } = supabase.storage.from('driver-images').getPublicUrl(filePath);

    return data.publicUrl;
};