import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function LineChartBox({ title, value, unit, color = "#2d79ff" }) {
    return (
        <View style={[styles.box, { borderColor: color }]}>
            <Text style={styles.title}>{title}</Text>
            <Text style={[styles.value, { color }]}>{value}{unit}</Text>
            <View style={styles.chartPlaceholder}>
                <Text style={{ color: color, fontSize: 11 }}>Chart</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    box: {
        flex: 1,
        backgroundColor: "#fff",
        borderRadius: 14,
        margin: 6,
        padding: 12,
        borderLeftWidth: 4,
        minWidth: 110,
        justifyContent: 'center'
    },
    title: { fontWeight: '600', color: '#777', fontSize: 13 },
    value: { fontSize: 18, fontWeight: 'bold', marginVertical: 1 },
    chartPlaceholder: { height: 26, backgroundColor: '#eaeaff', borderRadius: 6, marginTop: 8, justifyContent: 'center', alignItems: 'center' }
});