import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackButton from '../../components/BackButton';
import { Stack } from 'expo-router';

export default function TermsOfService() {
    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            <View style={styles.header}>
                <BackButton />
                <Text style={styles.headerTitle}>Terms of Service</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <Text style={styles.title}>Terms of Service</Text>
                <Text style={styles.updatedAt}>Last updated: March 1, 2026</Text>

                <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
                <Text style={styles.paragraph}>
                    By accessing and using the Waste Wise application, you accept and agree to be bound by the terms and provisions of this agreement.
                </Text>

                <Text style={styles.sectionTitle}>2. User Account</Text>
                <Text style={styles.paragraph}>
                    To use certain features of the application, you must register for an account. You are responsible for maintaining the confidentiality of your account information.
                </Text>

                <Text style={styles.sectionTitle}>3. Waste Collection Services</Text>
                <Text style={styles.paragraph}>
                    The application facilitates communication regarding waste collection schedules and services. Users must accurately report their waste disposal needs and adhere to the guidelines provided by the local authorities.
                </Text>

                <Text style={styles.sectionTitle}>4. Data Accuracy</Text>
                <Text style={styles.paragraph}>
                    You agree to provide true, accurate, current, and complete information as prompted by the application's registration forms and service requests.
                </Text>

                <Text style={styles.sectionTitle}>5. Modifications</Text>
                <Text style={styles.paragraph}>
                    We reserve the right to modify these terms from time to time at our sole discretion. Your continued use of the application following the posting of changes will mean that you accept and agree to the changes.
                </Text>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 5,
    },
    updatedAt: {
        fontSize: 14,
        color: '#888',
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginTop: 15,
        marginBottom: 8,
    },
    paragraph: {
        fontSize: 15,
        color: '#555',
        lineHeight: 22,
        marginBottom: 10,
    },
});
