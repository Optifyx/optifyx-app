import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function BottomNavbar({ current }) {
    const navigation = useNavigation();

    // Função que faz o redirecionamento usando React Navigation
    const handleTabPress = (route) => {
        if (current !== route) {
            navigation.navigate(route);
        }
    };

    return (
        <View style={styles.container}>
            <NavItem
                label="Home"
                icon={
                    <MaterialCommunityIcons
                        name="web"
                        size={32}
                        color={current === 'Home' ? "#181818" : "#666"}
                    />
                }
                active={current === 'Home'}
                onPress={() => handleTabPress('Home')}
            />
            <NavItem
                label="Connection"
                icon={
                    <Feather
                        name="share-2"
                        size={32}
                        color={current === 'Connection' ? "#181818" : "#666"}
                    />
                }
                active={current === 'Connection'}
                onPress={() => handleTabPress('Connections')}
            />
            <NavItem
                label="Config."
                icon={
                    <Feather
                        name="settings"
                        size={32}
                        color={current === 'Config' ? "#181818" : "#666"}
                    />
                }
                active={current === 'Config'}
                onPress={() => handleTabPress('Config')}
            />
        </View>
    );
}

function NavItem({ label, icon, active, onPress }) {
    return (
        <TouchableOpacity style={styles.item} onPress={onPress} activeOpacity={0.8}>
            <View style={[styles.iconWrapper, active && styles.iconWrapperActive]}>
                {icon}
            </View>
            <Text style={[styles.label, active && styles.labelActive]}>
                {label}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: '#F8F2FA',
        borderTopLeftRadius: 60,
        borderTopRightRadius: 60,
        paddingBottom: 20,
        paddingTop: 10,
        justifyContent: 'space-around',
        alignItems: 'center',
        elevation: 10,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowOffset: { width: 0, height: -4 },
        shadowRadius: 8,
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        zIndex: 99,
    },
    item: {
        flex: 1,
        alignItems: 'center',
    },
    iconWrapper: {
        backgroundColor: 'transparent',
        borderRadius: 26,
        padding: 10,
        marginBottom: 4,
    },
    iconWrapperActive: {
        backgroundColor: '#EFE8FB',
    },
    label: {
        fontSize: 22,
        color: '#444',
        fontWeight: '400',
        letterSpacing: 0.2,
    },
    labelActive: {
        fontWeight: '700',
        color: '#181818',
    },
});