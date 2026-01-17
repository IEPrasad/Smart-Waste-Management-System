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

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { CitizenService } from '@/services/citizen';
import { supabase } from '@/lib/supabase';

export default function SchedulePickupScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const themeColors = Colors[colorScheme ?? 'light'];
    const isDark = colorScheme === 'dark';

    // State
    const [selectedDate, setSelectedDate] = useState<number | null>(null);
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [wasteTypes, setWasteTypes] = useState({
        compost: false,
        recycling: false,
    });
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);

    // Calendar logic
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const getDaysInMonth = (month: number, year: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (month: number, year: number) => {
        return new Date(year, month, 1).getDay();
    };

    const generateCalendarDays = () => {
        const daysInMonth = getDaysInMonth(currentMonth, currentYear);
        const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
        const days = [];

        // Previous month's days
        const prevMonthDays = getDaysInMonth(currentMonth - 1, currentYear);
        for (let i = firstDay - 1; i >= 0; i--) {
            days.push({
                day: prevMonthDays - i,
                isCurrentMonth: false,
                isPast: true,
            });
        }

        // Current month's days
        const today = new Date();
        const isCurrentMonth = currentMonth === today.getMonth() && currentYear === today.getFullYear();

        for (let i = 1; i <= daysInMonth; i++) {
            // Simple "past" check (ignoring year/month diff for simplicity in this snippet, can be improved)
            const isPast = isCurrentMonth && i < today.getDate();
            days.push({
                day: i,
                isCurrentMonth: true,
                isPast,
            });
        }

        return days;
    };

    const handlePrevMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(currentYear - 1);
        } else {
            setCurrentMonth(currentMonth - 1);
        }
    };

    const handleNextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(currentYear + 1);
        } else {
            setCurrentMonth(currentMonth + 1);
        }
    };

    const toggleWasteType = (type: 'compost' | 'recycling') => {
        setWasteTypes({
            ...wasteTypes,
            [type]: !wasteTypes[type],
        });
    };

    const handleConfirm = async () => {
        if (!selectedDate) {
            Alert.alert('Error', 'Please select a date');
            return;
        }

        const selectedTypes = [];
        if (wasteTypes.compost) selectedTypes.push('Compost');
        if (wasteTypes.recycling) selectedTypes.push('Recycling');

        if (selectedTypes.length === 0) {
            Alert.alert('Error', 'Please select at least one waste type');
            return;
        }

        setLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                Alert.alert('Error', 'You must be logged in to schedule a pickup');
                setLoading(false);
                return;
            }

            // Format date: YYYY-MM-DD
            // Note: Month is 0-indexed, so add 1. Pad with 0.
            const formattedDate = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${selectedDate.toString().padStart(2, '0')}`;

            await CitizenService.createPickup({
                user_id: user.id,
                pickup_date: formattedDate,
                waste_types: selectedTypes,
                comment: comment,
            });

            Alert.alert(
                'Pickup Scheduled!',
                `Date: ${monthNames[currentMonth]} ${selectedDate}, ${currentYear}\nWaste Types: ${selectedTypes.join(', ')}\nComment: ${comment || 'None'}`,
                [
                    { text: 'OK', onPress: () => router.back() },
                ]
            );
        } catch (error: any) {
            console.error('Error scheduling pickup:', error);
            Alert.alert('Error', 'Failed to schedule pickup. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const calendarDays = generateCalendarDays();

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#151718' : '#F9FAFB' }}>

            {/* Header */}
            <ThemedView style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={themeColors.text} />
                </TouchableOpacity>
                <ThemedText type="subtitle">Schedule Pickup</ThemedText>
                <View style={styles.headerSpacer} />
            </ThemedView>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Select Date Section */}
                <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>Select Date</ThemedText>

                    {/* Calendar */}
                    <ThemedView style={[styles.calendarContainer, isDark && { backgroundColor: '#1E1E1E', shadowColor: '#000' }]}>
                        {/* Month Navigation */}
                        <View style={styles.monthNavigation}>
                            <TouchableOpacity onPress={handlePrevMonth} style={styles.monthArrow}>
                                <Ionicons name="chevron-back" size={20} color={themeColors.text} />
                            </TouchableOpacity>
                            <ThemedText style={styles.monthYear}>
                                {monthNames[currentMonth]} {currentYear}
                            </ThemedText>
                            <TouchableOpacity onPress={handleNextMonth} style={styles.monthArrow}>
                                <Ionicons name="chevron-forward" size={20} color={themeColors.text} />
                            </TouchableOpacity>
                        </View>

                        {/* Day Headers */}
                        <View style={styles.dayHeaderRow}>
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                                <ThemedText key={day} style={styles.dayHeader}>
                                    {day}
                                </ThemedText>
                            ))}
                        </View>

                        {/* Calendar Grid */}
                        <View style={styles.calendarGrid}>
                            {calendarDays.map((item, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={styles.dayCell}
                                    onPress={() => {
                                        if (item.isCurrentMonth && !item.isPast) {
                                            setSelectedDate(item.day);
                                        }
                                    }}
                                    disabled={!item.isCurrentMonth || item.isPast}
                                >
                                    <View
                                        style={[
                                            styles.dayCellInner,
                                            selectedDate === item.day && item.isCurrentMonth && { backgroundColor: themeColors.tint },
                                            selectedDate === item.day && item.isCurrentMonth && styles.selectedDay,
                                        ]}
                                    >
                                        <ThemedText
                                            style={[
                                                styles.dayText,
                                                !item.isCurrentMonth && styles.dayTextDisabled,
                                                item.isPast && styles.dayTextPast,
                                                selectedDate === item.day && item.isCurrentMonth && styles.selectedDayText,
                                            ]}
                                        >
                                            {item.day}
                                        </ThemedText>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ThemedView>
                </View>

                {/* Waste Type Section */}
                <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>Waste Type</ThemedText>

                    {/* Compost */}
                    <TouchableOpacity
                        style={[styles.wasteTypeCard, isDark && { backgroundColor: '#1E1E1E', borderColor: '#333' }]}
                        onPress={() => toggleWasteType('compost')}
                    >
                        <View style={styles.wasteTypeLeft}>
                            <View style={[
                                styles.checkbox,
                                wasteTypes.compost && { backgroundColor: themeColors.tint, borderColor: themeColors.tint }
                            ]}>
                                {wasteTypes.compost && (
                                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                                )}
                            </View>
                            <Ionicons name="leaf" size={20} color={themeColors.tint} />
                            <ThemedText style={styles.wasteTypeText}>Compost</ThemedText>
                        </View>
                    </TouchableOpacity>

                    {/* Recycling */}
                    <TouchableOpacity
                        style={[styles.wasteTypeCard, isDark && { backgroundColor: '#1E1E1E', borderColor: '#333' }]}
                        onPress={() => toggleWasteType('recycling')}
                    >
                        <View style={styles.wasteTypeLeft}>
                            <View style={[
                                styles.checkbox,
                                wasteTypes.recycling && { backgroundColor: themeColors.tint, borderColor: themeColors.tint }
                            ]}>
                                {wasteTypes.recycling && (
                                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                                )}
                            </View>
                            <Ionicons name="sync" size={20} color="#3B82F6" />
                            <ThemedText style={styles.wasteTypeText}>Recycling</ThemedText>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Comment Section */}
                <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>Comment</ThemedText>
                    <TextInput
                        style={[
                            styles.commentInput,
                            {
                                backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
                                color: isDark ? '#ECEDEE' : '#000000',
                                borderColor: isDark ? '#333' : '#E5E7EB'
                            }
                        ]}
                        placeholder="Add your comment (optional)"
                        placeholderTextColor="#9CA3AF"
                        multiline
                        numberOfLines={4}
                        value={comment}
                        onChangeText={setComment}
                        textAlignVertical="top"
                    />
                </View>

                {/* Confirm Button */}
                <TouchableOpacity
                    style={[styles.confirmButton, { backgroundColor: themeColors.tint }]}
                    onPress={handleConfirm}
                    activeOpacity={0.8}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <ThemedText style={styles.confirmButtonText}>Confirm Pickup</ThemedText>
                    )}
                </TouchableOpacity>

                <View style={{ height: 40 }} />
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
        marginTop: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 10,
    },
    calendarContainer: {
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingTop: 10,
        paddingBottom: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    monthNavigation: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 9,
    },
    monthArrow: {
        width: 28,
        height: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
    monthYear: {
        fontSize: 15,
        fontWeight: '600',
    },
    dayHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 8,
    },
    dayHeader: {
        width: 36,
        textAlign: 'center',
        fontSize: 11,
        fontWeight: '500',
        color: '#6B7280',
    },
    calendarGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: -35,
    },
    dayCell: {
        width: '14.28%',
        aspectRatio: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dayCellInner: {
        width: 28,
        height: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
    selectedDay: {
        borderRadius: 8,
    },
    dayText: {
        fontSize: 12,
        fontWeight: '400',
    },
    dayTextDisabled: {
        color: '#D1D5DB',
    },
    dayTextPast: {
        color: '#D1D5DB',
    },
    selectedDayText: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
    wasteTypeCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        padding: 10,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    wasteTypeLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    checkbox: {
        width: 18,
        height: 18,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: '#D1D5DB',
        justifyContent: 'center',
        alignItems: 'center',
    },
    wasteTypeText: {
        fontSize: 15,
        fontWeight: '500',
    },
    commentInput: {
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        padding: 10,
        fontSize: 13,
        minHeight: 70,
    },
    confirmButton: {
        borderRadius: 10,
        paddingVertical: 12,
        marginHorizontal: 18,
        marginTop: 10,
        shadowColor: '#10B981', // might want to change shadow color too
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 4,
    },
    confirmButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#FFFFFF',
        textAlign: 'center',
    },
});
