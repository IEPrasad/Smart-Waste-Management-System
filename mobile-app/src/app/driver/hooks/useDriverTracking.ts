import { useState, useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import { supabase } from '../../../lib/supabase';

export function useDriverTracking(driverId: string | null, hasStarted: boolean) {
    const [currentLocation, setCurrentLocation] = useState<any>(null);
    const lastDbUpdate = useRef<number>(0);

    useEffect(() => {
        let subscription: Location.LocationSubscription | null = null;

        const startTracking = async () => {
            // Check permissions first
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') return;

            subscription = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.BestForNavigation,
                    timeInterval: 1000,
                    distanceInterval: 5,
                },
                async (loc) => {
                    const { latitude, longitude, heading } = loc.coords;
                    const coords = { latitude, longitude, heading: heading || 0, latitudeDelta: 0.005, longitudeDelta: 0.005 };

                    setCurrentLocation(coords);

                    // Only sync to DB if the driver has officially "Started" the route
                    const now = Date.now();
                    if (driverId && hasStarted && (now - lastDbUpdate.current > 5000)) {
                        lastDbUpdate.current = now;
                        await supabase.from('driver_live_location').upsert({
                            driver_id: driverId,
                            lat: latitude,
                            lng: longitude,
                            updated_at: new Date()
                        }, { onConflict: 'driver_id' });
                    }
                }
            );
        };

        // ✅ CHANGE: Always start tracking immediately so handleStartRoute has a location
        startTracking();

        return () => subscription?.remove();
    }, [driverId, hasStarted]); // Keep hasStarted here so the listener knows when to start DB syncing

    return currentLocation;
}