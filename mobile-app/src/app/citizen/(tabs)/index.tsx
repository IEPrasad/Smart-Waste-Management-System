import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';

export default function Index() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Wait for root layout to mount
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      // Small delay to ensure navigation is ready
      const timer = setTimeout(() => {
        router.replace('/citizen/user-home');
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isMounted]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#10B981' }}>
      <ActivityIndicator size="large" color="#FFFFFF" />
    </View>
  );
}
