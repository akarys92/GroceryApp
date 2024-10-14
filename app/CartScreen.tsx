// app/CartScreen.tsx

import React, { useState, useEffect } from 'react';
import {
    View,
    SafeAreaView,
    StyleSheet,
    Dimensions,
} from 'react-native';
import DataStore, { Item, Session } from './storage/DataStore';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { TextInput, Button, DataTable, IconButton } from 'react-native-paper';
import { useNavigation } from 'expo-router';
import { useLayoutEffect } from 'react';

export default function CartScreen() {
    const [items, setItems] = useState<Item[]>([]);
    const [session, setSession] = useState<Session | null>(null);
    const [location, setLocation] = useState<string>('');
    const router = useRouter();
    const navigation = useNavigation();
    const { sessionId } = useLocalSearchParams<{ sessionId?: string }>();

    useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: 'My Cart',
        });
    }, [navigation]);

    // Fetch data when the screen gains focus
    useFocusEffect(
        React.useCallback(() => {
            const fetchItems = async () => {
                if (sessionId) {
                    // Load the specified session
                    const sessions = await DataStore.getSessions();
                    const selectedSession = sessions.find((s) => s.id === sessionId);
                    if (selectedSession) {
                        setSession(selectedSession);
                        setItems(selectedSession.items);
                        setLocation(selectedSession.location || '');
                    }
                } else {
                    // Load current session
                    const currentSession = await DataStore.getCurrentSession();
                    if (currentSession) {
                        setSession(currentSession);
                        setItems(currentSession.items || []);
                        setLocation(currentSession.location || '');
                    } else {
                        // Handle case where no current session exists
                        alert('No current session found');
                        router.replace('/'); // Navigate back to home screen
                    }
                }
            };
            fetchItems();
        }, [sessionId])
    );

    useEffect(() => {
        const saveSession = async () => {
            if (session) {
                const updatedSession = { ...session, items };
                setSession(updatedSession);

                if (sessionId) {
                    // Update existing session
                    await DataStore.updateSession(updatedSession);
                } else {
                    // Save current session
                    await DataStore.saveCurrentSession(updatedSession);
                    // Also save to sessions list
                    await DataStore.updateSession(updatedSession);
                }
            }
        };
        saveSession();
    }, [items]);

    useEffect(() => {
        const saveSession = async () => {
            if (session) {
                const updatedSession = { ...session, location };
                setSession(updatedSession);

                if (sessionId) {
                    // Update existing session
                    await DataStore.updateSession(updatedSession);
                } else {
                    // Save current session
                    await DataStore.saveCurrentSession(updatedSession);
                    // Also save to sessions list
                    await DataStore.updateSession(updatedSession);
                }
            }
        };
        saveSession();
    }, [location]);

    const saveLocationToCurrentSession = (text: string) => {
        if (session && !sessionId) {
            setLocation(text);
            // The useEffect on [location] will handle saving
        }
    };

    // Save the current session when the component unmounts
    // useEffect(() => {
    //     return () => {
    //         if (session && !sessionId) {
    //             // Move current session to sessions list if it has items
    //             if (session.items.length > 0) {
    //                 DataStore.saveSession(session);
    //             }
    //             DataStore.clearCurrentSession();
    //         }
    //     };
    // }, [session, sessionId]);

    const getTotal = () => {
        return items.reduce((total, item) => total + item.price * item.quantity, 0);
    };

    const removeItem = (id: string) => {
        if (session) {
            const updatedItems = items.filter((item) => item.id !== id);
            setItems(updatedItems);
            // The useEffect on [items] will handle saving
        }
    };


    const renderItem = ({ item }: { item: Item }, index: any) => (
        <DataTable.Row id={index}>
            <DataTable.Cell style={{ flex: 3 }}>{item.name}</DataTable.Cell>
            <DataTable.Cell numeric>{item.quantity}</DataTable.Cell>
            <DataTable.Cell numeric>
                ${(item.price * item.quantity).toFixed(2)}
            </DataTable.Cell>
            <DataTable.Cell>
                <IconButton
                    icon="delete"
                    size={20}
                    onPress={() => removeItem(item.id)}
                />
            </DataTable.Cell>
        </DataTable.Row>
    );

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.container}>
                {/* Location Input at the Top */}
                <View style={styles.locationContainer}>
                    <TextInput
                        label="Store Location"
                        value={location}
                        onChangeText={setLocation}
                        editable={true}
                        style={styles.locationInput}
                    />
                </View>

                {/* Middle Section - Item List */}
                <View style={styles.middle}>
                    <DataTable>
                        {/* Table Header (optional) */}
                        {/*<DataTable.Header>
                  <DataTable.Title>Name</DataTable.Title>
                  <DataTable.Title numeric>Qty</DataTable.Title>
                  <DataTable.Title numeric>Total</DataTable.Title>
                  <DataTable.Title>Action</DataTable.Title>
                </DataTable.Header>*/}
                        {items.map((item, index) => renderItem({ item }, index))}
                    </DataTable>
                </View>

                {/* Footer Section */}
                <View style={styles.footer}>
                    <Button
                        mode="contained"
                        onPress={() =>
                            router.push({
                                pathname: '/BarcodeScannerScreen',
                                params: { sessionId },
                            })
                        }
                        style={styles.button}
                        contentStyle={styles.buttonContent}
                    >
                        Scan Item
                    </Button>
                    <Button
                        mode="contained"
                        onPress={() =>
                            router.push({
                                pathname: '/ItemEntryScreen',
                                params: { sessionId },
                            })
                        }
                        style={styles.button}
                        contentStyle={styles.buttonContent}
                    >
                        Add Item Manually
                    </Button>
                    <View style={styles.totalContainer}>
                        <Button mode="text" disabled>
                            Total: ${getTotal().toFixed(2)}
                        </Button>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    locationContainer: {
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    locationInput: {
        marginBottom: 10,
    },
    middle: {
        flex: 1,
        paddingHorizontal: 10,
    },
    footer: {
        paddingHorizontal: 20,
        paddingBottom: 20,
        backgroundColor: '#f8f8f8',
        alignItems: 'center',
    },
    button: {
        width: '100%',
        marginVertical: 5,
    },
    buttonContent: {
        height: 50,
    },
    totalContainer: {
        marginTop: 10,
    },
});
