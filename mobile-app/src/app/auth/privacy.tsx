import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackButton from '../../components/BackButton';
import { Stack } from 'expo-router';

export default function PrivacyPolicy() {
    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            <View style={styles.header}>
                <BackButton />
                <Text style={styles.headerTitle}>Privacy Policy</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <Text style={styles.title}>Privacy Policy</Text>
                <Text style={styles.updatedAt}>Last updated: March 1, 2026</Text>

                <Text style={styles.sectionTitle}>1. Information We Collect</Text>
                <Text style={styles.paragraph}>
                    We collect information you provide directly to us when you create an account, such as your name, National Identity Card (NIC) number, mobile phone number, email address, home location, and assessment number.
                </Text>

                <Text style={styles.sectionTitle}>2. Location Data</Text>
                <Text style={styles.paragraph}>
                    We collect your location data to provide and improve our waste management services, specifically to determine accurate waste collection points and optimize vehicle routing.
                </Text>

                <Text style={styles.sectionTitle}>3. Use of Information</Text>
                <Text style={styles.paragraph}>
                    We use the information we collect to operate, maintain, and provide the features and functionality of the Service, as well as to communicate directly with you regarding waste collection schedules, delays, and important updates.
                </Text>

                <Text style={styles.sectionTitle}>4. Sharing of Information</Text>
                <Text style={styles.paragraph}>
                    We may share your information with governmental or municipal bodies involved in the waste management operations. We will not rent or sell your information to third parties outside the relevant authorities.
                </Text>

                <Text style={styles.sectionTitle}>5. Security</Text>
                <Text style={styles.paragraph}>
                    We value your trust in providing us your Personal Information, thus we are striving to use commercially acceptable means of protecting it. However, no method of transmission over the internet, or method of electronic storage is 100% secure.
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
