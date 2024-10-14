// app/ItemEntryScreen.tsx

import React, { useState, useRef } from 'react';
import { View, StyleSheet, TextInput as RNTextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import DataStore, { Item, type Session } from './storage/DataStore';
import uuid from 'react-native-uuid';
import { TextInput, Button } from 'react-native-paper';
import { useNavigation } from 'expo-router';
import { useLayoutEffect } from 'react';

export default function ItemEntryScreen() {
    const { barcodeData, sessionId } = useLocalSearchParams<{
        barcodeData?: string;
        sessionId?: string;
    }>();
    const navigation = useNavigation();

    useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: 'Add Item',
        });
    }, [navigation]);

    const [name, setName] = useState<string>(barcodeData || '');
    const [price, setPrice] = useState<string>('');
    const [quantity, setQuantity] = useState<string>('1');
    const router = useRouter();

    const priceRef = useRef<RNTextInput>(null);
    const quantityRef = useRef<RNTextInput>(null);

    const formatPrice = (value: string) => {
        // Remove non-digit characters
        const cleaned = value.replace(/\D/g, '');
        // Parse to number
        const number = parseInt(cleaned || '0', 10);
        // Divide by 100 to get decimal
        const formatted = (number / 100).toFixed(2);
        setPrice(formatted);
    };

    const addItemToCart = async () => {
        // Validate inputs
        if (!name.trim() || isNaN(parseFloat(price)) || isNaN(parseInt(quantity))) {
            alert('Please enter valid item details.');
            return;
        }

        const item: Item = {
            id: uuid.v4().toString(),
            name: name.trim(),
            price: parseFloat(price),
            quantity: parseInt(quantity),
        };

        let session: Session | null = null;

        if (sessionId) {
            // Load the specified session
            const sessions = await DataStore.getSessions();
            session = sessions.find((s) => s.id === sessionId) || null;
            if (!session) {
                alert('Session not found');
                return;
            }
        } else {
            // Load current session
            session = await DataStore.getCurrentSession();
            if (!session) {
                alert('No current session found');
                return;
            }
        }

        session.items.push(item);

        if (sessionId) {
            // Update the existing session
            await DataStore.updateSession(session);
        } else {
            // Save current session
            await DataStore.saveCurrentSession(session);
        }

        router.back();
    };

    return (
        <View style={styles.container}>
            <TextInput
                label="Item Name"
                value={name}
                onChangeText={setName}
                style={styles.input}
                returnKeyType="next"
                onSubmitEditing={() => priceRef.current?.focus()}
                autoFocus={!barcodeData}
            />
            <TextInput
                label="Price"
                value={price}
                onChangeText={formatPrice}
                keyboardType="numeric"
                style={styles.input}
                ref={priceRef}
                returnKeyType="next"
                onSubmitEditing={() => quantityRef.current?.focus()}
                autoFocus={!!barcodeData}
            />
            <TextInput
                label="Quantity"
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="numeric"
                style={styles.input}
                ref={quantityRef}
            />
            <Button
                mode="contained"
                onPress={addItemToCart}
                style={styles.button}
                contentStyle={styles.buttonContent}
            >
                Add to Cart
            </Button>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
    input: {
        marginBottom: 15,
    },
    button: {
        marginTop: 10,
    },
    buttonContent: {
        height: 50,
    },
});
