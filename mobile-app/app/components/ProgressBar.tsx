import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ProgressBarProps {
    currentStep: 1 | 2 | 3;
}

export default function ProgressBar({ currentStep }: ProgressBarProps) {
    return (
        <View style={styles.container}>
            {/* Step 1: User Info */}
            <View style={[styles.stepContainer, currentStep >= 1 ? styles.activeStep : styles.inactiveStep]}>
                <Ionicons
                    name="person-outline"
                    size={24}
                    color={currentStep >= 1 ? '#000' : '#ccc'}
                />
            </View>

            {/* Connecting Line 1 */}
            <View style={[styles.line, currentStep >= 2 ? styles.activeLine : styles.inactiveLine]} />

            {/* Step 2: Location Info */}
            <View style={[styles.stepContainer, currentStep >= 2 ? styles.activeStep : styles.inactiveStep]}>
                <Ionicons
                    name="location-outline"
                    size={24}
                    color={currentStep >= 2 ? '#000' : '#ccc'}
                />
            </View>

            {/* Connecting Line 2 */}
            <View style={[styles.line, currentStep >= 3 ? styles.activeLine : styles.inactiveLine]} />

            {/* Step 3: Security Info */}
            <View style={[styles.stepContainer, currentStep >= 3 ? styles.activeStep : styles.inactiveStep]}>
                <Ionicons
                    name="lock-closed-outline"
                    size={24}
                    color={currentStep >= 3 ? '#000' : '#ccc'}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 30,
        paddingHorizontal: 20,
    },
    stepContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
    },
    activeStep: {
        backgroundColor: '#00E5CC', // Bright Teal
        borderColor: '#00E5CC',
    },
    inactiveStep: {
        backgroundColor: '#fff',
        borderColor: '#E0E0E0',
    },
    line: {
        flex: 1,
        height: 2,
        marginHorizontal: 5,
    },
    activeLine: {
        backgroundColor: '#00E5CC',
    },
    inactiveLine: {
        backgroundColor: '#E0E0E0',
    },
});
