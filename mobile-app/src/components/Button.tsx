import React from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TextStyle,
    TouchableOpacity,
    ViewStyle,
} from 'react-native';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'outline' | 'ghost';
    isLoading?: boolean;
    disabled?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
}

export default function Button({
    title,
    onPress,
    variant = 'primary',
    isLoading = false,
    disabled = false,
    style,
    textStyle,
}: ButtonProps) {
    const isPrimary = variant === 'primary';
    const isOutline = variant === 'outline';

    return (
        <TouchableOpacity
            style={[
                styles.button,
                isPrimary && styles.primaryButton,
                isOutline && styles.outlineButton,
                disabled && styles.disabledButton,
                style,
            ]}
            onPress={onPress}
            disabled={disabled || isLoading}
            activeOpacity={0.8}
        >
            {isLoading ? (
                <ActivityIndicator color={isPrimary ? '#000' : '#00E5CC'} />
            ) : (
                <Text
                    style={[
                        styles.text,
                        isPrimary && styles.primaryText,
                        isOutline && styles.outlineText,
                        textStyle,
                    ]}
                >
                    {title}
                </Text>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        paddingVertical: 16,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    primaryButton: {
        backgroundColor: '#00E5CC', // Bright Teal
        shadowColor: '#00E5CC',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    },
    outlineButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        elevation: 0,
        shadowOpacity: 0,
    },
    disabledButton: {
        backgroundColor: '#E0E0E0',
        shadowOpacity: 0,
        elevation: 0,
        borderColor: 'transparent',
    },
    text: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    primaryText: {
        color: '#000',
    },
    outlineText: {
        color: '#000',
    },
});
