import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { supabase } from '@/lib/supabase';
import {
  getActivePickup,
  calculateDistance,
  estimateArrivalTime,
} from '@/services/pickupTracking';
import type { ActivePickup } from '@/services/pickupTracking';

export default function UserHomeScreen() {
  const router = useRouter();

  const [activePickup, setActivePickup] = useState<ActivePickup | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [eta, setEta] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    fetchActivePickup();
    // Refresh every 30 seconds
    const interval = setInterval(fetchActivePickup, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchActivePickup = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await getActivePickup(user.id);

      if (error) {
        console.log('No active pickup:', error);
      }

      if (data && data.user_location && data.driver_location) {
        setActivePickup(data);

        // Calculate distance and ETA
        const dist = calculateDistance(
          data.user_location.latitude,
          data.user_location.longitude,
          data.driver_location.lat,
          data.driver_location.lng
        );
        setDistance(dist);
        setEta(estimateArrivalTime(dist));

        // Fit map to show both markers
        if (mapRef.current) {
          mapRef.current.fitToCoordinates(
            [
              {
                latitude: data.user_location.latitude,
                longitude: data.user_location.longitude,
              },
              {
                latitude: data.driver_location.lat,
                longitude: data.driver_location.lng,
              },
            ],
            {
              edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
              animated: true,
            }
          );
        }
      } else {
        setActivePickup(null);
        setDistance(null);
        setEta(null);
      }
    } catch (error) {
      console.error('Error fetching pickup:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    router.setParams({ headerShown: 'false' });
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={false} />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.welcomeText}>Welcome, User</Text>
          <Text style={styles.subtitleText}>Your waste pickup assistant</Text>
        </View>
        
        {/* Profile Picture */}
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={() => router.push('/citizen/user-profile')}
        >
          <View style={styles.profileCircle}>
            <Ionicons name="person" size={24} color="#10B981" />
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Map Card with Google Maps */}
        <View style={styles.mapCard}>
          <MapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            initialRegion={{
              latitude: activePickup?.user_location?.latitude || 6.9271,
              longitude: activePickup?.user_location?.longitude || 79.8612,
              latitudeDelta: 0.02,
              longitudeDelta: 0.02,
            }}
          >
            {/* User location marker */}
            {activePickup?.user_location && (
              <Marker
                coordinate={{
                  latitude: activePickup.user_location.latitude,
                  longitude: activePickup.user_location.longitude,
                }}
                title="Your Location"
                pinColor="#EF4444"
              />
            )}

            {/* Driver location marker */}
            {activePickup?.driver_location && (
              <Marker
                coordinate={{
                  latitude: activePickup.driver_location.lat,
                  longitude: activePickup.driver_location.lng,
                }}
                title="Driver"
                description="Waste collection vehicle"
                pinColor="#3B82F6"
              >
                <View style={styles.driverMarker}>
                  <Ionicons name="car" size={24} color="#FFFFFF" />
                </View>
              </Marker>
            )}

            {/* Blue route line between user and driver */}
            {activePickup?.user_location && activePickup?.driver_location && (
              <Polyline
                coordinates={[
                  {
                    latitude: activePickup.user_location.latitude,
                    longitude: activePickup.user_location.longitude,
                  },
                  {
                    latitude: activePickup.driver_location.lat,
                    longitude: activePickup.driver_location.lng,
                  },
                ]}
                strokeColor="#3B82F6"
                strokeWidth={4}
              />
            )}
          </MapView>
        </View>

        {/* Live Tracking Card */}
        <View style={styles.trackingCard}>
          <Text style={styles.trackingTitle}>Live Tracking</Text>
          {activePickup && distance !== null && eta !== null ? (
            <Text style={styles.trackingSubtitle}>
              Tractor is {distance.toFixed(1)} km away, arriving in {eta} minutes
            </Text>
          ) : (
            <Text style={styles.trackingSubtitle}>No active pickup scheduled</Text>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.quickActionsTitle}>Quick Actions</Text>
          
          <View style={styles.actionButtonsRow}>
            {/* Schedule Pickup */}
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push('/citizen/schedule-pickup')}
            >
              <View style={[styles.actionIconCircle, { backgroundColor: '#D1FAE5' }]}>
                <Ionicons name="calendar" size={26} color="#10B981" />
              </View>
              <Text style={styles.actionButtonText}>Schedule Pickup</Text>
            </TouchableOpacity>

            {/* Sort Trash */}
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push('/citizen/sort-trash')}
            >
              <View style={[styles.actionIconCircle, { backgroundColor: '#D1FAE5' }]}>
                <Ionicons name="leaf" size={26} color="#10B981" />
              </View>
              <Text style={styles.actionButtonText}>Sort Trash</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="home" size={28} color="#10B981" />
          <Text style={[styles.navText, styles.navTextActive]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => router.push('/citizen/report-issue')}
        >
          <Ionicons name="information-circle-outline" size={28} color="#9CA3AF" />
          <Text style={styles.navText}>Report</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => router.push('/citizen/reward-history')}
        >
          <Ionicons name="person-outline" size={28} color="#9CA3AF" />
          <Text style={styles.navText}>Reward History</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => router.push('/citizen/messages')}
        >
          <Ionicons name="mail-outline" size={28} color="#9CA3AF" />
          <Text style={styles.navText}>Messages</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTextContainer: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  subtitleText: {
    fontSize: 18,
    color: '#6B7280',
    fontWeight: '400',
  },
  profileButton: {
    marginLeft: 12,
  },
  profileCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#10B981',
  },
  scrollView: {
    flex: 1,
  },
  mapCard: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 20,
    height: 325,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  trackingCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: -50,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    zIndex: 5,
  },
  trackingTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  trackingSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  quickActionsContainer: {
    marginHorizontal: 20,
    marginTop: 32,
  },
  quickActionsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginHorizontal: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  actionIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionButtonText: {
    fontSize: 15.2,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingTop: 12,
    paddingBottom: 40,
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
    position: 'relative',
  },
  navText: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 4,
    fontWeight: '500',
  },
  navTextActive: {
    color: '#10B981',
    fontWeight: '600',
  },
  driverMarker: {
    backgroundColor: '#3B82F6',
    padding: 8,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
});