import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

export default function HomeScreen({ navigation }) {

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Optifyx</Text>

            <View style={styles.buttonContainer}>
                <Button title="View Devices" onPress={() => navigation.navigate('Devices')} />
            </View>

            <View style={styles.buttonContainer}>
                <Button title="Terms and Conditions" onPress={() => navigation.navigate('Terms')} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
    title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20 },
    buttonContainer: { marginVertical: 10, width: '80%' },
});
