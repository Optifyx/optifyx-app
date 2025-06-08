import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import LineChartBox from '../LineChartBox';

export default function NetworkStats() {
    return (
        <View style={styles.container}>
            <Header />
            <View style={styles.card}>
                <Text style={styles.deviceTitle}>Matheus's PC</Text>
                <Text style={styles.subText}>192.0.0.2</Text>
            </View>
            <View style={styles.statRow}>
                <LineChartBox title="Ping" value="21" unit="" color="#2d79ff" />
            </View>
            <View style={styles.statRow}>
                <LineChartBox title="Download" value="635 MB/s" unit="" color="#2d79ff" />
                <LineChartBox title="Upload" value="435 MB/s" unit="" color="#ff5e7d" />
            </View>
            <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>Bluetooth</Text>
                <Text style={[styles.infoValue, { color: 'limegreen' }]}>Status: ON</Text>
            </View>
            <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>Uptime:</Text>
                <Text style={styles.infoValue}>4 Days, 21 Hours</Text>
            </View>
            <Pagination current={1} />
        </View>
    );
}

function Header() {
    return (
        <View style={styles.header}>
            <TouchableOpacity>
                <Ionicons name="arrow-back-outline" size={28} color="#222" />
            </TouchableOpacity>
            <TouchableOpacity>
                <Ionicons name="download-outline" size={26} color="#222" />
            </TouchableOpacity>
        </View>
    );
}

function Pagination({ current }) {
    return (
        <View style={styles.pagination}>
            {[1, 2, 3, 4].map((n) => (
                <View
                    key={n}
                    style={[
                        styles.pageDot,
                        current === n && styles.activeDot,
                    ]}
                >
                    <Text style={{ color: current === n ? '#111' : '#aaa' }}>{n}</Text>
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8f6fa', padding: 20 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    card: { marginTop: 12, marginBottom: 10 },
    deviceTitle: { fontWeight: '700', fontSize: 18, color: '#222' },
    subText: { color: '#aaa', fontSize: 13 },
    statRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 6 },
    infoBox: { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginVertical: 5 },
    infoLabel: { fontWeight: 'bold', fontSize: 15, color: '#444' },
    infoValue: { fontWeight: 'bold', fontSize: 17, marginTop: 2 },
    pagination: { flexDirection: 'row', alignSelf: 'center', marginTop: 18 },
    pageDot: { marginHorizontal: 5, paddingHorizontal: 8, borderRadius: 8, backgroundColor: '#eee' },
    activeDot: { backgroundColor: '#d1c9f7' },
});