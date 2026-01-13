import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    TextInput,
    Dimensions,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import SkipReasonModal from './SkipReasonModal';

const { width } = Dimensions.get('window');

interface PickupActionModalProps {
    visible: boolean;
    pickup: any;
    onClose: () => void;
    onComplete: (compost: number, recycling: number) => void;
    onSkip: (reason: string) => void;
}

export default function PickupActionModal({
                                              visible,
                                              pickup,
                                              onClose,
                                              onComplete,
                                              onSkip
                                          }: PickupActionModalProps) {

    const [compost, setCompost] = useState('');
    const [recycling, setRecycling] = useState('');
    const [showSkipModal, setShowSkipModal] = useState(false);

    if (!pickup) return null;

    // 🔒 STRICT INTEGER-ONLY INPUT HANDLER
    const handleIntegerInput = (text: string, setter: (v: string) => void) => {
        // Allow digits only (no dots, no minus, no spaces)
        const clean = text.replace(/[^0-9]/g, '');
        setter(clean);
    };

    const handleComplete = () => {
        const compostVal = compost ? Number(compost) : 0;
        const recyclingVal = recycling ? Number(recycling) : 0;

        // Safety checks (extra protection)
        if (
            isNaN(compostVal) ||
            isNaN(recyclingVal) ||
            compostVal < 0 ||
            recyclingVal < 0
        ) {
            alert('Invalid weight entered.');
            return;
        }

        if (compostVal === 0 && recyclingVal === 0) {
            alert('Please enter at least one weight.');
            return;
        }

        onComplete(compostVal, recyclingVal);

        // Reset inputs
        setCompost('');
        setRecycling('');
    };

    return (
        <Modal visible={visible} transparent animationType="slide">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.overlay}
            >
                <TouchableOpacity style={styles.backdrop} onPress={onClose} />

                <View style={styles.card}>

                    {/* HEADER */}
                    <View style={styles.headerRow}>
                        <View style={styles.infoSection}>
                            <Text style={styles.citizenName} numberOfLines={1}>
                                {pickup.citizen_name}
                            </Text>
                            <Text style={styles.subDetail}>{pickup.gn_division}</Text>
                            <Text style={styles.subDetail}>#{pickup.assessment_no}</Text>
                        </View>

                        <View style={styles.coordBox}>
                            <Text style={styles.coordLabel}>LAT</Text>
                            <Text style={styles.coordText}>{pickup.lat.toFixed(4)}</Text>
                            <Text style={styles.coordLabel}>LNG</Text>
                            <Text style={styles.coordText}>{pickup.lng.toFixed(4)}</Text>
                        </View>

                        <TouchableOpacity
                            style={styles.skipBtn}
                            onPress={() => setShowSkipModal(true)}
                        >
                            <MaterialIcons name="block" size={24} color="#D32F2F" />
                            <Text style={styles.skipText}>Skip</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.divider} />

                    {/* INPUTS */}
                    <View style={styles.inputRow}>
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Compost (g)</Text>
                            <View style={styles.inputWrapper}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="0"
                                    keyboardType="number-pad"
                                    value={compost}
                                    maxLength={6}
                                    autoCorrect={false}
                                    autoCapitalize="none"
                                    onChangeText={(t) =>
                                        handleIntegerInput(t, setCompost)
                                    }
                                />
                            </View>
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Recycling (g)</Text>
                            <View style={styles.inputWrapper}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="0"
                                    keyboardType="number-pad"
                                    value={recycling}
                                    maxLength={6}
                                    autoCorrect={false}
                                    autoCapitalize="none"
                                    onChangeText={(t) =>
                                        handleIntegerInput(t, setRecycling)
                                    }
                                />
                            </View>
                        </View>
                    </View>

                    {/* COMPLETE BUTTON */}
                    <TouchableOpacity style={styles.completeBtn} onPress={handleComplete}>
                        <Text style={styles.btnText}>COMPLETE PICKUP</Text>
                        <MaterialIcons
                            name="check-circle"
                            size={24}
                            color="white"
                            style={{ marginLeft: 10 }}
                        />
                    </TouchableOpacity>
                </View>

                {/* SKIP MODAL */}
                <SkipReasonModal
                    visible={showSkipModal}
                    onClose={() => setShowSkipModal(false)}
                    onConfirmSkip={(reason) => {
                        setShowSkipModal(false);
                        onSkip(reason);
                    }}
                />
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: { flex: 1, justifyContent: 'flex-end' },
    backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.3)' },
    card: {
        backgroundColor: 'white',
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        padding: 20,
        elevation: 10,
    },

    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    infoSection: { flex: 2 },
    citizenName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    subDetail: { fontSize: 12, color: '#666' },

    coordBox: {
        flex: 1,
        backgroundColor: '#f0f0f0',
        padding: 6,
        borderRadius: 8,
        alignItems: 'center',
        marginHorizontal: 10,
    },

    coordLabel: { fontSize: 8, color: '#999', fontWeight: 'bold' },
    coordText: { fontSize: 10, fontWeight: 'bold', color: '#333' },

    skipBtn: { alignItems: 'center' },
    skipText: { fontSize: 10, color: '#D32F2F', fontWeight: 'bold' },

    divider: { height: 1, backgroundColor: '#eee', marginVertical: 15 },

    inputRow: { flexDirection: 'row', justifyContent: 'space-between' },
    inputContainer: { width: '48%' },

    label: { fontSize: 14, fontWeight: '600', marginBottom: 6 },
    inputWrapper: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 12,
        paddingHorizontal: 10,
        height: 50,
        justifyContent: 'center',
    },

    input: { fontSize: 18, fontWeight: 'bold' },

    completeBtn: {
        backgroundColor: '#00e5bc',
        borderRadius: 15,
        height: 55,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
    },

    btnText: { color: 'white', fontSize: 16, fontWeight: '900' },
});
