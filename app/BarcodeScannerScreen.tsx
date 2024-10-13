// app/BarcodeScannerScreen.tsx

import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Button, Alert } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { useRouter } from 'expo-router';
import BarcodeLookupService from './services/BarcodeLookupService'; // Import the service
import { useLayoutEffect } from 'react';
import { useNavigation } from 'expo-router';

export default function BarcodeScannerScreen() {
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [scanned, setScanned] = useState(false);
    const router = useRouter();
    const navigation = useNavigation();

    useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: 'Scanner',
        });
    }, [navigation])

    useEffect(() => {
        (async () => {
            const { status } = await BarCodeScanner.requestPermissionsAsync();
            setHasPermission(status === 'granted');
        })();
    }, []);

    const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
        setScanned(true);

        // Lookup the barcode
        const productInfo = await BarcodeLookupService.lookupBarcode(data);

        if (productInfo) {
            // Navigate to ItemEntryScreen with product name pre-filled
            router.push({
                pathname: '/ItemEntryScreen',
                params: { barcodeData: productInfo.name },
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
                            router.push({
                                pathname: '/ItemEntryScreen',
                                params: { barcodeData: '' },
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
                <Button title="Allow Camera" onPress={() => BarCodeScanner.requestPermissionsAsync()} />
            </View>
        );
    }

    return (
        <View style={{ flex: 1 }}>
            <BarCodeScanner
                onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
                style={StyleSheet.absoluteFillObject}
            />
            {scanned && (
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
});
