import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Modal, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import { getLocationForIP } from '../../utils/Location';

const DEFAULT_IP = "177.162.88.167";
const WEBCAM_URL = "http://192.168.15.8:3000/webcam_check";

export default function BatteryAndRequests() {
    const [videoModalVisible, setVideoModalVisible] = useState(false);
    const [mapModalVisible, setMapModalVisible] = useState(false);

    const [videoBoxImgUri, setVideoBoxImgUri] = useState('');
    const [videoBoxLoading, setVideoBoxLoading] = useState(true);

    // Função para recarregar a imagem
    const reloadVideoBoxImage = () => {
        setVideoBoxLoading(true);
        const uri = WEBCAM_URL + `?t=${Date.now()}`;
        setVideoBoxImgUri(uri);
    };

    useEffect(() => {
        reloadVideoBoxImage();
    }, []);

    const handleOpenVideoModal = () => {
        reloadVideoBoxImage();
        setVideoModalVisible(true);
    };

    return (
        <View style={styles.container}>
            <Header />
            <View style={styles.batteryRow}>
                <View style={styles.batteryGauge}>
                    <Text style={styles.batteryText}>64%</Text>
                    <Text style={styles.batteryLabel}>Battery</Text>
                </View>
                <TouchableOpacity
                    style={styles.videoBox}
                    onPress={handleOpenVideoModal}
                    activeOpacity={0.8}
                >
                    <View style={styles.videoBoxContent}>
                        {videoBoxLoading && (
                            <View style={styles.videoLoadingOverlay}>
                                <ActivityIndicator size="large" color="#5d73f7" />
                            </View>
                        )}
                        {!!videoBoxImgUri && (
                            <Image
                                source={{ uri: videoBoxImgUri }}
                                style={styles.videoBoxImage}
                                resizeMode="cover"
                                onError={() => setVideoBoxLoading(false)}
                                onLoadEnd={() => setVideoBoxLoading(false)}
                            />
                        )}
                        {!videoBoxImgUri && !videoBoxLoading && (
                            <Ionicons name="videocam-outline" size={34} color="#444" />
                        )}
                        <TouchableOpacity
                            style={styles.videoExpand}
                            onPress={handleOpenVideoModal}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="expand-outline" size={18} color="#444" />
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </View>
            <VideoModal
                visible={videoModalVisible}
                onClose={() => setVideoModalVisible(false)}
            />
            <MapPlaceholderBox
                onExpand={() => setMapModalVisible(true)}
            />
            <MapModal
                visible={mapModalVisible}
                onClose={() => setMapModalVisible(false)}
            />
            <Text style={styles.requestsTitle}>Requests to device</Text>
            <View style={styles.requestsRow}>
                <View style={[styles.reqBox, { backgroundColor: '#ff6d6d' }]}>
                    <Ionicons name="sad-outline" size={18} color="#fff" />
                    <Text style={styles.reqCount}>1</Text>
                </View>
                <View style={[styles.reqBox, { backgroundColor: '#ffe24d' }]}>
                    <Ionicons name="alert-outline" size={18} color="#fff" />
                    <Text style={styles.reqCount}>4</Text>
                </View>
                <View style={[styles.reqBox, { backgroundColor: '#75e87c' }]}>
                    <Ionicons name="happy-outline" size={18} color="#fff" />
                    <Text style={styles.reqCount}>21</Text>
                </View>
            </View>
            <View style={styles.reqLabelsRow}>
                <Text style={styles.reqLabel}>Bad</Text>
                <Text style={styles.reqLabel}>Malformed</Text>
                <Text style={styles.reqLabel}>Successful</Text>
            </View>
            <Pagination current={4} />
        </View>
    );
}

