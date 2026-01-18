import React, { useState } from 'react';
import {
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    View,
    TextInput,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { CitizenService } from '@/services/citizen';
import { supabase } from '@/lib/supabase';

type PriorityLevel = 'low' | 'medium' | 'high';
type IssueType = 'missed-pickup' | 'damaged-bin' | 'incorrect-sorting' | 'other';

export default function ReportIssueScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const themeColors = Colors[colorScheme ?? 'light'];
    const isDark = colorScheme === 'dark';

    const [issueType, setIssueType] = useState<IssueType | null>(null);
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState<PriorityLevel>('high');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [showIssueTypePicker, setShowIssueTypePicker] = useState(false);
    const [loading, setLoading] = useState(false);

    const issueTypes = [
        { value: 'missed-pickup', label: 'Missed Pickup' },
        { value: 'damaged-bin', label: 'Damaged Bin' },
        { value: 'incorrect-sorting', label: 'Incorrect Sorting' },
        { value: 'other', label: 'Other' },
    ];

    const handlePhotoUpload = () => {
        Alert.alert('Photo Upload', 'Photo upload feature will be added soon! You can continue without it.');
    };

    const handleSubmit = async () => {
        if (!issueType) {
            Alert.alert('Error', 'Please select an issue type');
            return;
        }

        if (description.trim().length < 10) {
            Alert.alert('Error', 'Description must be at least 10 characters');
            return;
        }

        setLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                Alert.alert('Error', 'You must be logged in to report an issue');
                setLoading(false);
                return;
            }

            await CitizenService.reportIssue({
                user_id: user.id,
                issue_type: issueType,
                description,
                priority,
                contact_phone: phone,
                contact_email: email,
                photo_url: '', // Placeholder for now
            });

            Alert.alert(
                'Report Submitted!',
                'Your report has been saved and will be reviewed within 24 hours.',
                [
                    {
                        text: 'OK',
                        onPress: () => router.back(),
                    },
                ]
            );
        } catch (error: any) {
            console.error('Error reporting issue:', error);
            Alert.alert('Error', 'Failed to submit report. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#151718' : '#F9FAFB' }}>

            {/* Header */}
            <ThemedView style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={themeColors.text} />
                </TouchableOpacity>
                <ThemedText type="subtitle">Report Issue</ThemedText>
                <View style={styles.headerSpacer} />
            </ThemedView>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Issue Type */}
                <View style={styles.section}>
                    <ThemedText style={styles.label}>
                        Issue Type<ThemedText style={styles.required}> * </ThemedText>
                    </ThemedText>
                    <TouchableOpacity
                        style={[styles.dropdown, isDark && { backgroundColor: '#1E1E1E', borderColor: '#333' }]}
                        onPress={() => setShowIssueTypePicker(!showIssueTypePicker)}
                    >
                        <ThemedText style={[styles.dropdownText, !issueType && styles.placeholder]}>
                            {issueType
                                ? issueTypes.find(t => t.value === issueType)?.label
                                : 'Select issue type'}
                        </ThemedText>
                        <Ionicons name="chevron-down" size={20} color={themeColors.text} />
                    </TouchableOpacity>

                    {showIssueTypePicker && (
                        <View style={[styles.picker, isDark && { backgroundColor: '#1E1E1E', borderColor: '#333' }]}>
                            {issueTypes.map((type) => (
                                <TouchableOpacity
                                    key={type.value}
                                    style={[styles.pickerItem, isDark && { borderBottomColor: '#333' }]}
                                    onPress={() => {
                                        setIssueType(type.value as IssueType);
                                        setShowIssueTypePicker(false);
                                    }}
                                >
                                    <ThemedText style={styles.pickerItemText}>{type.label}</ThemedText>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>

                {/* Description */}
                <View style={styles.section}>
                    <ThemedText style={styles.label}>
                        Description<ThemedText style={styles.required}> *</ThemedText>
                    </ThemedText>
                    <TextInput
                        style={[
                            styles.textArea,
                            isDark && { backgroundColor: '#1E1E1E', borderColor: '#333', color: '#ECEDEE' }
                        ]}
                        placeholder="Please describe the issue in detail..."
                        placeholderTextColor="#9CA3AF"
                        multiline
                        numberOfLines={4}
                        value={description}
                        onChangeText={setDescription}
                        textAlignVertical="top"
                    />
                    <ThemedText style={styles.helperText}>Minimum 10 characters required</ThemedText>
                </View>

                {/* Upload Evidence */}
                <View style={styles.section}>
                    <ThemedText style={styles.label}>Upload Evidence (Optional)</ThemedText>
                    <TouchableOpacity
                        style={[styles.uploadBox, isDark && { backgroundColor: '#1E1E1E', borderColor: '#333' }]}
                        onPress={handlePhotoUpload}
                    >
                        <View style={styles.uploadContent}>
                            <View style={[styles.cameraIconContainer, isDark && { backgroundColor: '#333' }]}>
                                <Ionicons name="camera" size={32} color="#9CA3AF" />
                            </View>
                            <ThemedText style={styles.uploadText}>Tap to upload photo</ThemedText>
                            <ThemedText style={styles.uploadSubtext}>PNG, JPG up to 10MB</ThemedText>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Priority Level */}
                <View style={styles.section}>
                    <ThemedText style={styles.label}>Priority Level</ThemedText>
                    <View style={styles.priorityRow}>
                        <TouchableOpacity
                            style={[
                                styles.priorityButton,
                                isDark && { backgroundColor: '#1E1E1E', borderColor: '#333' },
                                priority === 'low' && styles.priorityButtonActiveLow,
                                priority === 'low' && isDark && { backgroundColor: '#332b00' }
                            ]}
                            onPress={() => setPriority('low')}
                        >
                            <View style={[styles.priorityDot, { backgroundColor: '#F59E0B' }]} />
                            <ThemedText style={[
                                styles.priorityText,
                                priority === 'low' && styles.priorityTextActiveLow
                            ]}>
                                Low
                            </ThemedText>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.priorityButton,
                                isDark && { backgroundColor: '#1E1E1E', borderColor: '#333' },
                                priority === 'medium' && styles.priorityButtonActiveMed,
                                priority === 'medium' && isDark && { backgroundColor: '#331a00' }
                            ]}
                            onPress={() => setPriority('medium')}
                        >
                            <View style={[styles.priorityDot, { backgroundColor: '#F97316' }]} />
                            <ThemedText style={[
                                styles.priorityText,
                                priority === 'medium' && styles.priorityTextActiveMed
                            ]}>
                                Medium
                            </ThemedText>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.priorityButton,
                                isDark && { backgroundColor: '#1E1E1E', borderColor: '#333' },
                                priority === 'high' && styles.priorityButtonActiveHigh,
                                priority === 'high' && isDark && { backgroundColor: '#330a0a' }
                            ]}
                            onPress={() => setPriority('high')}
                        >
                            <View style={[styles.priorityDot, { backgroundColor: '#EF4444' }]} />
                            <ThemedText style={[
                                styles.priorityText,
                                priority === 'high' && styles.priorityTextActiveHigh
                            ]}>
                                High
                            </ThemedText>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Contact Information */}
                <View style={styles.section}>
                    <ThemedText style={styles.label}>Contact Information</ThemedText>
                    <TextInput
                        style={[
                            styles.input,
                            isDark && { backgroundColor: '#1E1E1E', borderColor: '#333', color: '#ECEDEE' }
                        ]}
                        placeholder="Phone number (optional)"
                        placeholderTextColor="#9CA3AF"
                        value={phone}
                        onChangeText={setPhone}
                        keyboardType="phone-pad"
                    />
                    <TextInput
                        style={[
                            styles.input,
                            { marginTop: 10 },
                            isDark && { backgroundColor: '#1E1E1E', borderColor: '#333', color: '#ECEDEE' }
                        ]}
                        placeholder="Email address (optional)"
                        placeholderTextColor="#9CA3AF"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleSubmit}
                    activeOpacity={0.8}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <ThemedText style={styles.submitButtonText}>Submit Issue Report</ThemedText>
                    )}
                </TouchableOpacity>

                {/* Footer Note */}
                <View style={styles.footer}>
                    <Ionicons name="information-circle-outline" size={16} color="#6B7280" />
                    <ThemedText style={styles.footerText}>
                        Your report will be reviewed within 24 hours
                    </ThemedText>
                </View>

                <View style={{ height: 60 }} />
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
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerSpacer: {
        width: 36,
    },
    scrollView: {
        flex: 1,
    },
    section: {
        paddingHorizontal: 18,
        marginTop: 16,
    },
    label: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 8,
    },
    required: {
        color: '#EF4444',
    },
    dropdown: {
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        paddingHorizontal: 14,
        paddingVertical: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dropdownText: {
        fontSize: 14,
    },
    placeholder: {
        color: '#9CA3AF',
    },
    picker: {
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        marginTop: 8,
        overflow: 'hidden',
    },
    pickerItem: {
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    pickerItemText: {
        fontSize: 14,
    },
    textArea: {
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        padding: 12,
        fontSize: 14,
        minHeight: 90,
    },
    helperText: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 6,
    },
    uploadBox: {
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: '#D1D5DB',
        padding: 24,
        alignItems: 'center',
    },
    uploadContent: {
        alignItems: 'center',
    },
    cameraIconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    uploadText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
        marginBottom: 4,
    },
    uploadSubtext: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    priorityRow: {
        flexDirection: 'row',
        gap: 10,
    },
    priorityButton: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#E5E7EB',
        paddingVertical: 14,
        alignItems: 'center',
        gap: 6,
    },
    priorityButtonActiveLow: {
        borderColor: '#F59E0B',
        backgroundColor: '#FFFBEB',
    },
    priorityButtonActiveMed: {
        borderColor: '#F97316',
        backgroundColor: '#FFF7ED',
    },
    priorityButtonActiveHigh: {
        borderColor: '#EF4444',
        backgroundColor: '#FEF2F2',
    },
    priorityDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    priorityText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#6B7280',
    },
    priorityTextActiveLow: {
        color: '#F59E0B',
    },
    priorityTextActiveMed: {
        color: '#F97316',
    },
    priorityTextActiveHigh: {
        color: '#EF4444',
    },
    input: {
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 14,
    },
    submitButton: {
        backgroundColor: '#EF4444',
        borderRadius: 10,
        paddingVertical: 14,
        marginHorizontal: 18,
        marginTop: 20,
        shadowColor: '#EF4444',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 4,
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
        textAlign: 'center',
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 16,
        gap: 6,
    },
    footerText: {
        fontSize: 12,
        color: '#6B7280',
    },
});
