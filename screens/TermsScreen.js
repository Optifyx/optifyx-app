import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import Checkbox from 'expo-checkbox';
import AsyncStorage from '@react-native-async-storage/async-storage';
const icon = require('../assets/icon.jpg');

const TERMS_KEY = 'termsAccepted';

export default function TermsScreen({ navigation }) {
    const [isChecked, setChecked] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkTermsAccepted = async () => {
            try {
                const accepted = await AsyncStorage.getItem(TERMS_KEY);
                if (accepted === 'true') {
                    navigation.replace('Home');
                } else {
                    setLoading(false);
                }
            } catch (error) {
                setLoading(false);
            }
        };
        checkTermsAccepted();
    }, [navigation]);

    const handleConfirm = async () => {
        try {
            await AsyncStorage.setItem(TERMS_KEY, 'true');
            navigation.replace('Home');
        } catch (error) {
            console.error('Error saving terms acceptance:', error);
        }
    };

    if (loading) return null;

    return (
        <View style={styles.container}>
            <View style={styles.logoWrapper}>
                <Image source={icon} style={styles.icon} />
            </View>

            <Text style={styles.termsText}>
                By using the app{'\n'}
                you agree that you{'\n'}
                have read the{' '}
                <Text style={styles.linkText} onPress={() => navigation.navigate('TermsDetails')}>
                    terms{'\n'}and conditions
                </Text>
                {' '}and{'\n'}
                <Text style={styles.linkText} onPress={() => navigation.navigate('PrivacyPolicy')}>
                    Privacy Policy.
                </Text>
            </Text>

            <View style={styles.checkboxContainer}>
                <Checkbox
                    value={isChecked}
                    onValueChange={setChecked}
                    color={isChecked ? '#6d4aff' : undefined}
                    style={styles.checkbox}
                />
                <Text style={styles.checkboxLabel}>
                    I have read and agree to the terms and{'\n'}conditions.
                </Text>
            </View>

            <Pressable
                style={[styles.confirmButton, { opacity: isChecked ? 1 : 0.5 }]}
                onPress={handleConfirm}
                disabled={!isChecked}
            >
                <Text style={styles.confirmButtonText}>Confirm</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        paddingHorizontal: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoWrapper: {
        alignItems: 'center',
        marginBottom: 36,
    },
    icon: {
        width: 180,
        height: 180,
        borderRadius: 90,
        marginBottom: 16,
        resizeMode: 'contain',
    },
    termsText: {
        color: '#fff',
        fontSize: 20,
        textAlign: 'center',
        marginBottom: 32,
    },
    linkText: {
        color: '#2e6ad7',
        textDecorationLine: 'underline',
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 40,
    },
    checkbox: {
        width: 22,
        height: 22,
        marginRight: 10,
    },
    checkboxLabel: {
        color: '#fff',
        fontSize: 16,
    },
    confirmButton: {
        backgroundColor: '#6d4aff',
        borderRadius: 20,
        paddingVertical: 12,
        paddingHorizontal: 60,
        alignItems: 'center',
        justifyContent: 'center',
    },
    confirmButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});