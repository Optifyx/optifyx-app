import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Image, StyleSheet, Animated, Easing, TouchableOpacity, Linking } from 'react-native';

const logo = require('../assets/logo.png');
const icon = require('../assets/icon.jpg');

export default function SplashScreens({ navigation, onFinish }) {
    const [showSecondScreen, setShowSecondScreen] = useState(false);

    // Animation values for the "melting" distortion effect
    const scaleY = useRef(new Animated.Value(1)).current;
    const skewX = useRef(new Animated.Value(0)).current;
    const opacity = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        // First: run the "melting" animation for 1s
        Animated.parallel([
            Animated.timing(scaleY, {
                toValue: 1.2,
                duration: 1000,
                easing: Easing.elastic(1.5),
                useNativeDriver: true,
            }),
            Animated.timing(skewX, {
                toValue: 0.4, // in radians (about 23 deg)
                duration: 1200,
                easing: Easing.bounce,
                useNativeDriver: true,
            }),
            Animated.timing(opacity, {
                toValue: 0.9,
                duration: 1200,
                useNativeDriver: true,
            }),
        ]).start(() => {
            setShowSecondScreen(true);
            setTimeout(() => {
                if (navigation) {
                    navigation.replace('Terms');
                } else if (onFinish) {
                    onFinish();
                }
            }, 1500);
        });
    }, []);

    if (!showSecondScreen) {
        // First Splash: distorted logo
        return (
            <View style={styles.container}>
                <Animated.Image
                    source={logo}
                    style={[
                        styles.logo,
                        {
                            opacity,
                            transform: [
                                { scaleY },
                                { skewX: skewX.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: ['0deg', '23deg'],
                                    })
                                },
                            ],
                        },
                    ]}
                    resizeMode="contain"
                />
            </View>
        );
    } else {
        // Second Splash: info screen
        return (
            <View style={styles.container}>
                <Image
                    source={icon}
                    style={styles.icon}
                    resizeMode="contain"
                />
                <Text style={styles.subtitle}>
                    An application to{'\n'}analyze other{'\n'}devices on your{'\n'}network
                </Text>
                <Text style={styles.website}>
                    See more on us{'\n'}
                    <Text
                        style={styles.link}
                        onPress={() => Linking.openURL('https://your-website.com')}
                    >
                        Website
                    </Text>
                    {' '}now!
                </Text>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logo: {
        width: 400,
        height: 360,
        objectFit: 'cover',
        clipPath: 'inset(75px 75px 75px 75px)',
    },
    icon: {
        width: 180,
        height: 180,
        marginBottom: 10,
    },
    logoText: {
        color: '#fff',
        fontSize: 60,
        fontFamily: 'DancingScript-Regular',
        marginBottom: 10,
    },
    subtitle: {
        color: '#fff',
        fontSize: 18,
        textAlign: 'center',
        marginVertical: 12,
        fontFamily: 'DancingScript-Regular',
    },
    website: {
        color: '#fff',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 32,
    },
    link: {
        color: '#3796f6',
        textDecorationLine: 'underline',
    },
});