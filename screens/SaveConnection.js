import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function SaveConnection({ route, navigation }) {
    // Receba ip, device_name do endpoint e já preencha name
    const { ip, device_name } = route.params || {};
    const [name, setName] = useState(device_name || "");
    const [connections, setConnections] = useState([]);
    const [refresh, setRefresh] = useState(false);

    useEffect(() => {
        // Carrega conexões salvas ao abrir
        (async () => {
            let json = await AsyncStorage.getItem('connections');
            let arr = json ? JSON.parse(json) : [];
            setConnections(arr);
        })();
    }, [refresh]);

    async function handleSave() {
        if (!ip || !name) {
            Alert.alert("Missing", "Please enter a name for your connection.");
            return;
        }
        let json = await AsyncStorage.getItem('connections');
        let connections = json ? JSON.parse(json) : [];
        // Não permite duplicidade (IP igual)
        const exists = connections.findIndex(c => c.ip === ip);
        if (exists !== -1) {
            Alert.alert("Connection exists", "This connection is already saved!");
            return;
        }
        connections.push({ name, ip });
        await AsyncStorage.setItem('connections', JSON.stringify(connections));
        setRefresh(r => !r);
        navigation.reset({ index: 0, routes: [{ name: 'Connections' }] });
    }

    async function handleDeleteConnection(delIp) {
        let newList = connections.filter(c => c.ip !== delIp);
        await AsyncStorage.setItem('connections', JSON.stringify(newList));
        setConnections(newList);
        setRefresh(r => !r);
    }

    // Lista de conexões já salvas (com botão de deletar)
    const renderConnections = () => (
        <FlatList
            data={connections}
            keyExtractor={item => item.ip}
            ListHeaderComponent={<Text style={styles.savedTitle}>Saved Connections:</Text>}
            renderItem={({ item }) => (
                <View style={styles.savedRow}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.savedName}>{item.name}</Text>
                        <Text style={styles.savedIp}>{item.ip}</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.deleteBtn}
                        onPress={() =>
                            Alert.alert(
                                "Delete Connection",
                                `Are you sure you want to delete "${item.name}"?`,
                                [
                                    { text: "Cancel", style: "cancel" },
                                    { text: "Delete", style: "destructive", onPress: () => handleDeleteConnection(item.ip) }
                                ]
                            )
                        }
                    >
                        <MaterialCommunityIcons name="delete" size={24} color="#c00" />
                    </TouchableOpacity>
                </View>
            )}
            style={{ marginTop: 30, marginBottom: 30 }}
            ListEmptyComponent={<Text style={styles.noSaved}>No saved connections.</Text>}
        />
    );

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                <MaterialCommunityIcons name="arrow-left" size={28} color="#222" />
            </TouchableOpacity>
            <Text style={styles.label}>Enter a name for your connection</Text>
            <TextInput
                style={styles.input}
                placeholder="e.g., Matheus' PC"
                value={name}
                onChangeText={setName}
                autoFocus
            />
            <Text style={styles.ipLabel}>IP: {ip}</Text>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveBtnText}>Save</Text>
            </TouchableOpacity>
            {renderConnections()}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fcfafd', paddingTop: 32, paddingHorizontal: 16 },
    backBtn: { position: 'absolute', left: 18, top: 24, zIndex: 10, backgroundColor: 'white', borderRadius: 24, padding: 8 },
    label: { fontSize: 19, fontWeight: 'bold', color: '#222', marginTop: 60, marginBottom: 20, textAlign: 'center' },
    input: { borderWidth: 1, borderColor: "#bbb", borderRadius: 12, padding: 14, fontSize: 18, backgroundColor: "#fff", marginBottom: 18, textAlign: 'center' },
    ipLabel: { color: "#888", fontSize: 16, marginBottom: 30, textAlign: 'center' },
    saveBtn: { backgroundColor: '#222', borderRadius: 18, paddingVertical: 14, paddingHorizontal: 32, alignSelf: 'center', marginTop: 24 },
    saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },

    savedTitle: { fontSize: 18, fontWeight: 'bold', color: "#2e3a7a", marginBottom: 12, marginTop: 18 },
    savedRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: "#f1f1fa", borderRadius: 10, padding: 10, marginBottom: 7 },
    savedName: { fontWeight: 'bold', fontSize: 15, color: "#171a2a" },
    savedIp: { fontSize: 12, color: "#888" },
    deleteBtn: { marginLeft: 12, padding: 4 },
    noSaved: { color: "#888", fontSize: 16, textAlign: "center", marginTop: 18 },
});