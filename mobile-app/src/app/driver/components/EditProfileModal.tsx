import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, Alert, ScrollView, ActivityIndicator
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { supabase } from '../../../../lib/supabase';
import ChangePasswordModal from './ChangePasswordModal';

interface EditProfileModalProps {
    visible: boolean;
    onClose: () => void;
    currentEmail: string;
    currentPhone: string;
}

export default function EditProfileModal({ visible, onClose, currentEmail, currentPhone }: EditProfileModalProps) {
    // We initialize the state with the current data passed from the profile modal
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [isPasswordModalVisible, setPasswordModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);

    // This ensures that when the modal opens, the boxes are pre-filled with current data
    useEffect(() => {
        if (visible) {
            setEmail(currentEmail);
            setPhone(currentPhone);
        }
    }, [visible, currentEmail, currentPhone]);

    const handleUpdateInfo = async () => {
        if (!email.trim() || !phone.trim()) {
            Alert.alert("Error", "Email and Phone number cannot be empty.");
            return;
        }

        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("User not found");

            // 1. UPDATE SUPABASE AUTH (This handles the login email)
            if (email.trim() !== currentEmail) {
                const { error: authError } = await supabase.auth.updateUser({
                    email: email.trim(),
                });

                if (authError) throw authError;

                // Inform the user about the confirmation email
                Alert.alert(
                    "Verify Email",
                    "A confirmation link has been sent to your new email. Please verify it to update your login credentials."
                );
            }

            // 2. UPDATE DRIVER TABLE (This handles your profile data)
            const { error: dbError } = await supabase
                .from('driver')
                .update({
                    email: email.trim(),
                    mobile_number: phone.trim()
                })
                .eq('id', user.id);

            if (dbError) throw dbError;

            Alert.alert("Success", "Profile details updated.");
            onClose();

        } catch (error: any) {
            Alert.alert("Update Failed", error.message);
        } finally {
            setLoading(false);
        }
    };

    // Helper to ensure only numbers are typed in the phone field
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
                            keyboardType="numeric" // Opens number pad
                            maxLength={10} // Optional limit
                        />
                    </View>

                    <TouchableOpacity style={styles.updateBtn} onPress={handleUpdateInfo}>
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

                {/* Secure Password Popup */}
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