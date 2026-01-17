import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    View,
    TextInput,
    Switch,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { CitizenService, Profile } from '@/services/citizen';
import { supabase } from '@/lib/supabase';

export default function ProfileScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const themeColors = Colors[colorScheme ?? 'light'];
    const isDark = colorScheme === 'dark';

    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [pushNotifications, setPushNotifications] = useState(true);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserId(user.id);
                setEmail(user.email || '');
                const profile = await CitizenService.getProfile(user.id);
                if (profile) {
                    setFullName(profile.full_name || '');
                    setPhone(profile.phone || '');
                    setAddress(profile.address || '');
                }
            }
        } catch (error) {
            console.error('Error loading profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!userId) return;

        setSaving(true);
        try {
            await CitizenService.updateProfile(userId, {
                full_name: fullName,
                phone,
                address,
            });
            Alert.alert('Success', 'Your profile has been updated!');
        } catch (error) {
            console.error('Error updating profile:', error);
            Alert.alert('Error', 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordChange = async () => {
        if (!newPassword || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all password fields');
            return;
        }
        if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'New password and confirm password do not match');
            return;
        }
        if (newPassword.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters long');
            return;
        }

        try {
            const { error } = await supabase.auth.updateUser({ password: newPassword });
            if (error) throw error;

            Alert.alert('Success', 'Your password has been changed successfully!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to change password');
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: isDark ? '#151718' : '#F9FAFB' }}>
                <ActivityIndicator size="large" color={themeColors.tint} />
            </SafeAreaView>
        )
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#151718' : '#F9FAFB' }}>

            {/* Header */}
            <ThemedView style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={24} color={themeColors.text} />
                </TouchableOpacity>
                <ThemedText type="subtitle">User Profile</ThemedText>
                <View style={styles.headerSpacer} />
            </ThemedView>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Personal Information */}
                <ThemedView style={styles.section}>
                    <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Personal Information</ThemedText>

                    {/* Full Name */}
                    <View style={styles.fieldContainer}>
                        <ThemedText style={styles.label}>Full Name</ThemedText>
                        <View style={[styles.inputWrapper, isDark && { backgroundColor: '#1E1E1E', borderColor: '#333' }]}>
                            <TextInput
                                style={[styles.input, isDark && { color: '#ECEDEE' }]}
                                value={fullName}
                                onChangeText={setFullName}
                                placeholder="Enter full name"
                                placeholderTextColor={isDark ? '#555' : '#999'}
                            />
                            <Ionicons name="person-outline" size={20} color="#9CA3AF" />
                        </View>
                    </View>

                    {/* Email */}
                    <View style={styles.fieldContainer}>
                        <ThemedText style={styles.label}>Email</ThemedText>
                        <View style={[styles.inputWrapper, isDark && { backgroundColor: '#1E1E1E', borderColor: '#333' }, { opacity: 0.7 }]}>
                            <TextInput
                                style={[styles.input, isDark && { color: '#ECEDEE' }]}
                                value={email}
                                editable={false}
                                placeholder="Email"
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                            <Ionicons name="mail-outline" size={20} color="#9CA3AF" />
                        </View>
                    </View>

                    {/* Phone Number */}
                    <View style={styles.fieldContainer}>
                        <ThemedText style={styles.label}>Phone Number</ThemedText>
                        <View style={[styles.inputWrapper, isDark && { backgroundColor: '#1E1E1E', borderColor: '#333' }]}>
                            <TextInput
                                style={[styles.input, isDark && { color: '#ECEDEE' }]}
                                value={phone}
                                onChangeText={setPhone}
                                placeholder="Enter phone number"
                                keyboardType="phone-pad"
                            />
                            <Ionicons name="call-outline" size={20} color="#9CA3AF" />
                        </View>
                    </View>

                    {/* Address */}
                    <View style={styles.fieldContainer}>
                        <ThemedText style={styles.label}>Address</ThemedText>
                        <View style={[styles.inputWrapper, styles.addressWrapper, isDark && { backgroundColor: '#1E1E1E', borderColor: '#333' }]}>
                            <TextInput
                                style={[styles.input, styles.addressInput, isDark && { color: '#ECEDEE' }]}
                                value={address}
                                onChangeText={setAddress}
                                placeholder="Enter address"
                                multiline
                                numberOfLines={2}
                                textAlignVertical="top"
                            />
                            <Ionicons name="location-outline" size={20} color="#9CA3AF" />
                        </View>
                    </View>
                </ThemedView>

                {/* Security Settings */}
                <ThemedView style={styles.section}>
                    <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Security</ThemedText>

                    {/* New Password */}
                    <View style={styles.fieldContainer}>
                        <ThemedText style={styles.label}>New Password</ThemedText>
                        <View style={[styles.inputWrapper, isDark && { backgroundColor: '#1E1E1E', borderColor: '#333' }]}>
                            <TextInput
                                style={[styles.input, isDark && { color: '#ECEDEE' }]}
                                value={newPassword}
                                onChangeText={setNewPassword}
                                placeholder="Enter new password"
                                placeholderTextColor="#9CA3AF"
                                secureTextEntry={!showNewPassword}
                                autoCapitalize="none"
                            />
                            <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
                                <Ionicons
                                    name={showNewPassword ? "eye-off-outline" : "eye-outline"}
                                    size={20}
                                    color="#9CA3AF"
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Confirm Password */}
                    <View style={styles.fieldContainer}>
                        <ThemedText style={styles.label}>Confirm New Password</ThemedText>
                        <View style={[styles.inputWrapper, isDark && { backgroundColor: '#1E1E1E', borderColor: '#333' }]}>
                            <TextInput
                                style={[styles.input, isDark && { color: '#ECEDEE' }]}
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                placeholder="Re-enter new password"
                                placeholderTextColor="#9CA3AF"
                                secureTextEntry={!showConfirmPassword}
                                autoCapitalize="none"
                            />
                            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                                <Ionicons
                                    name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                                    size={20}
                                    color="#9CA3AF"
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Change Password Button */}
                    <TouchableOpacity
                        style={[styles.changePasswordButton, { backgroundColor: themeColors.tint }]}
                        onPress={handlePasswordChange}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="lock-closed" size={18} color="#FFFFFF" />
                        <ThemedText style={styles.changePasswordButtonText}>Change Password</ThemedText>
                    </TouchableOpacity>
                </ThemedView>

                {/* Notification Settings */}
                <ThemedView style={styles.section}>
                    <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Notification Settings</ThemedText>

                    <View style={styles.notificationRow}>
                        <View style={styles.notificationLeft}>
                            <Ionicons name="notifications" size={24} color={themeColors.tint} />
                            <View style={styles.notificationText}>
                                <ThemedText style={styles.notificationTitle}>Push Notifications</ThemedText>
                                <ThemedText style={styles.notificationSubtitle}>Receive push notifications on your device</ThemedText>
                            </View>
                        </View>
                        <Switch
                            value={pushNotifications}
                            onValueChange={setPushNotifications}
                            trackColor={{ false: '#E5E7EB', true: '#93C5FD' }}
                            thumbColor={pushNotifications ? themeColors.tint : '#F3F4F6'}
                        />
                    </View>
                </ThemedView>

                {/* Save Button */}
                <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleSave}
                    activeOpacity={0.8}
                    disabled={saving}
                >
                    {saving ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <ThemedText style={styles.saveButtonText}>Save Changes</ThemedText>
                    )}
                </TouchableOpacity>

                <View style={{ height: 80 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerSpacer: {
        width: 40,
    },
    scrollView: {
        flex: 1,
    },
    section: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        marginTop: 0,
        marginBottom: 8,
    },
    sectionTitle: {
        fontSize: 18,
        marginBottom: 10,
    },
    fieldContainer: {
        marginBottom: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#D1D5DB',
        paddingHorizontal: 8,
        paddingVertical: 6,
    },
    addressWrapper: {
        alignItems: 'flex-start',
        minHeight: 50,
        paddingTop: 6,
    },
    input: {
        flex: 1,
        fontSize: 14,
    },
    addressInput: {
        minHeight: 35,
    },
    notificationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    notificationLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 8,
    },
    notificationText: {
        flex: 1,
    },
    notificationTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
    },
    notificationSubtitle: {
        fontSize: 13,
        color: '#6B7280',
    },
    saveButton: {
        backgroundColor: '#EF4444',
        borderRadius: 8,
        paddingVertical: 10,
        marginHorizontal: 14,
        marginTop: 12,
        shadowColor: '#EF4444',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
        textAlign: 'center',
    },
    changePasswordButton: {
        borderRadius: 8,
        paddingVertical: 10,
        marginTop: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    changePasswordButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF',
    },
});
