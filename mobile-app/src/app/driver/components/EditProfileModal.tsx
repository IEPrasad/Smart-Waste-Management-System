import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, Alert, ScrollView, ActivityIndicator
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { supabase } from '../../../../lib/supabase';
import ChangePasswordModal from './ChangePasswordModal';
import { useRouter } from 'expo-router'; // 1. Import router for redirection
import AsyncStorage from '@react-native-async-storage/async-storage';

interface EditProfileModalProps {
    visible: boolean;
    onClose: () => void;
    currentEmail: string;
    currentPhone: string;
}

export default function EditProfileModal({ visible, onClose, currentEmail, currentPhone }: EditProfileModalProps) {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [isPasswordModalVisible, setPasswordModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (visible) {
            setEmail(currentEmail);
            setPhone(currentPhone);
        }
    }, [visible, currentEmail, currentPhone]);

    // 2. The Main Update Function
    const handleUpdateInfo = async () => {
        if (!email.trim() || !phone.trim()) {
            Alert.alert("Error", "Email and Phone number cannot be empty.");
            return;
        }

        // Check if email is actually different
        const isEmailChanged = email.trim().toLowerCase() !== currentEmail.toLowerCase();

        if (isEmailChanged) {
            // 3. Trigger the Confirmation Alert
            Alert.alert(
                "Confirm Email Change",
                "Are you sure you want to change your email? After confirming, you will have to verify the new email and log in again with your new credentials.",
                [
                    { text: "Cancel", style: "cancel" },
                    { text: "Yes, Change and Logout", onPress: () => processUpdate(true) }
                ]
            );
        } else {
            // Just update phone number/other info
            processUpdate(false);
        }
    };

    // 4. The actual Database/Auth Logic
    const processUpdate = async (shouldLogout: boolean) => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("User not found");

            // A. Update Auth if email changed
            if (shouldLogout) {
                const { error: authError } = await supabase.auth.updateUser({
                    email: email.trim(),
                });
                if (authError) throw authError;
            }

            // B. Update Database Table
            const { error: dbError } = await supabase
                .from('driver')
                .update({
                    email: email.trim(),
                    mobile_number: phone.trim()
                })
                .eq('id', user.id);

            if (dbError) throw dbError;

            if (shouldLogout) {
                // 5. Clear session and force redirect
                await supabase.auth.signOut();
                await AsyncStorage.clear();
                Alert.alert("Action Required", "Please check your new email for a verification link, then log in.");
                onClose();
                router.replace('/auth/driver-login');
            } else {
                Alert.alert("Success", "Profile details updated.");
                onClose();
            }

        } catch (error: any) {
            Alert.alert("Update Failed", error.message);
        } finally {
            setLoading(false);
        }
    };

    const handlePhoneChange = (text: string) => {
        const numericValue = text.replace(/[^0-9]/g, '');
        setPhone(numericValue);
    };

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose}>
                        <MaterialIcons name="close" size={28} color="#333" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Edit Profile</Text>
                    <View style={{ width: 28 }} />
                </View>

                <ScrollView contentContainerStyle={styles.scroll}>
                    <Text style={styles.sectionLabel}>Contact Information</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email Address</Text>
                        <TextInput
                            style={styles.input}
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            autoCorrect={false}
                            keyboardType="email-address"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Mobile Number</Text>
                        <TextInput
                            style={styles.input}
                            value={phone}
                            onChangeText={handlePhoneChange}
                            keyboardType="numeric"
                            maxLength={10}
                        />
                    </View>

                    <TouchableOpacity style={styles.updateBtn} onPress={handleUpdateInfo} disabled={loading}>
                        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.updateBtnText}>Save Changes</Text>}
                    </TouchableOpacity>

                    <View style={styles.divider} />

                    <Text style={styles.sectionLabel}>Security</Text>
                    <TouchableOpacity
                        style={styles.passwordLinkBtn}
                        onPress={() => setPasswordModalVisible(true)}
                    >
                        <View style={styles.rowCenter}>
                            <MaterialIcons name="lock-outline" size={20} color="#333" />
                            <Text style={styles.passwordLinkText}>Change Account Password</Text>
                        </View>
                        <MaterialIcons name="chevron-right" size={24} color="#ccc" />
                    </TouchableOpacity>
                </ScrollView>

                <ChangePasswordModal
                    visible={isPasswordModalVisible}
                    onClose={() => setPasswordModalVisible(false)}
                    email={currentEmail}
                />
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 20,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#eee'
    },
    headerTitle: { fontSize: 18, fontWeight: 'bold' },
    scroll: { padding: 25 },
    sectionLabel: { fontSize: 12, fontWeight: 'bold', color: '#aaa', textTransform: 'uppercase', marginBottom: 20 },
    inputGroup: { marginBottom: 25 },
    label: { fontSize: 14, color: '#666', marginBottom: 8, fontWeight: '600' },
    input: {
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        padding: 15,
        fontSize: 16,
        color: '#333',
        borderWidth: 1,
        borderColor: '#eee'
    },
    updateBtn: {
        backgroundColor: '#00e5bc',
        padding: 18,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10,
        elevation: 2
    },
    updateBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    divider: { height: 1, backgroundColor: '#eee', marginVertical: 35 },
    passwordLinkBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        backgroundColor: '#fdfdfd',
        borderRadius: 15,
        borderWidth: 1,
        borderColor: '#f0f0f0'
    },
    rowCenter: { flexDirection: 'row', alignItems: 'center' },
    passwordLinkText: { marginLeft: 10, fontSize: 16, color: '#333', fontWeight: '500' }
});