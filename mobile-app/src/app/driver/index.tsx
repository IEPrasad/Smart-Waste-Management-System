import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, Dimensions } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { supabase } from '../../../lib/supabase'; // Supabase client for DB requests

const { width, height } = Dimensions.get('window'); // Get device screen size

// --- TypeScript Interfaces ---
interface Pickup {
    id: string;
    lat: number;
    lng: number;
    status: string;
    citizen_id?: string;
}

interface MapRegion {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
}

// --- Main Component ---
export default function DriverHomeScreen() {
    const [hasStarted, setHasStarted] = useState(false);

    // Fix: Tell TypeScript these can hold our specific types
    const [region, setRegion] = useState<MapRegion | null>(null);
    const [pickups, setPickups] = useState<Pickup[]>([]);
    const [driverName, setDriverName] = useState("Saman");

    // useEffect runs once on component mount
    useEffect(() => {
        (async () => {
            // 1. Request GPS Permission
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') return; // Exit if no permission

            // 2. Get Current Location
            let location = await Location.getCurrentPositionAsync({});
            setRegion({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.05, // Zoom level
                longitudeDelta: 0.05,
            });

            // 3. Fetch Pending Pickups from Supabase (type-safe cast)
            const fetchPickups = async () => {
                const { data, error } = await supabase
                    .from('pickups') // Only table name, no generic types
                    .select('*')
                    .eq('status', 'pending'); // Only pending pickups

                if (error) {
                    console.error("Fetch error:", error.message);
                } else if (data) {
                    setPickups(data as Pickup[]); // Cast to Pickup[]
                }
            };

            fetchPickups();
        })();
    }, []); // Empty dependency array = runs once

    return (
        <View style={styles.container}>
            {/* 1. THE MAP */}
            {region && (
                <MapView
                    provider={PROVIDER_GOOGLE} // Use Google Maps
                    style={styles.map}
                    initialRegion={region} // Center map at current location
                    showsUserLocation={true} // Show blue dot for driver
                >
                    {/* Render Pickups as Pins once route has started */}
                    {hasStarted && pickups.map((item) => (
                        <Marker
                            key={item.id} // Unique key for each marker
                            coordinate={{ latitude: item.lat, longitude: item.lng }} // Pickup location
                            title={"Pickup"} // Marker title
                        />
                    ))}
                </MapView>
            )}

            {/* 2. TOP FLOATING BAR */}
            <View style={styles.headerBar}>
                {/* Hamburger/Menu button */}
                <TouchableOpacity style={styles.iconBtn}>
                    <Text style={{ fontSize: 20 }}>⠿</Text>
                </TouchableOpacity>

                {/* Jobs count and Online/Offline status */}
                <View style={{ alignItems: 'center' }}>
                    <Text style={styles.headerTitle}>{pickups.length} Jobs Available</Text>
                    <Text style={[styles.statusText, { color: hasStarted ? '#4CAF50' : '#F44336' }]}>
                        ● {hasStarted ? 'Online' : 'Offline'}
                    </Text>
                </View>

                {/* Driver profile image */}
                <Image
                    source={{ uri: 'https://i.pravatar.cc/100' }}
                    style={styles.profileImg}
                />
            </View>

            {/* 3. WELCOME MODAL (Only shows if route not started) */}
            {!hasStarted && (
                <View style={styles.modalOverlay}>
                    <View style={styles.welcomeCard}>
                        {/* Greeting message */}
                        <Text style={styles.welcomeText}>Good morning, {driverName}</Text>

                        {/* Sun icon */}
                        <Text style={styles.sunIcon}>☀️</Text>

                        {/* Subtext showing number of pickups */}
                        <Text style={styles.subText}>You have {pickups.length} Pickups scheduled today.</Text>

                        {/* Start route button */}
                        <TouchableOpacity
                            style={styles.startBtn}
                            onPress={() => setHasStarted(true)} // Start route
                        >
                            <Text style={styles.startBtnText}>START ROUTE</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
    );
}

// Styles for the component
const styles = StyleSheet.create({
    container: { flex: 1 }, // Full screen container
    map: { width: width, height: height }, // Map covers full screen
    headerBar: {
        position: 'absolute', // Overlay at top
        top: 50,
        left: 20,
        right: 20,
        height: 70,
        backgroundColor: 'white',
        borderRadius: 35,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        elevation: 5, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, // Shadow for Android/iOS
    },
    headerTitle: { fontWeight: 'bold', fontSize: 14 },
    statusText: { fontSize: 12, fontWeight: '600' },
    profileImg: { width: 40, height: 40, borderRadius: 20 },
    iconBtn: { padding: 5 },
    modalOverlay: {
        ...StyleSheet.absoluteFillObject, // Covers entire screen
        backgroundColor: 'rgba(0,0,0,0.1)', // Semi-transparent overlay
        justifyContent: 'center',
        alignItems: 'center',
    },
    welcomeCard: {
        width: width * 0.85,
        backgroundColor: 'white',
        borderRadius: 30,
        padding: 40,
        alignItems: 'center',
        elevation: 20, // Card shadow
    },
    welcomeText: { fontSize: 22, fontWeight: 'bold', textAlign: 'center' },
    sunIcon: { fontSize: 40, marginVertical: 20 },
    subText: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 30 },
    startBtn: {
        backgroundColor: '#00e5bc', // Button color
        paddingVertical: 18,
        paddingHorizontal: 50,
        borderRadius: 40,
    },
    startBtnText: { fontWeight: '900', fontSize: 18, letterSpacing: 1 },
});
