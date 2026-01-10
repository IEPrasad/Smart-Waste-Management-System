import React, { useState, useRef, useEffect } from 'react';
import {
    StyleSheet,
    TextInput,
    TextInputProps,
    TouchableOpacity,
    View,
    ViewStyle,
    Animated,
    Text
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AuthInputFieldProps extends TextInputProps {
    label: string; // Label is required for outlined field effect
    icon?: keyof typeof Ionicons.glyphMap;
    rightIcon?: keyof typeof Ionicons.glyphMap;
    onRightIconPress?: () => void;
    error?: string;
    containerStyle?: ViewStyle;
}

export default function AuthInputField({
    label,
    icon,
    rightIcon,
    onRightIconPress,
    error,
    containerStyle,
    style,
    value,
    ...props
}: AuthInputFieldProps) {
    const [isFocused, setIsFocused] = useState(false);
    // Animation for label position: 0 = inside, 1 = floating top
    const focusAnim = useRef(new Animated.Value(value ? 1 : 0)).current;

    useEffect(() => {
        Animated.timing(focusAnim, {
            toValue: isFocused || value ? 1 : 0,
            duration: 200,
            useNativeDriver: false,
        }).start();
    }, [isFocused, value]);

    // Interpolate values for styles
    const labelTop = focusAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [18, -10], // Position: vertically centered vs moved up to border
    });

    const labelFontSize = focusAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [16, 12], // Font size shrinks
    });

    const labelColor = focusAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['#999', '#1EBEA5'], // Color change on focus
    });

    // Determine icon color
    const iconColor = isFocused ? '#1EBEA5' : '#666';
    const borderColor = error ? '#FF4D4D' : (isFocused ? '#1EBEA5' : '#BBB');
    const borderWidth = isFocused ? 2 : 1;

    return (
        <View style={[styles.container, containerStyle]}>
            <View
                style={[
                    styles.inputContainer,
                    { borderColor, borderWidth },
                ]}
            >
                {/* Floating Label */}
                <Animated.Text
                    style={[
                        styles.label,
                        // { backgroundColor: '#fff' }, // Add background to hide border behind label if needed, but positioning it carefully is better
                        {
                            top: labelTop,
                            fontSize: labelFontSize,
                            color: error ? '#FF4D4D' : labelColor,
                            // Adjust left position based on whether there's an icon
                            left: icon ? 48 : 16,
                            zIndex: 1, // Ensure label is above border
                            backgroundColor: '#fff', // Mask the border
                            paddingHorizontal: 4,
                        },
                    ]}
                >
                    {label}
                </Animated.Text>

                {icon && (
                    <Ionicons
                        name={icon}
                        size={20}
                        color={iconColor}
                        style={styles.icon}
                    />
                )}

                <TextInput
                    style={[styles.input, style]}
                    value={value}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder="" // Placeholder conflicts with floating label logic usually
                    {...props}
                />

                {rightIcon && (
                    <TouchableOpacity onPress={onRightIconPress} disabled={!onRightIconPress}>
                        <Ionicons
                            name={rightIcon}
                            size={20}
                            color="#666"
                            style={styles.rightIcon}
                        />
                    </TouchableOpacity>
                )}
            </View>
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 20, // Increased spacing for floating label room
        paddingTop: 8, // Space for label to float up
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'transparent',
        borderRadius: 18, // Slightly more squared than pill
        paddingHorizontal: 18,
        height: 56,
        position: 'relative',
    },
    label: {
        position: 'absolute',
        fontWeight: '500',
    },
    icon: {
        marginRight: 12,
    },
    rightIcon: {
        marginLeft: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#333',
        height: '100%',
    },
    errorText: {
        color: '#FF4D4D',
        fontSize: 12,
        marginTop: 4,
        marginLeft: 4,
    },
});
