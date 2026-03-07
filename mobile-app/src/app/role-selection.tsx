import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Button from '../components/Button';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

export default function RoleSelectionScreen() {
    const router = useRouter();
    const [selectedRole, setSelectedRole] = useState<string | null>(null);

    const handleGetStarted = () => {
        if (selectedRole) {
            if (selectedRole === 'citizen') {
                router.push('/auth/citizen-welcome' as any);
            } else if (selectedRole === 'driver') {
                router.push('/auth/driver-login' as any);
            }
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />
            <View style={styles.contentContainer}>

                {/* Top Image */}
                <View style={styles.imageContainer}>
                    <Image
                        source={require('../assets/images/role_selection_header.jpg')}
                        style={styles.headerImage}
                        resizeMode="contain"
                    />
                </View>

                {/* Title & Description */}
                <View style={styles.textContainer}>
                    <Text style={styles.title}>Choose your role</Text>
                    <Text style={styles.description}>
                        Choose the role that best describes you so the app can provide information and services that fit your responsibilities in waste management
                    </Text>
                </View>

                {/* Role Cards */}
                <View style={styles.cardsRow}>
                    {/* Citizen Card */}
                    <TouchableOpacity
                        style={[
                            styles.card,
                            styles.citizenCard,
                            selectedRole === 'citizen' && styles.selectedCardBorder
                        ]}
                        onPress={() => setSelectedRole('citizen')}
                        activeOpacity={0.8}
                    >
                        <View style={styles.iconWrapper}>
                            <Image
                                source={require('../assets/images/citizen_icon.png')}
                                style={styles.roleIcon}
                                resizeMode="contain"
                            />
                        </View>
                        <Text style={styles.cardLabel}>Citizen</Text>
                    </TouchableOpacity>

                    {/* Driver Card */}
                    <TouchableOpacity
                        style={[
                            styles.card,
                            styles.driverCard,
                            selectedRole === 'driver' && styles.selectedCardBorder
                        ]}
                        onPress={() => setSelectedRole('driver')}
                        activeOpacity={0.8}
                    >
                        <View style={styles.iconWrapper}>
                            <Image
                                source={require('../assets/images/truck_icon.png')}
                                style={styles.roleIcon}
                                resizeMode="contain"
                            />
                        </View>
                        <Text style={styles.cardLabel}>Driver</Text>
                    </TouchableOpacity>
                </View>

                {/* Footer Button */}
                <View style={styles.buttonContainer}>
                    <Button
                        title="Get Started"
                        onPress={handleGetStarted}
                        disabled={!selectedRole}
                    />
                </View>

            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: 24,
        justifyContent: 'space-between',
        paddingBottom: 30,
    },
    imageContainer: {
        flex: 0.4,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 40,
    },
    headerImage: {
        width: width * 0.8,
        height: height * 0.3,
    },
    textContainer: {
        alignItems: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#000',
        marginTop: -35,
        marginBottom: 35,
        textAlign: 'center',
    },
    description: {
        fontSize: 15,
        color: '#666',
        textAlign: 'center',
        lineHeight: 20,
        paddingHorizontal: 0,
    },
    cardsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 20, // increased gap
        marginBottom: 30,
    },
    card: {
        flex: 1,
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        height: 200, // Square-ish
        // Default border transparent
        borderWidth: 2,
        borderColor: 'transparent',
    },
    citizenCard: {
        backgroundColor: '#F0F9F4', // Light green
    },
    driverCard: {
        backgroundColor: '#F0F8FF', // Light blue
    },
    selectedCardBorder: {
        borderColor: '#1EBEA5', // Teal selection border
    },
    iconWrapper: {
        marginBottom: 15,
        width: 80,
        height: 80,
        justifyContent: 'center',
        alignItems: 'center',
    },
    roleIcon: {
        width: '100%',
        height: '100%',
    },
    cardLabel: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
    },
    buttonContainer: {
        paddingBottom: 10,
    },
});
