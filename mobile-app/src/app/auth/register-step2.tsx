import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Modal,
    TouchableOpacity,
    FlatList,
    TouchableWithoutFeedback,
    ActivityIndicator,
    Alert,
} from 'react-native';
import * as Location from 'expo-location';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../components/Button';
import ProgressBar from '../../components/ProgressBar';
import InputField from '../../components/InputField';
import SelectField from '../../components/SelectField';
import BackButton from '../../components/BackButton';
import { supabase } from '../../../lib/supabase';

// Types for Supabase tables
interface Division {
    id: number;
    name: string;
}

interface GnDivision {
    id: string;
    name: string;
    division_id: number;
}

export default function RegisterStep2() {
    const router = useRouter();
    const params = useLocalSearchParams();

    const [assessmentNumber, setAssessmentNumber] = useState('');
    const [division, setDivision] = useState<Division | null>(null);
    const [gnDivision, setGnDivision] = useState<GnDivision | null>(null);
    const [homeLocation, setHomeLocation] = useState('');
    const [latitude, setLatitude] = useState<number | null>(null);
    const [longitude, setLongitude] = useState<number | null>(null);
    const [isLoadingLocation, setIsLoadingLocation] = useState(false);

    const [showDivisionPicker, setShowDivisionPicker] = useState(false);
    const [showGnDivisionPicker, setShowGnDivisionPicker] = useState(false);

    // Data from Supabase
    const [divisions, setDivisions] = useState<Division[]>([]);
    const [gnDivisions, setGnDivisions] = useState<GnDivision[]>([]);
    const [isLoadingDivisions, setIsLoadingDivisions] = useState(true);
    const [isLoadingGnDivisions, setIsLoadingGnDivisions] = useState(false);

    // Fetch divisions on component mount
    useEffect(() => {
        const fetchDivisions = async () => {
            try {
                setIsLoadingDivisions(true);
                const { data, error } = await supabase
                    .from('divisions')
                    .select('id, name')
                    .order('name');

                if (error) {
                    console.error('Error fetching divisions:', error);
                    Alert.alert('Error', 'Failed to load divisions. Please try again.');
                    return;
                }

                setDivisions(data || []);
            } catch (error) {
                console.error('Error fetching divisions:', error);
                Alert.alert('Error', 'Failed to load divisions. Please try again.');
            } finally {
                setIsLoadingDivisions(false);
            }
        };

        fetchDivisions();
    }, []);

    // Fetch GN divisions when division changes
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

                if (error) {
                    console.error('Error fetching GN divisions:', error);
                    Alert.alert('Error', 'Failed to load GN divisions. Please try again.');
                    return;
                }

                setGnDivisions(data || []);
            } catch (error) {
                console.error('Error fetching GN divisions:', error);
                Alert.alert('Error', 'Failed to load GN divisions. Please try again.');
            } finally {
                setIsLoadingGnDivisions(false);
            }
        };

        fetchGnDivisions();
    }, [division]);

    const [errors, setErrors] = useState<{
        assessmentNumber?: string;
        division?: string;
        gnDivision?: string;
        homeLocation?: string;
    }>({});

    const handleDivisionSelect = (item: Division) => {
        setDivision(item);
        setGnDivision(null); // Reset GN Division when division changes
        setShowDivisionPicker(false);
        if (errors.division) {
            setErrors({ ...errors, division: undefined });
        }
    };

    const handleGnDivisionSelect = (item: GnDivision) => {
        setGnDivision(item);
        setShowGnDivisionPicker(false);
        if (errors.gnDivision) {
            setErrors({ ...errors, gnDivision: undefined });
        }
    };

    const handleGetLocation = async () => {
        setIsLoadingLocation(true);
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert(
                    'Permission Denied',
                    'Permission to access location was denied. Please enable location permissions in settings.'
                );
                setIsLoadingLocation(false);
                return;
            }

            let location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
            });

            setLatitude(location.coords.latitude);
            setLongitude(location.coords.longitude);
            setHomeLocation(
                `Lat: ${location.coords.latitude.toFixed(6)}, Long: ${location.coords.longitude.toFixed(6)}`
            );

            if (errors.homeLocation) {
                setErrors({ ...errors, homeLocation: undefined });
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to get location. Please try again.');
        } finally {
            setIsLoadingLocation(false);
        }
    };

    const validateFields = () => {
        const newErrors: typeof errors = {};

        if (!assessmentNumber.trim()) {
            newErrors.assessmentNumber = 'Assessment Number is required';
        }

        if (!division) {
            newErrors.division = 'Division is required';
        }

        if (!gnDivision) {
            newErrors.gnDivision = 'Grama Niladhari Division is required';
        }

        if (!homeLocation.trim() || latitude === null || longitude === null) {
            newErrors.homeLocation = 'Home Location is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateFields()) {
            router.push({
                pathname: '/auth/register-step3',
                params: {
                    ...params,
                    assessmentNumber: assessmentNumber.trim(),
                    division: division?.name || '',
                    gnDivision: gnDivision?.name || '',
                    gnDivisionId: gnDivision?.id || '',
                    homeLocation,
                    latitude: latitude?.toString(),
                    longitude: longitude?.toString(),
                },
            });
        }
    };

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
                                    <Text style={styles.loadingText}>Loading divisions...</Text>
                                </View>
                            ) : (
                                <FlatList
                                    data={divisions}
                                    keyExtractor={(item) => item.id.toString()}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity
                                            style={[
                                                styles.modalItem,
                                                division?.id === item.id && styles.modalItemSelected
                                            ]}
                                            onPress={() => handleDivisionSelect(item)}
                                        >
                                            <Text style={[
                                                styles.modalItemText,
                                                division?.id === item.id && styles.modalItemTextSelected
                                            ]}>{item.name}</Text>
                                        </TouchableOpacity>
                                    )}
                                    ListEmptyComponent={
                                        <Text style={styles.emptyText}>No divisions available</Text>
                                    }
                                />
                            )}
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );

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
                                    <Text style={styles.loadingText}>Loading GN divisions...</Text>
                                </View>
                            ) : (
                                <FlatList
                                    data={gnDivisions}
                                    keyExtractor={(item) => item.id}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity
                                            style={[
                                                styles.modalItem,
                                                gnDivision?.id === item.id && styles.modalItemSelected
                                            ]}
                                            onPress={() => handleGnDivisionSelect(item)}
                                        >
                                            <Text style={[
                                                styles.modalItemText,
                                                gnDivision?.id === item.id && styles.modalItemTextSelected
                                            ]}>{item.name}</Text>
                                        </TouchableOpacity>
                                    )}
                                    ListEmptyComponent={
                                        <Text style={styles.emptyText}>No GN divisions available</Text>
                                    }
                                />
                            )}
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View style={styles.header}>
                <BackButton />
                <Text style={styles.headerTitle}>Registration</Text>
                <View style={{ width: 24 }} />
            </View>

            {/* Progress Bar */}
            <ProgressBar currentStep={2} />

            <View style={styles.contentWrapper}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    style={{ flex: 1 }}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
                >
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                        style={{ flex: 1 }}
                    >
                        <Text style={styles.title}>Location Info</Text>
                        <Text style={styles.subtitle}>
                            Please provide your location details to ensure accurate service allocation.
                        </Text>

                        {/* Assessment Number */}
                        <InputField
                            label="Assessment Number"
                            icon="document-text-outline"
                            placeholder="Enter assessment number"
                            value={assessmentNumber}
                            onChangeText={(text) => {
                                setAssessmentNumber(text);
                                if (errors.assessmentNumber) {
                                    setErrors({ ...errors, assessmentNumber: undefined });
                                }
                            }}
                            error={errors.assessmentNumber}
                            required
                        />

                        {/* Division */}
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

                        {/* Grama Niladhari Division */}
                        <SelectField
                            label="Grama Niladhari Division"
                            icon="business-outline"
                            placeholder={
                                !division
                                    ? "Select Division First"
                                    : isLoadingGnDivisions
                                        ? "Loading..."
                                        : "Select GN Division"
                            }
                            value={gnDivision?.name || ''}
                            onPress={() => division && !isLoadingGnDivisions && setShowGnDivisionPicker(true)}
                            error={errors.gnDivision}
                            required
                            disabled={!division || isLoadingGnDivisions}
                        />

                        {/* Home Location */}
                        <View style={styles.fieldContainer}>
                            <Text style={styles.label}>
                                Home Location
                                <Text style={styles.required}> *</Text>
                            </Text>
                            <TouchableOpacity
                                style={[
                                    styles.locationButton,
                                    errors.homeLocation && styles.inputContainerError,
                                ]}
                                onPress={handleGetLocation}
                                disabled={isLoadingLocation}
                                activeOpacity={0.7}
                            >
                                {isLoadingLocation ? (
                                    <ActivityIndicator size="small" color="#00E5CC" style={styles.icon} />
                                ) : (
                                    <Ionicons name="paper-plane-outline" size={20} color="#00E5CC" style={styles.icon} />
                                )}
                                <Text
                                    style={[
                                        styles.locationButtonText,
                                        !homeLocation && styles.placeholderText,
                                    ]}
                                >
                                    {isLoadingLocation
                                        ? 'Getting location...'
                                        : homeLocation || 'Select Your Current Location'}
                                </Text>
                            </TouchableOpacity>
                            {errors.homeLocation && (
                                <Text style={styles.errorText}>{errors.homeLocation}</Text>
                            )}
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>

                {/* Footer Button - Fixed at bottom */}
                <View style={styles.footer}>
                    <Button title="Next" onPress={handleNext} />
                </View>
            </View>

            {/* Modals */}
            {renderDivisionModal()}
            {renderGnDivisionModal()}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
    },
    contentWrapper: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    fieldContainer: {
        marginBottom: 20,
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
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        color: '#333',
    },
    required: {
        color: '#FF0000',
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
    inputContainerError: {
        borderColor: '#FF0000',
    },
    icon: {
        marginRight: 10,
    },
    locationButtonText: {
        flex: 1,
        fontSize: 16,
        color: '#333',
    },
    placeholderText: {
        color: '#999',
    },
    errorText: {
        fontSize: 12,
        color: '#FF0000',
        marginTop: 4,
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        backgroundColor: '#fff',
        // Ensure footer stays at bottom and doesn't jump
        position: 'relative',
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
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
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
    modalItemTextSelected: {
        color: '#00E5CC',
        fontWeight: '600',
    },
    loadingContainer: {
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: '#666',
    },
    emptyText: {
        padding: 20,
        textAlign: 'center',
        fontSize: 14,
        color: '#999',
    },
});

