// app/SessionHistoryScreen.tsx

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    Alert,
    StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import DataStore, { Session } from './storage/DataStore';
import { useNavigation } from 'expo-router';
import { useLayoutEffect } from 'react';
import { DataTable, IconButton } from 'react-native-paper';

export default function SessionHistoryScreen() {
    const [sessions, setSessions] = useState<Session[]>([]);
    const router = useRouter();
    const navigation = useNavigation();

    useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: 'History',
        });
    }, [navigation]);

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

    const renderHeader = () => (
        <View style={styles.headerRow}>
            <Text style={[styles.headerText, styles.dateColumn]}>Date</Text>
            <Text style={[styles.headerText, styles.locationColumn]}>Location</Text>
            <Text style={[styles.headerText, styles.amountColumn]}>Amount</Text>
            <Text style={[styles.headerText, styles.actionColumn]}>Action</Text>
        </View>
    );

    const renderItem = ({ item: session }: { item: Session }) => (
        <View style={styles.itemRow}>
            <TouchableOpacity
                style={styles.rowContent}
                onPress={() => {
                    router.push({
                        pathname: '/CartScreen',
                        params: { sessionId: session.id },
                    });
                }}
            >
                <Text style={[styles.itemText, styles.dateColumn]}>
                    {new Date(session.date).toLocaleDateString()}
                </Text>
                <Text style={[styles.itemText, styles.locationColumn]}>
                    {session.location || 'N/A'}
                </Text>
                <Text style={[styles.itemText, styles.amountColumn]}>
                    ${getTotal(session).toFixed(2)}
                </Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deleteSession(session.id)}
            >
                <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={{ flex: 1 }}>
            <DataTable>
                {sessions.map((session) => (
                    <DataTable.Row
                        key={session.id}
                        onPress={() =>
                            router.push({
                                pathname: '/CartScreen',
                                params: { sessionId: session.id },
                            })
                        }
                    >
                        <DataTable.Cell style={{ flex: 2 }}>
                            {new Date(session.date).toLocaleDateString()}
                        </DataTable.Cell>
                        <DataTable.Cell style={{ flex: 2 }}>
                            {session.location || 'N/A'}
                        </DataTable.Cell>
                        <DataTable.Cell numeric style={{ flex: 1 }}>
                            ${getTotal(session).toFixed(2)}
                        </DataTable.Cell>
                        <DataTable.Cell>
                            <IconButton
                                icon="delete"
                                size={20}
                                onPress={() => deleteSession(session.id)}
                            />
                        </DataTable.Cell>
                    </DataTable.Row>
                ))}
            </DataTable>
        </View>
    );
}

const styles = StyleSheet.create({
    headerRow: {
        flexDirection: 'row',
        paddingVertical: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    headerText: {
        fontWeight: 'bold',
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
    },
    rowContent: {
        flexDirection: 'row',
        flex: 1,
    },
    dateColumn: {
        flex: 2,
    },
    locationColumn: {
        flex: 2,
    },
    amountColumn: {
        flex: 1,
        textAlign: 'right',
    },
    actionColumn: {
        flex: 1,
        textAlign: 'center',
    },
    itemText: {
        fontSize: 16,
    },
    deleteButton: {
        flex: 1,
        alignItems: 'center',
    },
    deleteButtonText: {
        color: 'red',
    },
    separator: {
        height: 1,
        backgroundColor: '#ccc',
    },
});
