import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    Text,
    ActivityIndicator,
    Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';

// Services & Utils: Used for API calls and input validation
import { registerCitizen } from '../../services/authService';
import { validateStep1, validateStep2, validateStep3, RegisterErrors } from '../../utils/validations';

// Shared Components used in the UI
import BackButton from '../../components/BackButton';
import ProgressBar from '../../components/ProgressBar';

// Sub-components for Multi-step registration process
import Step1 from '../../components/auth/RegisterStep1';
import Step2 from '../../components/auth/RegisterStep2';
import Step3 from '../../components/auth/RegisterStep3';

// Main wrapper component that manages the entire multi-step registration flow
export default function RegisterWrapper() {
    const router = useRouter(); // Used for navigation between screens

    // -- State: Progress --
    // Tracks the current step (1, 2, or 3), loading status, and any validation errors
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<RegisterErrors>({});

    // -- State: Step 1 Data (Personal Info) --
    const [fullName, setFullName] = useState('');
    const [nic, setNic] = useState('');
    const [mobile, setMobile] = useState('');
    const [email, setEmail] = useState('');

    // -- State: Step 2 Data (Location Info) --
    const [assessmentNumber, setAssessmentNumber] = useState('');
    const [division, setDivision] = useState<any>(null); // e.g. { id: 1, name: 'Div1' }
    const [gnDivision, setGnDivision] = useState<any>(null); // e.g. { id: 'G-1', name: 'GN1', division_id: 1 }
    const [homeLocation, setHomeLocation] = useState(''); // Text address or lat/long string
    const [latitude, setLatitude] = useState<number | null>(null);
    const [longitude, setLongitude] = useState<number | null>(null);

    // -- State: Step 3 Data (Security & Agreement) --
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [agreed, setAgreed] = useState(false);



    // Validates Step 1 data and moves to Step 2 if everything is correct
    const handleNextStep1 = () => {
        const { isValid, errors: step1Errors } = validateStep1(fullName, nic, mobile, email);
        if (isValid) {
            setErrors({}); // Clear any previous errors
            setCurrentStep(2); // Go to next step
        } else {
            setErrors(step1Errors); // Show validation errors to the user
        }
    };

    // Validates Step 2 data and moves to Step 3 if everything is correct
    const handleNextStep2 = () => {
        const { isValid, errors: step2Errors } = validateStep2(
            assessmentNumber,
            division,
            gnDivision,
            homeLocation,
            latitude,
            longitude
        );
        if (isValid) {
            setErrors({});
            setCurrentStep(3);
        } else {
            setErrors(step2Errors);
        }
    };

    // Validates Step 3 data and submits the final registration form to the backend API
    const handleSubmit = async () => {
        const { isValid, errors: step3Errors } = validateStep3(password, confirmPassword, agreed);
        if (!isValid) {
            setErrors(step3Errors);
            return;
        }

        setLoading(true); // Show a loading indicator while submitting

        // Combine all data collected from the 3 steps into one object
        const userData = {
            fullName: fullName.trim(),
            email: email.trim(),
            nic: nic.trim(),
            mobile: mobile.trim(),
            assessmentNumber: assessmentNumber.trim(),
            division: division?.name || '',
            gnDivision: gnDivision?.name || '', // Pass name for now (or ID if DB requires)
            latitude: (latitude || 0),
            longitude: (longitude || 0),
            password: password.trim(),
        };

        try {
            // Call the authentication service to register the citizen
            const result = await registerCitizen(userData);

            if (result.success) {
                // If successful, show an alert and redirect to the login screen
                Alert.alert(
                    'Success',
                    'Account created successfully! Please wait for admin approval.',
                    [{ text: 'OK', onPress: () => router.replace('/auth/citizen-login') }]
                );
            } else {
                Alert.alert('Registration Failed', result.error);
            }
        } catch (error) {
            Alert.alert('Error', 'Something went wrong. Please try again.');
        } finally {
            setLoading(false); // Hide the loading indicator
        }
    };

    // Handles the back button press behavior
    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1); // Go back to the previous step within the form
        } else {
            router.back(); // Go back to the previous screen in the app navigation
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            <View style={styles.header}>
                <BackButton onPress={handleBack} />
                <Text style={styles.headerTitle}>Registration</Text>
                <View style={{ width: 24 }} />
            </View>

            {/* Visual indicator showing the user which step they are currently on */}
            <ProgressBar currentStep={currentStep as 1 | 2 | 3} />

            <View style={styles.contentWrapper}>
                {/* Render Step 1 only if currentStep is 1 */}
                {currentStep === 1 && (
                    <Step1
                        fullName={fullName} setFullName={setFullName}
                        nic={nic} setNic={setNic}
                        mobile={mobile} setMobile={setMobile}
                        email={email} setEmail={setEmail}
                        errors={errors} setErrors={setErrors}
                        onNext={handleNextStep1}
                    />
                )}

                {/* Render Step 2 only if currentStep is 2 */}
                {currentStep === 2 && (
                    <Step2
                        assessmentNumber={assessmentNumber} setAssessmentNumber={setAssessmentNumber}
                        division={division} setDivision={setDivision}
                        gnDivision={gnDivision} setGnDivision={setGnDivision}
                        homeLocation={homeLocation} setHomeLocation={setHomeLocation}
                        latitude={latitude} setLatitude={setLatitude}
                        longitude={longitude} setLongitude={setLongitude}
                        errors={errors} setErrors={setErrors}
                        onNext={handleNextStep2}
                    />
                )}

                {/* Render Step 3 only if currentStep is 3 */}
                {currentStep === 3 && (
                    <Step3
                        password={password} setPassword={setPassword}
                        confirmPassword={confirmPassword} setConfirmPassword={setConfirmPassword}
                        agreed={agreed} setAgreed={setAgreed}
                        errors={errors} setErrors={setErrors}
                        onSubmit={handleSubmit}
                        loading={loading}
                    />
                )}
            </View>
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
    }
});
