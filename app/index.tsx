// app/index.tsx

import React from 'react';
import { View, Text, Button } from 'react-native';
import { useRouter, Link } from 'expo-router';
import DataStore from './storage/DataStore';

export default function HomeScreen() {
    const router = useRouter();

    const startNewSession = async () => {
        // Get the current session
        const currentSession = await DataStore.getCurrentSession();
        if (currentSession && currentSession.items.length > 0) {
            // Move the current session to sessions list
            await DataStore.saveSession(currentSession);
        }
        // Clear the current session
        await DataStore.clearCurrentSession();
        // Navigate to CartScreen
        router.push('/CartScreen');
    };

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Welcome to Grocery Shopping App</Text>
            <View style={{ marginVertical: 10 }}>
                <Button title="Start New Session" onPress={startNewSession} />
            </View>
            <View style={{ marginVertical: 10 }}>
                <Link href="/SessionHistoryScreen" asChild>
                    <Button title="View Previous Carts" />
                </Link>
            </View>
        </View>
    );
}
