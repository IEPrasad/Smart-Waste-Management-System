import React, { useState } from 'react';
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

const LOCATION_DATA: { [key: string]: string[] } = {
    "Poddala": ["Poddala (117)", "Penideniya (117C)", "Pannamaga (117B)", "Meepawala (117A)", "Opatha (127B)"],
    "Narawala": ["Narawala (111)", "Mulana East (111F)", "Mulana West (111G)", "Walawatta (111C)", "Addaragoda (111E)", "Magadeniya (111A)", "Panvila (111B)"],
    "Labudoowa": ["Baswatta (111D)", "Labudoowa (114)", "Thotagoda (114A)", "Kurunda (114C)", "Kurunda Kanda (114B)"],
    "Uluvitike": ["Uluvitike (127)", "Holuwagoda (126C)", "Bokaramullagoda (127C)", "Bangalawatta (127D)", "Nawinna (127E)"],
    "Wakwella": ["Wakwella (121)", "Ukwatta East (108)", "Ukwatta West (108B)"],
    "Hapugala": ["Hapugala (123)", "Niladeniya (123A)", "Beraliyadola (123D)", "Silwagewatta (124B)"],
    "Kurunduwatta": ["Kurunduwatta (106)", "Maha Hapugala (108A)"],
    "Welipitimodara": ["Welipitimodara (105)", "Piyadigama (107)", "Bope North (107A)"],
    "Kalegana": ["Kalegana North (125A)", "Wataraka East (120)", "Mampitiya (120A)", "Kalegana South (125)"],
    "Kithulampitiya": ["Kithulampitiya (124)", "Thunhiripana (124A)", "Pelawatta (123B)", "Abeysundarawatta (123C)", "Kahadoowawatta (124C)"],
    "Karapitiya": ["Karapitiya (126A)", "Godakanda (126)", "Galketiya (126B)", "Hirimburagama (127A)"],
    "Kapuhempala": ["Ambagahawatta (114D)", "Kapuhempala (115)", "Keranvila (115A)", "Paliwathugoda (115B)", "Thotagoda (114A)"]
};

export default function RegisterStep2() {
    const router = useRouter();
    const params = useLocalSearchParams();

    const [assessmentNumber, setAssessmentNumber] = useState('');
    const [division, setDivision] = useState('');
    const [gnDivision, setGnDivision] = useState('');
    const [homeLocation, setHomeLocation] = useState('');
    const [latitude, setLatitude] = useState<number | null>(null);
    const [longitude, setLongitude] = useState<number | null>(null);
    const [isLoadingLocation, setIsLoadingLocation] = useState(false);

    const [showDivisionPicker, setShowDivisionPicker] = useState(false);
    const [showGnDivisionPicker, setShowGnDivisionPicker] = useState(false);

    const [errors, setErrors] = useState<{
        assessmentNumber?: string;
        division?: string;
        gnDivision?: string;
        homeLocation?: string;
    }>({});

    const handleDivisionSelect = (item: string) => {
        setDivision(item);
        setGnDivision(''); // Reset GN Division when division changes
        setShowDivisionPicker(false);
        if (errors.division) {
            setErrors({ ...errors, division: undefined });
        }
    };

    const handleGnDivisionSelect = (item: string) => {
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

        if (!division.trim()) {
            newErrors.division = 'Division is required';
        }

        if (!gnDivision.trim()) {
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
                    division,
                    gnDivision,
                    homeLocation,
                    latitude: latitude?.toString(),
                    longitude: longitude?.toString(),
                },
            });
        }
    };

    const renderSelectionModal = (
        visible: boolean,
        onClose: () => void,
        data: string[],
        onSelect: (item: string) => void,
        title: string
    ) => (
        <Modal visible={visible} transparent animationType="slide">
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.modalOverlay}>
                    <TouchableWithoutFeedback>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>{title}</Text>
                                <TouchableOpacity onPress={onClose}>
                                    <Ionicons name="close" size={24} color="#000" />
                                </TouchableOpacity>
                            </View>
                            <FlatList
                                data={data}
                                keyExtractor={(item) => item}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={styles.modalItem}
                                        onPress={() => onSelect(item)}
                                    >
                                        <Text style={styles.modalItemText}>{item}</Text>
                                    </TouchableOpacity>
                                )}
                            />
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );

    const divisions = Object.keys(LOCATION_DATA).sort();
    const gnDivisions = division ? [...LOCATION_DATA[division]].sort() : [];

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
                            placeholder="Select Division"
                            value={division}
                            onPress={() => setShowDivisionPicker(true)}
                            error={errors.division}
                            required
                        />

                        {/* Grama Niladhari Division */}
                        <SelectField
                            label="Grama Niladhari Division"
                            icon="business-outline"
                            placeholder={division ? "Select GN Division" : "Select Division First"}
                            value={gnDivision}
                            onPress={() => division && setShowGnDivisionPicker(true)}
                            error={errors.gnDivision}
                            required
                            disabled={!division}
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
            {renderSelectionModal(
                showDivisionPicker,
                () => setShowDivisionPicker(false),
                divisions,
                handleDivisionSelect,
                'Select Division'
            )}
            {renderSelectionModal(
                showGnDivisionPicker,
                () => setShowGnDivisionPicker(false),
                gnDivisions,
                handleGnDivisionSelect,
                'Select GN Division'
            )}
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
    modalItemText: {
        fontSize: 16,
        color: '#333',
    },
});

