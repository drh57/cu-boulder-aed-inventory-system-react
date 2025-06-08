import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Alert, Linking } from 'react-native';
import { 
  Card, 
  Title, 
  Paragraph, 
  Button, 
  Chip, 
  Divider, 
  ActivityIndicator,
  Surface 
} from 'react-native-paper';
import { SharePointAPI } from '../api/SharePointAPI';
import { useFocusEffect } from '@react-navigation/native';

const DetailRow = ({ label, value, isExpired = false, isWarning = false }) => (
  <View style={styles.detailRow}>
    <Paragraph style={styles.detailLabel}>{label}:</Paragraph>
    <Paragraph style={[
      styles.detailValue,
      isExpired && styles.expiredText,
      isWarning && styles.warningText
    ]}>
      {value}
    </Paragraph>
  </View>
);

const AEDDetailScreen = ({ route, navigation }) => {
  const { aedTitle } = route.params;
  const [aed, setAed] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadAedDetails = async () => {
    try {
      setLoading(true);
      const data = await SharePointAPI.getAedByTitle(aedTitle);
      if (data) {
        setAed(data);
      } else {
        Alert.alert('Error', 'AED not found');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error loading AED details:', error);
      Alert.alert('Error', 'Failed to load AED details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadAedDetails();
    }, [aedTitle])
  );

  const isExpired = (expiryDate) => {
    return new Date(expiryDate) < new Date();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleEdit = () => {
    navigation.navigate('EditAED', { mode: 'edit', aedData: aed });
  };

  const handleLogCheck = () => {
    navigation.navigate('LogCheck', { aedTitle: aed.Title });
  };

  const handleViewOnMap = () => {
    navigation.navigate('MapView', { aed });
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" />
        <Paragraph style={{ marginTop: 16 }}>Loading AED details...</Paragraph>
      </View>
    );
  }

  if (!aed) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Paragraph>AED not found</Paragraph>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Header Card */}
      <Card style={styles.headerCard}>
        <Card.Content>
          <View style={styles.headerContent}>
            <Title style={styles.aedTitle}>{aed.Title}</Title>
            <Chip 
              style={[styles.statusChip, { 
                backgroundColor: aed.NeedsService ? '#F44336' : '#4CAF50' 
              }]}
              textStyle={{ color: 'white', fontWeight: 'bold' }}
            >
              {aed.CalculatedStatus}
            </Chip>
          </View>
        </Card.Content>
      </Card>

      {/* Location Information */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Location Information</Title>
          <DetailRow label="Building" value={aed.BuildingName} />
          <DetailRow label="Building Code" value={aed.BuildingCode} />
          <DetailRow label="Floor" value={aed.Floor} />
          <DetailRow label="Specific Location" value={aed.SpecificLocationDescription} />
          <DetailRow label="Publicly Accessible" value={aed.PubliclyAccessible ? 'Yes' : 'No'} />
          <DetailRow label="Coordinates" value={`${aed.Latitude}, ${aed.Longitude}`} />
          
          <Button
            mode="outlined"
            onPress={handleViewOnMap}
            style={styles.mapButton}
            icon="map"
          >
            View on Map
          </Button>
        </Card.Content>
      </Card>

      {/* Device Information */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Device Information</Title>
          <DetailRow label="Manufacturer" value={aed.Manufacturer} />
          <DetailRow label="Model" value={aed.Model} />
          <DetailRow label="Serial Number" value={aed.SerialNumber} />
          <DetailRow label="Current Status" value={aed.CalculatedStatus} 
                    isWarning={aed.NeedsService} />
        </Card.Content>
      </Card>

      {/* Battery Information */}
      <Card style={[styles.sectionCard, isExpired(aed.CalculatedBatteryExpiryDate) && styles.expiredCard]}>
        <Card.Content>
          <Title style={[styles.sectionTitle, isExpired(aed.CalculatedBatteryExpiryDate) && styles.expiredTitle]}>
            Battery Information
            {isExpired(aed.CalculatedBatteryExpiryDate) && ' ⚠️'}
          </Title>
          <DetailRow label="Install Date" value={formatDate(aed.BatteryInstallDate)} />
          <DetailRow label="Lifespan" value={`${aed.BatteryLifespanMonths} months`} />
          <DetailRow 
            label="Expiry Date" 
            value={formatDate(aed.CalculatedBatteryExpiryDate)}
            isExpired={isExpired(aed.CalculatedBatteryExpiryDate)}
          />
        </Card.Content>
      </Card>

      {/* Pads Information */}
      <Card style={[styles.sectionCard, isExpired(aed.CalculatedPadsExpiryDate) && styles.expiredCard]}>
        <Card.Content>
          <Title style={[styles.sectionTitle, isExpired(aed.CalculatedPadsExpiryDate) && styles.expiredTitle]}>
            Pads Information
            {isExpired(aed.CalculatedPadsExpiryDate) && ' ⚠️'}
          </Title>
          <DetailRow label="Install Date" value={formatDate(aed.PadsInstallDate)} />
          <DetailRow label="Type" value={aed.PadsType} />
          <DetailRow label="Lifespan" value={`${aed.PadsLifespanMonths} months`} />
          <DetailRow 
            label="Expiry Date" 
            value={formatDate(aed.CalculatedPadsExpiryDate)}
            isExpired={isExpired(aed.CalculatedPadsExpiryDate)}
          />
        </Card.Content>
      </Card>

      {/* Last Check Information */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Last Monthly Check</Title>
          <DetailRow label="Check Date" value={formatDate(aed.LastMonthlyCheckDate)} />
          <DetailRow label="Checked By" value={aed.LastMonthlyCheckBy} />
          <DetailRow 
            label="Status" 
            value={aed.LastMonthlyCheckStatus}
            isWarning={aed.LastMonthlyCheckStatus && aed.LastMonthlyCheckStatus.includes('Fail')}
          />
          <DetailRow label="Notes" value={aed.LastMonthlyCheckNotes} />
        </Card.Content>
      </Card>

      {/* Status Summary */}
      <Card style={[styles.sectionCard, aed.NeedsService && styles.serviceNeededCard]}>
        <Card.Content>
          <Title style={[styles.sectionTitle, aed.NeedsService && styles.serviceNeededTitle]}>
            Automated Status Assessment
          </Title>
          <DetailRow label="Overall Status" value={aed.CalculatedStatus} 
                    isWarning={aed.NeedsService} />
          <Paragraph style={styles.statusExplanation}>
            {aed.NeedsService 
              ? 'This AED requires attention. Status automatically calculated based on expiry dates and check results.'
              : 'This AED is operational. All components are within their service life and latest check passed.'
            }
          </Paragraph>
        </Card.Content>
      </Card>

      {/* Additional Information */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Additional Information</Title>
          <DetailRow label="Notes" value={aed.Notes || 'No additional notes'} />
          <DetailRow label="Created" value={formatDate(aed.Created)} />
          <DetailRow label="Last Modified" value={formatDate(aed.Modified)} />
        </Card.Content>
      </Card>

      {/* Action Buttons */}
      <Surface style={styles.actionButtons}>
        <Button
          mode="contained"
          onPress={handleEdit}
          style={[styles.actionButton, { backgroundColor: '#1976D2' }]}
          contentStyle={styles.buttonContent}
        >
          Edit AED
        </Button>
        
        <Button
          mode="contained"
          onPress={handleLogCheck}
          style={[styles.actionButton, { backgroundColor: '#388E3C' }]}
          contentStyle={styles.buttonContent}
        >
          Log Monthly Check
        </Button>

        <Button
          mode="contained"
          onPress={() => {
            const qrData = JSON.stringify({
              aedId: aed.Title,
              location: `${aed.BuildingName} - ${aed.SpecificLocationDescription}`,
              type: 'CUEMS_AED'
            });
            Alert.alert(
              'QR Code Data',
              `QR Code content for ${aed.Title}:\n\n${qrData}\n\nThis would generate a scannable QR code for printing and attaching to the AED.`,
              [
                { text: 'OK' },
                { 
                  text: 'Generate Label', 
                  onPress: () => {
                    // In real app, this would generate a printable QR code label
                    Alert.alert('Label Generation', 'QR code label sent to printer (simulation)');
                  }
                }
              ]
            );
          }}
          style={[styles.actionButton, { backgroundColor: '#7B1FA2' }]}
          contentStyle={styles.buttonContent}
        >
          Generate QR Label
        </Button>
      </Surface>
    </ScrollView>
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
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  headerCard: {
    marginBottom: 16,
    elevation: 4,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  aedTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 16,
  },
  statusChip: {
    elevation: 2,
  },
  sectionCard: {
    marginBottom: 16,
    elevation: 2,
  },
  expiredCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
    backgroundColor: '#FFEBEE',
  },
  serviceNeededCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
    backgroundColor: '#FFF3E0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#1976D2',
  },
  expiredTitle: {
    color: '#C62828',
  },
  serviceNeededTitle: {
    color: '#F57C00',
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    width: 120,
    marginRight: 8,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  expiredText: {
    color: '#C62828',
    fontWeight: 'bold',
  },
  warningText: {
    color: '#F57C00',
    fontWeight: '600',
  },
  statusExplanation: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    fontStyle: 'italic',
  },
  mapButton: {
    marginTop: 8,
    borderColor: '#1976D2',
  },
  actionButtons: {
    padding: 16,
    borderRadius: 8,
    elevation: 2,
    backgroundColor: 'white',
  },
  actionButton: {
    marginBottom: 12,
    elevation: 2,
  },
  buttonContent: {
    paddingVertical: 8,
  },
});

export default AEDDetailScreen; 