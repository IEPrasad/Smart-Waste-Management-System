import React, { useEffect } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  View,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function CitizenHomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];

  return (
    <ThemedView style={styles.container}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <ThemedView style={styles.header}>
        <View style={styles.headerTextContainer}>
          <ThemedText type="title">Welcome, User</ThemedText>
          <ThemedText style={styles.subtitleText}>Your waste pickup assistant</ThemedText>
        </View>
        <TouchableOpacity 
          style={styles.logoutButton}
          //onPress={() => router.replace('/welcome')}
        >
          <Ionicons name="power" size={26} color="#EF4444" />
        </TouchableOpacity>
      </ThemedView>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Map Card with Multi-Color Background */}
        <View style={styles.mapCard}>
          <View style={[styles.mapBackground, { backgroundColor: '#E0F2FE' }]}>
            {/* Color sections */}
            <View style={[styles.colorSection1, { backgroundColor: '#E0F2FE' }]} />
            <View style={[styles.colorSection2, { backgroundColor: '#BAE6FD' }]} />
            <View style={[styles.colorSection3, { backgroundColor: '#7DD3FC' }]} />
          </View>
        </View>

        {/* Live Tracking Card */}
        <ThemedView style={styles.trackingCard} lightColor="#FFFFFF" darkColor="#1E1E1E">
          <ThemedText type="subtitle" style={styles.trackingTitle}>Live Tracking</ThemedText>
          <ThemedText style={styles.trackingSubtitle}>
            Tractor is 1.2 km away, arriving in 8 minutes
          </ThemedText>
        </ThemedView>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <ThemedText type="subtitle" style={styles.quickActionsTitle}>Quick Actions</ThemedText>
          
          <View style={styles.actionButtonsRow}>
            {/* Schedule Pickup */}
            <TouchableOpacity 
              style={[
                styles.actionButton, 
                { backgroundColor: colorScheme === 'dark' ? '#1E1E1E' : '#FFFFFF' }
              ]}
              onPress={() => router.push('/citizen/schedule-pickup')}
            >
              <View style={[styles.actionIconCircle, { backgroundColor: '#E0F2FE' }]}>
                <Ionicons name="calendar" size={32} color={themeColors.tint} />
              </View>
              <ThemedText style={styles.actionButtonText}>Schedule Pickup</ThemedText>
            </TouchableOpacity>

            {/* Sort Trash */}
            <TouchableOpacity 
              style={[
                styles.actionButton,
                { backgroundColor: colorScheme === 'dark' ? '#1E1E1E' : '#FFFFFF' }
              ]}
              onPress={() => router.push('/citizen/sort-trash')}
            >
              <View style={[styles.actionIconCircle, { backgroundColor: '#E0F2FE' }]}>
                <Ionicons name="leaf" size={32} color={themeColors.tint} />
              </View>
              <ThemedText style={styles.actionButtonText}>Sort Trash</ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Bottom Navigation */}
      <ThemedView style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="home" size={28} color={themeColors.tint} />
          <ThemedText style={[styles.navText, { color: themeColors.tint, fontWeight: '600' }]}>Home</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => router.push('/citizen/report-issue')}
        >
          <Ionicons name="information-circle-outline" size={28} color="#9CA3AF" />
          <ThemedText style={styles.navText}>Report</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => router.push('/citizen/reward-history')}
        >
          <Ionicons name="person-outline" size={28} color="#9CA3AF" />
          <ThemedText style={styles.navText}>Rewards</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => router.push('/citizen/messages')}
        >
          <Ionicons name="mail-outline" size={28} color="#9CA3AF" />
          <ThemedText style={styles.navText}>Messages</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => router.push('/citizen/user-profile')}
        >
          <Ionicons name="person-circle-outline" size={28} color="#9CA3AF" />
          <ThemedText style={styles.navText}>Profile</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60, // Increased for SafeArea
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6', // Need to handle dark mode border
  },
  headerTextContainer: {
    flex: 1,
  },
  subtitleText: {
    marginTop: 4,
    color: '#6B7280',
  },
  logoutButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  mapCard: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 20,
    height: 200, // Reduced height a bit
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  mapBackground: {
    flex: 1,
    position: 'relative',
  },
  colorSection1: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
  },
  colorSection2: {
    position: 'absolute',
    top: '30%',
    left: 0,
    right: 0,
    height: '40%',
    opacity: 0.7,
  },
  colorSection3: {
    position: 'absolute',
    top: '60%',
    left: 0,
    right: 0,
    height: '40%',
    opacity: 0.5,
  },
  trackingCard: {
    marginHorizontal: 20,
    marginTop: -40,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  trackingTitle: {
    marginBottom: 8,
  },
  trackingSubtitle: {
    color: '#6B7280',
    lineHeight: 22,
  },
  quickActionsContainer: {
    marginHorizontal: 20,
    marginTop: 32,
  },
  quickActionsTitle: {
    marginBottom: 16,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginHorizontal: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  actionIconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionButtonText: {
    fontWeight: '600',
    textAlign: 'center',
  },
  bottomNav: {
    flexDirection: 'row',
    paddingTop: 12,
    paddingBottom: 30, // SafeArea
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  navText: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 4,
    fontWeight: '500',
  },
});
