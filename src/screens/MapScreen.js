import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, Alert, Platform, Linking } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { 
  Card, 
  Title, 
  Paragraph, 
  Button, 
  Surface,
  FAB 
} from 'react-native-paper';

const { width, height } = Dimensions.get('window');

const MapScreen = ({ route, navigation }) => {
  const { aed } = route.params || {};
  const [showInfo, setShowInfo] = useState(true);

  // Validate AED data and coordinates
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

  const initialRegion = {
    latitude: latitude,
    longitude: longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

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

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation={true}
        showsMyLocationButton={true}
        showsCompass={true}
        showsScale={true}
        mapType="standard"
      >
        <Marker
          coordinate={{
            latitude: latitude,
            longitude: longitude,
          }}
          title={aed.Title}
          description={`${aed.BuildingName} - Floor ${aed.Floor}`}
          pinColor="#1976D2"
        />
      </MapView>

      {/* Info Card */}
      {showInfo && (
        <Surface style={styles.infoCard}>
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.infoHeader}>
                <View style={styles.infoText}>
                  <Title style={styles.aedTitle}>{aed.Title}</Title>
                  <Paragraph style={styles.buildingName}>
                    {aed.BuildingName} ({aed.BuildingCode})
                  </Paragraph>
                  <Paragraph style={styles.location}>
                    Floor {aed.Floor} • {aed.SpecificLocationDescription}
                  </Paragraph>
                </View>
                <Button
                  mode="text"
                  onPress={() => setShowInfo(false)}
                  compact
                >
                  ✕
                </Button>
              </View>
              
              <View style={styles.buttonRow}>
                <Button
                  mode="contained"
                  onPress={handleDirections}
                  style={styles.directionsButton}
                >
                  🧭 Get Directions
                </Button>
                
                <Button
                  mode="outlined"
                  onPress={() => navigation.navigate('AEDDetail', { aedTitle: aed.Title })}
                  style={styles.detailsButton}
                >
                  ℹ️ Details
                </Button>
              </View>
            </Card.Content>
          </Card>
        </Surface>
      )}

      {/* Show Info FAB (when info card is hidden) */}
      {!showInfo && (
        <FAB
          style={styles.infoFab}
          icon={() => <Title style={{ color: 'white', fontSize: 16 }}>ℹ️</Title>}
          onPress={() => setShowInfo(true)}
          small
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f5f5f5',
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
  map: {
    width: width,
    height: height,
  },
  infoCard: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    elevation: 8,
    borderRadius: 12,
  },
  card: {
    borderRadius: 12,
  },
  infoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  infoText: {
    flex: 1,
    marginRight: 8,
  },
  aedTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 4,
  },
  buildingName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  location: {
    fontSize: 14,
    color: '#666',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  directionsButton: {
    flex: 1,
    marginRight: 8,
    backgroundColor: '#1976D2',
  },
  detailsButton: {
    flex: 1,
    marginLeft: 8,
    borderColor: '#1976D2',
  },
  infoFab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#1976D2',
  },
});

export default MapScreen; 