function VideoModal({ visible, onClose }) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [imgUri, setImgUri] = useState('');

    useEffect(() => {
        if (!visible) {
            setLoading(true);
            setError('');
            setImgUri('');
            return;
        }
        setLoading(true);
        setError('');
        const uri = WEBCAM_URL + `?t=${Date.now()}`;
        setImgUri(uri);
    }, [visible]);

    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <TouchableOpacity style={styles.modalClose} onPress={onClose}>
                        <Ionicons name="close-outline" size={30} color="#444" />
                    </TouchableOpacity>
                    <Text style={styles.modalTitle}>Webcam Image</Text>
                    <View style={[styles.modalImageBox, styles.modalImageBoxBig]}>
                        {loading && (
                            <View style={styles.videoLoadingOverlay}>
                                <ActivityIndicator size="large" color="#5d73f7" />
                            </View>
                        )}
                        {!!imgUri && (
                            <Image
                                source={{ uri: imgUri }}
                                style={styles.modalImage}
                                resizeMode="contain"
                                onError={() => { setError('Failed to load image'); setLoading(false); }}
                                onLoadEnd={() => setLoading(false)}
                            />
                        )}
                        {error ? (
                            <Text style={{ color: 'red' }}>{error}</Text>
                        ) : null}
                    </View>
                </View>
            </View>
        </Modal>
    );
}

function MapPlaceholderBox({ onExpand }) {
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;
        setLoading(true);
        setError(null);
        getLocationForIP(DEFAULT_IP)
            .then(loc => {
                if (isMounted) {
                    setLocation(loc);
                    setLoading(false);
                }
            })
            .catch(e => {
                if (isMounted) {
                    setError(e.message);
                    setLoading(false);
                }
            });
        return () => { isMounted = false; };
    }, []);

    return (
        <View style={styles.mapBox}>
            {loading && (
                <ActivityIndicator style={{ alignSelf: 'center' }} />
            )}
            {error && (
                <Text style={{ color: 'red', alignSelf: 'center' }}>{error}</Text>
            )}
            {location && !loading && (
                <MapView
                    style={StyleSheet.absoluteFill}
                    initialRegion={{
                        latitude: location.latitude,
                        longitude: location.longitude,
                        latitudeDelta: 0.05,
                        longitudeDelta: 0.05,
                    }}
                >
                    <Marker
                        coordinate={{
                            latitude: location.latitude,
                            longitude: location.longitude,
                        }}
                        title={`IP: ${location.ip}`}
                        description={`City: ${location.city}\nCountry: ${location.country}`}
                    />
                </MapView>
            )}
            {!loading && !location && !error && (
                <Text style={{ color: '#888', alignSelf: 'center' }}>Map Placeholder</Text>
            )}
            <TouchableOpacity style={styles.mapExpand} onPress={onExpand}>
                <Ionicons name="expand-outline" size={20} color="#444" />
            </TouchableOpacity>
        </View>
    );
}

