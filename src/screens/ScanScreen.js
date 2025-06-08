import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { 
  Card, 
  Title, 
  Paragraph, 
  Button, 
  Surface,
  ActivityIndicator 
} from 'react-native-paper';
import { SharePointAPI } from '../api/SharePointAPI';

const ScanScreen = ({ navigation }) => {
  const [scanning, setScanning] = useState(false);

  const simulateScan = async (aedTitle) => {
    try {
      setScanning(true);
      
      // Simulate scanning delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const aed = await SharePointAPI.getAedByTitle(aedTitle);
      
      if (aed) {
        Alert.alert(
          'AED Found!',
          `Successfully scanned ${aed.Title} at ${aed.BuildingName}`,
          [
            {
              text: 'View Details',
              onPress: () => navigation.navigate('AEDDetail', { aedTitle: aed.Title })
            },
            {
              text: 'Scan Another',
              style: 'cancel'
            }
          ]
        );
      } else {
        Alert.alert(
          'AED Not Found',
          `No AED found with ID: ${aedTitle}`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error during scan simulation:', error);
      Alert.alert('Error', 'Failed to process scan');
    } finally {
      setScanning(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Camera Preview Placeholder */}
      <Surface style={styles.cameraPreview}>
        <View style={styles.cameraOverlay}>
          <View style={styles.scanFrame}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
            
            {scanning && (
              <View style={styles.scanningIndicator}>
                <ActivityIndicator size="large" color="#1976D2" />
                <Paragraph style={styles.scanningText}>Scanning...</Paragraph>
              </View>
            )}
          </View>
          
          <Paragraph style={styles.instructionText}>
            Point camera at AED QR code to scan
          </Paragraph>
        </View>
      </Surface>

      {/* Instructions Card */}
      <Card style={styles.instructionsCard}>
        <Card.Content>
          <Title style={styles.instructionsTitle}>How to Scan</Title>
          <Paragraph style={styles.instructionItem}>
            • Point your camera at the QR code on the AED
          </Paragraph>
          <Paragraph style={styles.instructionItem}>
            • Hold steady until the code is recognized
          </Paragraph>
          <Paragraph style={styles.instructionItem}>
            • You'll automatically navigate to the AED details
          </Paragraph>
        </Card.Content>
      </Card>

      {/* Simulation Section */}
      <Card style={styles.simulationCard}>
        <Card.Content>
          <Title style={styles.simulationTitle}>🔧 Testing & Simulation</Title>
          <Paragraph style={styles.simulationDescription}>
            For demonstration purposes, you can simulate scanning specific AEDs:
          </Paragraph>
          
          <Button
            mode="contained"
            onPress={() => simulateScan('CU-AED-001')}
            style={[styles.simulationButton, { backgroundColor: '#4CAF50' }]}
            contentStyle={styles.buttonContent}
            disabled={scanning}
          >
            Simulate Scan: CU-AED-001 (Operational)
          </Button>
          
          <Button
            mode="contained"
            onPress={() => simulateScan('CU-AED-002')}
            style={[styles.simulationButton, { backgroundColor: '#F44336' }]}
            contentStyle={styles.buttonContent}
            disabled={scanning}
          >
            Simulate Scan: CU-AED-002 (Needs Service)
          </Button>
          
          <Button
            mode="outlined"
            onPress={() => simulateScan('CU-AED-999')}
            style={styles.simulationButton}
            contentStyle={styles.buttonContent}
            disabled={scanning}
          >
            Simulate Scan: Invalid AED ID
          </Button>
        </Card.Content>
      </Card>

      {/* Manual Entry Option */}
      <Card style={styles.manualCard}>
        <Card.Content>
          <Title style={styles.manualTitle}>Manual Entry</Title>
          <Paragraph style={styles.manualDescription}>
            Can't scan the QR code? You can also search for AEDs manually.
          </Paragraph>
          
          <Button
            mode="outlined"
            onPress={() => navigation.navigate('AllAEDs')}
            style={styles.manualButton}
            contentStyle={styles.buttonContent}
            icon="magnify"
          >
            Search All AEDs
          </Button>
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  cameraPreview: {
    height: 250,
    margin: 16,
    borderRadius: 12,
    backgroundColor: '#000',
    elevation: 4,
  },
  cameraOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  scanFrame: {
    width: 200,
    height: 200,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#1976D2',
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  scanningIndicator: {
    alignItems: 'center',
  },
  scanningText: {
    color: '#1976D2',
    marginTop: 8,
    fontWeight: 'bold',
  },
  instructionText: {
    color: 'white',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
  instructionsCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 2,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 8,
  },
  instructionItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  simulationCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 2,
    backgroundColor: '#FFF3E0',
  },
  simulationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F57C00',
    marginBottom: 8,
  },
  simulationDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  simulationButton: {
    marginBottom: 8,
    elevation: 2,
  },
  manualCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 2,
  },
  manualTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 8,
  },
  manualDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  manualButton: {
    borderColor: '#1976D2',
  },
  buttonContent: {
    paddingVertical: 8,
  },
});

export default ScanScreen; 