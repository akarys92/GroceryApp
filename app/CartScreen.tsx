// app/CartScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Button, TouchableOpacity } from 'react-native';
import DataStore, { Item, type Session } from './storage/DataStore';
import { useRouter } from 'expo-router';
import { useNavigation } from 'expo-router';
import { useLocalSearchParams } from 'expo-router';
import { Alert, TextInput } from 'react-native';
import { useLayoutEffect } from 'react';
import { ScrollView, SafeAreaView } from 'react-native';
import { StyleSheet } from 'react-native';
import { uuid } from 'expo-modules-core';

export default function CartScreen() {
    const [items, setItems] = useState<Item[]>([]);
    const [session, setSession] = useState<Session | null>(null);
    const router = useRouter();
    const navigation = useNavigation();
    const { sessionId } = useLocalSearchParams<{ sessionId?: string }>();
    const [location, setLocation] = useState<string>("");

    useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: 'My Cart',
        });
    }, [navigation])

    useEffect(() => {
        const fetchItems = async () => {
            if (sessionId) {
                // Load the specified session
                const sessions = await DataStore.getSessions();
                const selectedSession = sessions.find((s) => s.id === sessionId);
                if (selectedSession) {
                    setSession(selectedSession);
                    setItems(selectedSession.items);
                    await DataStore.saveCurrentSession(selectedSession);
                }
            } else {
                // Create a new session
                let session: Session = {
                    id: uuid.v4().toString(),
                    date: new Date().toISOString(),
                    location: '',
                    items: [],
                };
            }
        };
        fetchItems();
    }, [])

    useEffect(() => {
        console.log("Adding item to session: ", sessionId)
        const saveCurrentSession = async () => {
            if (session && !sessionId) {
                const updatedSession = { ...session, items };
                setSession(updatedSession);
                await DataStore.saveCurrentSession(updatedSession);
            }
        };
        saveCurrentSession();
    }, [items]);

    useEffect(() => {
        const saveCurrentSession = async () => {
            if (session && !sessionId) {
                const updatedSession = { ...session, location };
                setSession(updatedSession);
                await DataStore.saveCurrentSession(updatedSession);
            }
        };
        saveCurrentSession();
    }, [location]);


    useEffect(() => {
        console.log('SessionId updated:', sessionId);
        const fetchItems = async () => {
            if (sessionId) {
                // Load the specified session
                const sessions = await DataStore.getSessions();
                const selectedSession = sessions.find((s) => s.id === sessionId);
                if (selectedSession) {
                    setSession(selectedSession);
                    setItems(selectedSession.items);
                    await DataStore.saveCurrentSession(selectedSession);
                }
            } else {
                // Load current session
                const currentSession = await DataStore.getCurrentSession();
                setSession(currentSession);
                setItems(currentSession?.items || []);
            }
        };
        fetchItems();
    }, [sessionId]);

    const saveLocationToCurrentSession = async (text: string) => {
        if (session && !sessionId) {
            session.location = text;
            await DataStore.saveCurrentSession(session);
        }
    };


    const getTotal = () => {
        return items.reduce((total, item) => total + item.price * item.quantity, 0);
    };

    const removeItem = async (id: string) => {
        if (session && !sessionId) {
            const updatedItems = items.filter((item) => item.id !== id);
            setItems(updatedItems);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.container}>
                {/* Header Section */}

                <View style={styles.header}>
                    <Button
                        title="Scan Item"
                        onPress={() => router.push('/BarcodeScannerScreen')}
                    />
                    <View style={{ height: 10 }} />
                    <Button
                        title="Add Item Manually"
                        onPress={() => router.push('/ItemEntryScreen')}
                    />
                </View>


                {/* Middle Section - Scrollable Item List */}
                <View style={styles.middle}>
                    <FlatList
                        data={items}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <View style={styles.itemRow}>
                                <Text>{item.name}</Text>
                                <Text>
                                    {item.quantity} x ${item.price.toFixed(2)}
                                </Text>
                                {!sessionId && (
                                    <TouchableOpacity onPress={() => removeItem(item.id)}>
                                        <Text style={{ color: 'red' }}>Remove</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}
                    />
                </View>

                {/* Footer Section */}
                <View style={styles.footer}>
                    <Text style={styles.totalText}>Total: ${getTotal().toFixed(2)}</Text>
                    <TextInput
                        placeholder="Enter Store Location"
                        value={location}
                        onChangeText={(text) => {
                            setLocation(text);
                            saveLocationToCurrentSession(text);
                        }}
                        editable={!sessionId}
                        style={[
                            styles.locationInput,
                            { color: sessionId ? 'gray' : 'black' },
                        ]}
                    />
                    <Text>Session: {session?.id}</Text>
                    <Text>SessionId: {sessionId}</Text>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 20,
        paddingBottom: 10,
    },
    middle: {
        flex: 1,
        paddingHorizontal: 20,
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10,
    },
    footer: {
        paddingHorizontal: 20,
        paddingBottom: 20,
        backgroundColor: '#f8f8f8',
    },
    totalText: {
        fontSize: 18,
        marginBottom: 10,
    },
    locationInput: {
        borderBottomWidth: 1,
        marginBottom: 10,
        fontSize: 16,
        paddingVertical: 5,
    },
});

/*
How this should work: 
1. On page load, check if a sessionId was given. If it was, load that sesion. If it wasn't create a new session. 
2. On add item open, send the sessionId to the component. In the component, just add to that session, then drop back to the cart passing the sessionID back. 
3. When the location changes, update the sesion directly
I think this removes the notion of a current session
*/