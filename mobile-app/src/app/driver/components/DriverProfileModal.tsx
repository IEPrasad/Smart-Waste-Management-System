import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, Modal, TouchableOpacity, Image, Dimensions, ActivityIndicator, Alert
} from 'react-native';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { supabase } from '../../../../lib/supabase';
import { uploadDriverPhoto } from '@/services/driverService';

import EditProfileModal from './EditProfileModal';

const { width } = Dimensions.get('window');

interface DriverProfileModalProps {
    visible: boolean;
    onClose: () => void;
    onLogout: () => void;
    onHistoryPress: () => void;
}

export default function DriverProfileModal({ visible, onClose, onLogout, onHistoryPress }: DriverProfileModalProps) {
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<any>(null);
    const [isEditVisible, setEditVisible] = useState(false);

    // Fetch Full Profile + Vehicle Details when opened
    useEffect(() => {
        if (visible) {
            fetchProfileData();
        }
    }, [visible]);

    const fetchProfileData = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            const { data, error } = await supabase
                .from('driver')
                .select(`
                full_name,
                email,
                mobile_number,
                photo_url,
                vehicles (
                    vehicle_no,
                    model,
                    vehicle_type
                )
            `)
                .eq('id', user.id)
                .single();

            if (data) {
                // ✅ THE FIX: Append a unique timestamp to force a refresh
                if (data.photo_url) {
                    const timestamp = new Date().getTime();
                    data.photo_url = `${data.photo_url}?t=${timestamp}`;
                }

                setProfile(data);
            } else {
                console.error(error);
            }
        }
        setLoading(false);
    };

    const handleImagePick = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            setLoading(true);
            const publicUrl = await uploadDriverPhoto(user.id, supabase);

            if (publicUrl) {
                // Update the driver table with the new URL
                const { error } = await supabase
                    .from('driver')
                    .update({ photo_url: publicUrl })
                    .eq('id', user.id);

                if (error) throw error;

                // Refresh local state to show the new image
                fetchProfileData();
                Alert.alert("Success", "Profile picture updated!");
            }
        } catch (error: any) {
            Alert.alert("Upload Error", error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal visible={visible} transparent animationType="fade">
            <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1}>
                <View style={styles.card} onStartShouldSetResponder={() => true}>

                    <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                        <MaterialIcons name="close" size={24} color="#666" />
                    </TouchableOpacity>

                    {loading ? (
                        <ActivityIndicator size="large" color="#00e5bc" style={{ marginVertical: 20 }} />
                    ) : (
                        <>
                            {/* --- SECTION 1: DRIVER DETAILS --- */}
                            <Text style={styles.sectionTitle}>Driver Details</Text>
                            <View style={styles.driverRow}>
                                {/* PROFILE IMAGE SECTION */}
                                <TouchableOpacity
                                    style={styles.avatarCircle}
                                    onPress={handleImagePick}
                                    activeOpacity={0.7}
                                >
                                    {profile?.photo_url ? (
                                        <Image source={{ uri: profile.photo_url }} style={styles.avatarImage} />
                                    ) : (
                                        <FontAwesome5 name="user" size={30} color="#fff" />
                                    )}
                                    <View style={styles.cameraIconBadge}>
                                        <MaterialIcons name="photo-camera" size={14} color="white" />
                                    </View>
                                </TouchableOpacity>

                                <View style={styles.driverInfo}>
                                    <Text style={styles.nameText}>{profile?.full_name || "Driver"}</Text>
                                    <Text style={styles.detailText}>{profile?.email}</Text>
                                    <Text style={styles.detailText}>{profile?.mobile_number || "No phone"}</Text>

                                    <TouchableOpacity
                                        style={styles.editSmallBtn}
                                        onPress={() => setEditVisible(true)}
                                    >
                                        <Text style={styles.editSmallBtnText}>Edit Profile</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View style={styles.divider} />

                            {/* --- SECTION 2: VEHICLE DETAILS --- */}
                            <Text style={styles.sectionTitle}>Vehicle Details</Text>
                            <View style={styles.vehicleBox}>
                                <View style={styles.vehicleRow}>
                                    <Text style={styles.label}>Number:</Text>
                                    <Text style={styles.value}>{profile?.vehicles?.vehicle_no || "N/A"}</Text>
                                </View>
                                <View style={styles.vehicleRow}>
                                    <Text style={styles.label}>Model:</Text>
                                    <Text style={styles.value}>{profile?.vehicles?.model || "N/A"}</Text>
                                </View>
                                <View style={styles.vehicleRow}>
                                    <Text style={styles.label}>Type:</Text>
                                    <Text style={styles.value}>{profile?.vehicles?.vehicle_type || "N/A"}</Text>
                                </View>
                            </View>

                            {/* --- SECTION 3: BUTTONS --- */}
                            <TouchableOpacity style={styles.historyBtn} onPress={onHistoryPress}>
                                <FontAwesome5 name="history" size={16} color="#00e5bc" style={{ marginRight: 10 }} />
                                <Text style={styles.historyText}>View History</Text>
                            </TouchableOpacity>

                            <View style={styles.spacer} />

                            <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
                                <Text style={styles.logoutText}>Log Out</Text>
                                <MaterialIcons name="logout" size={20} color="white" style={{ marginLeft: 10 }} />
                            </TouchableOpacity>
                        </>
                    )}

                    <EditProfileModal
                        visible={isEditVisible}
                        onClose={() => {
                            setEditVisible(false);
                            fetchProfileData(); // Refresh if details changed
                        }}
                        currentEmail={profile?.email}
                        currentPhone={profile?.mobile_number}
                    />
                </View>
            </TouchableOpacity>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center', alignItems: 'center',
    },
    card: {
        width: width * 0.85, backgroundColor: 'white', borderRadius: 25,
        padding: 25, elevation: 15, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10,
    },
    closeBtn: { alignSelf: 'flex-end', padding: 5, marginBottom: 5 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#888', marginBottom: 10, textTransform: 'uppercase' },
    driverRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },

    avatarCircle: {
        width: 70, height: 70, borderRadius: 35, backgroundColor: '#ccc',
        justifyContent: 'center', alignItems: 'center', marginRight: 15,
        position: 'relative'
    },
    avatarImage: { width: 70, height: 70, borderRadius: 35 },
    cameraIconBadge: {
        position: 'absolute', bottom: 0, right: 0,
        backgroundColor: '#00e5bc', width: 24, height: 24, borderRadius: 12,
        justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'white',
    },

    driverInfo: { flex: 1 },
    nameText: { fontSize: 20, fontWeight: 'bold', color: '#333' },
    detailText: { fontSize: 14, color: '#666', marginTop: 2 },
    editSmallBtn: {
        marginTop: 8, paddingVertical: 5, paddingHorizontal: 10,
        borderRadius: 5, borderWidth: 1, borderColor: '#00e5bc', alignSelf: 'flex-start'
    },
    editSmallBtnText: { fontSize: 12, color: '#00e5bc', fontWeight: 'bold' },
    divider: { height: 1, backgroundColor: '#eee', marginVertical: 15 },
    vehicleBox: { backgroundColor: '#f9f9f9', borderRadius: 15, padding: 15, marginBottom: 20 },
    vehicleRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
    label: { color: '#666', fontWeight: '600' },
    value: { color: '#333', fontWeight: 'bold' },
    historyBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        padding: 15, borderWidth: 1, borderColor: '#00e5bc', borderRadius: 12, marginBottom: 10
    },
    historyText: { color: '#00e5bc', fontWeight: 'bold', fontSize: 16 },
    spacer: { height: 10 },
    logoutBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        padding: 15, backgroundColor: '#F44336', borderRadius: 12
    },
    logoutText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});