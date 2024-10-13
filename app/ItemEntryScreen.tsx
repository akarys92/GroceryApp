// app/ItemEntryScreen.tsx

import React, { useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import DataStore, { Item } from './storage/DataStore';
import uuid from 'react-native-uuid';

export default function ItemEntryScreen() {
    const { barcodeData } = useLocalSearchParams<{ barcodeData?: string }>();
    const [name, setName] = useState<string>(barcodeData || '');
    const [price, setPrice] = useState<string>('');
    const [quantity, setQuantity] = useState<string>('1');
    const router = useRouter();

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

        let session = await DataStore.getCurrentSession();
        if (!session) {
            session = {
                id: uuid.v4().toString(),
                date: new Date().toISOString(),
                location: '',
                items: [],
            };
            console.log("Added new Session: ", session.id)
        }
        session.items.push(item);
        await DataStore.saveCurrentSession(session);
        router.push({ pathname: '/CartScreen', params: { sessionId: session.id } });
    };

    return (
        <View style={{ padding: 20 }}>
            <Text style={{ fontSize: 18, marginBottom: 10 }}>Enter Item Details</Text>
            <TextInput
                placeholder="Item Name"
                value={name}
                onChangeText={setName}
                style={{
                    borderBottomWidth: 1,
                    marginBottom: 10,
                    paddingVertical: 5,
                    fontSize: 16,
                }}
            />
            <TextInput
                placeholder="Price"
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
                style={{
                    borderBottomWidth: 1,
                    marginBottom: 10,
                    paddingVertical: 5,
                    fontSize: 16,
                }}
            />
            <TextInput
                placeholder="Quantity"
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="numeric"
                style={{
                    borderBottomWidth: 1,
                    marginBottom: 20,
                    paddingVertical: 5,
                    fontSize: 16,
                }}
            />
            <Button title="Add to Cart" onPress={addItemToCart} />
        </View>
    );
}
