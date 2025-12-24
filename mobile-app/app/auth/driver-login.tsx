import { Ionicons } from '@expo/vector-icons';
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
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import Button from '../components/Button';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

export default function DriverLoginScreen() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = () => {
        // Implement driver login logic here
        // For now, navigate to home or driver dashboard
        router.replace('/driver/index.tsx');
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
                            source={require('../assets/images/driver_login.jpg')}
                            style={styles.image}
                            resizeMode="contain"
                        />
                    </View>

                    <View style={styles.contentContainer}>
                        {/* Title Section */}
                        <Text style={styles.title}>You{'\''}re Continuing as a{"\n"}Driver</Text>
                        <Text style={styles.subtitle}>
                            Login to manage your assigned waste collection tasks securely.
                        </Text>

                        {/* Form Section */}
                        <View style={styles.formContainer}>

                            {/* Username Input */}
                            <Text style={styles.label}>Username</Text>
                            <View style={styles.inputContainer}>
                                <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Saman@123"
                                    placeholderTextColor="#999"
                                    value={username}
                                    onChangeText={setUsername}
                                    autoCapitalize="none"
                                />
                            </View>

                            {/* Password Input */}
                            <Text style={styles.label}>Password</Text>
                            <View style={styles.inputContainer}>
                                {/* Using empty view to align text input if no icon on left, 
                                    but design shows no icon on left for password? 
                                    Wait, screenshot shows NO icon on left for Password. 
                                    Just text input and eye icon on right. 
                                    Username HAS icon on left.
                                */}
                                <TextInput
                                    style={styles.input}
                                    placeholder="*************"
                                    placeholderTextColor="#999"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                    <Ionicons
                                        name={showPassword ? "eye-off-outline" : "eye-outline"}
                                        size={20}
                                        color="#666"
                                    />
                                </TouchableOpacity>
                            </View>

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
    label: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
        marginLeft: 4,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 30, // Rounded pill shape
        paddingHorizontal: 20,
        marginBottom: 20,
        height: 56,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#333',
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
