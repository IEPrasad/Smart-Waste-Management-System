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
    TouchableOpacity,
    View,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../components/Button';
import AuthInputField from '../../components/AuthInputField';
import BackButton from '../../components/BackButton';
import { citizenLogin } from '../../services/authService';

const { width, height } = Dimensions.get('window');

export default function CitizenLogin() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email.trim() || !password.trim()) {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }
        setLoading(true);

        const result = await citizenLogin(email.trim(), password.trim());

        setLoading(false);

        if (result.success) {
            // Login හරි, දැන් Status එක බලමු
            if (result.status === 'approved') {
                // Approved නම් ඇතුලට යන්න (Dashboard එකට)
                // ඔයාගේ Dashboard එක 'citizen/index' හෝ '(tabs)' වෙන්න පුළුවන්
                router.replace('/citizen' as any);
            } else if (result.status === 'pending') {
                Alert.alert(
                    "Account Pending",
                    "Your account is waiting for admin approval. Please check back later."
                );
            } else if (result.status === 'rejected') {
                Alert.alert("Account Rejected", "Sorry, your registration request has been rejected.");
            }
        } else {
            // Login වැරදියි (Password wrong or User not found)
            Alert.alert("Login Failed", result.error || "Invalid email or password");
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />
            <View style={styles.header}>
                <BackButton />
            </View>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {/* Header Image */}
                    <View style={styles.imageContainer}>
                        <Image
                            source={require('../../assets/images/citizen-login.jpg')}
                            style={styles.image}
                            resizeMode="contain"
                        />
                    </View>

                    <View style={styles.contentContainer}>
                        <Text style={styles.title}>Welcome Back</Text>
                        <Text style={styles.subtitle}>
                            Log in to stay connected with waste services in your community.
                        </Text>

                        {/* Form Section */}
                        <View style={styles.formContainer}>
                            <AuthInputField
                                label="Email"
                                icon="mail-outline"
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                            />

                            <AuthInputField
                                label="Password"
                                icon="lock-closed-outline"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                                rightIcon={showPassword ? "eye-off-outline" : "eye-outline"}
                                onRightIconPress={() => setShowPassword(!showPassword)}
                            />

                            {/* Forgot Password */}
                            <TouchableOpacity style={styles.forgotPasswordContainer}>
                                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                            </TouchableOpacity>

                            {/* Login Button */}
                            <Button title="Log in" onPress={handleLogin} style={{ marginTop: 10 }} isLoading={loading} />

                        </View>
                    </View>

                    {/* Footer Text */}
                    <View style={styles.footerContainer}>
                        <Text style={styles.footerText}>
                            Your data is protected and used only for service delivery.
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 20,
    },
    imageContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
        marginBottom: 20,
        height: height * 0.3,
    },
    image: {
        width: width * 0.9,
        height: '100%',
    },
    contentContainer: {
        paddingHorizontal: 24,
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 10,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 30,
        paddingHorizontal: 10,
    },
    formContainer: {
        marginBottom: 20,
    },
    forgotPasswordContainer: {
        alignItems: 'flex-end',
        marginBottom: 20,
        marginTop: -10,
    },
    forgotPasswordText: {
        color: '#1EBEA5',
        fontWeight: '600',
        fontSize: 14,
    },
    signupContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
    },
    signupText: {
        color: '#666',
        fontSize: 14,
    },
    signupLink: {
        color: '#1EBEA5',
        fontWeight: 'bold',
        fontSize: 14,
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

//sample comment


