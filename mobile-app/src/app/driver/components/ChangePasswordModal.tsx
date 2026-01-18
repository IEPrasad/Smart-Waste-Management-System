import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { supabase } from '../../../../lib/supabase';

interface ChangePasswordProps {
    visible: boolean;
    onClose: () => void;
    email: string;
}

export default function ChangePasswordModal({ visible, onClose, email }: ChangePasswordProps) {
    const [oldPass, setOldPass] = useState('');
    const [newPass, setNewPass] = useState('');
    const [confirmPass, setConfirmPass] = useState('');
    const [loading, setLoading] = useState(false);

    const handlePasswordUpdate = async () => {
        if (newPass !== confirmPass) {
            Alert.alert("Error", "New passwords do not match.");
            return;
        }

        setLoading(true);

        // 1. Re-authenticate: Check if current password is correct
        const { error: signInError } = await supabase.auth.signInWithPassword({
            email: email,
            password: oldPass,
        });

        if (signInError) {
            setLoading(false);
            Alert.alert("Verify Failed", "The current password you entered is incorrect.");
            return;
        }

        // 2. If correct, update to new password
        const { error: updateError } = await supabase.auth.updateUser({
            password: newPass
        });

        if (updateError) {
            Alert.alert("Error", updateError.message);
        } else {
            Alert.alert("Success", "Your password has been changed!");
            setOldPass(''); setNewPass(''); setConfirmPass('');
            onClose();
        }
        setLoading(false);
    };

    return (
        <Modal visible={visible} animationType="fade" transparent>
            <View style={styles.overlay}>
                <View style={styles.card}>
                    <Text style={styles.title}>Update Password</Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Current Password"
                        secureTextEntry
                        value={oldPass}
                        onChangeText={setOldPass}
                    />
                    <View style={styles.line} />

                    <TextInput
                        style={styles.input}
                        placeholder="New Password"
                        secureTextEntry
                        value={newPass}
                        onChangeText={setNewPass}
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Confirm New Password"
                        secureTextEntry
                        value={confirmPass}
                        onChangeText={setConfirmPass}
                    />

                    <View style={styles.row}>
                        <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                            <Text>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.confirmBtn} onPress={handlePasswordUpdate}>
                            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.confirmText}>Update</Text>}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
    card: { width: '85%', backgroundColor: '#fff', borderRadius: 20, padding: 25 },
    title: { fontSize: 18, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    input: { padding: 15, backgroundColor: '#f0f0f0', borderRadius: 10, marginBottom: 10 },
    line: { height: 2, backgroundColor: '#00e5bc', marginVertical: 10, borderRadius: 1 },
    row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
    cancelBtn: { padding: 15, flex: 1, alignItems: 'center' },
    confirmBtn: { backgroundColor: '#333', padding: 15, flex: 1, borderRadius: 10, alignItems: 'center' },
    confirmText: { color: '#fff', fontWeight: 'bold' }
});