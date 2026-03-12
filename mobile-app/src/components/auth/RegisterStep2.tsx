// Import necessary React, React Native components, and other dependencies
import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Modal,
    TouchableOpacity,
    FlatList,
    TouchableWithoutFeedback,
    ActivityIndicator,
    Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import { supabase } from '../../../lib/supabase';
import InputField from '../InputField';
import SelectField from '../SelectField';
import Button from '../Button';
import { RegisterErrors } from '../../utils/validations';

// Define the types for the props passed to the RegisterStep2 component
interface Step2Props {
    assessmentNumber: string;
    setAssessmentNumber: (val: string) => void;
    division: any;
    setDivision: (val: any) => void;
    gnDivision: any;
    setGnDivision: (val: any) => void;
    homeLocation: string;
    setHomeLocation: (val: string) => void;
    latitude: number | null;
    setLatitude: (val: number | null) => void;
    longitude: number | null;
    setLongitude: (val: number | null) => void;
    errors: RegisterErrors;
    setErrors: (err: RegisterErrors) => void;
    onNext: () => void;
}

// Second step of registration: Collects location-related information (Assessment No, Division, Location)
export default function RegisterStep2({
    assessmentNumber, setAssessmentNumber,
    division, setDivision,
    gnDivision, setGnDivision,
    homeLocation, setHomeLocation,
    latitude, setLatitude,
    longitude, setLongitude,
    errors, setErrors,
    onNext
}: Step2Props) {

    // Define temporary internal states required by the component
    const [isLoadingLocation, setIsLoadingLocation] = useState(false);
    const [showDivisionPicker, setShowDivisionPicker] = useState(false);
    const [showGnDivisionPicker, setShowGnDivisionPicker] = useState(false);
    const [showMapModal, setShowMapModal] = useState(false);

    // Initialize temporary map coordinates using previously selected location (if any)
    const [tempLatitude, setTempLatitude] = useState<number | null>(latitude);
    const [tempLongitude, setTempLongitude] = useState<number | null>(longitude);

    const [divisions, setDivisions] = useState<any[]>([]);
    const [gnDivisions, setGnDivisions] = useState<any[]>([]);
    const [isLoadingDivisions, setIsLoadingDivisions] = useState(true);
    const [isLoadingGnDivisions, setIsLoadingGnDivisions] = useState(false);

    // Fetch Divisions from the Supabase database when the component first loads
    useEffect(() => {
        const fetchDivisions = async () => {
            try {
                setIsLoadingDivisions(true);
                const { data, error } = await supabase
                    .from('divisions')
                    .select('id, name')
                    .order('name');
                if (error) throw error;
                setDivisions(data || []);
            } catch (error) {
                Alert.alert('Error', 'Failed to load divisions.');
            } finally {
                setIsLoadingDivisions(false);
            }
        };
        fetchDivisions();
    }, []);

    // Fetch the relevant GN Divisions when a Division is selected by the user
    useEffect(() => {
        const fetchGnDivisions = async () => {
            if (!division) {
                setGnDivisions([]);
                return;
            }
            try {
                setIsLoadingGnDivisions(true);
                const { data, error } = await supabase
                    .from('gn_divisions')
                    .select('id, name, division_id')
                    .eq('division_id', division.id)
                    .order('name');
                if (error) throw error;
                setGnDivisions(data || []);
            } catch (error) {
                Alert.alert('Error', 'Failed to load GN divisions.');
            } finally {
                setIsLoadingGnDivisions(false);
            }
        };
        fetchGnDivisions();
    }, [division]);

    // Handle Division selection from the list
    const handleDivisionSelect = (item: any) => {
        setDivision(item);
        setGnDivision(null); // Clear previously selected GN Division when a new Division is selected
        setShowDivisionPicker(false);
        if (errors.division) setErrors({ ...errors, division: undefined });
    };

    // Handle GN Division selection from the list
    const handleGnDivisionSelect = (item: any) => {
        setGnDivision(item);
        setShowGnDivisionPicker(false);
        if (errors.gnDivision) setErrors({ ...errors, gnDivision: undefined });
    };

    // Use phone GPS to find current location
    const handleGetLocation = async () => {
        setIsLoadingLocation(true);
        try {
            // Check for location permissions
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Please enable location permissions in settings.');
                setIsLoadingLocation(false);
                return;
            }

            // Get current position if permission is granted
            let location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
            });

            setTempLatitude(location.coords.latitude);
            setTempLongitude(location.coords.longitude);
            setShowMapModal(true); // Open the map modal

        } catch (error) {
            Alert.alert('Error', 'Failed to get location. Please try again.');
        } finally {
            setIsLoadingLocation(false);
        }
    };

    // Confirm the selected location from the map
    const handleConfirmLocation = () => {
        setLatitude(tempLatitude);
        setLongitude(tempLongitude);
        if (tempLatitude && tempLongitude) {
            setHomeLocation(`Lat: ${tempLatitude.toFixed(6)}, Long: ${tempLongitude.toFixed(6)}`);
            if (errors.homeLocation) setErrors({ ...errors, homeLocation: undefined });
        }
        setShowMapModal(false);
    };

    // Render the Map Modal/Popup
    const renderMapModal = () => (
        <Modal visible={showMapModal} animationType="slide" transparent={false}>
            <View style={styles.fullScreenModal}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Adjust Your Location</Text>
                    <TouchableOpacity onPress={() => setShowMapModal(false)}>
                        <Ionicons name="close" size={24} color="#000" />
                    </TouchableOpacity>
                </View>

                {tempLatitude && tempLongitude ? (
                    <View style={styles.fullMapContainer}>
                        {/* The actual Map view component */}
                        <MapView
                            style={styles.map}
                            initialRegion={{
                                latitude: tempLatitude,
                                longitude: tempLongitude,
                                latitudeDelta: 0.005,
                                longitudeDelta: 0.005,
                            }}
                            onRegionChangeComplete={(region) => {
                                setTempLatitude(region.latitude);
                                setTempLongitude(region.longitude);
                            }}
                        >
                            <Marker
                                coordinate={{ latitude: tempLatitude, longitude: tempLongitude }}
                                title="Home Location"
                            />
                        </MapView>
                        {/* Red pin marker centered on the map */}
                        <View style={styles.mapOverlay}>
                            <Ionicons name="location" size={40} color="#FF0000" style={styles.centerMarker} />
                        </View>
                        <Text style={styles.mapHintModal}>Drag the map to pinpoint your exact home location</Text>
                    </View>
                ) : (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#00E5CC" />
                        <Text style={{ marginTop: 10, color: '#666' }}>Fetching location...</Text>
                    </View>
                )}

                <View style={styles.mapFooter}>
                    <Button title="Confirm Location" onPress={handleConfirmLocation} />
                </View>
            </View>
        </Modal>
    );

    // List Popup  for selecting a Division
    const renderDivisionModal = () => (
        <Modal visible={showDivisionPicker} transparent animationType="slide">
            <TouchableWithoutFeedback onPress={() => setShowDivisionPicker(false)}>
                <View style={styles.modalOverlay}>
                    <TouchableWithoutFeedback>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Select Division</Text>
                                <TouchableOpacity onPress={() => setShowDivisionPicker(false)}>
                                    <Ionicons name="close" size={24} color="#000" />
                                </TouchableOpacity>
                            </View>
                            {isLoadingDivisions ? (
                                <View style={styles.loadingContainer}>
                                    <ActivityIndicator size="large" color="#00E5CC" />
                                </View>
                            ) : (
                                <FlatList
                                    data={divisions}
                                    keyExtractor={(item) => item.id.toString()}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity
                                            style={[styles.modalItem, division?.id === item.id && styles.modalItemSelected]}
                                            onPress={() => handleDivisionSelect(item)}
                                        >
                                            <Text style={styles.modalItemText}>{item.name}</Text>
                                        </TouchableOpacity>
                                    )}
                                />
                            )}
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );

    // List Popup  for selecting a GN Division
    const renderGnDivisionModal = () => (
        <Modal visible={showGnDivisionPicker} transparent animationType="slide">
            <TouchableWithoutFeedback onPress={() => setShowGnDivisionPicker(false)}>
                <View style={styles.modalOverlay}>
                    <TouchableWithoutFeedback>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Select GN Division</Text>
                                <TouchableOpacity onPress={() => setShowGnDivisionPicker(false)}>
                                    <Ionicons name="close" size={24} color="#000" />
                                </TouchableOpacity>
                            </View>
                            {isLoadingGnDivisions ? (
                                <View style={styles.loadingContainer}>
                                    <ActivityIndicator size="large" color="#00E5CC" />
                                </View>
                            ) : (
                                <FlatList
                                    data={gnDivisions}
                                    keyExtractor={(item) => item.id}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity
                                            style={[styles.modalItem, gnDivision?.id === item.id && styles.modalItemSelected]}
                                            onPress={() => handleGnDivisionSelect(item)}
                                        >
                                            <Text style={styles.modalItemText}>{item.name}</Text>
                                        </TouchableOpacity>
                                    )}
                                />
                            )}
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );

    return (
        <>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Main title and subtitle of the page */}
                    <Text style={styles.title}>Location Info</Text>
                    <Text style={styles.subtitle}>
                        Please provide your location details to ensure accurate service allocation.
                    </Text>

                    /* Input field to collect the Assessment Number */
                    <InputField
                        label="Assessment Number"
                        icon="document-text-outline"
                        placeholder="Enter assessment number"
                        value={assessmentNumber}
                        onChangeText={(text) => {
                            setAssessmentNumber(text);
                            if (errors.assessmentNumber) setErrors({ ...errors, assessmentNumber: undefined });
                        }}
                        error={errors.assessmentNumber}
                        required
                    />

                    /* Field to select the Division */
                    <SelectField
                        label="Division"
                        icon="location-outline"
                        placeholder={isLoadingDivisions ? "Loading..." : "Select Division"}
                        value={division?.name || ''}
                        onPress={() => !isLoadingDivisions && setShowDivisionPicker(true)}
                        error={errors.division}
                        required
                        disabled={isLoadingDivisions}
                    />

                    /* Field to select the GN Division */
                    <SelectField
                        label="Grama Niladhari Division"
                        icon="business-outline"
                        placeholder={!division ? "Select Division First" : isLoadingGnDivisions ? "Loading..." : "Select GN Division"}
                        value={gnDivision?.name || ''}
                        onPress={() => division && !isLoadingGnDivisions && setShowGnDivisionPicker(true)}
                        error={errors.gnDivision}
                        required
                        disabled={!division || isLoadingGnDivisions}
                    />

                    /* GPS Location selection button */
                    <View style={styles.fieldContainer}>
                        <Text style={styles.label}>Home Location <Text style={{ color: 'red' }}>*</Text></Text>
                        <TouchableOpacity
                            style={[styles.locationButton, errors.homeLocation ? { borderColor: 'red' } : null, { marginBottom: 15 }]}
                            onPress={handleGetLocation}
                            disabled={isLoadingLocation}
                        >
                            {isLoadingLocation ? (
                                <ActivityIndicator size="small" color="#00E5CC" style={styles.icon} />
                            ) : (
                                <Ionicons name="location-outline" size={20} color="#00E5CC" style={styles.icon} />
                            )}
                            <Text style={[styles.locationButtonText, !homeLocation && { color: '#999' }]}>
                                {isLoadingLocation ? 'Getting location...' : homeLocation || 'Find My Location (GPS)'}
                            </Text>
                        </TouchableOpacity>

                        {errors.homeLocation && <Text style={{ color: 'red', fontSize: 12, marginTop: 4 }}>{errors.homeLocation}</Text>}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Section containing the button to proceed to the next step */}
            <View style={styles.footer}>
                <Button title="Next" onPress={onNext} />
            </View>

            {/* Render the Modal Popups created above */}
            {renderMapModal()}
            {renderDivisionModal()}
            {renderGnDivisionModal()}
        </>
    );
}

