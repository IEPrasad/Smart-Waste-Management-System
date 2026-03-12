import React from 'react';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet } from 'react-native';

export default function MapSection({ mapRef, currentLocation, hasStarted, pickups, currentTarget, isDriverMode, onMarkerPress, apiKey }: any) {
    return (
        <MapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            style={StyleSheet.absoluteFill}
            initialRegion={currentLocation}
            rotateEnabled={!isDriverMode}
        >
            {currentLocation && (
                <Marker.Animated coordinate={currentLocation} anchor={{ x: 0.5, y: 0.5 }} rotation={currentLocation.heading} flat>
                    <View style={styles.driverMarker}><Ionicons name="arrow-up" size={18} color="white" /></View>
                </Marker.Animated>
            )}

            {hasStarted && pickups.map((item: any) => (
                <Marker
                    key={item.id}
                    coordinate={{ latitude: item.lat, longitude: item.lng }}
                    pinColor={currentTarget?.id === item.id ? "blue" : "red"}
                    onPress={() => onMarkerPress(item)}
                />
            ))}

            {hasStarted && currentTarget && (
                <MapViewDirections
                    origin={currentLocation}
                    destination={{ latitude: currentTarget.lat, longitude: currentTarget.lng }}
                    apikey={apiKey}
                    strokeWidth={5} // thickness of route linee
                    strokeColor="#00b0ff"
                />
            )}
        </MapView>
        //make sure to only show the route after the driver has started and has a target pickup
    );
}

const styles = StyleSheet.create({
    driverMarker: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#00b0ff', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'white' }
});