function MapModal({ visible, onClose }) {
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!visible) return;
        setLoading(true);
        setError(null);
        setLocation(null);
        getLocationForIP(DEFAULT_IP)
            .then(loc => {
                setLocation(loc);
                setLoading(false);
            })
            .catch(e => {
                setError(e.message);
                setLoading(false);
            });
    }, [visible]);

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.mapModalOverlay}>
                <View style={styles.mapModalContent}>
                    <TouchableOpacity style={styles.mapModalClose} onPress={onClose}>
                        <Ionicons name="close-outline" size={30} color="#444" />
                    </TouchableOpacity>
                    <Text style={styles.mapModalTitle}>Localização do IP</Text>
                    <View style={styles.mapModalBox}>
                        {loading && <ActivityIndicator />}
                        {error && <Text style={{ color: 'red', alignSelf: 'center' }}>{error}</Text>}
                        {location && !loading && (
                            <MapView
                                style={StyleSheet.absoluteFill}
                                initialRegion={{
                                    latitude: location.latitude,
                                    longitude: location.longitude,
                                    latitudeDelta: 0.03,
                                    longitudeDelta: 0.03,
                                }}
                            >
                                <Marker
                                    coordinate={{
                                        latitude: location.latitude,
                                        longitude: location.longitude,
                                    }}
                                    title={`IP: ${location.ip}`}
                                    description={`City: ${location.city}\nCountry: ${location.country}`}
                                />
                            </MapView>
                        )}
                        {!loading && !location && !error && (
                            <Text style={{ color: '#888', alignSelf: 'center' }}>Map Placeholder</Text>
                        )}
                    </View>
                </View>
            </View>
        </Modal>
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
    batteryRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
    batteryGauge: { backgroundColor: '#eaeaff', borderRadius: 20, padding: 24, alignItems: 'center', marginRight: 12 },
    batteryText: { fontWeight: '700', fontSize: 26, color: '#5d73f7' },
    batteryLabel: { fontSize: 13, color: '#444' },

    videoBox: {
        backgroundColor: '#eaeaea',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        height: 110, // Aumenta a altura do videoBox
        flex: 1,
        marginLeft: 0,
        flexDirection: 'row',
        position: 'relative',
        overflow: 'hidden',
    },
    videoBoxContent: {
        flex: 1,
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    videoBoxImage: {
        width: '100%',
        height: '100%',
        borderRadius: 12,
        position: 'absolute',
        top: 0,
        left: 0,
    },
    videoLoadingOverlay: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
        backgroundColor: 'rgba(255,255,255,0.7)',
    },
    videoExpand: {
        position: 'absolute',
        top: 8,
        right: 8,
        zIndex: 20,
        backgroundColor: 'rgba(255,255,255,0.8)',
        borderRadius: 8,
        padding: 2,
    },

    mapBox: { backgroundColor: '#fff', borderRadius: 14, height: 240, justifyContent: 'center', marginTop: 16, overflow: 'hidden' },
    mapExpand: { position: 'absolute', top: 8, right: 8, zIndex: 10 },
    requestsTitle: { fontWeight: 'bold', fontSize: 17, marginTop: 18 },
    requestsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
    reqBox: { flexDirection: 'row', alignItems: 'center', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 14 },
    reqCount: { fontWeight: 'bold', color: '#fff', fontSize: 18, marginLeft: 7 },
    reqLabelsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4, marginBottom: 18 },
    reqLabel: { color: '#888', fontSize: 15 },
    pagination: { flexDirection: 'row', alignSelf: 'center', marginTop: 18 },
    pageDot: { marginHorizontal: 5, paddingHorizontal: 8, borderRadius: 8, backgroundColor: '#eee' },
    activeDot: { backgroundColor: '#d1c9f7' },

    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 18,
        width: '85%',
        alignItems: 'center',
    },
    modalClose: {
        position: 'absolute',
        top: 8,
        right: 8,
        zIndex: 10,
    },
    modalTitle: {
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 14,
        marginTop: 8,
        color: '#222',
    },
    modalImageBox: {
        width: 260,
        height: 180,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#eee',
        borderRadius: 10,
        overflow: 'hidden',
        position: 'relative',
    },
    modalImageBoxBig: {
        height: 260, // Aumenta a altura do modal da webcam
    },
    modalImage: {
        width: '100%',
        height: '100%',
    },

    // Map modal styles
    mapModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    mapModalContent: {
        backgroundColor: '#fff',
        borderRadius: 16,
        paddingTop: 36,
        paddingBottom: 18,
        paddingHorizontal: 12,
        width: '95%',
        alignItems: 'center',
        maxHeight: '90%',
    },
    mapModalClose: {
        position: 'absolute',
        top: 8,
        right: 8,
        zIndex: 10,
    },
    mapModalTitle: {
        fontWeight: 'bold',
        fontSize: 17,
        marginBottom: 12,
        color: '#222',
        alignSelf: 'center',
    },
    mapModalBox: {
        width: '100%',
        height: 400,
        maxWidth: 600,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#eee',
        alignItems: 'center',
        justifyContent: 'center',
    },
});