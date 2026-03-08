import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { supabase } from '../lib/supabase';

export default function Index() {
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const checkSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();

                if (session) {
                    const userId = session.user.id;

                    // First check if the user is a driver
                    const { data: driverData } = await supabase
                        .from('driver')
                        .select('id')
                        .eq('id', userId)
                        .maybeSingle();

                    if (driverData) {
                        router.replace('/driver');
                        return;
                    }

                    // If not driver, check citizen account status
                    const { data: citizenData } = await supabase
                        .from('citizens')
                        .select('account_status')
                        .eq('id', userId)
                        .maybeSingle();

                    if (citizenData) {
                        if (citizenData.account_status === 'approved') {
                            router.replace('/citizen');
                        } else {
                            // Pending, rejected, or suspended
                            router.replace({
                                pathname: '/auth/account-status',
                                params: {
                                    status: citizenData.account_status,
                                    userId: userId
                                }
                            } as any);
                        }
                    } else {
                        // User not found in either table
                        router.replace('/welcome');
                    }
                } else {
                    // No session found
                    router.replace('/welcome');
                }
            } catch (error) {
                console.error("Session check error:", error);
                router.replace('/welcome');
            } finally {
                setIsChecking(false);
            }
        };

        checkSession();
    }, []);

    // Return a blank view while routing happens (splash screen covers this)
    return <View style={{ flex: 1, backgroundColor: '#fff' }} />;
}
