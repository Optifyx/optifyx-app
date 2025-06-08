import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function ConnectionDetail({ route, navigation }) {
    const { connection } = route.params || {};
    const [search, setSearch] = useState("");

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                <MaterialCommunityIcons name="arrow-left" size={28} color="#222" />
            </TouchableOpacity>
            <View style={styles.searchRow}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search"
                    value={search}
                    onChangeText={setSearch}
                />
                <MaterialCommunityIcons name="magnify" size={28} color="#999" style={{ marginLeft: 8 }} />
                <TouchableOpacity>
                    <MaterialCommunityIcons name="help-circle-outline" size={26} color="#222" style={{ marginLeft: 8 }} />
                </TouchableOpacity>
            </View>
            <View style={styles.connectionCard}>
                <Text style={styles.connectionText}>Name: {connection?.name}</Text>
                <Text style={styles.connectionText}>IP: {connection?.ip}</Text>
                <Text style={styles.rightTimer}>00:00</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fcfafd', paddingTop: 32, paddingHorizontal: 16 },
    backBtn: { position: 'absolute', left: 18, top: 24, zIndex: 10, backgroundColor: 'white', borderRadius: 24, padding: 8 },
    searchRow: { flexDirection: 'row', alignItems: 'center', marginTop: 38, marginBottom: 32 },
    searchInput: { flex: 1, borderWidth: 1, borderColor: "#ddd", borderRadius: 14, padding: 13, fontSize: 16, backgroundColor: "#fff", marginRight: 8 },
    connectionCard: { backgroundColor: "#f5f4fa", borderRadius: 12, padding: 18, marginTop: 10, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    connectionText: { fontSize: 16, color: "#222" },
    rightTimer: { fontWeight: "bold", color: "#222", fontSize: 17 }
});