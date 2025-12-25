import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import Button from '../../components/Button';
import ProgressBar from '../../components/ProgressBar';
import InputField from '../../components/InputField';
import BackButton from '../../components/BackButton';
import { supabase } from '../../../lib/supabase';

export default function RegisterStep3() {
    const router = useRouter();
    const params = useLocalSearchParams();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [agreed, setAgreed] = useState(false);

    const [errors, setErrors] = useState<{
        password?: string;
        confirmPassword?: string;
        agreed?: string;
    }>({});

    const validate = () => {
        const newErrors: typeof errors = {};

        const strongPassword = /^(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,}$/;
        if (!password.trim()) {
            newErrors.password = 'Password is required';
        } else if (!strongPassword.test(password.trim())) {
            newErrors.password = 'At least 8 chars, include a number and a special character';
        }

        if (!confirmPassword.trim()) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (password.trim() !== confirmPassword.trim()) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        if (!agreed) {
            newErrors.agreed = 'You must agree to the Terms of Service and Privacy Policy';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleCreateAccount = () => {
        if (!validate()) return;

        const registrationData = {
            ...params,
            password: password.trim(),
        };

        console.log('Registration Data:', registrationData);
        Alert.alert('Success', 'Account created successfully!', [
            { text: 'OK', onPress: () => router.replace('/auth/citizen-login') },
        ]);
    };

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View style={styles.header}>
                <BackButton />
                <Text style={styles.headerTitle}>Registration</Text>
                <View style={{ width: 24 }} />
            </View>

            {/* Progress Bar */}
            <ProgressBar currentStep={3} />

            <View style={styles.contentWrapper}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    style={{ flex: 1 }}
                >
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                        style={{ flex: 1 }}
                    >
                        <Text style={styles.title}>Secure{'\n'}Your Account</Text>
                        <Text style={styles.subtitle}>
                            Create a strong password to protect your account details and personal details.
                        </Text>

                        {/* Create Password */}
                        <InputField
                            label="Create Password"
                            placeholder="*************"
                            secureTextEntry={!showPassword}
                            value={password}
                            onChangeText={(text) => {
                                setPassword(text);
                                if (errors.password) setErrors({ ...errors, password: undefined });
                            }}
                            rightAdornment={
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                    <Ionicons
                                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                        size={20}
                                        color="#999"
                                    />
                                </TouchableOpacity>
                            }
                            required
                            error={errors.password}
                        />

                        <View style={styles.infoRow}>
                            <Ionicons name="information-circle-outline" size={20} color="#000" />
                            <Text style={styles.infoText}>
                                Must contain at least 8 characters, including one number and one special character.
                            </Text>
                        </View>

                        {/* Confirm Password */}
                        <InputField
                            label="Confirm Password"
                            placeholder="*************"
                            secureTextEntry={!showConfirmPassword}
                            value={confirmPassword}
                            onChangeText={(text) => {
                                setConfirmPassword(text);
                                if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined });
                            }}
                            rightAdornment={
                                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                                    <Ionicons
                                        name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                                        size={20}
                                        color="#999"
                                    />
                                </TouchableOpacity>
                            }
                            required
                            error={errors.confirmPassword}
                        />

                        {/* Terms and Conditions */}
                        <View style={styles.termsRow}>
                            <TouchableOpacity
                                style={[styles.checkbox, agreed && styles.checkboxChecked]}
                                onPress={() => {
                                    setAgreed(!agreed);
                                    if (errors.agreed) setErrors({ ...errors, agreed: undefined });
                                }}
                                activeOpacity={0.7}
                            >
                                {agreed && <Ionicons name="checkmark" size={16} color="#00E5CC" />}
                            </TouchableOpacity>
                            <Text style={styles.termsText}>
                                I agree to the <Text style={styles.link}>Terms of Service</Text> and{' '}
                                <Text style={styles.link}>Privacy Policy</Text>
                            </Text>
                        </View>
                        {errors.agreed && <Text style={styles.errorText}>{errors.agreed}</Text>}
                    </ScrollView>
                </KeyboardAvoidingView>

                {/* Footer Button - Fixed at bottom */}
                <View style={styles.footer}>
                    <Button title="Create Account" onPress={handleCreateAccount} />
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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
    },
    contentWrapper: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#000',
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 30,
        lineHeight: 20,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
        marginTop: 4,
        marginBottom: 24,
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        color: '#333',
        lineHeight: 18,
    },
    termsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 20,
        gap: 10,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderWidth: 1,
        borderColor: '#999',
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxChecked: {
        borderColor: '#00E5CC',
    },
    termsText: {
        flex: 1,
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    link: {
        color: '#00BBD4',
        fontWeight: '600',
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        backgroundColor: '#fff',
    },
    errorText: {
        fontSize: 12,
        color: '#FF0000',
        marginTop: 4,
    },
});

