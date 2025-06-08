import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ConfigScreen({ navigation }) {
    const [status, setStatus] = useState(null);
    const [statusColor, setStatusColor] = useState('limegreen');
    const [version, setVersion] = useState('...');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch status
        fetch('https://optifyx.theushen.me/status?status')
            .then(res => res.json())
            .then(data => {
                setStatus(data.status);
                // Color logic: green if allOperational, orange if partial, red if major outage
                if (data.allOperational) setStatusColor('limegreen');
                else if (data.status.toLowerCase().includes('issues')) setStatusColor('orange');
                else setStatusColor('red');
            })
            .catch(() => {
                setStatus('Some Problems');
                setStatusColor('yellow');
            });

        fetch('https://api.github.com/repos/Optifyx/optifyx-app/tags')
            .then(res => res.json())
            .then(tags => {
                if (Array.isArray(tags) && tags.length > 0) setVersion(tags[0].name);
                else setVersion('Unknown');
            })
            .catch(() => setVersion('Unknown'))
            .finally(() => setLoading(false));
    }, []);

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation && navigation.goBack && navigation.goBack()}
                activeOpacity={0.7}
            >
                <Ionicons name="arrow-back" size={22} color="#222" />
            </TouchableOpacity>
            <View style={styles.infoContainer}>
                <Text style={styles.infoText}>
                    Version: {loading ? <ActivityIndicator size="small" color="#7d6bb8" /> : version}
                </Text>
                <Text style={styles.infoText}>Author: TheusHen</Text>
                <Text style={styles.infoText}>
                    Status:{' '}
                    <Text style={{ color: statusColor, fontFamily: 'monospace' }}>
                        {status ? status : <ActivityIndicator size="small" color="#7d6bb8" />}
                    </Text>
                </Text>
            </View>
            <TouchableOpacity
                style={styles.feedbackButton}
                activeOpacity={0.8}
                onPress={() => Linking.openURL('http://optifyx.theushen.me/contact')}
            >
                <Text style={styles.feedbackText}>Feedback</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#faf7fb',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    backButton: {
        position: 'absolute',
        top: 32,
        left: 16,
        padding: 8,
    },
    infoContainer: {
        marginTop: 90,
        alignSelf: 'flex-start',
        marginLeft: 32,
    },
    infoText: {
        fontSize: 20,
        color: '#222',
        fontFamily: 'monospace',
        marginBottom: 8,
    },
    feedbackButton: {
        position: 'absolute',
        bottom: 56,
        alignSelf: 'center',
        backgroundColor: '#7d6bb8',
        borderRadius: 18,
        paddingHorizontal: 32,
        paddingVertical: 10,
        elevation: 1,
    },
    feedbackText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'monospace',
    },
});