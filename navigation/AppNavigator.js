import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import DeviceListScreen from '../screens/DeviceListScreen';
import TermsScreen from '../screens/TermsScreen';
import TermsDetailsScreen from '../screens/TermsDetailsScreen';
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Home" component={HomeScreen} />
                <Stack.Screen name="Devices" component={DeviceListScreen} />
                <Stack.Screen name="Terms" component={TermsScreen} />
                <Stack.Screen name="TermsDetails" component={TermsDetailsScreen} />
                <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}