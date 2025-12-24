import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SelectFieldProps {
    label: string;
    icon?: keyof typeof Ionicons.glyphMap;
    placeholder: string;
    value?: string;
    onPress: () => void;
    error?: string;
    required?: boolean;
    disabled?: boolean;
}

export default function SelectField({
    label,
    icon,
    placeholder,
    value,
    onPress,
    error,
    required = false,
    disabled = false,
}: SelectFieldProps) {
    return (
        <View style={styles.container}>
            <Text style={styles.label}>
                {label}
                {required && <Text style={styles.required}> *</Text>}
            </Text>
            <TouchableOpacity
                style={[
                    styles.inputContainer,
                    error && styles.inputContainerError,
                    disabled && styles.disabledContainer,
                ]}
                onPress={onPress}
                disabled={disabled}
                activeOpacity={0.7}
            >
                {icon && (
                    <Ionicons
                        name={icon}
                        size={20}
                        color={disabled ? '#ccc' : '#999'}
                        style={styles.icon}
                    />
                )}
                <Text
                    style={[
                        styles.inputText,
                        !value && styles.placeholderText,
                        disabled && styles.disabledText,
                    ]}
                >
                    {value || placeholder}
                </Text>
                <Ionicons
                    name="chevron-down"
                    size={20}
                    color={disabled ? '#ccc' : '#999'}
                    style={styles.chevron}
                />
            </TouchableOpacity>
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
    disabledContainer: {
        backgroundColor: '#f5f5f5',
        borderColor: '#eee',
    },
    icon: {
        marginRight: 10,
    },
    inputText: {
        flex: 1,
        fontSize: 16,
        color: '#333',
    },
    placeholderText: {
        color: '#999',
    },
    disabledText: {
        color: '#ccc',
    },
    chevron: {
        marginLeft: 10,
    },
    errorText: {
        fontSize: 12,
        color: '#FF0000',
        marginTop: 4,
    },
});

