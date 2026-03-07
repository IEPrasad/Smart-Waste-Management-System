// src/app/auth/driver-login.tsx
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
    Alert,
    Dimensions,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    View,
    ActivityIndicator,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../components/Button';
import AuthInputField from '../../components/AuthInputField';
import { supabase } from '../../../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

export default function DriverLoginScreen() {
    const router = useRouter();
    const [username, setUsername] = useState(''); // use as email
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!username || !password) {
            Alert.alert('Error', 'Please enter email and password.');
            return;
        }

        try {
            setLoading(true);

            // 1) Sign in with Supabase Auth
            const {
                data: signInData,
                error: signInError,
            } = await supabase.auth.signInWithPassword({
                email: username.trim(),
                password,
            });

            if (signInError || !signInData.session) {
                console.log('Sign in error:', signInError);
                Alert.alert('Login failed', signInError?.message ?? 'Invalid credentials');
                setLoading(false);
                return;
            }

            const user = signInData.user;
            if (!user?.id) {
                Alert.alert('Login failed', 'No user id returned from auth.');
                setLoading(false);
                return;
            }
            const userId = user.id;

            // 2) Check the drivers table - ensure the authenticated user is a driver
            const { data: driver, error: driverError } = await supabase
                .from('driver')
                .select('*')
                .eq('id', userId)
                .single();

            if (driverError || !driver) {
                // Not a driver — sign them out to be safe
                await supabase.auth.signOut();
                Alert.alert('Not allowed', 'Your account is not registered as a driver.');
                setLoading(false);
                return;
            }

            // 3) Save driver profile locally (so driver name can be shown quickly)
            await AsyncStorage.setItem('driver_profile', JSON.stringify(driver));

            // 4) Navigate to driver screen
            router.replace('/driver' as any);
        } catch (err) {
            console.error('Login exception', err);
            Alert.alert('Error', 'Something went wrong while logging in.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.imageContainer}>
                        <Image
                            source={require('../../assets/images/driver_login.jpg')}
                            style={styles.image}
                            resizeMode="contain"
                        />
                    </View>

                    <View style={styles.contentContainer}>
                        <Text style={styles.title}>You're Continuing as a{"\n"}Driver</Text>
                        <Text style={styles.subtitle}>
                            Login to manage your assigned waste collection tasks securely.
                        </Text>

                        <View style={styles.formContainer}>
                            <AuthInputField
                                label="Email"
                                icon="mail-outline"
                                value={username}
                                onChangeText={setUsername}
                                autoCapitalize="none"
                                keyboardType="email-address"
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
                            <TouchableOpacity
                                style={styles.forgotPasswordContainer}
                                onPress={() => router.push('/auth/forgot-password')}
                            >
                                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                            </TouchableOpacity>

                            <Button
                                title="Log in"
                                onPress={handleLogin}
                                style={{ marginTop: 10 }}
                                isLoading={loading}
                                disabled={loading}
                            />
                        </View>
                    </View>

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
    /* keep your styles as before */
    container: { flex: 1, backgroundColor: '#fff' },
    scrollContent: { flexGrow: 1, paddingBottom: 20 },
    imageContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 15, marginBottom: 20, height: height * 0.25 },
    image: { width: width * 0.8, height: '100%' },
    contentContainer: { paddingHorizontal: 24 },
    title: { fontSize: 26, lineHeight: 35, fontWeight: 'bold', color: '#000', textAlign: 'center', marginBottom: 15 },
    subtitle: { fontSize: 15, color: '#666', textAlign: 'center', lineHeight: 20, marginBottom: 30, paddingHorizontal: 3 },
    formContainer: { marginBottom: 20 },
    footerContainer: { paddingHorizontal: 20, marginTop: 'auto', marginBottom: 20 },
    footerText: { fontSize: 12, color: '#999', textAlign: 'center', lineHeight: 18 },
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
});