import React, { useState } from 'react';
import {
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    View,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface TrashItem {
    id: string;
    name: string;
    description: string;
    weight: number;
    category: 'compost' | 'recycling';
    icon: string;
    date: string;
    time: string;
}

export default function SortTrashScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const themeColors = Colors[colorScheme ?? 'light'];
    const isDark = colorScheme === 'dark';

    const [selectedCategory, setSelectedCategory] = useState<'compost' | 'recycling'>('compost');

    const trashItems: TrashItem[] = [
        {
            id: '1',
            name: 'Apple Core',
            description: 'Goes in compost bin',
            weight: 10.10,
            category: 'compost',
            icon: 'nutrition', // Changed from apple which might not exist in all sets, checking common ones
            date: 'Jan 12, 2025',
            time: '10:15 AM',
        },
        {
            id: '2',
            name: 'Vegetable Scraps',
            description: 'Perfect for composting',
            weight: 1.50,
            category: 'compost',
            icon: 'leaf',
            date: 'Jan 10, 2025',
            time: '3:20 PM',
        },
        {
            id: '3',
            name: 'Coffee Grounds',
            description: 'Excellent for compost',
            weight: 3.40,
            category: 'compost',
            icon: 'cafe',
            date: 'Jan 08, 2025',
            time: '9:00 AM',
        },
        {
            id: '4',
            name: 'Plastic Bottle',
            description: 'Recycle in plastic bin',
            weight: 0.50,
            category: 'recycling',
            icon: 'water',
            date: 'Jan 15, 2025',
            time: '2:30 PM',
        },
        {
            id: '5',
            name: 'Paper',
            description: 'Clean paper is recyclable',
            weight: 2.20,
            category: 'recycling',
            icon: 'document',
            date: 'Jan 14, 2025',
            time: '4:45 PM',
        },
    ];

    const filteredItems = trashItems.filter(item => item.category === selectedCategory);
    const totalWeight = filteredItems.reduce((sum, item) => sum + item.weight, 0);

    const handleHelp = () => {
        Alert.alert(
            'Sorting Help',
            'Compost: Food waste, vegetable scraps, coffee grounds\n\nRecycling: Plastic, paper, cardboard, metal cans'
        );
    };

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
                <ThemedText type="subtitle">Trash Sorting</ThemedText>
                <TouchableOpacity
                    style={styles.helpButton}
                    onPress={handleHelp}
                >
                    <Ionicons name="help-circle" size={28} color="#6B7280" />
                </TouchableOpacity>
            </ThemedView>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Total Weight Card */}
                <View style={[styles.weightCard, { backgroundColor: themeColors.tint }]}>
                    <ThemedText style={styles.weightLabel}>Total Trash Weight</ThemedText>
                    <ThemedText style={styles.weightValue}>{totalWeight.toFixed(2)} kg</ThemedText>
                </View>

                {/* Category Tabs */}
                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[
                            styles.tab,
                            selectedCategory === 'compost' && { backgroundColor: '#D1FAE5', borderColor: '#10B981' },
                            selectedCategory !== 'compost' && { backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF', borderColor: isDark ? '#333' : '#E5E7EB' }
                        ]}
                        onPress={() => setSelectedCategory('compost')}
                    >
                        <Ionicons
                            name="leaf"
                            size={20}
                            color={selectedCategory === 'compost' ? '#10B981' : '#6B7280'}
                        />
                        <ThemedText style={[
                            styles.tabText,
                            selectedCategory === 'compost' && { color: '#10B981' },
                        ]}>
                            Compost
                        </ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.tab,
                            selectedCategory === 'recycling' && { backgroundColor: '#D1FAE5', borderColor: '#10B981' },
                            selectedCategory !== 'recycling' && { backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF', borderColor: isDark ? '#333' : '#E5E7EB' }
                        ]}
                        onPress={() => setSelectedCategory('recycling')}
                    >
                        <Ionicons
                            name="sync"
                            size={20}
                            color={selectedCategory === 'recycling' ? '#10B981' : '#6B7280'}
                        />
                        <ThemedText style={[
                            styles.tabText,
                            selectedCategory === 'recycling' && { color: '#10B981' },
                        ]}>
                            Recycling
                        </ThemedText>
                    </TouchableOpacity>
                </View>

                {/* Trash Items List */}
                <View style={styles.itemsList}>
                    {filteredItems.map((item) => (
                        <ThemedView key={item.id} style={styles.itemCard} lightColor="#FFFFFF" darkColor="#1E1E1E">
                            <View style={[styles.itemIcon, { backgroundColor: '#D1FAE5' }]}>
                                <Ionicons
                                    name={item.category === 'compost' ? 'leaf' : 'sync'}
                                    size={32}
                                    color="#10B981"
                                />
                            </View>
                            <View style={styles.itemDetails}>
                                <ThemedText style={[styles.itemCategory, { color: '#10B981' }]}>
                                    {item.category === 'compost' ? 'Compost' : 'Recycling'}
                                </ThemedText>
                                <ThemedText style={styles.itemDateTime}>
                                    {item.date} • {item.time}
                                </ThemedText>
                                <View style={styles.itemWeight}>
                                    <ThemedText style={[styles.itemWeightText, { color: '#10B981' }]}>
                                        {item.weight.toFixed(2)} kg
                                    </ThemedText>
                                </View>
                            </View>
                        </ThemedView>
                    ))}
                </View>

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
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    helpButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollView: {
        flex: 1,
    },
    weightCard: {
        marginHorizontal: 0,
        marginTop: 0,
        paddingVertical: 32,
        alignItems: 'center',
    },
    weightLabel: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFFFFF',
        marginBottom: 8,
    },
    weightValue: {
        fontSize: 28,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    tabContainer: {
        flexDirection: 'row',
        marginHorizontal: 16,
        marginTop: 20,
        gap: 12,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
        paddingVertical: 14,
        gap: 8,
        borderWidth: 1,
    },
    tabText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#6B7280',
    },
    itemsList: {
        paddingHorizontal: 16,
        marginTop: 20,
    },
    itemCard: {
        borderRadius: 14,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    itemIcon: {
        width: 70,
        height: 70,
        borderRadius: 35,
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemDetails: {
        flex: 1,
        marginLeft: 14,
    },
    itemCategory: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 4,
    },
    itemDateTime: {
        fontSize: 13,
        color: '#6B7280',
        marginBottom: 6,
    },
    itemWeight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    itemWeightText: {
        fontSize: 14,
        fontWeight: '600',
    },
});
