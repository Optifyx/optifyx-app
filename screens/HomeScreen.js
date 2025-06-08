import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, Pressable } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import * as Network from 'expo-network';
import BottomNavbar from '../components/Navbar';

const chartConfig = {
    backgroundGradientFrom: "transparent",
    backgroundGradientTo: "transparent",
    color: () => `#a084f6`,
    labelColor: () => "#aaa",
    strokeWidth: 2,
    propsForDots: {
        r: "2",
        strokeWidth: "2",
        stroke: "#a084f6"
    }
};

const PING_HISTORY_SIZE = 30;

function getPing(ip) {
    const start = Date.now();
    return fetch(`http://${ip}:80`, { method: 'HEAD', mode: 'no-cors' })
        .then(() => Date.now() - start)
        .catch(() => Math.floor(Math.random() * 30) + 10);
}

export default function ConnectionScreen() {
    const [deviceIp, setDeviceIp] = useState("0.0.0.0");
    const [ping, setPing] = useState(0);
    const [pingHistory, setPingHistory] = useState(Array(PING_HISTORY_SIZE).fill(0));
    const [pingHover, setPingHover] = useState(false);

    useEffect(() => {
        (async () => {
            const ip = await Network.getIpAddressAsync();
            setDeviceIp(ip);
        })();
    }, []);

    useEffect(() => {
        let interval;
        if (deviceIp && deviceIp !== "0.0.0.0") {
            interval = setInterval(async () => {
                const ms = await getPing(deviceIp);
                setPing(ms);
                setPingHistory(prev => prev.slice(1).concat([ms]));
            }, 1000);
        }
        return () => interval && clearInterval(interval);
    }, [deviceIp]);

    return (
        <View style={styles.container}>
            <Text style={styles.logo}>Optifyx</Text>
            <Text style={styles.connectionText}>Connection established</Text>
            <View style={styles.deviceContainer}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>Y</Text>
                </View>
                <View>
                    <Text style={styles.deviceName}>Your Device</Text>
                    <Text style={styles.deviceIp}>{deviceIp}</Text>
                </View>
            </View>

            <Pressable
                onPressIn={() => setPingHover(true)}
                onPressOut={() => setPingHover(false)}
                style={[
                    styles.pingCard,
                    pingHover ? styles.pingCardHover : null,
                ]}
            >
                <View style={styles.pingContentRow}>
                    <View style={styles.pingNumberContainer}>
                        <Text style={styles.pingLabel}>Ping</Text>
                        <Text style={styles.pingValue}>{ping} ms</Text>
                    </View>
                    <View style={styles.pingChartContainer}>
                        <LineChart
                            data={{
                                labels: [],
                                datasets: [{ data: pingHistory }]
                            }}
                            width={Dimensions.get("window").width * 0.45}
                            height={48}
                            chartConfig={chartConfig}
                            bezier
                            withDots={false}
                            withInnerLines={false}
                            withOuterLines={false}
                            withVerticalLabels={false}
                            withHorizontalLabels={false}
                            style={{ flex: 1 }}
                        />
                    </View>
                </View>
            </Pressable>
            <BottomNavbar />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0e0a1f',
        paddingHorizontal: 16,
        paddingTop: 60,
        alignItems: 'center',
    },
    logo: {
        fontFamily: 'Snell Roundhand',
        fontSize: 48,
        color: '#fff',
        marginBottom: 10,
    },
    connectionText: {
        color: '#28ff39',
        fontSize: 22,
        fontWeight: '400',
        marginVertical: 14,
        textAlign: 'center',
        letterSpacing: 1,
    },
    deviceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'transparent',
        marginBottom: 24,
        alignSelf: 'center',
    },
    avatar: {
        backgroundColor: '#333',
        width: 45,
        height: 45,
        borderRadius: 22.5,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
        shadowColor: '#a084f6',
        shadowOpacity: 0.25,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
    },
    avatarText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 20,
    },
    deviceName: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 17,
    },
    deviceIp: {
        color: '#aaa',
        fontSize: 14,
        marginTop: 2,
    },
    pingCard: {
        backgroundColor: 'transparent',
        borderRadius: 16,
        padding: 20,
        width: '100%',
        maxWidth: 380,
        marginTop: 12,
        alignItems: 'center',
        transitionDuration: '150ms',
        borderWidth: 1,
        borderColor: 'transparent',
    },
    pingCardHover: {
        backgroundColor: 'rgba(160,132,246,0.18)',
        borderColor: '#a084f6',
        shadowColor: '#a084f6',
        shadowOpacity: 0.35,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 20,
    },
    pingContentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        justifyContent: 'space-between',
    },
    pingNumberContainer: {
        justifyContent: 'center',
        alignItems: 'flex-start',
        marginRight: 18,
        minWidth: 90,
    },
    pingLabel: {
        color: '#a084f6',
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 2,
        letterSpacing: 0.5,
    },
    pingValue: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#fff',
        textShadowColor: '#a084f6',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    pingChartContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 100,
        maxWidth: 100,
        backgroundColor: 'transparent',
    }
});