import React from 'react';
import { StyleSheet, TextInput, TextInputProps, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface InputFieldProps extends TextInputProps {
    label: string;
    icon?: keyof typeof Ionicons.glyphMap;
    leftAdornment?: React.ReactNode;
    rightAdornment?: React.ReactNode;
    error?: string;
    required?: boolean;
}

export default function InputField({
    label,
    icon,
    leftAdornment,
    rightAdornment,
    error,
    required = false,
    ...textInputProps
}: InputFieldProps) {
    return (
        <View style={styles.container}>
            <Text style={styles.label}>
                {label}
                {required && <Text style={styles.required}> *</Text>}
            </Text>
            <View style={[styles.inputContainer, error && styles.inputContainerError]}>
                {leftAdornment ? (
                    leftAdornment
                ) : icon ? (
                    <Ionicons name={icon} size={20} color="#999" style={styles.icon} />
                ) : null}
                <TextInput
                    style={styles.input}
                    placeholderTextColor="#999"
                    {...textInputProps}
                />
                {rightAdornment}
            </View>
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        color: '#333',
    },
    required: {
        color: '#FF0000',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 12,
        paddingHorizontal: 15,
        height: 50,
        backgroundColor: '#fff',
    },
    inputContainerError: {
        borderColor: '#FF0000',
    },
    icon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#333',
    },
    errorText: {
        fontSize: 12,
        color: '#FF0000',
        marginTop: 4,
    },
});

