import { Stack } from 'expo-router';

export default function DriverLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            {/* index.tsx will be the main map screen */}
            <Stack.Screen name="index" />
            {/* You can add other screens like 'history' or 'profile' here later */}
        </Stack>
    );
}