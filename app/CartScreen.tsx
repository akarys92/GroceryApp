// app/CartScreen.tsx

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    Button,
    TouchableOpacity,
    TextInput,
    SafeAreaView,
    StyleSheet,
    Dimensions
} from 'react-native';
import DataStore, { Item, Session } from './storage/DataStore';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useNavigation } from 'expo-router';
import { useLayoutEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';

const screenWidth = Dimensions.get('window').width;

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
                    setSession(currentSession);
                    setItems(currentSession?.items || []);
                    setLocation(currentSession?.location || '');
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
                    await DataStore.updateSession(updatedSession);
                } else {
                    await DataStore.saveCurrentSession(updatedSession);
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
    useEffect(() => {
        return () => {
            if (session && !sessionId) {
                // Move current session to sessions list if it has items
                if (session.items.length > 0) {
                    DataStore.saveSession(session);
                }
                DataStore.clearCurrentSession();
            }
        };
    }, [session, sessionId]);

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


    const renderItem = ({ item }: { item: Item }) => (
        <View style={styles.itemRow}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemQuantity}>{item.quantity}</Text>
            <Text style={styles.itemTotal}>
                ${(item.price * item.quantity).toFixed(2)}
            </Text>

            <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => removeItem(item.id)}
            >
                <Text style={styles.deleteButtonText}>Remove</Text>
            </TouchableOpacity>

        </View>
    );

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.container}>
                {/* Header Section */}

                <View style={styles.header}>
                    <Button
                        title="Scan Item"
                        onPress={() =>
                            router.push({
                                pathname: '/BarcodeScannerScreen',
                                params: { sessionId },
                            })
                        }
                    />
                    <View style={{ height: 10 }} />
                    <Button
                        title="Add Item Manually"
                        onPress={() =>
                            router.push({
                                pathname: '/ItemEntryScreen',
                                params: { sessionId },
                            })
                        }
                    />
                </View>

                {/* Middle Section - Item List */}
                <View style={styles.middle}>

                    <FlatList
                        data={items}
                        keyExtractor={(item) => item.id}
                        renderItem={renderItem}
                        ItemSeparatorComponent={() => <View style={styles.separator} />}
                    />
                </View>

                {/* Footer Section */}
                <View style={styles.footer}>
                    <Text style={styles.totalText}>Total: ${getTotal().toFixed(2)}</Text>
                    <TextInput
                        placeholder="Enter Store Location"
                        value={location}
                        onChangeText={saveLocationToCurrentSession}
                        editable={true}
                        style={[
                            styles.locationInput,
                            { color: sessionId ? 'gray' : 'black' },
                        ]}
                    />
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
    headerRow: {
        flexDirection: 'row',
        paddingVertical: 5,
        backgroundColor: '#f0f0f0',
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    headerText: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
    },
    nameColumn: {
        width: screenWidth * 0.35,
    },
    quantityColumn: {
        width: screenWidth * 0.15,
        textAlign: 'center',
    },
    priceColumn: {
        width: screenWidth * 0.2,
        textAlign: 'right',
    },
    totalColumn: {
        width: screenWidth * 0.2,
        textAlign: 'right',
    },
    actionColumn: {
        width: screenWidth * 0.1,
        textAlign: 'center',
    },
    itemText: {
        fontSize: 16,
    },
    itemName: {
        flex: 3,
    },
    itemQuantity: {
        flex: 1,
        textAlign: 'center',
    },
    itemPrice: {
        flex: 1,
        textAlign: 'right',
    },
    itemTotal: {
        flex: 1,
        textAlign: 'right',
    },
    deleteButton: {
        flex: 1,
        alignItems: 'center',
    },
    deleteButtonText: {
        color: 'red',
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
    separator: {
        height: 1,
        backgroundColor: '#ccc',
    },
});
