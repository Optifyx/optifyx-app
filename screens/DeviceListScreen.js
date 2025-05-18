import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal, Text, ActivityIndicator, Alert, ScrollView, Dimensions, TextInput, Animated, Easing } from 'react-native';
import { Link, Terminal, Power } from 'lucide-react-native';
import * as Network from 'expo-network';
import { LineChart, BarChart } from "react-native-chart-kit";
import { MaterialCommunityIcons } from '@expo/vector-icons';

const chartConfig = {
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    color: (opacity = 1) => `rgba(50, 70, 180, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(34, 34, 34, ${opacity})`,
    decimalPlaces: 1,
    style: { borderRadius: 16 },
    propsForDots: { r: "4", strokeWidth: "2", stroke: "#2e3a7a" }
};

function getSubnet(ip) {
    if (!ip) return null;
    return ip.split('.').slice(0, 3).join('.');
}

async function scanSubnet(onFound, onProgress) {
    let found = null;
    let testedIPs = [];
    let stop = false;
    try {
        const ip = await Network.getIpAddressAsync();
        const subnet = getSubnet(ip);
        if (!subnet) throw new Error('Could not identify subnet.');
        for (let i = 1; i <= 254 && !stop; i++) {
            const testIp = subnet + '.' + i;
            try {
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), 900);
                const response = await fetch('http://' + testIp + ':8080/check_online_connections', { method: 'GET', signal: controller.signal });
                clearTimeout(timeout);
                testedIPs.push(testIp);
                onProgress([...testedIPs]);
                if (response.ok && !found) {
                    found = testIp;
                    stop = true;
                    break;
                }
            } catch (e) {
                testedIPs.push(testIp);
                onProgress([...testedIPs]);
            }
            await new Promise(res => setTimeout(res, 40));
        }
        onFound(found, testedIPs);
    } catch (e) {
        onFound(null, testedIPs);
    }
}

const MAX_POINTS = 30;

function LoadingAnimation({ text }) {
    const spinValue = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        const spin = Animated.loop(
            Animated.timing(spinValue, {
                toValue: 1,
                duration: 1000,
                easing: Easing.linear,
                useNativeDriver: true
            })
        );
        spin.start();
        return () => spin.stop();
    }, []);
    const spin = spinValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg']
    });
    return (
        <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1, marginVertical: 48 }}>
            <Animated.View style={{ transform: [{ rotate: spin }] }}>
                <MaterialCommunityIcons name="loading" size={38} color="#2e3a7a" />
            </Animated.View>
            <Text style={{ color: "#2e3a7a", fontSize: 17, marginTop: 20 }}>{text || "Loading..."}</Text>
        </View>
    );
}

