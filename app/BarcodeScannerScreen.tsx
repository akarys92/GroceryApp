// app/BarcodeScannerScreen.tsx

import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Button, Alert, ActivityIndicator } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { useRouter } from 'expo-router';
import BarcodeLookupService from './services/BarcodeLookupService';
import { useLocalSearchParams } from 'expo-router';
import { useNavigation } from 'expo-router';
import { useLayoutEffect } from 'react';

export default function BarcodeScannerScreen() {
    const { sessionId } = useLocalSearchParams<{ sessionId?: string }>();

    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [scanned, setScanned] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const navigation = useNavigation();

    useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: 'Scanner',
        });
    }, [navigation]);

    useEffect(() => {
        (async () => {
            const { status } = await BarCodeScanner.requestPermissionsAsync();
            setHasPermission(status === 'granted');
        })();
    }, []);

    const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
        setScanned(true);
        setIsLoading(true);

        const productInfo = await BarcodeLookupService.lookupBarcode(data);

        setIsLoading(false);

        if (productInfo) {
            // Navigate to ItemEntryScreen with product name pre-filled
            router.replace({
                pathname: '/ItemEntryScreen',
                params: { barcodeData: productInfo.name, sessionId },
            });
        } else {
            // Show an alert and navigate to ItemEntryScreen without product name
            Alert.alert(
                'Product Not Found',
                'The scanned barcode was not found in the database.',
                [
                    {
                        text: 'Enter Item Manually',
                        onPress: () =>
                            router.replace({
                                pathname: '/ItemEntryScreen',
                                params: { barcodeData: '', sessionId },
                            }),
                    },
                ]
            );
        }
    };

    if (hasPermission === null) {
        return (
            <View style={styles.centered}>
                <Text>Requesting Camera Permission</Text>
            </View>
        );
    }
    if (hasPermission === false) {
        return (
            <View style={styles.centered}>
                <Text>No access to camera</Text>
                <Button
                    title="Allow Camera"
                    onPress={() => BarCodeScanner.requestPermissionsAsync()}
                />
            </View>
        );
    }

    return (
        <View style={{ flex: 1 }}>
            <BarCodeScanner
                onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
                style={StyleSheet.absoluteFillObject}
            />
            {isLoading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#fff" />
                    <Text style={{ color: '#fff', marginTop: 10 }}>Looking up product...</Text>
                </View>
            )}
            {scanned && !isLoading && (
                <View style={styles.scannedOverlay}>
                    <Button title="Tap to Scan Again" onPress={() => setScanned(false)} />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scannedOverlay: {
        position: 'absolute',
        bottom: 50,
        alignSelf: 'center',
    },
    loadingOverlay: {
        position: 'absolute',
        top: '50%',
        alignSelf: 'center',
        alignItems: 'center',
    },
});
