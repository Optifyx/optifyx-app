import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function DeviceCard({ device }) {
    return (
        <View style={styles.card}>
            <Text style={styles.title}>{device.name}</Text>
            <Text>IP: {device.ip}</Text>
            <Text>Ping: {device.ping} ms</Text>
            <Text>Download: {device.download}</Text>
            <Text>Upload: {device.upload}</Text>
            <Text>CPU: {device.cpu} | GPU: {device.gpu}</Text>
            <Text>RAM: {device.ram}</Text>
            <Text>Uptime: {device.uptime}</Text>
            <Text>Battery: {device.battery}</Text>
            <Text>Disk: {device.disk}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#eee',
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
    },
    title: { fontWeight: 'bold', fontSize: 16, marginBottom: 8 },
});
