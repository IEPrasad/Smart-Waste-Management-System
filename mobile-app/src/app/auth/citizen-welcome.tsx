import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Button from '../../components/Button';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

export default function CitizenWelcomeScreen() {
    const router = useRouter();

    const handleLogin = () => {
        router.push('/auth/citizen-login');
    };

    const handleRegister = () => {
        router.push('/auth/register-step1' as any);
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
            </View>

            <View style={styles.contentContainer}>
                {/* Illustration */}
                <View style={styles.imageContainer}>
                    <Image
                        source={require('../../assets/images/citizen.jpg')}
                        style={styles.image}
                        resizeMode="contain"
                    />
                </View>

                {/* Text Content */}
                <View style={styles.textContainer}>
                    <Text style={styles.title}>You're Continuing as a{"\n"}Citizen</Text>
                    <Text style={styles.subtitle}>
                        We'll help you manage waste services and stay{"\n"}informed in your area
                    </Text>
                </View>

                {/* Buttons */}
                <View style={styles.buttonContainer}>
                    <Button title="Log in" onPress={handleLogin} />
                    <Button title="Register" onPress={handleRegister} variant="outline" />
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
    header: {
        paddingHorizontal: 20,
        paddingTop: 10,
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
    },
    backButton: {
        padding: 5,
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: 24,
        justifyContent: 'space-between',
        paddingBottom: 110,
    },
    imageContainer: {
        marginTop: 20,
        alignItems: 'center',
        justifyContent: 'center',
        height: height * 0.30, // Approx 30% of screen height
    },
    image: {
        width: '100%',
        height: '100%',
    },
    textContainer: {
        alignItems: 'center',
        marginVertical: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111',
        textAlign: 'center',
        marginBottom: 25,
        lineHeight: 32,
    },
    subtitle: {
        fontSize: 15,
        color: '#666',
        textAlign: 'center',
        lineHeight: 22,
        maxWidth: '95%',
    },
    buttonContainer: {
        width: '100%',
        gap: 16,
    },
});
