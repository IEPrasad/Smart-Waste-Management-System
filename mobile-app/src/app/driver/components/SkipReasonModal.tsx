import React, { useState } from 'react';
import {
    View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, Dimensions, KeyboardAvoidingView, Platform
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface SkipReasonModalProps {
    visible: boolean;
    onClose: () => void;
    onConfirmSkip: (reason: string) => void;
}

export default function SkipReasonModal({ visible, onClose, onConfirmSkip }: SkipReasonModalProps) {
    const [reason, setReason] = useState('');

    const handleSkip = () => {
        if (!reason.trim()) {
            alert("Please state a reason for skipping.");
            return;
        }
        onConfirmSkip(reason);
        setReason(''); // Reset after submit
    };

    return (
        <Modal visible={visible} transparent animationType="fade">
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.overlay}>
                <View style={styles.card}>
                    <Text style={styles.title}>Skip this Pickup?</Text>
                    <Text style={styles.subtitle}>Please state the reason below:</Text>

                    <TextInput
                        style={styles.input}
                        placeholder="e.g. Road blocked, Gate closed..."
                        value={reason}
                        onChangeText={setReason}
                        multiline
                    />

                    <View style={styles.btnRow}>
                        <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.confirmBtn} onPress={handleSkip}>
                            <MaterialIcons name="block" size={20} color="white" style={{ marginRight: 5 }} />
                            <Text style={styles.confirmText}>SKIP ADDRESS</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    card: {
        width: width * 0.85,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 25,
        elevation: 10,
    },
    title: { fontSize: 20, fontWeight: 'bold', color: '#D32F2F', marginBottom: 5 },
    subtitle: { fontSize: 14, color: '#666', marginBottom: 15 },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        padding: 12,
        height: 80,
        textAlignVertical: 'top',
        fontSize: 16,
        marginBottom: 20,
        backgroundColor: '#f9f9f9'
    },
    btnRow: { flexDirection: 'row', justifyContent: 'space-between' },
    cancelBtn: { flex: 1, padding: 15, alignItems: 'center', marginRight: 10 },
    cancelText: { color: '#666', fontWeight: 'bold' },
    confirmBtn: {
        flex: 1.5,
        backgroundColor: '#D32F2F',
        padding: 15,
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    confirmText: { color: 'white', fontWeight: 'bold' }
});