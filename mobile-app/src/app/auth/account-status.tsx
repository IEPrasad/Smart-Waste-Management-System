import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Linking,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../../lib/supabase';

const { width, height } = Dimensions.get('window');

type AccountStatus = 'pending' | 'rejected' | 'suspended';

interface StatusConfig {
    icon: keyof typeof Ionicons.glyphMap;
    iconBgColor: string;
    iconColor: string;
    title: string;
    message: string;
    primaryButtonText: string;
    primaryButtonIcon: keyof typeof Ionicons.glyphMap;
    showContactSupport: boolean;
}

const statusConfigs: Record<AccountStatus, StatusConfig> = {
    pending: {
        icon: 'hourglass-outline',
        iconBgColor: '#E8F5F2',
        iconColor: '#1EBEA5',
        title: 'Account Pending Approval',
        message: 'Your registration was submitted successfully. Please wait for admin approval before logging in.',
        primaryButtonText: 'Refresh status',
        primaryButtonIcon: 'refresh-outline',
        showContactSupport: false,
    },
    rejected: {
        icon: 'person-remove-outline',
        iconBgColor: '#FDECEC',
        iconColor: '#E74C3C',
        title: 'Account Rejected',
        message: 'Unfortunately, your registration was not approved. Please contact support for more details.',
        primaryButtonText: 'Contact support',
        primaryButtonIcon: 'headset-outline',
        showContactSupport: true,
    },
    suspended: {
        icon: 'lock-closed-outline',
        iconBgColor: '#FFF8E6',
        iconColor: '#F5A623',
        title: 'Account Suspended',
        message: 'Your account has been temporarily suspended. Please reach out to administration for assistance.',
        primaryButtonText: 'Contact support',
        primaryButtonIcon: 'headset-outline',
        showContactSupport: true,
    },
};

export default function AccountStatusScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{ status: AccountStatus; userId?: string }>();
    const [isRefreshing, setIsRefreshing] = useState(false);

    const status = (params.status as AccountStatus) || 'pending';
    const config = statusConfigs[status] || statusConfigs.pending;

    const handleRefreshStatus = async () => {
        if (!params.userId) return;

        setIsRefreshing(true);
        try {
            const { data, error } = await supabase
                .from('citizens')
                .select('account_status')
                .eq('id', params.userId)
                .single();

            if (error) throw error;

            if (data.account_status === 'approved') {
                // Status approved, navigate to citizen dashboard
                router.replace('/citizen' as any);
            } else if (data.account_status !== status) {
                // Status changed but not approved, update the screen
                router.setParams({ status: data.account_status });
            }
        } catch (error) {
            console.error('Error refreshing status:', error);
        } finally {
            setIsRefreshing(false);
        }
    };

    const handleContactSupport = () => {
        // Open email or support link
        Linking.openURL('mailto:support@wastewise.com?subject=Account%20Support%20Request');
    };

    const handleLogout = async () => {
        try {
            await supabase.auth.signOut();
            router.replace('/auth/citizen-login' as any);
        } catch (error) {
            console.error('Logout error:', error);
            router.replace('/auth/citizen-login' as any);
        }
    };

    const handlePrimaryAction = () => {
        if (config.showContactSupport) {
            handleContactSupport();
        } else {
            handleRefreshStatus();
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />

            {/* Main Content */}
            <View style={styles.content}>
                {/* Icon Container */}
                <View style={[styles.iconContainer, { backgroundColor: config.iconBgColor }]}>
                    <Ionicons name={config.icon} size={48} color={config.iconColor} />
                </View>

                {/* Title */}
                <Text style={styles.title}>{config.title}</Text>

                {/* Message */}
                <Text style={styles.message}>{config.message}</Text>
            </View>

            {/* Bottom Actions */}
            <View style={styles.bottomContainer}>
                {/* Primary Button */}
                <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={handlePrimaryAction}
                    disabled={isRefreshing}
                    activeOpacity={0.8}
                >
                    {isRefreshing ? (
                        <ActivityIndicator color="#fff" size="small" />
                    ) : (
                        <>
                            <Ionicons
                                name={config.primaryButtonIcon}
                                size={20}
                                color="#fff"
                                style={styles.buttonIcon}
                            />
                            <Text style={styles.primaryButtonText}>
                                {config.primaryButtonText}
                            </Text>
                        </>
                    )}
                </TouchableOpacity>

                {/* Logout Link */}
                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={handleLogout}
                    activeOpacity={0.7}
                >
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    iconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 32,
        // Subtle shadow for depth
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 6,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1A1A2E',
        textAlign: 'center',
        marginBottom: 16,
        letterSpacing: 0.3,
    },
    message: {
        fontSize: 15,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: 10,
    },
    bottomContainer: {
        paddingHorizontal: 24,
        paddingBottom: 40,
        alignItems: 'center',
    },
    primaryButton: {
        flexDirection: 'row',
        backgroundColor: '#1EBEA5',
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        // Button shadow
        shadowColor: '#1EBEA5',
        shadowOffset: {
            width: 0,
            height: 6,
        },
        shadowOpacity: 0.35,
        shadowRadius: 10,
        elevation: 8,
    },
    buttonIcon: {
        marginRight: 10,
    },
    primaryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 0.3,
    },
    logoutButton: {
        marginTop: 20,
        paddingVertical: 12,
        paddingHorizontal: 24,
    },
    logoutText: {
        color: '#6B7280',
        fontSize: 15,
        fontWeight: '500',
    },
});
