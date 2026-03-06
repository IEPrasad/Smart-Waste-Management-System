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

// Services & Utils
import { registerCitizen } from '../../services/authService';
import { validateStep1, validateStep2, validateStep3, RegisterErrors } from '../../utils/validations';

// Components
import BackButton from '../../components/BackButton';
import ProgressBar from '../../components/ProgressBar';

// Sub-components for Multi-step
import Step1 from '../../components/auth/RegisterStep1';
import Step2 from '../../components/auth/RegisterStep2';
import Step3 from '../../components/auth/RegisterStep3';

export default function RegisterWrapper() {
    const router = useRouter();

    // -- State: Progress --
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<RegisterErrors>({});

    // -- State: Step 1 Data --
    const [fullName, setFullName] = useState('');
    const [nic, setNic] = useState('');
    const [mobile, setMobile] = useState('');
    const [email, setEmail] = useState('');

    // -- State: Step 2 Data --
    const [assessmentNumber, setAssessmentNumber] = useState('');
    const [division, setDivision] = useState<any>(null); // e.g. { id: 1, name: 'Div1' }
    const [gnDivision, setGnDivision] = useState<any>(null); // e.g. { id: 'G-1', name: 'GN1', division_id: 1 }
    const [homeLocation, setHomeLocation] = useState(''); // Text address or lat/long string
    const [latitude, setLatitude] = useState<number | null>(null);
    const [longitude, setLongitude] = useState<number | null>(null);

    // -- State: Step 3 Data --
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [agreed, setAgreed] = useState(false);

    // --- Handlers ---
    const handleNextStep1 = () => {
        const { isValid, errors: step1Errors } = validateStep1(fullName, nic, mobile, email);
        if (isValid) {
            setErrors({});
            setCurrentStep(2);
        } else {
            setErrors(step1Errors);
        }
    };

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

    const handleSubmit = async () => {
        const { isValid, errors: step3Errors } = validateStep3(password, confirmPassword, agreed);
        if (!isValid) {
            setErrors(step3Errors);
            return;
        }

        setLoading(true);

        // Combine all data
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
            const result = await registerCitizen(userData);

            if (result.success) {
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
            setLoading(false);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        } else {
            router.back();
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View style={styles.header}>
                <BackButton onPress={handleBack} />
                <Text style={styles.headerTitle}>Registration</Text>
                <View style={{ width: 24 }} />
            </View>

            {/* Progress Bar */}
            <ProgressBar currentStep={currentStep as 1 | 2 | 3} />

            {/* Step Rendering */}
            <View style={styles.contentWrapper}>
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