// Visual appearance, colors, and layout definitions (Styles) for the component
const styles = StyleSheet.create({
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#000',
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 30,
        lineHeight: 20,
    },
    fieldContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        color: '#333',
    },
    locationButton: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 12,
        paddingHorizontal: 15,
        height: 50,
        backgroundColor: '#fff',
    },
    icon: {
        marginRight: 10,
    },
    locationButtonText: {
        flex: 1,
        fontSize: 16,
        color: '#333',
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        backgroundColor: '#fff',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '70%',
        paddingBottom: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    modalItem: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    modalItemSelected: {
        backgroundColor: '#E6FBF8',
    },
    modalItemText: {
        fontSize: 16,
        color: '#333',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullScreenModal: {
        flex: 1,
        backgroundColor: '#fff',
    },
    fullMapContainer: {
        flex: 1,
    },
    mapFooter: {
        padding: 20,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    mapOverlay: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginLeft: -20,
        marginTop: -40, // offset to point exactly to center
        zIndex: 1,
        pointerEvents: 'none',
    },
    centerMarker: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    mapHintModal: {
        position: 'absolute',
        top: 20,
        alignSelf: 'center',
        backgroundColor: 'rgba(0,0,0,0.7)',
        color: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        fontSize: 14,
        overflow: 'hidden',
        fontWeight: 'bold',
    }
});
