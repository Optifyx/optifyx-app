import React from 'react';
import { View, Text, Button, StyleSheet, ScrollView } from 'react-native';

export default function PrivacyPolicyScreen({ navigation }) {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Política de Privacidade</Text>
            
            <ScrollView style={styles.scrollContainer}>
                <Text style={styles.text}>
                    1. Data Collection{"\n"}
                    Optifyx does not collect or store any personal data on our servers. All operations happen locally between your mobile device and desktop over your own Wi-Fi network.{"\n\n"}
                    
                    We do not collect:{"\n"}
                    - Personally Identifiable Information (PII){"\n"}
                    - IP addresses{"\n"}
                    - Location data{"\n"}
                    - Usage statistics{"\n\n"}
                    
                    2. Permissions{"\n"}
                    To function properly, Optifyx may request the following permissions:{"\n"}
                    - Local network access: To discover and connect to your desktop.{"\n"}
                    - Camera (optional): Only if screen-sharing features require it, and only with your explicit permission.{"\n"}
                    These permissions are used solely for the app’s core functionality and are never used to transmit data externally.{"\n\n"}
                    
                    3. Analytics{"\n"}
                    Optifyx does not use any analytics or tracking services. We believe your usage data should remain yours.{"\n\n"}
                    
                    4. Third-Party Services{"\n"}
                    Optifyx does not rely on or integrate with third-party services that collect data. If you use third-party add-ons or forks, please review their respective privacy policies.{"\n\n"}
                    
                    5. Open Source Transparency{"\n"}
                    Being open-source means our code is publicly available for review. You can inspect exactly what the app does and ensure it respects your privacy.{"\n\n"}
                    
                    6. Changes to This Policy{"\n"}
                    We may update this Privacy Policy as the project evolves. Changes will be published in the official repository and documented clearly.
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
