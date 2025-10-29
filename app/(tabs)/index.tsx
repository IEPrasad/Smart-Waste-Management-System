import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const [voiceAlerts, setVoiceAlerts] = useState(true);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View>
            <Text style={styles.screenTitle}>Home Screen</Text>
            <Text style={styles.welcomeText}>Welcome</Text>
            <Text style={styles.subtitle}>Your waste pickup assistant</Text>
          </View>
          <TouchableOpacity style={styles.profileButton}>
            <Ionicons name="person" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Pickup Reminder Card */}
        <View style={styles.reminderCard}>
          <Ionicons name="notifications" size={20} color="#F59E0B" />
          <Text style={styles.reminderText}>Pickup reminder: Tractor arrives in 2 hours</Text>
          <TouchableOpacity>
            <Ionicons name="close" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Live Tracking Card */}
        <View style={styles.trackingCard}>
          {/* Map View */}
          <View style={styles.mapContainer}>
            <View style={styles.mapBackground}>
              <View style={styles.routeLine} />
              <Ionicons name="home" size={32} color="#10B981" style={styles.homeIcon} />
              <View style={styles.truckContainer}>
                <Ionicons name="car" size={32} color="#EF4444" />
              </View>
            </View>
          </View>
          
          {/* Tracking Info */}
          <View style={styles.trackingInfo}>
            <Text style={styles.trackingTitle}>Live Tracking</Text>
            <Text style={styles.trackingDetails}>Tractor is 1.2 km away, arriving in 8 minutes</Text>
          </View>
        </View>

        {/* Next Pickup Card */}
        <View style={styles.nextPickupCard}>
          <View>
            <Text style={styles.nextPickupLabel}>Next Pickup</Text>
            <Text style={styles.nextPickupTime}>10:00 AM Today</Text>
          </View>
          <Ionicons name="time" size={32} color="white" />
        </View>

        {/* Voice Alerts Toggle */}
        <View style={styles.voiceCard}>
          <View style={styles.voiceIconContainer}>
            <Ionicons name="volume-high" size={24} color="#10B981" />
          </View>
          <View style={styles.voiceInfo}>
            <Text style={styles.voiceTitle}>Voice Alerts</Text>
            <Text style={styles.voiceSubtitle}>Get audio notifications</Text>
          </View>
          <Switch
            value={voiceAlerts}
            onValueChange={setVoiceAlerts}
            trackColor={{ false: '#E5E7EB', true: '#10B981' }}
            thumbColor="white"
          />
        </View>

        {/* Quick Actions Section */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsContainer}>
          <TouchableOpacity style={styles.quickActionButton}>
            <View style={styles.quickActionIcon}>
              <Ionicons name="calendar-outline" size={32} color="#10B981" />
            </View>
            <Text style={styles.quickActionText}>Schedule Pickup</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickActionButton}>
            <View style={styles.quickActionIcon}>
              <Ionicons name="trash" size={32} color="#10B981" />
            </View>
            <Text style={styles.quickActionText}>Sort Trash</Text>
          </TouchableOpacity>
        </View>

        {/* View Information Button */}
        <TouchableOpacity style={styles.infoButton}>
          <Ionicons name="information-circle" size={24} color="#10B981" />
          <Text style={styles.infoButtonText}>View Information</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  screenTitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reminderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    gap: 12,
  },
  reminderText: {
    flex: 1,
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600',
  },
  trackingCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  mapContainer: {
    height: 200,
  },
  mapBackground: {
    flex: 1,
    backgroundColor: '#E0F2FE',
    position: 'relative',
  },
  routeLine: {
    position: 'absolute',
    width: '100%',
    height: 4,
    backgroundColor: '#EF4444',
    top: '50%',
    marginTop: -2,
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: '#EF4444',
  },
  homeIcon: {
    position: 'absolute',
    left: 20,
    top: '50%',
    marginTop: -16,
  },
  truckContainer: {
    position: 'absolute',
    right: 20,
    top: '50%',
    marginTop: -16,
  },
  trackingInfo: {
    padding: 16,
  },
  trackingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  trackingDetails: {
    fontSize: 14,
    color: '#6B7280',
  },
  nextPickupCard: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  nextPickupLabel: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
  },
  nextPickupTime: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 4,
  },
  voiceCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  voiceIconContainer: {
    marginRight: 12,
  },
  voiceInfo: {
    flex: 1,
  },
  voiceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  voiceSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  quickActionIcon: {
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  infoButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  infoButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 12,
  },
});