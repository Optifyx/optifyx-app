import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import BottomNavbar from '../components/Navbar';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Connections({ navigation }) {
    const [connections, setConnections] = useState([]);

    useEffect(() => {
        (async () => {
            const json = await AsyncStorage.getItem('connections');
            setConnections(json ? JSON.parse(json) : []);
        })();
        const unsubscribe = navigation.addListener('focus', async () => {
            const json = await AsyncStorage.getItem('connections');
            setConnections(json ? JSON.parse(json) : []);
        });
        return unsubscribe;
    }, [navigation]);

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.newBtn} onPress={() => navigation.navigate('NewConnection')}>
                <Text style={styles.newBtnText}>New</Text>
            </TouchableOpacity>
            {connections.length === 0 ? (
                <View style={styles.centered}>
                    <MaterialCommunityIcons name="alert-circle-outline" size={30} color="#c00" />
                    <Text style={styles.noSaved}>No Saved Connections!</Text>
                    <Text style={styles.noSavedSub}>You can save one on the button above.</Text>
                </View>
            ) : (
                <View>
                    <Text style={styles.title}>Stable connections:</Text>
                    {connections.map((con, idx) => (
                        <TouchableOpacity
                            key={con.ip}
                            style={styles.connectionCard}
                            // Redireciona direto para a rota Network, passando a conexão
                            onPress={() => navigation.navigate('Dashboard', {
                                screen: 'Network',
                                params: { connection: con }
                            })}
                        >
                            <Text style={styles.connectionText}>Name: {con.name}</Text>
                            <Text style={styles.connectionText}>IP: {con.ip}</Text>
                        </TouchableOpacity>
                    ))}
                    <Text style={styles.footnote}>
                        <MaterialCommunityIcons name="alert" size={16} color="#222" />
                        {' '}Make sure that the device you want to connect to has{' '}
                        <Text style={styles.link} onPress={() => {
                            // Pode abrir um link externo aqui se necessário
                        }}>Optifyx-Server</Text> installed.
                    </Text>
                </View>
            )}
            <BottomNavbar />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fcfafd', paddingTop: 32, paddingHorizontal: 16 },
    newBtn: {
        position: 'absolute',
        top: 24,
        right: 24,
        zIndex: 10,
        backgroundColor: '#222',
        borderRadius: 20,
        paddingHorizontal: 18,
        paddingVertical: 7,
    },
    newBtnText: { color: '#fff', fontWeight: "bold", fontSize: 17 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 120 },
    noSaved: { color: '#c00', fontWeight: 'bold', fontSize: 20, marginTop: 10 },
    noSavedSub: { color: '#222', fontSize: 15, marginTop: 2 },
    title: { fontWeight: 'bold', fontSize: 20, marginBottom: 14, marginTop: 16, color: "#222" },
    connectionCard: {
        backgroundColor: "#f5f4fa",
        borderRadius: 12,
        padding: 18,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    connectionText: { fontSize: 16, color: "#222" },
    footnote: { fontSize: 14, color: "#222", marginTop: 48, marginBottom: 12 },
    link: { color: "#1d65c1", textDecorationLine: "underline" },
});