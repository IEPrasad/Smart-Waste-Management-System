import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function RoleSelectionScreen() {
    const router = useRouter();
    const [selectedRole, setSelectedRole] = useState<string | null>(null);

    const handleGetStarted = () => {
        if (selectedRole) {
            // In a real app, you might save the role here
            if (selectedRole === 'citizen') {
                router.replace('/auth/citizen-login' as any);
            } else {
                router.replace('/(tabs)/home');
            }
        } else {
            // Optional: Alert user to select a role
            alert("Please select a role to continue.");
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />
            <View style={styles.contentContainer}>

                {/* Top Image Placeholder */}
                <View style={styles.imageContainer}>
                    {/* Using welcome-screen.jpg as placeholder since specific asset is missing */}
                    <Image
                        source={require('../assets/images/role_selection.jpg')}
                        style={styles.image}
                        resizeMode="contain"
                    />
                </View>

                <View style={styles.textContainer}>
                    <Text style={styles.title}>Choose your role</Text>
                    <Text style={styles.description}>
                        Choose the role that best describes you so the app can provide information and services that fit your responsibilities in waste management
                    </Text>
                </View>

                {/* Role Cards */}
                <View style={styles.cardsContainer}>
                    <TouchableOpacity
                        style={[
                            styles.card,
                            selectedRole === 'citizen' && styles.selectedCard
                        ]}
                        onPress={() => setSelectedRole('citizen')}
                    >
                        <View style={styles.iconContainer}>
                            {/* Placeholder for Citizen Icon */}
                            <FontAwesome5 name="user-alt" size={40} color={selectedRole === 'citizen' ? "#1EBEA5" : "#555"} />
                        </View>
                        <Text style={styles.cardText}>Citizen</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.card,
                            selectedRole === 'driver' && styles.selectedCard
                        ]}
                        onPress={() => setSelectedRole('driver')}
                    >
                        <View style={styles.iconContainer}>
                            {/* Placeholder for Driver Icon */}
                            <FontAwesome5 name="truck" size={40} color={selectedRole === 'driver' ? "#1EBEA5" : "#555"} />
                        </View>
                        <Text style={styles.cardText}>Driver</Text>
                    </TouchableOpacity>
                </View>

                {/* Footer Button */}
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={[styles.button, !selectedRole && styles.disabledButton]}
                        onPress={handleGetStarted}
                        disabled={!selectedRole}
                    >
                        <Text style={styles.buttonText}>Get Started</Text>
                    </TouchableOpacity>
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
        paddingHorizontal: 20,
        justifyContent: 'space-between',
        paddingVertical: 10,
    },
    imageContainer: {
        flex: 0.5,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
    },
    image: {
        marginTop: 10,
        width: 500,
        height: '100%',
    },
    textContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 20,
        textAlign: 'center',
    },
    description: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        lineHeight: 20,
        paddingHorizontal: 10,
    },
    cardsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 15,
        marginBottom: 20,
    },
    card: {
        flex: 1,
        backgroundColor: '#F0F9F6', // Light greenish background
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
        height: 200,
    },
    selectedCard: {
        borderColor: '#1EBEA5', // Teal highlight
        backgroundColor: '#E0F2F1',
    },
    iconContainer: {
        marginBottom: 15,
        width: 90,
        height: 90,
        borderRadius: 50,
        backgroundColor: '#fff', // Circle behind icon
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardText: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333',
    },
    buttonContainer: {
        paddingBottom: 20,
    },
    button: {
        backgroundColor: '#1EBEA5',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        elevation: 2,
    },
    disabledButton: {
        backgroundColor: '#A0DCD5', // Lighter/faded color
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
