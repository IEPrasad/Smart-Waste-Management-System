import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

interface WelcomeStartModalProps {
    visible: boolean;       // Should we show it?
    driverName: string;     // "Saman"
    pickupCount: number;    // 45
    onStartRoute: () => void; // Function to run when button is pressed
}

export default function WelcomeStartModal({
                                              visible,
                                              driverName,
                                              pickupCount,
                                              onStartRoute
                                          }: WelcomeStartModalProps) {

    if (!visible) return null;

    // Logic from your previous code:
    // Icon logic: shows Sun if >= 10 jobs, Cloud if less
    const showSun = pickupCount >= 10;

    // Button logic: active if there is at least 1 job
    const canStart = pickupCount > 0;

    return (
        <View style={styles.modalOverlay}>
        <View style={styles.welcomeCard}>
        <Text style={styles.welcomeText}>Good morning, {driverName || 'Driver'}</Text>

    <Text style={styles.sunIcon}>{showSun ? '☀️' : '☁️'}</Text>

        <Text style={styles.subText}>
        You have {pickupCount} Pickups scheduled today.
    </Text>

    <TouchableOpacity
    style={[styles.startBtn, { backgroundColor: canStart ? '#00e5bc' : '#ccc' }]}
    disabled={!canStart}
    onPress={onStartRoute}
    >
    <Text style={styles.startBtnText}>
        {canStart ? "START ROUTE" : "NO JOBS YET"}
        </Text>
        </TouchableOpacity>
        </View>
        </View>
);
}

const styles = StyleSheet.create({
    modalOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255,255,255,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 50
    },
    welcomeCard: {
        width: width * 0.85,
        backgroundColor: 'white',
        borderRadius: 30,
        padding: 40,
        alignItems: 'center',
        elevation: 20,
        shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 20,
    },
    welcomeText: { fontSize: 22, fontWeight: 'bold', textAlign: 'center' },
    sunIcon: { fontSize: 40, marginVertical: 20 },
    subText: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 30 },
    startBtn: {
        paddingVertical: 18, paddingHorizontal: 50, borderRadius: 40,
    },
    startBtnText: { color:'white', fontWeight: '900', fontSize: 18, letterSpacing: 1 },
});