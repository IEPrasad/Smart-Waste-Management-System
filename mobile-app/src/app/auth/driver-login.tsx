import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
    Dimensions,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../components/Button';
import AuthInputField from '../../components/AuthInputField';

const { width, height } = Dimensions.get('window');

export default function DriverLoginScreen() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = () => {
        // Implement driver login logic here
        // For now, navigate to home or driver dashboard
        router.replace('/driver' as any);
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>

                    {/* Header Illustration */}
                    <View style={styles.imageContainer}>
                        <Image
                            source={require('../../assets/images/driver_login.jpg')}
                            style={styles.image}
                            resizeMode="contain"
                        />
                    </View>

                    <View style={styles.contentContainer}>
                        {/* Title Section */}
                        <Text style={styles.title}>You're Continuing as a{"\n"}Driver</Text>
                        <Text style={styles.subtitle}>
                            Login to manage your assigned waste collection tasks securely.
                        </Text>

                        {/* Form Section */}
                        <View style={styles.formContainer}>
                            <AuthInputField
                                label="Username or Email"
                                icon="mail-outline"
                                value={username}
                                onChangeText={setUsername}
                                autoCapitalize="none"
                            />

                            <AuthInputField
                                label="Password"
                                icon='lock-closed-outline'
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                                rightIcon={showPassword ? "eye-off-outline" : "eye-outline"}
                                onRightIconPress={() => setShowPassword(!showPassword)}
                            />

                            {/* Login Button */}
                            <Button title="Log in" onPress={handleLogin} style={{ marginTop: 10 }} />
                        </View>
                    </View>

                    {/* Footer Text */}
                    <View style={styles.footerContainer}>
                        <Text style={styles.footerText}>
                            Log in using the credentials provided by your administrator.
                        </Text>
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 20,
    },
    imageContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 15,
        marginBottom: 20,
        height: height * 0.25,
    },
    image: {
        width: width * 0.8,
        height: '100%',
    },
    contentContainer: {
        paddingHorizontal: 24,
    },
    title: {
        fontSize: 26,
        lineHeight: 35,
        fontWeight: 'bold',
        color: '#000',
        textAlign: 'center',
        marginBottom: 15,
    },
    subtitle: {
        fontSize: 15,
        color: '#666',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 30,
        paddingHorizontal: 3,
    },
    formContainer: {
        marginBottom: 20,
    },
    footerContainer: {
        paddingHorizontal: 20,
        marginTop: 'auto',
        marginBottom: 20,
    },
    footerText: {
        fontSize: 12,
        color: '#999',
        textAlign: 'center',
        lineHeight: 18,
    },
});
