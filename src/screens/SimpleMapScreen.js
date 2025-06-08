import React from 'react';
import { View, StyleSheet, Linking, Platform } from 'react-native';
import { 
  Card, 
  Title, 
  Paragraph, 
  Button, 
  Surface,
  Divider 
} from 'react-native-paper';

const SimpleMapScreen = ({ route, navigation }) => {
  const { aed } = route.params || {};

  // Validate AED data
  if (!aed) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <Title style={styles.errorTitle}>Map Error</Title>
        <Paragraph style={styles.errorText}>AED location data not found</Paragraph>
        <Button
          mode="contained"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          Go Back
        </Button>
      </View>
    );
  }

  const latitude = parseFloat(aed.Latitude);
  const longitude = parseFloat(aed.Longitude);

  // Validate coordinates
  if (isNaN(latitude) || isNaN(longitude)) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <Title style={styles.errorTitle}>Invalid Coordinates</Title>
        <Paragraph style={styles.errorText}>
          Cannot display map for {aed.Title}. Invalid location coordinates.
        </Paragraph>
        <Button
          mode="contained"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          Go Back
        </Button>
      </View>
    );
  }

  const handleDirections = () => {
    // Open native maps app for directions
    const scheme = Platform.select({ 
      ios: 'maps:0,0?q=', 
      android: 'geo:0,0?q=' 
    });
    const latLng = `${latitude},${longitude}`;
    const label = `${aed.Title} - ${aed.BuildingName}`;
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`
    });

    Linking.openURL(url).catch(err => {
      console.error('Error opening maps:', err);
      // Fallback to Google Maps web
      const googleUrl = `https://www.google.com/maps/dir/?api=1&destination=${latLng}`;
      Linking.openURL(googleUrl);
    });
  };

  const handleOpenInMaps = () => {
    const googleUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
    Linking.openURL(googleUrl);
  };

  return (
    <View style={styles.container}>
      {/* Location Info Card */}
      <Surface style={styles.mainCard}>
        <Card>
          <Card.Content>
            <Title style={styles.aedTitle}>📍 {aed.Title}</Title>
            <Paragraph style={styles.buildingName}>
              {aed.BuildingName} ({aed.BuildingCode})
            </Paragraph>
            <Paragraph style={styles.location}>
              Floor {aed.Floor} • {aed.SpecificLocationDescription}
            </Paragraph>
            
            <Divider style={styles.divider} />
            
            <View style={styles.coordinatesContainer}>
              <Title style={styles.sectionTitle}>Location Coordinates</Title>
              <Paragraph style={styles.coordinates}>
                Latitude: {latitude.toFixed(6)}
              </Paragraph>
              <Paragraph style={styles.coordinates}>
                Longitude: {longitude.toFixed(6)}
              </Paragraph>
            </View>
            
            <Divider style={styles.divider} />
            
            <View style={styles.accessibilityInfo}>
              <Title style={styles.sectionTitle}>Accessibility</Title>
              <Paragraph style={styles.accessText}>
                {aed.PubliclyAccessible ? '✅ Publicly Accessible' : '🔒 Restricted Access'}
              </Paragraph>
            </View>
          </Card.Content>
        </Card>
      </Surface>

      {/* Action Buttons */}
      <Surface style={styles.buttonsCard}>
        <Card>
          <Card.Content>
            <Button
              mode="contained"
              onPress={handleDirections}
              style={styles.primaryButton}
            >
              🧭 Get Directions
            </Button>
            
            <Button
              mode="outlined"
              onPress={handleOpenInMaps}
              style={styles.secondaryButton}
            >
              🗺️ Open in Google Maps
            </Button>
            
            <Button
              mode="outlined"
              onPress={() => navigation.navigate('AEDDetail', { aedTitle: aed.Title })}
              style={styles.secondaryButton}
            >
              ℹ️ View AED Details
            </Button>
            
            <Button
              mode="text"
              onPress={() => navigation.goBack()}
              style={styles.backButtonText}
            >
              ← Back to Details
            </Button>
          </Card.Content>
        </Card>
      </Surface>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F44336',
    marginBottom: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#1976D2',
  },
  mainCard: {
    marginBottom: 16,
    elevation: 4,
    borderRadius: 12,
  },
  buttonsCard: {
    elevation: 4,
    borderRadius: 12,
  },
  aedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 8,
  },
  buildingName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  location: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  divider: {
    marginVertical: 16,
  },
  coordinatesContainer: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 8,
  },
  coordinates: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#333',
    marginBottom: 4,
  },
  accessibilityInfo: {
    marginBottom: 8,
  },
  accessText: {
    fontSize: 14,
    color: '#333',
  },
  primaryButton: {
    backgroundColor: '#1976D2',
    marginBottom: 12,
    elevation: 3,
  },
  secondaryButton: {
    borderColor: '#1976D2',
    marginBottom: 8,
  },
  backButtonText: {
    marginTop: 8,
  },
});

export default SimpleMapScreen; 