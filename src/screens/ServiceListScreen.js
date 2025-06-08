import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, Alert, Linking } from 'react-native';
import { 
  Card, 
  Title, 
  Paragraph, 
  Button, 
  Chip, 
  ActivityIndicator,
  Surface,
  Divider 
} from 'react-native-paper';
import { SharePointAPI } from '../api/SharePointAPI';
import { useFocusEffect } from '@react-navigation/native';

const ServiceAEDItem = ({ item, onPress }) => {
  const getIssueType = () => {
    const now = new Date();
    const batteryExpiry = new Date(item.CalculatedBatteryExpiryDate);
    const padsExpiry = new Date(item.CalculatedPadsExpiryDate);
    
    const issues = [];
    if (batteryExpiry < now) issues.push('Battery Expired');
    if (padsExpiry < now) issues.push('Pads Expired');
    if (item.OverallStatus.includes('Needs')) issues.push(item.OverallStatus);
    
    return issues;
  };

  const getUrgencyColor = () => {
    const issues = getIssueType();
    if (issues.length > 1) return '#D32F2F'; // High urgency - multiple issues
    if (issues.some(issue => issue.includes('Battery'))) return '#F57C00'; // Medium urgency
    return '#FF5722'; // Standard urgency
  };

  const daysSinceExpiry = (expiryDate) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = now - expiry;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const issues = getIssueType();

  return (
    <Card style={styles.serviceItem} onPress={onPress}>
      <Card.Content>
        <View style={styles.serviceItemHeader}>
          <Title style={styles.aedTitle}>{item.Title}</Title>
          <Chip 
            style={[styles.urgencyChip, { backgroundColor: getUrgencyColor() }]}
            textStyle={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}
          >
            {issues.length > 1 ? 'URGENT' : 'SERVICE DUE'}
          </Chip>
        </View>
        
        <Paragraph style={styles.buildingName}>{item.BuildingName}</Paragraph>
        <Paragraph style={styles.location}>
          Floor {item.Floor} - {item.SpecificLocationDescription}
        </Paragraph>
        
        <Divider style={styles.divider} />
        
        <View style={styles.issuesContainer}>
          <Paragraph style={styles.issuesLabel}>Issues:</Paragraph>
          {issues.map((issue, index) => (
            <Chip 
              key={index}
              style={[styles.issueChip, { backgroundColor: '#FFEBEE' }]}
              textStyle={{ color: '#C62828', fontSize: 11 }}
            >
              {issue}
            </Chip>
          ))}
        </View>

        <View style={styles.expiryInfo}>
          {new Date(item.CalculatedBatteryExpiryDate) < new Date() && (
            <Paragraph style={styles.expiryText}>
              Battery expired {daysSinceExpiry(item.CalculatedBatteryExpiryDate)} days ago
            </Paragraph>
          )}
          {new Date(item.CalculatedPadsExpiryDate) < new Date() && (
            <Paragraph style={styles.expiryText}>
              Pads expired {daysSinceExpiry(item.CalculatedPadsExpiryDate)} days ago
            </Paragraph>
          )}
        </View>
      </Card.Content>
    </Card>
  );
};

