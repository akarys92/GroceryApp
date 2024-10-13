// app/SessionHistoryScreen.tsx

import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, Button } from 'react-native';
import { useRouter } from 'expo-router';
import DataStore, { Session } from './storage/DataStore';

export default function SessionHistoryScreen() {
    const [sessions, setSessions] = useState<Session[]>([]);
    const router = useRouter();

    useEffect(() => {
        const fetchSessions = async () => {
            const storedSessions = await DataStore.getSessions();
            setSessions(storedSessions);
        };
        fetchSessions();
    }, []);

    const getTotal = (session: Session) =>
        session.items.reduce((total, item) => total + item.price * item.quantity, 0);

    const deleteSession = (sessionId: string) => {
        Alert.alert(
            'Delete Session',
            'Are you sure you want to delete this session?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        await DataStore.deleteSession(sessionId);
                        const updatedSessions = await DataStore.getSessions();
                        setSessions(updatedSessions);
                    },
                },
            ],
            { cancelable: true }
        );
    };

    return (
        <View style={{ flex: 1, padding: 20 }}>
            <FlatList
                data={sessions}
                keyExtractor={(session) => session.id}
                renderItem={({ item: session }) => (
                    <View style={{ paddingVertical: 10 }}>
                        <TouchableOpacity
                            onPress={() => {
                                router.push({
                                    pathname: '/CartScreen',
                                    params: { sessionId: session.id },
                                });
                            }}
                        >
                            <Text>Date: {new Date(session.date).toLocaleString()}</Text>
                            <Text>Location: {session.location || 'N/A'}</Text>
                            <Text>Amount: ${getTotal(session).toFixed(2)}</Text>
                        </TouchableOpacity>
                        <Button
                            title="Delete"
                            color="red"
                            onPress={() => deleteSession(session.id)}
                        />
                    </View>
                )}
            />
        </View>
    );
}
