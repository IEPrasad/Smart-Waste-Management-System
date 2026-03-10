import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, AppState, AppStateStatus } from 'react-native';
import MapView from 'react-native-maps';
import { Stack, useRouter } from 'expo-router';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../../lib/supabase';


// --- Services & Hooks ---
import { fetchTodayPickups, getDistance } from '@/services/driverService';
import { useDriverTracking } from './hooks/useDriverTracking';

// --- Components ---
import MapSection from './components/MapSection';
import PickupActionModal from './components/PickupActionModal';
import WelcomeStartModal from './components/WelcomeStartModal';
import DriverProfileModal from './components/DriverProfileModal';
import DriverHistoryModal from './components/DriverHistoryModal';
import DriverMessagesModal from './components/DriverMessagesModal';
import DriverChatModal from './components/DriverChatModal';

const GOOGLE_API_KEY = "AIzaSyAWAwQ3RBtI20uUUGyLwedbqihPvpol3pw";

export default function DriverHomeScreen() {
    const router = useRouter();
    const mapRef = useRef<MapView>(null);
    const appState = useRef(AppState.currentState);

    // 1. Logic States
    const [hasStarted, setHasStarted] = useState(false);
    const [isDriverMode, setIsDriverMode] = useState(true);
    const [driverId, setDriverId] = useState<string | null>(null);
    const [driverName, setDriverName] = useState('');

    const [pickups, setPickups] = useState<any[]>([]);
    const [currentTarget, setCurrentTarget] = useState<any>(null);
    const [selectedPickup, setSelectedPickup] = useState<any>(null);

    // Modal Visibilities
    const [isPopupVisible, setPopupVisible] = useState(false);
    const [isProfileVisible, setProfileVisible] = useState(false);
    const [isHistoryVisible, setHistoryVisible] = useState(false);
    const [isMessagesVisible, setMessagesVisible] = useState(false);
    const [isChatVisible, setChatVisible] = useState(false);
    const [chatPickup, setChatPickup] = useState<any>(null);

    // 🛰️ CUSTOM HOOK: Handles GPS watching & DB syncing automatically
    // The hook already handles the 5s update to 'updated_at' in driver_live_location
    const currentLocation = useDriverTracking(driverId, hasStarted);

    // 2. Initial Data Load
    useEffect(() => {
        (async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setDriverId(user.id);
                try {
                    const data = await fetchTodayPickups(user.id);
                    setPickups(data);

                    const { data: driver } = await supabase.from('driver').select('full_name').eq('id', user.id).single();
                    if (driver) setDriverName(driver.full_name);
                } catch (err) {
                    console.error("Initial load error:", err);
                }
            }
        })();
    }, []);

    // 3. Handle App State (Online/Offline Toggle) + Logs
    useEffect(() => {
        const handleAppStateChange = async (nextAppState: AppStateStatus) => {
            if (!driverId || !hasStarted) return;

            if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
                console.log("📱 App: FOREGROUND (Online)"); // <-- Log added
                await supabase.from('driver').update({ is_online: true }).eq('id', driverId);
            } else if (nextAppState.match(/inactive|background/)) {
                console.log("📱 App: BACKGROUND (Offline)"); // <-- Log added
                await supabase.from('driver').update({ is_online: false }).eq('id', driverId);
            }

            appState.current = nextAppState;
        };

        const subscription = AppState.addEventListener('change', handleAppStateChange);

        return () => {
            subscription.remove();
        };
    }, [driverId, hasStarted]);

    // 4. Camera Follow Logic
    useEffect(() => {
        if (hasStarted && currentLocation && mapRef.current) {
            mapRef.current.animateCamera({
                center: { latitude: currentLocation.latitude, longitude: currentLocation.longitude },
                pitch: isDriverMode ? 50 : 0,
                heading: isDriverMode ? (currentLocation.heading || 0) : 0,
                zoom: isDriverMode ? 19 : 15,
            }, { duration: 500 });
        }
    }, [currentLocation, isDriverMode, hasStarted]);

    // 5. Helper: Find Nearest
    const findNearest = (lat: number, lng: number, list: any[]) => {
        if (list.length === 0) return null;
        return [...list].map(p => ({
            ...p,
            dist: getDistance(lat, lng, p.lat, p.lng)
        })).sort((a, b) => a.dist - b.dist)[0];
    };

    // 6. Actions
    const handleStartRoute = async () => {
        if (!driverId || !currentLocation) {
            Alert.alert("Waiting for GPS", "Please wait for your location to sync.");
            return;
        }

        // Update DB status to Online
        await supabase.from('driver').update({ is_online: true }).eq('id', driverId);

        if (pickups.length > 0) {
            const nearest = findNearest(currentLocation.latitude, currentLocation.longitude, pickups);
            setCurrentTarget(nearest);
        }
        setHasStarted(true);
    };

    const handlePickupAction = async (compostWt: number, recycleWt: number, status: 'completed' | 'skipped', note?: string) => {
        if (!selectedPickup || !driverId) return;

        await supabase.from('pickup_logs').insert({
            pickup_id: selectedPickup.id,
            driver_id: driverId,
            citizen_name: selectedPickup.citizen_name,
            gn_division: selectedPickup.gn_division,
            lat: selectedPickup.lat,
            lng: selectedPickup.lng,
            compost_weight: compostWt || 0,
            recycling_weight: recycleWt || 0,
            status,
            note
        });

        await supabase.from('pickups').update({
            status,
            completed_at: new Date(),
        }).eq('id', selectedPickup.id);

        setPopupVisible(false);
        const remaining = pickups.filter(p => p.id !== selectedPickup.id);
        setPickups(remaining);

        if (remaining.length > 0 && currentLocation) {
            const next = findNearest(currentLocation.latitude, currentLocation.longitude, remaining);
            setCurrentTarget(next);
        } else {
            setCurrentTarget(null);
        }
    };

    const handleLogout = async () => {
        if (driverId) await supabase.from('driver').update({ is_online: false }).eq('id', driverId);
        await supabase.auth.signOut();
        await AsyncStorage.clear();
        router.replace('/auth/driver-login');
    };

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            <View style={styles.headerBar}>
                <TouchableOpacity style={styles.iconBtn} onPress={() => setMessagesVisible(true)}>
                    <Ionicons name="chatbubble-ellipses-outline" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{pickups.length} Jobs Remaining</Text>
                <TouchableOpacity onPress={() => setProfileVisible(true)}>
                    <View style={styles.profileCircle}>
                        <FontAwesome5 name="user" size={18} color="#555" />
                    </View>
                </TouchableOpacity>
            </View>

            <MapSection
                mapRef={mapRef}
                currentLocation={currentLocation}
                hasStarted={hasStarted}
                pickups={pickups}
                currentTarget={currentTarget}
                isDriverMode={isDriverMode}
                onMarkerPress={(item: any) => {
                    if (currentTarget?.id === item.id) {
                        setSelectedPickup(item);
                        setPopupVisible(true);
                    }
                }}
                apiKey={GOOGLE_API_KEY}
            />

            {hasStarted && (
                <TouchableOpacity
                    style={styles.viewToggleBtn}
                    onPress={() => setIsDriverMode(!isDriverMode)}
                >
                    <MaterialCommunityIcons
                        name={isDriverMode ? "map-marker-path" : "navigation"}
                        size={28}
                        color="white"
                    />
                </TouchableOpacity>
            )}

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
                onComplete={(c, r) => handlePickupAction(c, r, 'completed')}
                onSkip={(reason) => handlePickupAction(0, 0, 'skipped', reason)}
            />

            <DriverProfileModal
                visible={isProfileVisible}
                onClose={() => setProfileVisible(false)}
                onHistoryPress={() => { setProfileVisible(false); setHistoryVisible(true); }}
                onLogout={handleLogout}
            />

            <DriverHistoryModal visible={isHistoryVisible} onClose={() => setHistoryVisible(false)} driverId={driverId} />

            <DriverMessagesModal
                visible={isMessagesVisible}
                onClose={() => setMessagesVisible(false)}
                onOpenChat={(data) => { setChatPickup(data); setChatVisible(true); }}
                driverId={driverId}
            />

            <DriverChatModal visible={isChatVisible} pickup={chatPickup} driverId={driverId} onClose={() => setChatVisible(false)} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    headerBar: {
        position: 'absolute', zIndex: 100, top: 50, left: 20, right: 20,
        height: 60, backgroundColor: 'white', borderRadius: 30,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, elevation: 5, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5,
    },
    headerTitle: { fontWeight: 'bold', fontSize: 14, color: '#333' },
    iconBtn: { padding: 5 },
    profileCircle: {
        width: 35, height: 35, borderRadius: 18, backgroundColor: '#eee',
        justifyContent: 'center', alignItems: 'center'
    },
    viewToggleBtn: {
        position: 'absolute', bottom: 40, right: 20, width: 60, height: 60,
        borderRadius: 30, backgroundColor: '#333', justifyContent: 'center', alignItems: 'center',
        elevation: 10, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 5, zIndex: 90
    }
});