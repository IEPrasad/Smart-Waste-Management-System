import React from 'react';
import { View, Text, ScrollView, Platform, KeyboardAvoidingView, StyleSheet } from 'react-native';
import InputField from '../InputField';
import Button from '../Button';
import { RegisterErrors } from '../../utils/validations';

interface Step1Props {
    fullName: string;
    setFullName: (val: string) => void;
    nic: string;
    setNic: (val: string) => void;
    mobile: string;
    setMobile: (val: string) => void;
    email: string;
    setEmail: (val: string) => void;
    errors: RegisterErrors;
    setErrors: (err: RegisterErrors) => void;
    onNext: () => void;
}

export default function RegisterStep1({
    fullName, setFullName,
    nic, setNic,
    mobile, setMobile,
    email, setEmail,
    errors, setErrors,
    onNext
}: Step1Props) {
    return (
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

                <InputField
                    label="Full Name"
                    icon="person-outline"
                    placeholder="e.g. Kasun Perera"
                    value={fullName}
                    onChangeText={(text) => {
                        setFullName(text);
                        if (errors.fullName) setErrors({ ...errors, fullName: undefined });
                    }}
                    error={errors.fullName}
                    required
                />

                <InputField
                    label="NIC Number"
                    icon="card-outline"
                    placeholder="200012345678 or 123456789V"
                    value={nic}
                    onChangeText={(text) => {
                        setNic(text);
                        if (errors.nic) setErrors({ ...errors, nic: undefined });
                    }}
                    autoCapitalize="characters"
                    error={errors.nic}
                    required
                />

                <InputField
                    label="Mobile Number"
                    placeholder="07XX XXX XXX"
                    keyboardType="phone-pad"
                    value={mobile}
                    onChangeText={(text) => {
                        setMobile(text);
                        if (errors.mobile) setErrors({ ...errors, mobile: undefined });
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

                <InputField
                    label="Email"
                    icon="mail-outline"
                    placeholder="you@example.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={(text) => {
                        setEmail(text);
                        if (errors.email) setErrors({ ...errors, email: undefined });
                    }}
                    error={errors.email}
                    required
                />
            </ScrollView>

            <View style={styles.footer}>
                <Button title="Next" onPress={onNext} />
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
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
