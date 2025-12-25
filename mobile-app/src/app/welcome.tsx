import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Dimensions, Image, StyleSheet, Text, View } from 'react-native';
import Button from '../components/Button';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
    const router = useRouter();

    const handleNext = () => {
        router.replace('/role-selection');
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />
            <View style={styles.contentContainer}>
                {/* Top Image */}
                <View style={styles.imageContainer}>
                    <Image
                        source={require('../assets/images/welcome-screen.jpg')}
                        style={styles.image}
                        resizeMode="contain"
                    />
                </View>

                {/* Text Content */}
                <View style={styles.textContainer}>
                    <Text style={styles.title}>Welcome to</Text>
                    <Text style={styles.subtitle}>Waste Wise</Text>

                    <Text style={styles.description}>
                        Join our community to manage waste efficiently, track your pickups, and earn rewards for keeping the environment clean.
                    </Text>
                </View>

                {/* Button */}
                <View style={styles.buttonContainer}>
                    <Button title="Let's go" onPress={handleNext} />
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F0F9F6',
    },
    contentContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 20,
    },
    imageContainer: {
        flex: 0.5,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        marginTop: 20,
    },
    image: {
        width: width * 0.9,
        height: '100%',
    },
    textContainer: {
        flex: 0.3,
        alignItems: 'center',
        paddingHorizontal: 30,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#000',
        // Using default font, usually sans-serif. 
        // If serif is desired: fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 20,
    },
    description: {
        fontSize: 16,
        color: '#555',
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: 10,
    },
    buttonContainer: {
        flex: 0.2,
        justifyContent: 'center',
        width: '100%',
        paddingHorizontal: 30,
        marginBottom: 20,
    },
});
