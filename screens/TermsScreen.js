import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

export default function TermsScreen({ navigation }) {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Terms and Privacy Policy</Text>
            <Text style={styles.text}>
                By using this application, you agree to the terms described below.
            </Text>

            <View style={styles.buttonContainer}>
                <Button title="Read Terms of Use" onPress={() => navigation.navigate('TermsDetails')} />
            </View>

            <View style={styles.buttonContainer}>
                <Button title="Read Privacy Policy" onPress={() => navigation.navigate('PrivacyPolicy')} />
            </View>

            <View style={styles.buttonContainer}>
                <Button title="Confirm" onPress={() => navigation.navigate('Home')} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, justifyContent: 'center' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
    text: { fontSize: 16, marginBottom: 20 },
    buttonContainer: { marginVertical: 8 },
});
