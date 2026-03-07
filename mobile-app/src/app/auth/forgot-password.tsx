import React, { useState, useRef, useEffect } from 'react';
import {
    StyleSheet,
    View,
    Text,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TouchableOpacity,
    Alert,
    TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import BackButton from '../../components/BackButton';
import Button from '../../components/Button';
import InputField from '../../components/InputField';

import {
    sendPasswordResetOtp,
    verifyPasswordResetOtp,
    updatePassword,
    checkEmailExists
} from '../../services/authService';
import {
    validateForgotPassword,
    validateResetPassword,
    RegisterErrors
} from '../../utils/validations';

export default function ForgotPassword() {
    const router = useRouter();

    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<RegisterErrors>({});

    // Step 1: Email
    const [email, setEmail] = useState('');

    // Step 2: OTP
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const inputs = useRef<Array<TextInput | null>>([]);
    const [timer, setTimer] = useState(60);

    // Step 3: New Password
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        let interval: any;
        if (currentStep === 2 && timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [currentStep, timer]);

    const handleBack = () => {
        if (currentStep > 1 && currentStep < 4) {
            setCurrentStep(currentStep - 1);
        } else if (currentStep === 4) {
            router.back();
        } else {
            router.back();
        }
    };

    // --- Actions ---
    const handleSendOTP = async () => {
        const { isValid, errors: emailErrors } = validateForgotPassword(email);
        if (!isValid) {
            setErrors(emailErrors);
            return;
        }

        setLoading(true);

        // Ensure email exists before sending OTP
        const emailCheck = await checkEmailExists(email.trim());
        if (!emailCheck.exists) {
            setLoading(false);
            Alert.alert("Account Not Found", "There is no account registered with this email address.");
            return;
        }

        const res = await sendPasswordResetOtp(email.trim());
        setLoading(false);

        if (res.success) {
            setErrors({});
            setTimer(60); // Reset timer
            setCurrentStep(2);
        } else {
            Alert.alert("Error", res.error || "Failed to send reset email.");
        }
    };

    const handleVerifyOTP = async () => {
        const token = otp.join('');
        if (token.length < 6) {
            Alert.alert("Error", "Please enter the complete 6-digit OTP.");
            return;
        }

        setLoading(true);
        const res = await verifyPasswordResetOtp(email.trim(), token);
        setLoading(false);

        if (res.success) {
            setCurrentStep(3);
        } else {
            Alert.alert("Verification Failed", res.error || "Invalid or expired OTP.");
        }
    };

    const handleResendOTP = async () => {
        if (timer > 0) return;
        setLoading(true);
        const res = await sendPasswordResetOtp(email.trim());
        setLoading(false);

        if (res.success) {
            setTimer(60);
            Alert.alert("Sent", "A new OTP has been sent to your email.");
        } else {
            Alert.alert("Error", res.error || "Failed to resend OTP.");
        }
    };

    const handleUpdatePassword = async () => {
        const { isValid, errors: passErrors } = validateResetPassword(password, confirmPassword);
        if (!isValid) {
            setErrors(passErrors);
            return;
        }

        setLoading(true);
        const res = await updatePassword(password);
        setLoading(false);

        if (res.success) {
            setCurrentStep(4);
        } else {
            Alert.alert("Error", res.error || "Failed to update password.");
        }
    };

    const handleOtpChange = (text: string, index: number) => {
        const newOtp = [...otp];
        newOtp[index] = text;
        setOtp(newOtp);

        if (text && index < 5) {
            inputs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
            inputs.current[index - 1]?.focus();
        }
    };

    const getPasswordStrength = (pass: string) => {
        if (!pass) return { text: '', color: '#E0E0E0', width: '0%' };
        let strength = 0;
        if (pass.length >= 8) strength += 1;
        if (/[A-Z]/.test(pass)) strength += 1;
        if (/[0-9]/.test(pass)) strength += 1;
        if (/[^A-Za-z0-9]/.test(pass)) strength += 1;

        if (strength <= 1) return { text: 'Weak', color: '#ff4d4f', width: '30%' };
        if (strength === 2 || strength === 3) return { text: 'Medium', color: '#faad14', width: '60%' };
        return { text: 'Strong', color: '#1EBEA5', width: '100%' };
    };

    const strengthProps = getPasswordStrength(password);

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            <View style={styles.header}>
                <BackButton onPress={handleBack} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

                    {currentStep === 1 && (
                        <View style={styles.stepContainer}>
                            <View style={styles.iconContainer}>
                                <Ionicons name="lock-closed-outline" size={40} color="#1EBEA5" />
                            </View>
                            <Text style={styles.title}>Forgot Password?</Text>
                            <Text style={styles.subtitle}>
                                Don't worry! It happens. Please enter the address associated with your account.
                            </Text>

                            <View style={styles.formContainer}>
                                <InputField
                                    label="Enter your email"
                                    icon="mail-outline"
                                    placeholder="yourmail@wastewise.com"
                                    value={email}
                                    onChangeText={(text) => {
                                        setEmail(text);
                                        if (errors.email) setErrors({ ...errors, email: undefined });
                                    }}
                                    error={errors.email}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            </View>

                            <View style={styles.footerContainer}>
                                <Button title="Reset Password" onPress={handleSendOTP} isLoading={loading} disabled={loading} />
                            </View>
                        </View>
                    )}

                    {currentStep === 2 && (
                        <View style={styles.stepContainer}>
                            <Text style={styles.titleLeft}>Verify Your Identity</Text>
                            <Text style={styles.subtitleLeft}>
                                Enter the 6-digit code we sent to{'\n'}
                                <Text style={{ fontWeight: 'bold', color: '#000' }}>
                                    {email.substring(0, 3)}***@{email.split('@')[1]}
                                </Text>
                            </Text>

                            <View style={styles.otpContainer}>
                                {otp.map((digit, index) => (
                                    <TextInput
                                        key={index}
                                        style={[
                                            styles.otpInput,
                                            digit ? styles.otpInputActive : {}
                                        ]}
                                        value={digit}
                                        onChangeText={(text) => handleOtpChange(text, index)}
                                        onKeyPress={(e) => handleOtpKeyPress(e, index)}
                                        keyboardType="number-pad"
                                        maxLength={1}
                                        ref={(ref) => { inputs.current[index] = ref; }}
                                    />
                                ))}
                            </View>

                            <View style={styles.resendContainer}>
                                <Text style={styles.resendText}>
                                    Resend code in <Text style={{ color: '#1EBEA5', fontWeight: 'bold' }}>00:{timer < 10 ? `0${timer}` : timer}</Text>
                                </Text>
                                <TouchableOpacity onPress={handleResendOTP} disabled={timer > 0 || loading}>
                                    <Text style={[styles.resendLink, timer > 0 && { color: '#bbb' }]}>Resend Code</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.footerContainer}>
                                <Button title="Verify" onPress={handleVerifyOTP} isLoading={loading} disabled={loading} style={{ backgroundColor: '#1EBEA5' }} />
                            </View>
                        </View>
                    )}

                    {currentStep === 3 && (
                        <View style={styles.stepContainer}>
                            <Text style={styles.titleLeft}>Set New Password</Text>
                            <Text style={styles.subtitleLeft}>
                                Create a new, strong password for your account to ensure secure waste management.
                            </Text>

                            <View style={styles.formContainer}>
                                <InputField
                                    label="New Password"
                                    icon="lock-closed-outline"
                                    placeholder="••••••••"
                                    value={password}
                                    onChangeText={(text) => {
                                        setPassword(text);
                                        if (errors.password) setErrors({ ...errors, password: undefined });
                                    }}
                                    secureTextEntry={!showPassword}
                                    error={errors.password}
                                />
                                <TouchableOpacity
                                    style={styles.eyeIconContainer}
                                    onPress={() => setShowPassword(!showPassword)}
                                >
                                    <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#666" />
                                </TouchableOpacity>

                                {/* Strength Indicator */}
                                {password.length > 0 && (
                                    <View style={styles.strengthContainer}>
                                        <View style={styles.strengthHeader}>
                                            <Text style={styles.strengthLabel}>STRENGTH</Text>
                                            <Text style={[styles.strengthText, { color: strengthProps.color }]}>{strengthProps.text}</Text>
                                        </View>
                                        <View style={styles.strengthBarsRow}>
                                            <View style={[styles.strengthBar, { flex: parseInt(strengthProps.width) > 0 ? 1 : 0, backgroundColor: strengthProps.color }]} />
                                            <View style={[styles.strengthBar, { flex: parseInt(strengthProps.width) > 30 ? 1 : 0, backgroundColor: strengthProps.color }]} />
                                            <View style={[styles.strengthBar, { flex: parseInt(strengthProps.width) > 60 ? 1 : 0, backgroundColor: strengthProps.color }]} />
                                            <View style={[styles.strengthBar, { flex: parseInt(strengthProps.width) > 90 ? 1 : 0, backgroundColor: strengthProps.color }]} />
                                        </View>
                                        <Text style={styles.strengthDesc}>
                                            Use at least 8 characters with a mix of letters, numbers & symbols.
                                        </Text>
                                    </View>
                                )}

                                <View style={{ marginTop: 20 }}>
                                    <InputField
                                        label="Confirm New Password"
                                        icon="lock-closed-outline"
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChangeText={(text) => {
                                            setConfirmPassword(text);
                                            if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined });
                                        }}
                                        secureTextEntry={!showConfirmPassword}
                                        error={errors.confirmPassword}
                                    />
                                    <TouchableOpacity
                                        style={styles.eyeIconContainerBottom}
                                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        <Ionicons name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#666" />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View style={styles.footerContainer}>
                                <Button title="Update Password" onPress={handleUpdatePassword} isLoading={loading} disabled={loading} />
                            </View>
                        </View>
                    )}

                    {currentStep === 4 && (
                        <View style={styles.stepContainerCenter}>
                            <View style={styles.successIconContainer}>
                                <Ionicons name="checkmark-circle" size={80} color="#1EBEA5" />
                            </View>
                            <Text style={styles.titleCenter}>Password Reset{'\n'}Successful!</Text>
                            <Text style={styles.subtitleCenter}>
                                Your password has been updated. You can now log in with your new password.
                            </Text>

                            <View style={[styles.footerContainer, { marginTop: 40, width: '100%' }]}>
                                <Button title="Back to Login" onPress={handleBack} style={{ backgroundColor: '#1EBEA5' }} />
                            </View>
                        </View>
                    )}

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fefefe', // or #f9f9f9 to match the bg color of ui
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    scrollContent: {
        flexGrow: 1,
    },
    stepContainer: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 20,
    },
    stepContainerCenter: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 40,
        alignItems: 'center',
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 20,
        backgroundColor: '#E8FAF5',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#000',
        textAlign: 'center',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 30,
    },
    titleLeft: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 10,
    },
    subtitleLeft: {
        fontSize: 14,
        color: '#666',
        lineHeight: 22,
        marginBottom: 30,
    },
    formContainer: {
        marginBottom: 20,
    },
    footerContainer: {
        marginTop: 'auto',
        marginBottom: 40,
    },
    // OTP Styles
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 30,
    },
    otpInput: {
        width: 45,
        height: 55,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 12,
        fontSize: 24,
        textAlign: 'center',
        backgroundColor: '#fff',
        color: '#000',
    },
    otpInputActive: {
        borderColor: '#1EBEA5',
        borderWidth: 2,
    },
    resendContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    resendText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
    },
    resendLink: {
        fontSize: 14,
        color: '#999',
        textDecorationLine: 'underline',
    },
    // Password Strength Styles
    eyeIconContainer: {
        position: 'absolute',
        right: 15,
        top: 45,
    },
    eyeIconContainerBottom: {
        position: 'absolute',
        right: 15,
        top: 45,
    },
    strengthContainer: {
        marginTop: 10,
    },
    strengthHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    strengthLabel: {
        fontSize: 10,
        color: '#999',
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    strengthText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    strengthBarsRow: {
        flexDirection: 'row',
        height: 4,
        gap: 5,
        marginBottom: 10,
        backgroundColor: '#E0E0E0',
        borderRadius: 2,
    },
    strengthBar: {
        borderRadius: 2,
    },
    strengthDesc: {
        fontSize: 12,
        color: '#999',
        lineHeight: 18,
    },
    // Success Screen Styles
    successIconContainer: {
        marginBottom: 20,
    },
    titleCenter: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#000',
        textAlign: 'center',
        marginBottom: 10,
        lineHeight: 34,
    },
    subtitleCenter: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        lineHeight: 22,
        paddingHorizontal: 20,
    },
});
