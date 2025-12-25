import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import Button from '../../components/Button';
import ProgressBar from '../../components/ProgressBar';
import InputField from '../../components/InputField';
import BackButton from '../../components/BackButton';

export default function RegisterStep1() {
    const router = useRouter();
    const [fullName, setFullName] = useState('');
    const [nic, setNic] = useState('');
    const [mobile, setMobile] = useState('');
    const [email, setEmail] = useState('');

    const [errors, setErrors] = useState<{
        fullName?: string;
        nic?: string;
        mobile?: string;
        email?: string;
    }>({});

    const validateFields = () => {
        const newErrors: typeof errors = {};

        if (!fullName.trim()) {
            newErrors.fullName = 'Full Name is required';
        }

        if (!nic.trim()) {
            newErrors.nic = 'NIC Number is required';
        } else {
            // Basic NIC validation (Sri Lankan format)
            const nicRegex = /^(\d{9}[Vv]|\d{12})$/;
            if (!nicRegex.test(nic.trim())) {
                newErrors.nic = 'Please enter a valid NIC number';
            }
        }

        if (!mobile.trim()) {
            newErrors.mobile = 'Mobile Number is required';
        } else {
            // Sri Lankan mobile number validation (07XX XXX XXX)
            const mobileRegex = /^0[1-9]\d{8}$/;
            if (!mobileRegex.test(mobile.trim())) {
                newErrors.mobile = 'Please enter a valid mobile number';
            }
        }

        if (!email.trim()) {
            newErrors.email = 'Email is required';
        } else {
            // Basic email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email.trim())) {
                newErrors.email = 'Please enter a valid email address';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateFields()) {
            router.push({
                pathname: '/auth/register-step2',
                params: {
                    fullName: fullName.trim(),
                    nic: nic.trim(),
                    mobile: mobile.trim(),
                    email: email.trim(),
                },
            });
        }
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
            <ProgressBar currentStep={1} />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView
                    contentContainerStyle={styles.content}
                    keyboardShouldPersistTaps="handled"
                >
                    <Text style={styles.title}>Let's{'\n'}Get Started</Text>
                    <Text style={styles.subtitle}>
                        We need your details to verify your identity and register you for the waste management service
                    </Text>

                    {/* Full Name */}
                    <InputField
                        label="Full Name"
                        icon="person-outline"
                        placeholder="e.g. Kasun Perera"
                        value={fullName}
                        onChangeText={(text) => {
                            setFullName(text);
                            if (errors.fullName) {
                                setErrors({ ...errors, fullName: undefined });
                            }
                        }}
                        error={errors.fullName}
                        required
                    />

                    {/* NIC Number */}
                    <InputField
                        label="NIC Number"
                        icon="card-outline"
                        placeholder="200012345678 or 123456789V"
                        value={nic}
                        onChangeText={(text) => {
                            setNic(text);
                            if (errors.nic) {
                                setErrors({ ...errors, nic: undefined });
                            }
                        }}
                        autoCapitalize="characters"
                        error={errors.nic}
                        required
                    />

                    {/* Mobile Number */}
                    <InputField
                        label="Mobile Number"
                        placeholder="07XX XXX XXX"
                        keyboardType="phone-pad"
                        value={mobile}
                        onChangeText={(text) => {
                            setMobile(text);
                            if (errors.mobile) {
                                setErrors({ ...errors, mobile: undefined });
                            }
                        }}
                        error={errors.mobile}
                        required
                        leftAdornment={
                            <View style={styles.flagContainer}>
                                <Text style={styles.flag}>🇱🇰</Text>
                                <View style={styles.flagDivider} />
                            </View>
                        }
                    />

                    {/* Email */}
                    <InputField
                        label="Email"
                        icon="mail-outline"
                        placeholder="you@example.com"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={email}
                        onChangeText={(text) => {
                            setEmail(text);
                            if (errors.email) {
                                setErrors({ ...errors, email: undefined });
                            }
                        }}
                        error={errors.email}
                        required
                    />
                </ScrollView>

                {/* Footer Button */}
                <View style={styles.footer}>
                    <Button title="Next" onPress={handleNext} />
                </View>
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
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
    },
    content: {
        paddingHorizontal: 20,
        paddingBottom: 100,
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
    flagContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 10,
    },
    flag: {
        fontSize: 20,
        marginRight: 10,
    },
    flagDivider: {
        width: 1,
        height: '60%',
        backgroundColor: '#E0E0E0',
        marginRight: 10,
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        backgroundColor: '#fff',
    },
});

