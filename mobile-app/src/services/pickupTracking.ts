import { supabase } from '@/lib/supabase';
import { getRoute } from './routeService';

export interface DriverLocation {
  lat: number;
  lng: number;
  updated_at: string;
}

export interface UserLocation {
  latitude: number;
  longitude: number;
}

export interface ActivePickup {
  id: string;
  citizen_id: string;
  driver_id: string;
  scheduled_date: string;
  status: string;
  user_location: UserLocation | null;
  driver_location: DriverLocation | null;
}

interface ServiceResponse<T> {
  data: T | null;
  error: string | null;
}

export const PickupTrackingService = {
  // Get active pickup with user and driver locations
  async getActivePickup(userId: string): Promise<ServiceResponse<ActivePickup>> {
    try {
      // 1. Get active pickup for this user
      const { data: pickup, error: pickupError } = await supabase
        .from('pickups')
        .select('id, citizen_id, driver_id, scheduled_date, status')
        .eq('citizen_id', userId)
        .eq('status', 'pending')
        .single();

      if (pickupError || !pickup) {
        return { data: null, error: 'No active pickup found' };
      }

      // 2. Get user location from citizens table
      const { data: citizen, error: citizenError } = await supabase
        .from('citizens')
        .select('latitude, longitude')
        .eq('id', userId)
        .single();

      const userLocation = citizen && !citizenError
        ? { latitude: citizen.latitude, longitude: citizen.longitude }
        : null;

      // 3. Get driver live location
      const { data: driverLoc, error: driverError } = await supabase
        .from('driver_live_location')
        .select('lat, lng, updated_at')
        .eq('driver_id', pickup.driver_id)
        .single();

      const driverLocation = driverLoc && !driverError
        ? { lat: driverLoc.lat, lng: driverLoc.lng, updated_at: driverLoc.updated_at }
        : null;

      return {
        data: {
          ...pickup,
          user_location: userLocation,
          driver_location: driverLocation,
        },
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch pickup tracking',
      };
    }
  },

  // Calculate distance between two points (Haversine formula)
  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  },

  // Estimate arrival time (assuming average speed of 30 km/h)
  estimateArrivalTime(distanceKm: number): number {
    const averageSpeedKmh = 30;
    return Math.round((distanceKm / averageSpeedKmh) * 60); // minutes
  },

  async getRouteToDriver(
    userLocation: { latitude: number; longitude: number },
    driverLocation: { lat: number; lng: number },
    googleApiKey: string
  ): Promise<Array<{ latitude: number; longitude: number }> | null> {
    return await getRoute(
      { lat: userLocation.latitude, lng: userLocation.longitude },
      { lat: driverLocation.lat, lng: driverLocation.lng },
      googleApiKey
    );
  },
};

export const getActivePickup = PickupTrackingService.getActivePickup;
export const calculateDistance = PickupTrackingService.calculateDistance;
export const estimateArrivalTime = PickupTrackingService.estimateArrivalTime;
export const getRouteToDriver = PickupTrackingService.getRouteToDriver;