const ServiceListScreen = ({ navigation }) => {
  const [serviceAeds, setServiceAeds] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadServiceAeds = async () => {
    try {
      setLoading(true);
      const data = await SharePointAPI.getServiceDueAeds();
      // Sort by urgency (multiple issues first, then by expiry dates)
      const sortedData = data.sort((a, b) => {
        const aIssues = getIssueCount(a);
        const bIssues = getIssueCount(b);
        
        if (aIssues !== bIssues) return bIssues - aIssues;
        
        // If same number of issues, sort by earliest expiry date
        const aBatteryExpiry = new Date(a.CalculatedBatteryExpiryDate);
        const aPadsExpiry = new Date(a.CalculatedPadsExpiryDate);
        const bBatteryExpiry = new Date(b.CalculatedBatteryExpiryDate);
        const bPadsExpiry = new Date(b.CalculatedPadsExpiryDate);
        
        const aEarliestExpiry = Math.min(aBatteryExpiry, aPadsExpiry);
        const bEarliestExpiry = Math.min(bBatteryExpiry, bPadsExpiry);
        
        return aEarliestExpiry - bEarliestExpiry;
      });
      
      setServiceAeds(sortedData);
    } catch (error) {
      console.error('Error loading service AEDs:', error);
      Alert.alert('Error', 'Failed to load service list');
    } finally {
      setLoading(false);
    }
  };

  const getIssueCount = (aed) => {
    const now = new Date();
    const batteryExpiry = new Date(aed.CalculatedBatteryExpiryDate);
    const padsExpiry = new Date(aed.CalculatedPadsExpiryDate);
    
    let count = 0;
    if (batteryExpiry < now) count++;
    if (padsExpiry < now) count++;
    if (aed.OverallStatus.includes('Needs')) count++;
    
    return count;
  };

  useFocusEffect(
    useCallback(() => {
      loadServiceAeds();
    }, [])
  );

  const navigateToDetail = (aed) => {
    navigation.navigate('AEDDetail', { aedTitle: aed.Title });
  };

  const generateOptimizedRoute = () => {
    if (serviceAeds.length === 0) {
      Alert.alert('No AEDs', 'No AEDs require service at this time.');
      return;
    }

    if (serviceAeds.length === 1) {
      const aed = serviceAeds[0];
      const url = `https://www.google.com/maps/dir/?api=1&destination=${aed.Latitude},${aed.Longitude}`;
      Linking.openURL(url);
      return;
    }

    // For multiple locations, create waypoints
    const origin = `${serviceAeds[0].Latitude},${serviceAeds[0].Longitude}`;
    const destination = `${serviceAeds[serviceAeds.length - 1].Latitude},${serviceAeds[serviceAeds.length - 1].Longitude}`;
    
    // Middle locations as waypoints
    const waypoints = serviceAeds.slice(1, -1)
      .map(aed => `${aed.Latitude},${aed.Longitude}`)
      .join('|');

    let url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`;
    if (waypoints) {
      url += `&waypoints=${waypoints}`;
    }
    url += '&travelmode=driving';

    Linking.openURL(url);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" />
        <Paragraph style={{ marginTop: 16 }}>Loading service list...</Paragraph>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header Statistics */}
      <Surface style={styles.headerStats}>
        <Title style={styles.statsTitle}>Service Required: {serviceAeds.length} AEDs</Title>
        <Paragraph style={styles.statsSubtitle}>
          {serviceAeds.filter(aed => getIssueCount(aed) > 1).length} urgent, {' '}
          {serviceAeds.filter(aed => getIssueCount(aed) === 1).length} standard priority
        </Paragraph>
      </Surface>

      {/* Route Generation Button */}
      {serviceAeds.length > 0 && (
        <Surface style={styles.routeContainer}>
          <Button
            mode="contained"
            onPress={generateOptimizedRoute}
            style={styles.routeButton}
            contentStyle={styles.routeButtonContent}
            labelStyle={styles.routeButtonLabel}
            icon="map-marker-path"
          >
            Generate Optimized Service Route
          </Button>
          <Paragraph style={styles.routeDescription}>
            Opens Google Maps with optimized route to visit all AEDs requiring service
          </Paragraph>
        </Surface>
      )}

      {/* Service List */}
      {serviceAeds.length === 0 ? (
        <View style={[styles.container, styles.centerContent]}>
          <Title style={styles.noServiceTitle}>🎉 All AEDs Operational!</Title>
          <Paragraph style={styles.noServiceText}>
            No AEDs currently require service. Great work keeping everything up to date!
          </Paragraph>
        </View>
      ) : (
        <FlatList
          data={serviceAeds}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <ServiceAEDItem 
              item={item} 
              onPress={() => navigateToDetail(item)}
            />
          )}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  headerStats: {
    margin: 16,
    padding: 16,
    borderRadius: 8,
    elevation: 2,
    backgroundColor: 'white',
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#D32F2F',
    textAlign: 'center',
  },
  statsSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  routeContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 8,
    elevation: 2,
    backgroundColor: 'white',
  },
  routeButton: {
    backgroundColor: '#1976D2',
    elevation: 3,
  },
  routeButtonContent: {
    paddingVertical: 8,
  },
  routeButtonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  routeDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  listContainer: {
    padding: 16,
  },
  serviceItem: {
    marginBottom: 12,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  serviceItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  aedTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  urgencyChip: {
    elevation: 2,
  },
  buildingName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1976D2',
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  divider: {
    marginVertical: 8,
  },
  issuesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: 8,
  },
  issuesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  issueChip: {
    marginRight: 4,
    marginBottom: 4,
  },
  expiryInfo: {
    marginTop: 4,
  },
  expiryText: {
    fontSize: 12,
    color: '#C62828',
    fontWeight: '600',
  },
  noServiceTitle: {
    fontSize: 24,
    textAlign: 'center',
    color: '#4CAF50',
    marginBottom: 16,
  },
  noServiceText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    lineHeight: 24,
  },
});

export default ServiceListScreen; 