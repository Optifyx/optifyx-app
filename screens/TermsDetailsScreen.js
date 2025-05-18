import React from 'react';
import { View, Text, Button, StyleSheet, ScrollView } from 'react-native';

export default function TermsDetailsScreen({ navigation }) {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Termos de Uso</Text>
            
            <ScrollView style={styles.scrollContainer}>
                <Text style={styles.text}>
                    1. Overview{"\n"}
                    Optifyx is an open-source application that allows users to monitor and control their desktop remotely using a smartphone over a Wi-Fi connection. The software is provided free of charge and under an open-source license.{"\n\n"}
                    
                    2. Open Source Nature{"\n"}
                    Optifyx is distributed under the GPL-2.0 license. You are free to use, modify, and distribute the software according to the terms of the license.{"\n\n"}
                    
                    3. No Warranty{"\n"}
                    The software is provided “as is,” without warranty of any kind. The developers are not liable for any damages or data loss that may occur from using the application.{"\n\n"}
                    
                    4. User Responsibility{"\n"}
                    You are responsible for the security of your own devices and networks.{"\n"}
                    You must not use Optifyx to access or monitor any system without proper authorization.{"\n"}
                    You agree to comply with all applicable laws and regulations while using the app.{"\n\n"}
                    
                    5. Modifications{"\n"}
                    We reserve the right to update or modify these terms at any time. Changes will be posted on this page, and continued use of the app means you accept the updated terms.
                </Text>
            </ScrollView>
            
            <View style={styles.buttonContainer}>
                <Button title="Back" onPress={() => navigation.goBack()} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        padding: 20, 
        justifyContent: 'center' 
    },
    title: { 
        fontSize: 24, 
        fontWeight: 'bold', 
        marginBottom: 16 
    },
    scrollContainer: {
        flex: 1,
        marginBottom: 20
    },
    text: { 
        fontSize: 16, 
        lineHeight: 24
    },
    buttonContainer: { 
        marginVertical: 8 
    },
});

