import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import LineChartBox from '../LineChartBox';

export default function PerformanceStats() {
    return (
        <View style={styles.container}>
            <Header />
            <View style={styles.statRow}>
                <LineChartBox title="CPU" value="63%" color="#2d79ff" />
                <LineChartBox title="GPU" value="35%" color="#ff5e7d" />
            </View>
            <View style={styles.statRow}>
                <LineChartBox title="Memory/RAM" value="7,8GB" color="#ffe24d" />
            </View>
            <View style={styles.processBox}>
                <Text style={styles.statTitle}>Statistics</Text>
                <Text style={styles.sectionTitle}>Processes</Text>
                <Text style={styles.processCount}>263</Text>
                <View style={{ height: 70, justifyContent: 'center' }}>
                    <Text style={{ color: '#8fb5fc', alignSelf: 'center' }}>Chart Placeholder</Text>
                </View>
                <TimeSelector />
            </View>
            <Pagination current={2} />
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

function TimeSelector() {
    const times = ['12h', '13h', '14h', '15h', '16h'];
    return (
        <View style={styles.timeSelector}>
            {times.map((t, i) => (
                <View key={t} style={[styles.timeCircle, i === 2 && styles.timeActive]}>
                    <Text style={{ color: i === 2 ? '#fff' : '#222' }}>{t}</Text>
                </View>
            ))}
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
    statRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 8 },
    processBox: { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginTop: 12 },
    statTitle: { fontWeight: '400', color: '#bbb', fontSize: 14 },
    sectionTitle: { fontWeight: 'bold', fontSize: 17, marginTop: 3 },
    processCount: { fontWeight: 'bold', fontSize: 34, color: '#5d73f7', marginVertical: 2, alignSelf: 'center' },
    timeSelector: { flexDirection: 'row', justifyContent: 'center', marginTop: 10 },
    timeCircle: { marginHorizontal: 6, backgroundColor: '#eaeaff', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12 },
    timeActive: { backgroundColor: '#5d73f7' },
    pagination: { flexDirection: 'row', alignSelf: 'center', marginTop: 18 },
    pageDot: { marginHorizontal: 5, paddingHorizontal: 8, borderRadius: 8, backgroundColor: '#eee' },
    activeDot: { backgroundColor: '#d1c9f7' },
});