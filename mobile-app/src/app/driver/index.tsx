import React, { useState, useEffect, useRef } from 'react';
import {
    StyleSheet, View, Text, TouchableOpacity, Dimensions, Alert
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import * as Location from 'expo-location';
import { supabase } from '../../../lib/supabase';
import { Stack, useRouter } from 'expo-router';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';

import PickupActionModal from './components/PickupActionModal';
import WelcomeStartModal from './components/WelcomeStartModal';
import DriverProfileModal from './components/DriverProfileModal';
import DriverHistoryModal from './components/DriverHistoryModal'; // <<< IMPORT NEW COMPONENT

/* <<< ADDED IMPORTS FOR MESSAGING >>> */
import DriverMessagesModal from './components/DriverMessagesModal'; // List
import DriverChatModal from './components/DriverChatModal';         // Chat Window

import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');
// ⚠️ Ensure "Directions API" is enabled in Google Cloud Console
const GOOGLE_API_KEY = "AIzaSyAWAwQ3RBtI20uUUGyLwedbqihPvpol3pw";

// --- Types ---
interface LocationState {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
    heading?: number;
}

// --- HELPER: Haversine Formula ---
const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
};

export default function DriverHomeScreen() {
    // 1. STATE VARIABLES
    const mapRef = useRef<MapView>(null);
    const lastDbUpdate = useRef<number>(0);

    const [hasStarted, setHasStarted] = useState(false);
    const [currentLocation, setCurrentLocation] = useState<LocationState | null>(null);

    // Camera Mode State
    const [isDriverMode, setIsDriverMode] = useState(true);

    const [pickups, setPickups] = useState<any[]>([]);
    const [driverName, setDriverName] = useState('');
    const [driverId, setDriverId] = useState<string | null>(null);

    const [currentTarget, setCurrentTarget] = useState<any>(null);
    const [selectedPickup, setSelectedPickup] = useState<any>(null);

    // Modal Visibilities
    const [isPopupVisible, setPopupVisible] = useState(false);
    const [isProfileVisible, setProfileVisible] = useState(false);
    const [isHistoryVisible, setHistoryVisible] = useState(false); // <<< NEW STATE

    /* <<< ADDED MESSAGE/CHAT STATES >>> */
    const [isMessagesVisible, setMessagesVisible] = useState(false); // Shows list
    const [isChatVisible, setChatVisible] = useState(false);         // Shows chat window
    const [chatPickup, setChatPickup] = useState<any>(null);         // Stores which citizen we are chatting with

    const router = useRouter();

    // 2. INITIAL DATA LOAD & TRACKING
    useEffect(() => {
        let locationSubscription: Location.LocationSubscription | null = null;

        (async () => {
            // A. Get Driver Identity
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setDriverId(user.id);
                const { data: driver } = await supabase.from('driver').select('full_name').eq('id', user.id).single();
                if (driver) setDriverName(driver.full_name);
            }

            // B. Fetch Pickups
            fetchPickups(user?.id);

            // C. Permissions
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert("Permission Denied", "Allow location access to use navigation.");
                return;
            }

            // D. START WATCHING LOCATION
            locationSubscription = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.BestForNavigation,
                    timeInterval: 1000,
                    distanceInterval: 5,
                },
                async (loc) => {
                    const { latitude, longitude, heading } = loc.coords;

                    setCurrentLocation({
                        latitude,
                        longitude,
                        latitudeDelta: 0.005,
                        longitudeDelta: 0.005,
                        heading: heading || 0
                    });

                    // CAMERA LOGIC
                    if (hasStarted && mapRef.current) {
                        if (isDriverMode) {
                            mapRef.current.animateCamera({
                                center: { latitude, longitude },
                                pitch: 50,
                                heading: heading || 0,
                                zoom: 19,
                            }, { duration: 500 });
                        } else {
                            mapRef.current.animateCamera({
                                center: { latitude, longitude },
                                pitch: 0,
                                heading: 0,
                                zoom: 15,
                            }, { duration: 500 });
                        }
                    }

                    // DB Sync (Every 5s)
                    const now = Date.now();
                    if (driverId && hasStarted && (now - lastDbUpdate.current > 5000)) {
                        lastDbUpdate.current = now;

                        const { error } = await supabase.from('driver_live_location').upsert({
                            driver_id: driverId,
                            lat: latitude,
                            lng: longitude,
                            updated_at: new Date()
                        }, { onConflict: 'driver_id' });

                        if (error) {
                            console.error("📍 Sync Error:", error.message);
                        } else {
                            console.log("📍 Location synced to DB");
                        }
                    }
                }
            );
        })();

        return () => {
            if (locationSubscription) locationSubscription.remove();
        };
    }, [hasStarted, isDriverMode]);

    // 3. FETCH PICKUPS
    const fetchPickups = async (uid: string | undefined) => {
        if (!uid) return;
        const today = new Date().toISOString().split('T')[0];
        const { data } = await supabase
            .from('pickups')
            .select(`*, citizens(full_name, assessment_number, gn_division)`)
            .eq('driver_id', uid)
            .eq('status', 'pending')
            .eq('scheduled_date', today);

        if (data) {
            const formatted = data.map((p: any) => ({
                ...p,
                citizen_name: p.citizens?.full_name,
                assessment_no: p.citizens?.assessment_number,
                gn_division: p.citizens?.gn_division
            }));
            setPickups(formatted);
        }
    };

    // 4. FIND NEAREST PICKUP
    const findNearestPickup = (currentLat: number, currentLng: number, list: any[]) => {
        if (list.length === 0) return null;
        const sorted = [...list].map(p => ({
            ...p,
            dist: getDistance(currentLat, currentLng, p.lat, p.lng)
        })).sort((a, b) => a.dist - b.dist);
        return sorted[0];
    };

    // 5. START ROUTE
    const handleStartRoute = async () => {
        if(!driverId || !currentLocation) {
            Alert.alert("Waiting for GPS", "Please wait a moment.");
            return;
        }
        await supabase.from('driver').update({ is_online: true }).eq('id', driverId);

        if (pickups.length > 0) {
            const nearest = findNearestPickup(currentLocation.latitude, currentLocation.longitude, pickups);
            setCurrentTarget(nearest);
        }
        setIsDriverMode(true);
        setHasStarted(true);
    };

    // 6. COMPLETE PICKUP
    const handleCompletePickup = async (compostWt: number, recycleWt: number) => {
        if (!selectedPickup || !driverId) return;

        // DB Updates...
        await supabase.from('pickup_logs').insert({
            pickup_id: selectedPickup.id,
            driver_id: driverId,
            citizen_name: selectedPickup.citizen_name,
            gn_division: selectedPickup.gn_division,
            lat: selectedPickup.lat,
            lng: selectedPickup.lng,
            compost_weight: compostWt,
            recycling_weight: recycleWt,
            status: 'completed'
        });
        await supabase.from('pickups').update({
            status: 'completed',
            completed_at: new Date(),
        }).eq('id', selectedPickup.id);

        setPopupVisible(false);
        const remainingPickups = pickups.filter(p => p.id !== selectedPickup.id);
        setPickups(remainingPickups);

        // --- NEW TARGET LOGIC ---
        if (remainingPickups.length > 0 && currentLocation) {
            const nextPickup = findNearestPickup(
                currentLocation.latitude,
                currentLocation.longitude,
                remainingPickups
            );

            // Force update target immediately
            setCurrentTarget(nextPickup);
            Alert.alert("Route Updated", `Heading to: ${nextPickup.citizen_name}`);
        } else {
            setCurrentTarget(null);
            Alert.alert("Done", "All pickups finished.");
        }
    };

    // 7. SKIP PICKUP
    const handleSkipPickup = async (reason: string) => {
        if (!selectedPickup || !driverId) return;

        await supabase.from('pickup_logs').insert({
            pickup_id: selectedPickup.id,
            driver_id: driverId,
            citizen_name: selectedPickup.citizen_name,
            gn_division: selectedPickup.gn_division,
            lat: selectedPickup.lat,
            lng: selectedPickup.lng,
            status: 'skipped',
            note: reason
        });
        await supabase.from('pickups').update({
            status: 'skipped',
            completed_at: new Date()
        }).eq('id', selectedPickup.id);

        setPopupVisible(false);
        const remainingPickups = pickups.filter(p => p.id !== selectedPickup.id);
        setPickups(remainingPickups);

        if (remainingPickups.length > 0 && currentLocation) {
            const nextPickup = findNearestPickup(
                currentLocation.latitude,
                currentLocation.longitude,
                remainingPickups
            );
            setCurrentTarget(nextPickup);
            Alert.alert("Skipped", `Routing to next: ${nextPickup.citizen_name}`);
        } else {
            setCurrentTarget(null);
            Alert.alert("Done", "All pickups finished.");
        }
    };

    // Toggle Camera
    const toggleViewMode = () => {
        const newMode = !isDriverMode;
        setIsDriverMode(newMode);
        if (currentLocation && mapRef.current) {
            mapRef.current.animateCamera({
                center: { latitude: currentLocation.latitude, longitude: currentLocation.longitude },
                pitch: newMode ? 50 : 0,
                heading: newMode ? (currentLocation.heading || 0) : 0,
                zoom: newMode ? 19 : 15,
            }, { duration: 800 });
        }
    };

    // Logout
    // Inside index.tsx


    const handleLogout = async () => {
        try {
            // 1. Set status to offline in DB
            if (driverId) {
                await supabase.from('driver').update({ is_online: false }).eq('id', driverId);
            }

            // 2. Sign out of Supabase
            const { error } = await supabase.auth.signOut();

            if (error) throw error;

            // 3. Clear local storage/cache (Very important to remove driver details)
            await AsyncStorage.clear();

            // 4. Close the modal
            setProfileVisible(false);

            // 5. Navigate back to login page
            // If you are using expo-router, use replace so they can't go "back" to the home screen
            router.replace('/auth/driver-login');

        } catch (err) {
            Alert.alert("Logout Error", "Please try again.");
        }
    };

    // <<< HANDLER FOR HISTORY BUTTON >>>
    const openHistory = () => {
        setProfileVisible(false); // Close profile first
        setHistoryVisible(true);  // Open history
    };

    /* <<< ADDED MESSAGE/CHAT HANDLERS >>> */
    // Handle opening the Message List
    const handleOpenMessages = () => {
        setMessagesVisible(true);
    };

    // Handle clicking a row in the list -> Opens chat
    const handleOpenChat = (pickupData: any) => {
        setChatPickup(pickupData);
        setChatVisible(true);
    };
    /* <<< END ADDED >>> */

    // --- RENDER ---
    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* HEADER */}
            <View style={styles.headerBar}>
                <TouchableOpacity style={styles.iconBtn} onPress={handleOpenMessages}>
                    <Ionicons name="chatbubble-ellipses-outline" size={24} color="#333" />
                </TouchableOpacity>
                <View style={{ alignItems: 'center' }}>
                    <Text style={styles.headerTitle}>{pickups.length} Jobs Remaining</Text>
                </View>
                <TouchableOpacity onPress={() => setProfileVisible(true)}>
                    <View style={styles.profileCircle}>
                        <FontAwesome5 name="user" size={18} color="#555" />
                    </View>
                </TouchableOpacity>
            </View>

            {/* MAP */}
            {currentLocation && (
                <MapView
                    ref={mapRef}
                    provider={PROVIDER_GOOGLE}
                    style={styles.map}
                    initialRegion={currentLocation}
                    showsUserLocation={false}
                    showsMyLocationButton={false}
                    showsCompass={false}
                    rotateEnabled={!isDriverMode}
                >
                    <Marker.Animated
                        coordinate={currentLocation}
                        anchor={{ x: 0.5, y: 0.5 }}
                        rotation={currentLocation.heading}
                        flat={true}
                    >
                        <View style={styles.driverMarker}>
                            <Ionicons name="arrow-up" size={18} color="white" />
                        </View>
                    </Marker.Animated>

                    {hasStarted && pickups.map((item) => {
                        const isTarget = currentTarget?.id === item.id;
                        return (
                            <Marker
                                key={`${item.id}-${isTarget ? 'blue' : 'red'}`}
                                coordinate={{ latitude: item.lat, longitude: item.lng }}
                                title={item.citizen_name}
                                pinColor={isTarget ? "blue" : "red"}
                                onPress={() => {
                                    if (isTarget) {
                                        setSelectedPickup(item);
                                        setPopupVisible(true);
                                    }
                                }}
                            />
                        );
                    })}

                    {hasStarted && currentTarget && (
                        <MapViewDirections
                            origin={currentLocation}
                            destination={{ latitude: currentTarget.lat, longitude: currentTarget.lng }}
                            apikey={GOOGLE_API_KEY}
                            strokeWidth={5}
                            strokeColor="#00b0ff"
                            optimizeWaypoints={true}
                        />
                    )}
                </MapView>
            )}

            {hasStarted && (
                <TouchableOpacity style={styles.viewToggleBtn} onPress={toggleViewMode}>
                    <MaterialCommunityIcons
                        name={isDriverMode ? "map-marker-path" : "navigation"}
                        size={28}
                        color="white"
                    />
                </TouchableOpacity>
            )}

            {/* MODALS */}
            <WelcomeStartModal
                visible={!hasStarted}
                driverName={driverName}
                pickupCount={pickups.length}
                onStartRoute={handleStartRoute}
            />

            <PickupActionModal
                visible={isPopupVisible}
                pickup={selectedPickup}
                onClose={() => setPopupVisible(false)}
                onComplete={handleCompletePickup}
                onSkip={handleSkipPickup}
            />

            <DriverProfileModal
                visible={isProfileVisible}
                onClose={() => setProfileVisible(false)}
                onHistoryPress={openHistory} // <<< Connect Logic
                onLogout={handleLogout}
            />

            {/* <<< NEW HISTORY MODAL >>> */}
            <DriverHistoryModal
                visible={isHistoryVisible}
                onClose={() => setHistoryVisible(false)}
                driverId={driverId}
            />

            {/* <<< ADDED MESSAGE MODALS >>> */}
            <DriverMessagesModal
                visible={isMessagesVisible}
                onClose={() => setMessagesVisible(false)}
                onOpenChat={handleOpenChat}
            />

            <DriverChatModal
                visible={isChatVisible}
                pickup={chatPickup}
                driverId={driverId}
                onClose={() => setChatVisible(false)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    map: { width: width, height: height },
    headerBar: {
        position: 'absolute',
        zIndex: 100,
        top: 50, left: 20, right: 20,
        height: 60,
        backgroundColor: 'white',
        borderRadius: 30,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        elevation: 5, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5,
    },
    headerTitle: { fontWeight: 'bold', fontSize: 14, color: '#333' },
    iconBtn: { padding: 5 },
    profileCircle: {
        width: 35, height: 35, borderRadius: 18, backgroundColor: '#eee',
        justifyContent: 'center', alignItems: 'center'
    },
    driverMarker: {
        width: 30, height: 30, borderRadius: 15,
        backgroundColor: '#00b0ff', justifyContent: 'center', alignItems: 'center',
        borderWidth: 2, borderColor: 'white',
        elevation: 5, shadowColor: 'black', shadowOpacity: 0.3, shadowOffset: { width: 0, height: 2 }
    },
    viewToggleBtn: {
        position: 'absolute',
        bottom: 40,
        right: 20,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#333',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 10,
        shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 5,
        zIndex: 90
    }
});
