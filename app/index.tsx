// app/index.tsx

import React from 'react';
import { View, Text, Button } from 'react-native';
import { useRouter } from 'expo-router';
import DataStore from './storage/DataStore';
import { useNavigation } from 'expo-router';
import { useLayoutEffect } from 'react';

export default function HomeScreen() {
    const router = useRouter();
    const navigation = useNavigation();

    useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: 'Home',
        });
    }, [navigation]);

    const startNewSession = async () => {
        // Clear the current session and navigate to CartScreen
        await DataStore.clearCurrentSession();
        router.push('/CartScreen');
    };

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Welcome to Grocery Shopping App</Text>
            <View style={{ marginVertical: 10 }}>
                <Button title="Start New Session" onPress={startNewSession} />
            </View>
            <View style={{ marginVertical: 10 }}>
                <Button
                    title="View Previous Carts"
                    onPress={() => router.push('/SessionHistoryScreen')}
                />
            </View>
        </View>
    );
}
