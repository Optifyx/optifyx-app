
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Import your screens
import SplashScreens from '../screens/SlashScreens';
import TermsScreen from '../screens/TermsScreen';
import TermsDetailsScreen from '../screens/TermsDetailsScreen';
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';
import HomeScreen from "../screens/HomeScreen";
import NewConnection from "../screens/NewConnection";
import ConnectionDetail from "../screens/ConnectionDetail";
import SaveConnection from "../screens/SaveConnection";
import Connections from "../screens/Connections";
import ConfigScreen from "../screens/ConfigScreen";

// Import the four dashboard screens
import NetworkStats from '../components/analysis/NetworkStats';
import PerformanceStats from '../components/analysis/PerformanceStats';
import DiskStorage from '../components/analysis/DiskStorage';
import BatteryAndRequests from '../components/analysis/BatteryAndRequests';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Tabs for the dashboard pages
function DashboardTabs() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ color, size }) => {
                    let iconName = 'ellipse';
                    if (route.name === 'Network') iconName = 'speedometer-outline';
                    if (route.name === 'Performance') iconName = 'stats-chart-outline';
                    if (route.name === 'Disk') iconName = 'disc-outline';
                    if (route.name === 'Battery') iconName = 'battery-half-outline';
                    return <Ionicons name={iconName} size={size} color={color} />;
                },
            })}
        >
            <Tab.Screen name="Network" component={NetworkStats} />
            <Tab.Screen name="Performance" component={PerformanceStats} />
            <Tab.Screen name="Disk" component={DiskStorage} />
            <Tab.Screen name="Battery" component={BatteryAndRequests} />
        </Tab.Navigator>
    );
}

export default function AppNavigator() {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="SplashScreen" screenOptions={{ headerShown: false }}>
                <Stack.Screen name="SplashScreen" component={SplashScreens} />
                <Stack.Screen name="Terms" component={TermsScreen} />
                <Stack.Screen name="Connections" component={Connections} />
                <Stack.Screen name="TermsDetails" component={TermsDetailsScreen} />
                <Stack.Screen name="Home" component={HomeScreen} />
                <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
                <Stack.Screen name="NewConnection" component={NewConnection} />
                <Stack.Screen name="ConnectionDetail" component={ConnectionDetail} />
                <Stack.Screen name="SaveConnection" component={SaveConnection} />
                <Stack.Screen name="Config" component={ConfigScreen} />
                {/* Adicione a tela de dashboard usando as abas */}
                <Stack.Screen name="Dashboard" component={DashboardTabs} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}