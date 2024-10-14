// app/index.tsx

import React from 'react';
import { View, StyleSheet, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import DataStore from './storage/DataStore';
import { Button, Text, Title } from 'react-native-paper';
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
        // Save and clear the current session before starting a new one
        const currentSession = await DataStore.getCurrentSession();
        if (currentSession && currentSession.items.length > 0) {
            await DataStore.saveSession(currentSession);
        }
        await DataStore.clearCurrentSession();
        router.push('/LocationScreen');
    };

    const viewPreviousCarts = () => {
        router.push('/SessionHistoryScreen');
    };

    return (
        <ImageBackground
            style={styles.background}
        >
            <View style={styles.container}>
                <Title style={styles.title}>Welcome to Grocery Shopping App</Title>
                <Button
                    mode="contained"
                    onPress={startNewSession}
                    style={styles.button}
                    contentStyle={styles.buttonContent}
                >
                    Start New Session
                </Button>
                <Button
                    mode="outlined"
                    onPress={viewPreviousCarts}
                    style={styles.button}
                    contentStyle={styles.buttonContent}
                >
                    View Previous Carts
                </Button>
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
        resizeMode: 'cover', // Adjust the background image
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',

        backgroundColor: 'rgba(255,255,255,0.8)', // Semi-transparent background
    },
    title: {
        fontSize: 24,
        marginBottom: 40,
        color: '#333',
    },
    button: {
        width: '80%',
        marginVertical: 10,
    },
    buttonContent: {
        height: 50,
    },
});