export default function DeviceListScreen() {
    const [modalVisible, setModalVisible] = useState(false);
    const [scanning, setScanning] = useState(false);
    const [testedIPs, setTestedIPs] = useState([]);
    const [ipHistoryVisible, setIpHistoryVisible] = useState(false);
    const [foundIP, setFoundIP] = useState(null);

    // Real-time state
    const [homeHistory, setHomeHistory] = useState([]);
    const [systemHistory, setSystemHistory] = useState([]);
    const [diskHistory, setDiskHistory] = useState([]);
    const [securityData, setSecurityData] = useState(null);

    // Authentication
    const [awaitingCode, setAwaitingCode] = useState(false);
    const [userCode, setUserCode] = useState("");
    const [startDeviceError, setStartDeviceError] = useState(null);

    const wsRef = useRef(null);
    const [isConnected, setIsConnected] = useState(false);

    const [loadingHome, setLoadingHome] = useState(true);
    const [loadingSystem, setLoadingSystem] = useState(true);
    const [loadingDisk, setLoadingDisk] = useState(true);
    const [loadingSecurity, setLoadingSecurity] = useState(true);

    const handleConnect = async () => {
        setModalVisible(true);
        setScanning(true);
        setTestedIPs([]);
        setAwaitingCode(false);
        setUserCode("");
        setStartDeviceError(null);
        scanSubnet(
            function (foundIp, tested) {
                setScanning(false);
                setTestedIPs(tested || []);
                if (foundIp) {
                    setFoundIP(foundIp);
                    Alert.alert('Device found', `IP: ${foundIp}`);
                } else {
                    setFoundIP(null);
                    Alert.alert('No device found', 'Could not find any device on the network.');
                }
            },
            function (currentTested) { setTestedIPs([...currentTested]); }
        );
    };

    const triggerStartDevice = async (ip) => {
        try {
            setStartDeviceError(null);
            const res = await fetch(`http://${ip}:8080/start_device`, {
                method: "POST"
            });
            if (!res.ok) throw new Error("Failed to request connection start.");
            setAwaitingCode(true);
        } catch (e) {
            setStartDeviceError(e.message || String(e));
        }
    };

    // Send code to /connection_code via POST
    const submitCode = async () => {
        if (!foundIP || !userCode) return;
        try {
            setStartDeviceError(null);
            const authRes = await fetch(`http://${foundIP}:8080/connection_code`, {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: userCode }),
            });
            const authJson = await authRes.json();
            if (authJson?.message !== "Connection authorized!") {
                throw new Error(authJson?.message || "Authentication failed.");
            }
            setAwaitingCode(false);
            setUserCode("");
            connectWebSocket(foundIP);
        } catch (e) {
            setStartDeviceError(e.message || String(e));
        }
    };

    // Button to disconnect WebSocket
    const handleDisconnect = () => {
        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }
        setIsConnected(false);
        setFoundIP(null);
        setHomeHistory([]); setSystemHistory([]); setDiskHistory([]); setSecurityData(null);
        setLoadingHome(true); setLoadingSystem(true); setLoadingDisk(true); setLoadingSecurity(true);
    };

    // WS connection and data handling
    const connectWebSocket = (ip) => {
        try { if (wsRef.current) wsRef.current.close(); } catch { }
        setLoadingHome(true);
        setLoadingSystem(true);
        setLoadingDisk(true);
        setLoadingSecurity(true);
        setHomeHistory([]); setSystemHistory([]); setDiskHistory([]); setSecurityData(null);

        const ws = new WebSocket(`ws://${ip}:8080/ws`);
        wsRef.current = ws;

        ws.onopen = () => {
            ws.send("/home_realtime");
            ws.send("/system_realtime");
            ws.send("/disk_realtime");
            ws.send("/security_realtime");
            setIsConnected(true);
        };

        ws.onmessage = (ev) => {
            try {
                const data = JSON.parse(ev.data);
                const now = Date.now();
                // Internet: Download/Upload
                if (data.download_speed && data.upload_speed) {
                    const download = parseFloat((data.download_speed || "0").split(" ")[0]);
                    const upload = parseFloat((data.upload_speed || "0").split(" ")[0]);
                    setHomeHistory(old => {
                        const newArr = [...old, { download, upload, timestamp: now }];
                        return newArr.length > MAX_POINTS ? newArr.slice(-MAX_POINTS) : newArr;
                    });
                    setLoadingHome(false);
                }
                // System: CPU/RAM/GPU
                if (data.cpu && data.ram) {
                    const cpu = parseFloat((data.cpu || "0").replace("%", ""));
                    const ram = parseFloat((data.ram || "0").replace("%", ""));
                    const gpu = data.gpu_load ? parseFloat(data.gpu_load.replace("%", "")) : 0;
                    setSystemHistory(old => {
                        const newArr = [...old, { cpu, ram, gpu, timestamp: now }];
                        return newArr.length > MAX_POINTS ? newArr.slice(-MAX_POINTS) : newArr;
                    });
                    setLoadingSystem(false);
                }
                // Disk: used/free
                if (data.disk_used && data.disk_free) {
                    const used = parseFloat(data.disk_used.split(" ")[0]);
                    const free = parseFloat(data.disk_free.split(" ")[0]);
                    setDiskHistory(old => {
                        const newArr = [...old, { used, free, timestamp: now }];
                        return newArr.length > MAX_POINTS ? newArr.slice(-MAX_POINTS) : newArr;
                    });
                    setLoadingDisk(false);
                }
                // Security
                if (data.battery && data.location) {
                    setSecurityData(data);
                    setLoadingSecurity(false);
                }
            } catch { }
        };

        ws.onerror = (ev) => {
            Alert.alert("WebSocket error", "WebSocket connection error: " + JSON.stringify(ev));
        };

        ws.onclose = () => {
            setIsConnected(false);
        };
    };

    // When we find IP, start GET /start_device to request code
    useEffect(() => {
        if (foundIP) triggerStartDevice(foundIP);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [foundIP]);

    // Request real-time data (high frequency: 1s)
    useEffect(() => {
        let interval;
        if (wsRef.current && wsRef.current.readyState === 1) {
            interval = setInterval(() => {
                wsRef.current?.send("/home_realtime");
                wsRef.current?.send("/system_realtime");
                wsRef.current?.send("/disk_realtime");
                wsRef.current?.send("/security_realtime");
            }, 1000);
        }
        return () => { if (interval) clearInterval(interval); };
    }, [isConnected, foundIP]);

    // Charts helpers
    const chartWidth = Math.max(480, Dimensions.get("window").width - 32);

    function renderHomeChart() {
        if (loadingHome) return <LoadingAnimation text="Loading Internet data..." />;
        if (!homeHistory.length) return null;
        return (
            <View style={styles.card}>
                <Text style={styles.title}>Internet (Mbps)</Text>
                <LineChart
                    data={{
                        labels: [],
                        datasets: [
                            { data: homeHistory.map(x => x.download), color: () => 'rgba(46, 58, 122, 1)', strokeWidth: 2, withDots: true },
                            { data: homeHistory.map(x => x.upload), color: () => 'rgba(50, 180, 70, 1)', strokeWidth: 2, withDots: true }
                        ],
                        legend: ["Download", "Upload"]
                    }}
                    width={chartWidth}
                    height={260}
                    yAxisSuffix=" "
                    chartConfig={chartConfig}
                    withDots={true}
                    withInnerLines={false}
                    bezier
                    style={styles.chart}
                />
            </View>
        );
    }

    function renderSystemChart() {
        if (loadingSystem) return <LoadingAnimation text="Loading system data..." />;
        if (!systemHistory.length) return null;
        return (
            <View style={styles.card}>
                <Text style={styles.title}>CPU / RAM / GPU (%)</Text>
                <LineChart
                    data={{
                        labels: [],
                        datasets: [
                            { data: systemHistory.map(x => x.cpu), color: () => 'rgba(46,58,122,1)', strokeWidth: 2, withDots: true },
                            { data: systemHistory.map(x => x.ram), color: () => 'rgba(255,99,71,1)', strokeWidth: 2, withDots: true },
                            { data: systemHistory.map(x => x.gpu), color: () => 'rgba(34,160,240,1)', strokeWidth: 2, withDots: true }
                        ],
                        legend: ["CPU", "RAM", "GPU"]
                    }}
                    width={chartWidth}
                    height={260}
                    yAxisSuffix="%"
                    chartConfig={chartConfig}
                    withDots={true}
                    withInnerLines={false}
                    bezier
                    style={styles.chart}
                />
            </View>
        );
    }

    function renderDiskChart() {
        if (loadingDisk) return <LoadingAnimation text="Loading disk data..." />;
        if (!diskHistory.length) return null;
        return (
            <View style={styles.card}>
                <Text style={styles.title}>Disk (GB)</Text>
                <BarChart
                    data={{
                        labels: ["Used", "Free"],
                        datasets: [
                            { data: [diskHistory[diskHistory.length-1]?.used || 0, diskHistory[diskHistory.length-1]?.free || 0] }
                        ]
                    }}
                    width={chartWidth}
                    height={180}
                    yAxisSuffix=" "
                    chartConfig={chartConfig}
                    style={styles.chart}
                    fromZero
                    showBarTops
                />
            </View>
        );
    }

    function renderSecurityCard() {
        if (loadingSecurity) return <LoadingAnimation text="Loading security data..." />;
        if (!securityData) return null;
        return (
            <View style={styles.card}>
                <Text style={styles.title}>Security & Location</Text>
                <Text style={styles.label}>Battery: {securityData.battery}</Text>
                <Text style={styles.label}>Location: {typeof securityData.location === "object"
                    ? JSON.stringify(securityData.location)
                    : securityData.location}</Text>
                <Text style={styles.label}>Requests OK: {securityData.requests_success}</Text>
                <Text style={styles.label}>Malformed requests: {securityData.requests_malformed}</Text>
                <Text style={styles.label}>Bad requests: {securityData.requests_bad}</Text>
            </View>
        );
    }

    function renderCodeModal() {
        return (
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
        );
    }

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.terminalButton}
                onPress={() => setIpHistoryVisible(true)}
            >
                <Terminal color="#222" size={28} />
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.qrButton}
                onPress={handleConnect}
                disabled={scanning}
            >
                <Link color="#222" size={28} />
            </TouchableOpacity>
            {isConnected && (
                <TouchableOpacity
                    style={styles.disconnectButton}
                    onPress={handleDisconnect}
                >
                    <Power color="#C00" size={28} />
                </TouchableOpacity>
            )}

            <ScrollView horizontal contentContainerStyle={{ paddingVertical: 24 }}>
                <View>
                    {!foundIP && (
                        <View style={[styles.card, { alignItems: "center" }]}>
                            <MaterialCommunityIcons name="lan-connect" size={36} color="#2e3a7a" />
                            <Text style={styles.label}>Click the connection button to search for devices...</Text>
                        </View>
                    )}
                    {renderHomeChart()}
                    {renderSystemChart()}
                    {renderDiskChart()}
                    {renderSecurityCard()}
                </View>
            </ScrollView>

            <Modal visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)} transparent>
                <View style={styles.modalContainer}>
                    {scanning ? (
                        <>
                            <ActivityIndicator size="large" color="#222" style={{ marginTop: 50 }} />
                            <Text style={styles.scannerText}>Searching for devices on the network...</Text>
                        </>
                    ) : (
                        <Text style={styles.scannerText}>Device search finished.</Text>
                    )}
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={() => setModalVisible(false)}
                        disabled={false}
                    >
                        <Text style={styles.closeButtonText}>Close</Text>
                    </TouchableOpacity>
                </View>
            </Modal>

            <Modal visible={ipHistoryVisible} animationType="slide" onRequestClose={() => setIpHistoryVisible(false)} transparent>
                <View style={styles.ipHistoryContainer}>
                    <Text style={styles.ipHistoryTitle}>Tested IPs</Text>
                    <ScrollView style={{ maxHeight: 400, width: '90%' }}>
                        {testedIPs.length > 0 ? (
                            testedIPs.map(function (ip, idx) {
                                return (
                                    <Text key={ip + idx} style={styles.ipText}>
                                        {ip}
                                    </Text>
                                );
                            })
                        ) : (
                            <Text style={styles.ipText}>No IP tested yet.</Text>
                        )}
                    </ScrollView>
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={() => setIpHistoryVisible(false)}
                    >
                        <Text style={styles.closeButtonText}>Close</Text>
                    </TouchableOpacity>
                </View>
            </Modal>

            {renderCodeModal()}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 8, backgroundColor: "#f8fafd" },
    card: {
        backgroundColor: "#fff",
        marginBottom: 18,
        borderRadius: 18,
        padding: 18,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 4,
        minHeight: 100
    },
    title: { fontWeight: "bold", fontSize: 18, marginBottom: 6, color: "#2e3a7a" },
    label: { fontSize: 15, color: "#222", marginVertical: 3 },
    chart: { marginVertical: 8, borderRadius: 16 },
    terminalButton: {
        position: 'absolute',
        top: 24,
        left: 24,
        zIndex: 11,
        backgroundColor: 'white',
        borderRadius: 24,
        padding: 8,
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
    },
    qrButton: {
        position: 'absolute',
        top: 24,
        right: 24,
        zIndex: 10,
        backgroundColor: 'white',
        borderRadius: 24,
        padding: 8,
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
    },
    disconnectButton: {
        position: 'absolute',
        top: 24,
        right: 72,
        zIndex: 12,
        backgroundColor: 'white',
        borderRadius: 24,
        padding: 8,
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.95)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButton: {
        backgroundColor: 'rgba(255,255,255,0.9)',
        paddingHorizontal: 32,
        paddingVertical: 12,
        borderRadius: 20,
        alignSelf: 'center',
        marginTop: 20,
        marginBottom: 20,
    },
    closeButtonText: {
        fontSize: 18,
        color: '#333',
        fontWeight: 'bold',
    },
    scannerText: {
        fontSize: 18,
        padding: 16,
        textAlign: 'center',
    },
    ipHistoryContainer: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.98)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    ipHistoryTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    ipText: {
        fontSize: 15,
        color: '#222',
        paddingVertical: 2,
        borderBottomColor: '#eee',
        borderBottomWidth: 1,
    },
    codeModalContainer: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.97)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    codeModalTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 16,
        color: "#2e3a7a"
    },
    codeInput: {
        borderWidth: 1.5,
        borderColor: "#2e3a7a",
        borderRadius: 12,
        padding: 14,
        fontSize: 20,
        width: 180,
        textAlign: "center",
        marginBottom: 14,
        backgroundColor: "#fff"
    },
    submitButton: {
        backgroundColor: "#2e3a7a",
        paddingVertical: 12,
        paddingHorizontal: 40,
        borderRadius: 20,
        marginBottom: 10,
        marginTop: 8
    },
    submitButtonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 18
    },
    codeError: {
        color: "#c00",
        fontSize: 15,
        marginBottom: 8,
        textAlign: "center"
    }
});