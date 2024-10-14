// app/LocationScreen.tsx

import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { TextInput, Button, Title } from 'react-native-paper';
import DataStore from './storage/DataStore';
import uuid from 'react-native-uuid';
import { useNavigation } from 'expo-router';
import { useLayoutEffect } from 'react';

export default function LocationScreen() {
  const [location, setLocation] = useState('');
  const router = useRouter();

  const navigation = useNavigation();

  useLayoutEffect(() => {
      navigation.setOptions({
          headerTitle: 'Location',
      });
  }, [navigation]);

  const startSession = async () => {
    if (!location.trim()) {
      alert('Please enter a location.');
      return;
    }

    // Create a new current session with the location
    const newSession = {
      id: uuid.v4().toString(),
      date: new Date().toISOString(),
      location: location.trim(),
      items: [],
    };
    await DataStore.saveCurrentSession(newSession);

    router.replace('/CartScreen');
  };

  return (
    <View style={styles.container}>
      <Title style={styles.title}>Enter Store Location</Title>
      <TextInput
        label="Location"
        value={location}
        onChangeText={setLocation}
        style={styles.input}
      />
      <Button
        mode="contained"
        onPress={startSession}
        style={styles.button}
        contentStyle={styles.buttonContent}
      >
        Start Shopping
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    marginBottom: 20,
  },
  button: {
    marginTop: 10,
  },
  buttonContent: {
    height: 50,
  },
});
