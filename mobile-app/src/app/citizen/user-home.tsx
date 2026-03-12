import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  Image,
  Alert,
  BackHandler,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { supabase } from '@/lib/supabase';
import {
  getActivePickup,
  calculateDistance,
  estimateArrivalTime,
} from '@/services/pickupTracking';
import type { ActivePickup } from '@/services/pickupTracking';
import { UserProfileService } from '@/services/userProfileService';

// ── Quick action definitions ─────────────────────────────────────────────────
const QUICK_ACTIONS = [
  {
    id: 'schedule',
    label: 'Schedule Pickup',
    icon: 'calendar' as const,
    route: '/citizen/schedule-pickup',
    gradient: ['#065F46', '#059669'] as [string, string],
  },
  {
    id: 'sort',
    label: 'Sort Trash',
    icon: 'leaf' as const,
    route: '/citizen/sort-trash',
    gradient: ['#047857', '#10B981'] as [string, string],
  },
];

export default function UserHomeScreen() {
  const router = useRouter();

  const [activePickup, setActivePickup] = useState<ActivePickup | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [eta, setEta] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    fetchActivePickup();
    fetchUserAvatar();
    const interval = setInterval(fetchActivePickup, 30000);
    return () => clearInterval(interval);
  }, []);

  // Prevent going back to auth screens
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        Alert.alert('Exit App', 'Are you sure you want to exit?', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Exit', onPress: () => BackHandler.exitApp() },
        ]);
        return true;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [])
  );

  const fetchUserAvatar = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await UserProfileService.getCitizenProfile(user.id);
      if (data?.avatar_url) setAvatarUrl(data.avatar_url);
      if (data?.full_name) setUserName(data.full_name.split(' ')[0]);
    } catch {
      // silently ignore — fallback icon will show
    }
  };

  const fetchActivePickup = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await getActivePickup(user.id);
      if (error) console.log('No active pickup:', error);

      if (data && data.user_location && data.driver_location) {
        setActivePickup(data);
        const dist = calculateDistance(
          data.user_location.latitude,
          data.user_location.longitude,
          data.driver_location.lat,
          data.driver_location.lng
        );
        setDistance(dist);
        setEta(estimateArrivalTime(dist));

        if (mapRef.current) {
          mapRef.current.fitToCoordinates(
            [
              { latitude: data.user_location.latitude, longitude: data.user_location.longitude },
              { latitude: data.driver_location.lat, longitude: data.driver_location.lng },
            ],
            { edgePadding: { top: 40, right: 40, bottom: 40, left: 40 }, animated: true }
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

  const hasActivePickup = activePickup && distance !== null && eta !== null;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#065F46" />

      {/* ── Gradient Header ── */}
      <LinearGradient colors={['#065F46', '#059669']} style={styles.header}>
        <View style={styles.headerDecorCircle} />
        <View style={styles.headerLeft}>
          <Text style={styles.welcomeLabel}>Good day{userName ? `, ${userName}` : ''} 👋</Text>
          <Text style={styles.welcomeTitle}>WasteWise</Text>
          <Text style={styles.welcomeSub}>Your waste pickup assistant</Text>
        </View>
        <TouchableOpacity
          style={styles.profileBtn}
          onPress={() => router.push('/citizen/user-profile')}
          activeOpacity={0.8}
        >
          <View style={styles.profileCircle}>
            {avatarUrl ? (
              <Image
                source={{ uri: avatarUrl }}
                style={styles.profileImage}
              />
            ) : (
              <Ionicons name="person" size={24} color="#059669" />
            )}
          </View>
        </TouchableOpacity>
      </LinearGradient>

      {/* ── Body (no scroll — flex fills remaining space) ── */}
      <View style={styles.body}>


        {/* ── Map Card ── */}
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
            {activePickup?.user_location && (
              <Marker
                coordinate={{ latitude: activePickup.user_location.latitude, longitude: activePickup.user_location.longitude }}
                title="Your Location"
                pinColor="#EF4444"
              />
            )}
            {activePickup?.driver_location && (
              <Marker
                coordinate={{ latitude: activePickup.driver_location.lat, longitude: activePickup.driver_location.lng }}
                title="Driver"
                description="Waste collection vehicle"
                pinColor="#2563EB"
              >
                <View style={styles.driverMarker}>
                  <Ionicons name="car" size={20} color="#FFFFFF" />
                </View>
              </Marker>
            )}
            {activePickup?.user_location && activePickup?.driver_location && (
              <Polyline
                coordinates={[
                  { latitude: activePickup.user_location.latitude, longitude: activePickup.user_location.longitude },
                  { latitude: activePickup.driver_location.lat, longitude: activePickup.driver_location.lng },
                ]}
                strokeColor="#2563EB"
                strokeWidth={4}
              />
            )}
          </MapView>

        </View>

        {/* ── Quick Actions ── */}
        <View style={styles.actionsRow}>
          <View style={styles.actionsGrid}>
            {QUICK_ACTIONS.map(action => (
              <TouchableOpacity
                key={action.id}
                style={styles.actionCard}
                onPress={() => router.push(action.route as any)}
                activeOpacity={0.82}
              >
                <LinearGradient
                  colors={action.gradient}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={styles.actionIconGradient}
                >
                  <Ionicons name={action.icon} size={28} color="#fff" />
                </LinearGradient>
                <Text style={styles.actionLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

      </View>

      {/* ── Bottom Navigation ── */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} activeOpacity={0.7}>
          <View style={styles.navActivePill}>
            <Ionicons name="home" size={22} color="#059669" />
          </View>
          <Text style={[styles.navText, styles.navTextActive]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/citizen/report-issue')} activeOpacity={0.7}>
          <Ionicons name="information-circle-outline" size={26} color="#9CA3AF" />
          <Text style={styles.navText}>Report</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/citizen/reward-history')} activeOpacity={0.7}>
          <Ionicons name="gift-outline" size={26} color="#9CA3AF" />
          <Text style={styles.navText}>Rewards</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/citizen/messages')} activeOpacity={0.7}>
          <Ionicons name="chatbubble-ellipses-outline" size={26} color="#9CA3AF" />
          <Text style={styles.navText}>Messages</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F3F4F6' },

  // ── Header ────────────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 48 : (StatusBar.currentHeight ?? 24) + 8,
    paddingBottom: 14,
    overflow: 'hidden',
  },
  headerDecorCircle: {
    position: 'absolute',
    width: 180, height: 180, borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.07)',
    top: -60, right: -30,
  },
  headerLeft: { flex: 1 },
  welcomeLabel: { fontSize: 13, color: 'rgba(255,255,255,0.75)', fontWeight: '500', marginBottom: 1 },
  welcomeTitle: { fontSize: 24, fontWeight: '800', color: '#fff', letterSpacing: 0.2, marginBottom: 1 },
  welcomeSub: { fontSize: 13, color: 'rgba(255,255,255,0.75)', fontWeight: '400' },

  profileBtn: { marginLeft: 12 },
  profileCircle: {
    width: 70, height: 70, borderRadius: 35,
    backgroundColor: '#fff',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.5)',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12, shadowRadius: 4, elevation: 4,
    overflow: 'hidden',
  },
  profileImage: {
    width: 70, height: 70, borderRadius: 35,
  },

  // ── Body ──────────────────────────────────────────────────────────────────
  body: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 8,
  },

  // ── Map Card ──────────────────────────────────────────────────────────────
  mapCard: {
    flex: 1,
    borderRadius: 18,
    overflow: 'hidden', marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.09, shadowRadius: 8, elevation: 4,
  },
  map: { width: '100%', height: '100%' },
  mapLabel: {
    position: 'absolute', bottom: 10, left: 10,
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 9, paddingVertical: 4,
    borderRadius: 20,
  },
  mapLabelText: { fontSize: 12, fontWeight: '600', color: '#111827' },

  driverMarker: {
    backgroundColor: '#2563EB',
    padding: 7, borderRadius: 18,
    borderWidth: 2.5, borderColor: '#fff',
  },

  // ── Quick Actions ─────────────────────────────────────────────────────────
  actionsRow: { marginBottom: 4 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 8 },
  actionsGrid: { flexDirection: 'row', gap: 12 },
  actionCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16, padding: 16,
    alignItems: 'center', flexDirection: 'column',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 5, elevation: 2,
  },
  actionIconGradient: {
    width: 58, height: 58, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
  },
  actionLabel: {
    fontSize: 15, fontWeight: '700', color: '#111827',
    textAlign: 'center', marginTop: 10,
  },

  // ── Bottom Nav ────────────────────────────────────────────────────────────
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 44 : 28,
    paddingHorizontal: 8,
    borderTopWidth: 1, borderTopColor: '#F3F4F6',
    shadowColor: '#000', shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 8,
  },
  navItem: {
    flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 4,
  },
  navActivePill: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 14, paddingVertical: 5,
    borderRadius: 20, marginBottom: 2,
  },
  navText: { fontSize: 11, color: '#9CA3AF', marginTop: 3, fontWeight: '500' },
  navTextActive: { color: '#059669', fontWeight: '700' },
});