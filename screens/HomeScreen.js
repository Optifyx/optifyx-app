import React, { useState, useEffect, TouchableOpacity, Animated, Easing } from 'react-native';
import { View, Text, Button, StyleSheet } from 'react-native';
import Sound from 'react-native-sound';
import Particles from 'react-native-particles';

export default function HomeScreen({ navigation }) {
    const [tapCount, setTapCount] = useState(0);
    const [majikMode, setMajikMode] = useState(false);
    const [animation] = useState(new Animated.Value(0));

    const handleTap = () => {
        setTapCount(prevCount => prevCount + 1);
        if (tapCount + 1 === 5) {
            setMajikMode(true);
            setTapCount(0);
            Sound.setCategory('Playback');
            const sound = new Sound('magic_sound.mp3', Sound.MAIN_BUNDLE, (error) => {
                if (error) {
                    console.log('Failed to load the sound', error);
                    return;
                }
                sound.play();
            });
            Animated.timing(animation, {
                toValue: 1,
                duration: 1000,
                easing: Easing.linear,
                useNativeDriver: true,
            }).start();
        }
    };

    useEffect(() => {
        if (majikMode) {
            const timer = setTimeout(() => {
                Animated.timing(animation, {
                    toValue: 0,
                    duration: 1000,
                    easing: Easing.linear,
                    useNativeDriver: true,
                }).start(() => setMajikMode(false));
            }, 15000);
            return () => clearTimeout(timer);
        }
    }, [majikMode]);

    return (
        <TouchableOpacity style={styles.container} onPress={handleTap}>
            <Text style={styles.title}>Optifyx</Text>

            <View style={styles.buttonContainer}>
                <Button title="View Devices" onPress={() => navigation.navigate('Devices')} />
            </View>

            <View style={styles.buttonContainer}>
                <Button title="Terms and Conditions" onPress={() => navigation.navigate('Terms')} />
            </View>

            {majikMode && (
                <>
                    <Particles
                        style={styles.particles}
                        particleCount={100}
                        particleColor="#FFD700"
                        particleSize={5}
                        particleSpeed={2}
                    />
                    <Animated.View style={[styles.creature, { opacity: animation }]}>
                        <Text style={styles.creatureText}>🧚</Text>
                    </Animated.View>
                    <Text style={styles.majikText}>✨ You have unlocked MAJIK MODE! ✨</Text>
                </>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
    title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20 },
    buttonContainer: { marginVertical: 10, width: '80%' },
    particles: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
    creature: { position: 'absolute', top: '50%', left: '50%', transform: [{ translateX: -50 }, { translateY: -50 }] },
    creatureText: { fontSize: 50 },
    majikText: { position: 'absolute', bottom: 50, fontSize: 20, color: '#FFD700' },
});
