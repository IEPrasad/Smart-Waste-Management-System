import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    ScrollView,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import { supabase } from '../../lib/supabase';
import { getDistance } from 'geolib';

// Read key from .env
const GOOGLE_MAPS_APIKEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '';

export default function UserHomeScreen() {
    const router = useRouter();
    const mapRef = useRef<MapView>(null);

    // Logic States
    const [citizenData, setCitizenData] = useState<any>(null);
    const [driverLocation, setDriverLocation] = useState<any>(null);
    const [isDriverOnline, setIsDriverOnline] = useState<boolean>(false);
    const [distance, setDistance] = useState<string | null>(null);
    const [assignedDriverId, setAssignedDriverId] = useState<string | null>(null);
    const [activePickup, setActivePickup] = useState<any>(null); // Stores today's pickup object

    React.useEffect(() => {
        router.setParams({ headerShown: 'false' });
        fetchInitialData();
    }, []);

    // 1. Get Initial Data (Citizen + Today's Assignment)
    const fetchInitialData = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const today = new Date().toISOString().split('T')[0];

        const { data: citizen } = await supabase.from('citizens').select('*').eq('id', user.id).single();
        if (citizen) {
            setCitizenData(citizen);

            // Logic: Find a pickup specifically for TODAY that isn't completed
            const { data: pickup } = await supabase
                .from('pickups')
                .select(`
                    *,
                    driver ( id, full_name, is_online )
                `)
                .eq('citizen_id', citizen.id)
                .eq('scheduled_date', today)
                .neq('status', 'completed')
                .maybeSingle();

            if (pickup) {
                setActivePickup(pickup);
                if (pickup.driver?.id) setAssignedDriverId(pickup.driver.id);
            }
        }
    };

    // 2. Polling Loop for Live Updates
    useEffect(() => {
        if (!assignedDriverId || !citizenData) return;

        const poll = async () => {
            // Check online status
            const { data: drv } = await supabase.from('driver').select('is_online').eq('id', assignedDriverId).single();
            setIsDriverOnline(drv?.is_online || false);

            // Check live location
            const { data: loc } = await supabase.from('driver_live_location').select('lat, lng').eq('driver_id', assignedDriverId).single();
            if (loc) {
                const newCoords = { latitude: loc.lat, longitude: loc.lng };
                setDriverLocation(newCoords);

                const d = getDistance({ latitude: citizenData.latitude, longitude: citizenData.longitude }, newCoords);
                setDistance((d / 1000).toFixed(2));

                // Sync map view
                mapRef.current?.fitToCoordinates(
                    [newCoords, { latitude: citizenData.latitude, longitude: citizenData.longitude }],
                    { edgePadding: { top: 70, right: 70, bottom: 70, left: 70 }, animated: true }
                );
            }
        };

        poll();
        const interval = setInterval(poll, 5000);
        return () => clearInterval(interval);
    }, [assignedDriverId, citizenData]);

    // 3. CHAT DISCOVERY LOGIC
    const handleOpenChat = () => {
        if (!activePickup) {
            Alert.alert("No Active Pickup", "You don't have a pickup scheduled for today.");
            return;
        }

        if (!isDriverOnline) {
            Alert.alert("Driver Offline", "The assigned driver is not currently online.");
            return;
        }

        // Navigate to the chat screen with the context
        router.push({
            pathname: '/citizen/messages',
            params: {
                pickupId: activePickup.id,
                driverId: assignedDriverId,
                driverName: activePickup.driver?.full_name
            }
        });
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={false} />

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerTextContainer}>
                    <Text style={styles.welcomeText}>Welcome, {citizenData?.full_name || 'User'}</Text>
                    <Text style={styles.subtitleText}>Your waste pickup assistant</Text>
                </View>
                <TouchableOpacity style={styles.logoutButton}>
                    <Ionicons name="power" size={26} color="#EF4444" />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Map Card */}
                <View style={styles.mapCard}>
                    <MapView
                        ref={mapRef}
                        provider={PROVIDER_GOOGLE}
                        style={styles.map}
                        initialRegion={{
                            latitude: citizenData?.latitude || 6.9271,
                            longitude: citizenData?.longitude || 79.8612,
                            latitudeDelta: 0.02,
                            longitudeDelta: 0.02,
                        }}
                    >
                        {citizenData && (
                            <Marker coordinate={{ latitude: citizenData.latitude, longitude: citizenData.longitude }} title="My House">
                                <Ionicons name="home" size={24} color="#3B82F6" />
                            </Marker>
                        )}

                        {driverLocation && (
                            <>
                                <Marker coordinate={driverLocation} title="Collector">
                                    <Ionicons name="bus" size={32} color={isDriverOnline ? "#10B981" : "#9CA3AF"} />
                                </Marker>

                                <MapViewDirections
                                    key={`route-${driverLocation.latitude}-${driverLocation.longitude}`}
                                    origin={driverLocation}
                                    destination={{ latitude: citizenData.latitude, longitude: citizenData.longitude }}
                                    apikey={GOOGLE_MAPS_APIKEY}
                                    strokeWidth={4}
                                    strokeColor="#3B82F6"
                                    mode="DRIVING"
                                />
                            </>
                        )}
                    </MapView>
                </View>

                {/* Live Tracking Card */}
                <View style={styles.trackingCard}>
                    <Text style={styles.trackingTitle}>
                        {isDriverOnline ? 'Live Tracking' : 'Collector Offline'}
                    </Text>
                    <Text style={styles.trackingSubtitle}>
                        {isDriverOnline && distance
                            ? `Tractor is ${distance} km away. Approaching your location.`
                            : "Waiting for the collector to start sharing their location."}
                    </Text>
                </View>

                {/* Quick Actions */}
                <View style={styles.quickActionsContainer}>
                    <Text style={styles.quickActionsTitle}>Quick Actions</Text>
                    <View style={styles.actionButtonsRow}>
                        <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/citizen/schedule-pickup')}>
                            <View style={[styles.actionIconCircle, { backgroundColor: '#D1FAE5' }]}>
                                <Ionicons name="calendar" size={32} color="#10B981" />
                            </View>
                            <Text style={styles.actionButtonText}>Schedule Pickup</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/citizen/sort-trash')}>
                            <View style={[styles.actionIconCircle, { backgroundColor: '#D1FAE5' }]}>
                                <Ionicons name="leaf" size={32} color="#10B981" />
                            </View>
                            <Text style={styles.actionButtonText}>Sort Trash</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Bottom Navigation */}
            <View style={styles.bottomNav}>
                <TouchableOpacity style={styles.navItem}>
                    <Ionicons name="home" size={28} color="#10B981" />
                    <Text style={[styles.navText, styles.navTextActive]}>Home</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.navItem} onPress={() => router.push('/citizen/report-issue')}>
                    <Ionicons name="information-circle-outline" size={28} color="#9CA3AF" />
                    <Text style={styles.navText}>Report</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.navItem} onPress={() => router.push('/citizen/reward-history')}>
                    <Ionicons name="person-outline" size={28} color="#9CA3AF" />
                    <Text style={styles.navText}>History</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.navItem} onPress={handleOpenChat}>
                    <Ionicons name="chatbubble-ellipses-outline" size={28} color="#9CA3AF" />
                    <Text style={styles.navText}>Messages</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.navItem} onPress={() => router.push('/citizen/user-profile')}>
                    <Ionicons name="person-circle-outline" size={28} color="#9CA3AF" />
                    <Text style={styles.navText}>Profile</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
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
    headerTextContainer: { flex: 1 },
    welcomeText: { fontSize: 28, fontWeight: '700', color: '#111827', marginBottom: 4 },
    subtitleText: { fontSize: 15, color: '#6B7280', fontWeight: '400' },
    logoutButton: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
    scrollView: { flex: 1 },
    mapCard: {
        marginHorizontal: 20,
        marginTop: 20,
        borderRadius: 20,
        height: 280,
        overflow: 'hidden',
        elevation: 5,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    map: { width: '100%', height: '100%' },
    trackingCard: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: 20,
        marginTop: -60,
        borderRadius: 16,
        padding: 20,
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 8,
        zIndex: 5,
    },
    trackingTitle: { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 8 },
    trackingSubtitle: { fontSize: 15, color: '#6B7280', lineHeight: 22 },
    quickActionsContainer: { marginHorizontal: 20, marginTop: 32 },
    quickActionsTitle: { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 16 },
    actionButtonsRow: { flexDirection: 'row', justifyContent: 'space-between' },
    actionButton: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        marginHorizontal: 6,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.06,
    },
    actionIconCircle: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
    actionButtonText: { fontSize: 15, fontWeight: '600', color: '#111827', textAlign: 'center' },
    bottomNav: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        paddingTop: 12,
        paddingBottom: 40,
        paddingHorizontal: 8,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        elevation: 8,
    },
    navItem: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 8 },
    navText: { fontSize: 11, color: '#9CA3AF', marginTop: 4, fontWeight: '500' },
    navTextActive: { color: '#10B981', fontWeight: '600' },
});

