import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function DiskStorage() {
    return (
        <View style={styles.container}>
            <Header />
            <Text style={styles.sectionTitle}>Statistics</Text>
            <Text style={styles.diskTitle}>Disk Storage</Text>
            <View style={styles.gaugeContainer}>
                <Text style={styles.gaugeText}>14GB</Text>
            </View>
            <Text style={styles.subText}>You used 114GB</Text>
            <Text style={styles.diskOpsTitle}>Disk Operations</Text>
            <View style={styles.chartPlaceholder}>
                <Text style={{ color: '#8f5efc', alignSelf: 'center' }}>Write / Read Chart</Text>
            </View>
            <Pagination current={3} />
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
    sectionTitle: { color: '#bbb', fontSize: 14, marginTop: 14 },
    diskTitle: { fontWeight: 'bold', fontSize: 21, marginBottom: 15, marginTop: 4 },
    gaugeContainer: { marginVertical: 10, alignItems: 'center', justifyContent: 'center', height: 120 },
    gaugeText: { fontSize: 38, fontWeight: '700', color: '#5d73f7' },
    subText: { color: '#888', fontSize: 15, alignSelf: 'center', marginBottom: 4 },
    diskOpsTitle: { fontWeight: 'bold', fontSize: 16, marginTop: 12 },
    chartPlaceholder: { height: 70, backgroundColor: '#efeaff', borderRadius: 10, marginTop: 8, justifyContent: 'center', alignItems: 'center' },
    pagination: { flexDirection: 'row', alignSelf: 'center', marginTop: 18 },
    pageDot: { marginHorizontal: 5, paddingHorizontal: 8, borderRadius: 8, backgroundColor: '#eee' },
    activeDot: { backgroundColor: '#d1c9f7' },
});