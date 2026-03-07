import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import InputField from '../InputField';
import Button from '../Button';
import { RegisterErrors } from '../../utils/validations';

interface Step3Props {
    password: string;
    setPassword: (val: string) => void;
    confirmPassword: string;
    setConfirmPassword: (val: string) => void;
    agreed: boolean;
    setAgreed: (val: boolean) => void;
    errors: RegisterErrors;
    setErrors: (err: RegisterErrors) => void;
    onSubmit: () => void;
    loading: boolean;
}

export default function RegisterStep3({
    password, setPassword,
    confirmPassword, setConfirmPassword,
    agreed, setAgreed,
    errors, setErrors,
    onSubmit,
    loading
}: Step3Props) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{ flex: 1 }}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.title}>Secure{'\n'}Your Account</Text>
                <Text style={styles.subtitle}>
                    Create a strong password to protect your account details and personal details.
                </Text>

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

                <View style={styles.termsRow}>
                    <TouchableOpacity
                        onPress={() => {
                            setAgreed(!agreed);
                            if (errors.agreed) setErrors({ ...errors, agreed: undefined });
                        }}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
                            {agreed && <Ionicons name="checkmark" size={16} color="#00E5CC" />}
                        </View>
                    </TouchableOpacity>
                    <Text style={styles.termsText}>
                        I agree to the <Link href="/auth/terms" style={styles.link}>Terms of Service</Link> and{' '}
                        <Link href="/auth/privacy" style={styles.link}>Privacy Policy</Link>
                    </Text>
                </View>
                {errors.agreed && <Text style={styles.errorText}>{errors.agreed}</Text>}
            </ScrollView>

            <View style={styles.footer}>
                <Button title="Create Account" onPress={onSubmit} isLoading={loading} />
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
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
