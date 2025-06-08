import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ActivityIndicator, TextInput, Alert, FlatList, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Terminal } from 'lucide-react-native';
import { scanSubnet, isExpoWebLocalhost } from '../utils/SubnetScan';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function NewConnection({ navigation }) {
    const [scanning, setScanning] = useState(false);
    const [testedIPs, setTestedIPs] = useState([]);
    const [foundIP, setFoundIP] = useState(null);
    const [foundDeviceName, setFoundDeviceName] = useState("");
    const [awaitingCode, setAwaitingCode] = useState(false);
    const [userCode, setUserCode] = useState("");
    const [startDeviceError, setStartDeviceError] = useState(null);
    const [terminalVisible, setTerminalVisible] = useState(false);
    const [requestLogs, setRequestLogs] = useState([]);
    const [savedConnections, setSavedConnections] = useState([]);
    const [ipsWithError, setIpsWithError] = useState([]); // new: stores failed IPs

    // Load saved connections to avoid duplicates
    React.useEffect(() => {
        (async () => {
            let json = await AsyncStorage.getItem('connections');
            setSavedConnections(json ? JSON.parse(json) : []);
        })();
    }, []);

    // Check if connection already exists (same IP)
    const isConnectionAlreadySaved = (ip = foundIP) => {
        if (!ip) return false;
        const url = `http://${ip}:8080`;
        return !!savedConnections.find(c => c.ip === url);
    };

    // Check if the IP is in the list of IPs with error
    const isIpWithError = (ip) => {
        return ipsWithError.includes(ip);
    };

    const handleScan = async () => {
        setScanning(true);
        setTestedIPs([]);
        setFoundIP(null);
        setFoundDeviceName("");
        setStartDeviceError(null);
        setAwaitingCode(false);
        setIpsWithError([]);
        setRequestLogs([]);

        scanSubnet(
            async function (foundIp, tested) {
                // Filter out already saved IPs and IPs with error
                let validIp = foundIp;
                if (foundIp && (isConnectionAlreadySaved(foundIp) || isIpWithError(foundIp))) {
                    validIp = null;
                }

                setScanning(false);
                setTestedIPs(tested || []);
                if (validIp) {
                    try {
                        const url = `http://${validIp}:8080/status`;
                        const res = await fetch(url, { method: "GET" });
                        const json = await res.json();
                        if (json && json.status === "Online" && json.device_name) {
                            setFoundDeviceName(json.device_name);
                        } else {
                            setFoundDeviceName("(unknown)");
                        }
                    } catch {
                        setFoundDeviceName("(unknown)");
                    }
                    setFoundIP(validIp);
                } else {
                    Alert.alert('No device found', 'Could not find any device on the network that is not already saved or had errors.');
                }
            },
            async function (currentTested) {
                setTestedIPs([...currentTested]);
                const lastIp = currentTested[currentTested.length - 1];
                if (lastIp) {
                    if (isConnectionAlreadySaved(lastIp) || isIpWithError(lastIp)) {
                        // Do not attempt to connect or log for already saved IPs or those with error
                        return;
                    }
                    const url = `http://${lastIp}:8080/start_device`;
                    try {
                        const res = await fetch(url, { method: "GET" });
                        setRequestLogs(logs => [
                            ...logs,
                            { ip: lastIp, url, status: res.status === 200 ? '200 OK' : res.status }
                        ]);
                        if (!res.ok) {
                            setIpsWithError(errs => [...errs, lastIp]);
                        }
                    } catch (e) {
                        setRequestLogs(logs => [
                            ...logs,
                            { ip: lastIp, url, status: 'Error' }
                        ]);
                        setIpsWithError(errs => [...errs, lastIp]);
                    }
                }
            }
        );
    };

    const triggerStartDevice = async (ip) => {
        try {
            setStartDeviceError(null);
            const endpointIP = isExpoWebLocalhost() ? "127.0.0.1" : ip;
            const url = `http://${endpointIP}:8080/start_device`;
            const res = await fetch(url, { method: "POST" });
            setRequestLogs(logs => [
                ...logs,
                { ip: endpointIP, url, status: res.status === 200 ? '200 OK' : res.status }
            ]);
            if (!res.ok) throw new Error("Failed to request connection start.");
            setAwaitingCode(true);
        } catch (e) {
            setStartDeviceError(e.message || String(e));
            setAwaitingCode(true);
        }
    };

    const submitCode = async () => {
        const endpointIP = isExpoWebLocalhost() ? "127.0.0.1" : foundIP;
        if (!endpointIP || !userCode) return;
        try {
            setStartDeviceError(null);
            const url = `http://${endpointIP}:8080/connection_code`;
            const authRes = await fetch(url, {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: userCode }),
            });
            setRequestLogs(logs => [
                ...logs,
                { ip: endpointIP, url, status: authRes.status === 200 ? '200 OK' : authRes.status }
            ]);
            const authJson = await authRes.json();
            if (authJson?.message !== "Connection authorized!") {
                throw new Error(authJson?.message || "Authentication failed.");
            }
            setAwaitingCode(false);
            setUserCode("");
            navigation.navigate('SaveConnection', {
                ip: `http://${endpointIP}:8080`,
                device_name: foundDeviceName
            });
        } catch (e) {
            setStartDeviceError(e.message || String(e));
        }
    };

    // Display the connection card only if IP is not already saved and did not return error
    const renderConnectionCard = () => {
        if (!foundIP || isConnectionAlreadySaved(foundIP) || isIpWithError(foundIP)) {
            return null;
        }
        return (
            <TouchableOpacity
                style={styles.connectionCard}
                onPress={() => triggerStartDevice(foundIP)}
            >
                <Text style={styles.connectionText}>Name: {foundDeviceName || "(unknown)"}</Text>
                <Text style={styles.connectionText}>IP: {foundIP}</Text>
            </TouchableOpacity>
        );
    };

    // Terminal screen
    const renderTerminal = () => (
        <Modal visible={terminalVisible} animationType="slide" transparent onRequestClose={() => setTerminalVisible(false)}>
            <View style={styles.terminalModalBg}>
                <View style={styles.terminalModal}>
                    <Text style={styles.terminalTitle}>Terminal - IP Test Logs</Text>
                    <FlatList
                        data={requestLogs}
                        keyExtractor={(_, idx) => idx.toString()}
                        style={{ width: '100%' }}
                        contentContainerStyle={{ paddingBottom: 20 }}
                        renderItem={({ item }) => (
                            <View style={styles.terminalRow}>
                                <Text style={styles.terminalIp}>{item.ip}</Text>
                                <Text numberOfLines={1} ellipsizeMode="middle" style={styles.terminalUrl}>{item.url}</Text>
                                <Text style={[styles.terminalStatus, item.status === '200 OK' ? styles.statusOk : styles.statusError]}>
                                    {item.status}
                                </Text>
                            </View>
                        )}
                    />
                    <TouchableOpacity style={styles.terminalCloseBtn} onPress={() => setTerminalVisible(false)}>
                        <Text style={styles.terminalCloseText}>Close</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                <MaterialCommunityIcons name="arrow-left" size={28} color="#222" />
            </TouchableOpacity>
            <Text style={styles.title}>New Connection</Text>
            {!foundIP ? (
                <>
                    <TouchableOpacity style={styles.scanBtn} onPress={handleScan} disabled={scanning}>
                        {scanning ? <ActivityIndicator color="#fff" /> : <Text style={styles.scanBtnLabel}>Scan for Devices</Text>}
                    </TouchableOpacity>
                    <View style={{ marginTop: 32 }}>
                        <Text style={styles.label}>Tested IPs: {testedIPs.length}</Text>
                    </View>
                </>
            ) : (
                renderConnectionCard() || (
                    <View style={{ marginTop: 30, alignSelf: "center", width: "100%", backgroundColor: "#eee", borderRadius: 12, padding: 18, opacity: 0.7 }}>
                        <Text style={{ color: '#c00', fontWeight: 'bold', fontSize: 15, marginBottom: 4 }}>This IP is not available for connection.</Text>
                        <Text style={styles.connectionText}>IP: {foundIP}</Text>
                        {isConnectionAlreadySaved(foundIP) && <Text style={styles.connectionText}>Already saved</Text>}
                        {isIpWithError(foundIP) && <Text style={styles.connectionText}>Previous request failed</Text>}
                    </View>
                )
            )}

            <Modal visible={awaitingCode} animationType="slide" transparent onRequestClose={() => setAwaitingCode(false)}>
                <View style={styles.codeModalContainer}>
                    <Text style={styles.codeModalTitle}>Enter the code shown on the PC</Text>
                    <TextInput
                        style={styles.codeInput}
                        placeholder="Code"
                        keyboardType="default"
                        value={userCode}
                        onChangeText={text => setUserCode(text.toUpperCase())}
                        autoFocus
                        maxLength={8}
                        autoCapitalize="characters"
                        autoCorrect={false}
                    />
                    {startDeviceError && (
                        <Text style={styles.codeError}>{startDeviceError}</Text>
                    )}
                    <TouchableOpacity
                        style={styles.submitButton}
                        onPress={submitCode}
                        disabled={!userCode}
                    >
                        <Text style={styles.submitButtonText}>Connect</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={() => setAwaitingCode(false)}
                    >
                        <Text style={styles.closeButtonText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
            {renderTerminal()}
            <TouchableOpacity style={styles.terminalBtn} onPress={() => setTerminalVisible(true)}>
                <Terminal color="#2e3a7a" size={30} />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fcfafd', paddingTop: 32, paddingHorizontal: 16 },
    backBtn: { position: 'absolute', left: 18, top: 24, zIndex: 10, backgroundColor: 'white', borderRadius: 24, padding: 8 },
    title: { fontSize: 21, fontWeight: "bold", alignSelf: "center", marginTop: 16, marginBottom: 32, color: "#222" },
    scanBtn: { backgroundColor: '#222', borderRadius: 18, paddingVertical: 14, paddingHorizontal: 26, alignSelf: 'center', marginTop: 24 },
    scanBtnLabel: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
    label: { fontSize: 15, color: "#222", marginVertical: 3, textAlign: "center" },
    connectionCard: { backgroundColor: "#f5f4fa", borderRadius: 12, padding: 18, marginTop: 30, alignSelf: "center", width: "100%" },
    connectionText: { fontSize: 16, color: "#222" },
    codeModalContainer: { flex: 1, backgroundColor: 'rgba(255,255,255,0.97)', justifyContent: 'center', alignItems: 'center', padding: 24 },
    codeModalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 16, color: "#2e3a7a" },
    codeInput: { borderWidth: 1.5, borderColor: "#2e3a7a", borderRadius: 12, padding: 14, fontSize: 20, width: 180, textAlign: "center", marginBottom: 14, backgroundColor: "#fff" },
    submitButton: { backgroundColor: "#2e3a7a", paddingVertical: 12, paddingHorizontal: 40, borderRadius: 20, marginBottom: 10, marginTop: 8 },
    submitButtonText: { color: "#fff", fontWeight: "bold", fontSize: 18 },
    codeError: { color: "#c00", fontSize: 15, marginBottom: 8, textAlign: "center" },
    closeButton: { backgroundColor: 'rgba(255,255,255,0.9)', paddingHorizontal: 32, paddingVertical: 12, borderRadius: 20, alignSelf: 'center', marginTop: 8, marginBottom: 8 },
    closeButtonText: { fontSize: 18, color: '#333', fontWeight: 'bold' },
    terminalBtn: {
        position: 'absolute',
        bottom: 32,
        right: 24,
        backgroundColor: '#fff',
        borderRadius: 32,
        padding: 11,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 1, height: 2 },
        shadowOpacity: 0.16,
        shadowRadius: 5,
    },
    terminalModalBg: {
        flex: 1,
        backgroundColor: 'rgba(32,32,32,0.57)',
        justifyContent: 'flex-end',
    },
    terminalModal: {
        minHeight: Dimensions.get('window').height * 0.45,
        maxHeight: Dimensions.get('window').height * 0.85,
        backgroundColor: '#18192c',
        borderTopRightRadius: 22,
        borderTopLeftRadius: 22,
        padding: 18,
        alignItems: 'center',
    },
    terminalTitle: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 19,
        marginBottom: 18,
        alignSelf: 'flex-start',
    },
    terminalRow: {
        flexDirection: 'column',
        marginBottom: 13,
        paddingVertical: 7,
        borderBottomWidth: 0.4,
        borderColor: '#444',
        width: '100%',
    },
    terminalIp: { color: '#8cc0ff', fontWeight: 'bold', fontSize: 15 },
    terminalUrl: { color: '#fff', fontSize: 13, marginTop: 1, marginBottom: 2, width: '100%' },
    terminalStatus: { fontWeight: 'bold', fontSize: 13, marginTop: 2 },
    statusOk: { color: '#21d476' },
    statusError: { color: '#e84c4c' },
    terminalCloseBtn: {
        marginTop: 14,
        backgroundColor: '#23244a',
        borderRadius: 18,
        paddingVertical: 9,
        paddingHorizontal: 42,
        alignSelf: 'center',
    },
    terminalCloseText: { color: '#fff', fontWeight: 'bold', fontSize: 17 },
});