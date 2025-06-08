import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity,
  Alert 
} from 'react-native';
import { 
  Searchbar, 
  Card, 
  Title, 
  Paragraph, 
  Chip,
  ActivityIndicator,
  FAB,
  Divider 
} from 'react-native-paper';
import { SharePointAPI } from '../api/SharePointAPI';
import { useFocusEffect } from '@react-navigation/native';

const AllAEDsScreen = ({ navigation }) => {
  const [aeds, setAeds] = useState([]);
  const [filteredAeds, setFilteredAeds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const loadAeds = async () => {
    try {
      setLoading(true);
      const data = await SharePointAPI.getAllAeds();
      setAeds(data);
      setFilteredAeds(data);
    } catch (error) {
      console.error('Error loading AEDs:', error);
      Alert.alert('Error', 'Failed to load AED data');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadAeds();
    }, [])
  );

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query === '') {
      setFilteredAeds(aeds);
    } else {
      const filtered = aeds.filter(aed =>
        aed.Title.toLowerCase().includes(query.toLowerCase()) ||
        aed.BuildingName.toLowerCase().includes(query.toLowerCase()) ||
        aed.BuildingCode.toLowerCase().includes(query.toLowerCase()) ||
        aed.SpecificLocationDescription.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredAeds(filtered);
    }
  };

  const getStatusColor = (status) => {
    if (status === 'Operational') {
      return '#4CAF50';
    } else if (status.includes('Needs')) {
      return '#F44336';
    } else {
      return '#FF9800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderAedItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('AEDDetail', { aedTitle: item.Title })}
    >
      <Card style={[styles.aedCard, item.NeedsService && styles.serviceNeededCard]}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <Title style={styles.aedTitle}>{item.Title}</Title>
            <Chip 
              style={[styles.statusChip, { 
                backgroundColor: getStatusColor(item.CalculatedStatus) 
              }]}
              textStyle={{ color: 'white', fontSize: 11 }}
            >
              {item.CalculatedStatus}
            </Chip>
          </View>
          
          <Paragraph style={styles.buildingInfo}>
            {item.BuildingName} ({item.BuildingCode})
          </Paragraph>
          
          <Paragraph style={styles.locationInfo}>
            Floor {item.Floor} • {item.SpecificLocationDescription}
          </Paragraph>

          <View style={styles.expiryInfo}>
            <View style={styles.expiryRow}>
              <Paragraph style={styles.expiryLabel}>Battery:</Paragraph>
              <Paragraph style={[
                styles.expiryDate,
                new Date(item.CalculatedBatteryExpiryDate) < new Date() && styles.expiredDate
              ]}>
                {formatDate(item.CalculatedBatteryExpiryDate)}
              </Paragraph>
            </View>
            
            <View style={styles.expiryRow}>
              <Paragraph style={styles.expiryLabel}>Pads:</Paragraph>
              <Paragraph style={[
                styles.expiryDate,
                new Date(item.CalculatedPadsExpiryDate) < new Date() && styles.expiredDate
              ]}>
                {formatDate(item.CalculatedPadsExpiryDate)}
              </Paragraph>
            </View>
          </View>

          {item.NeedsService && (
            <View style={styles.serviceWarning}>
              <Paragraph style={styles.serviceWarningText}>
                ⚠️ Automated system detected this AED needs attention
              </Paragraph>
            </View>
          )}
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" />
        <Paragraph style={{ marginTop: 16 }}>Loading AED inventory...</Paragraph>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search AEDs by title, building, or location..."
        onChangeText={handleSearch}
        value={searchQuery}
        style={styles.searchBar}
      />
      
      <View style={styles.statsContainer}>
        <Paragraph style={styles.statsText}>
          {filteredAeds.length} AEDs found • {filteredAeds.filter(aed => aed.NeedsService).length} need service
        </Paragraph>
      </View>

      <FlatList
        data={filteredAeds}
        renderItem={renderAedItem}
        keyExtractor={(item) => item.Title}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      <FAB
        style={styles.fab}
        icon={() => <Title style={{ color: 'white', fontSize: 18 }}>+</Title>}
        onPress={() => navigation.navigate('EditAED', { mode: 'add' })}
        label="Add AED"
        uppercase={false}
      />
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
  },
  searchBar: {
    margin: 16,
    elevation: 2,
  },
  statsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  statsText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  aedCard: {
    marginBottom: 12,
    elevation: 2,
  },
  serviceNeededCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  aedTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 12,
  },
  statusChip: {
    elevation: 1,
  },
  buildingInfo: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1976D2',
    marginBottom: 4,
  },
  locationInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  expiryInfo: {
    backgroundColor: '#f8f9fa',
    padding: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  expiryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  expiryLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  expiryDate: {
    fontSize: 12,
    color: '#333',
  },
  expiredDate: {
    color: '#F44336',
    fontWeight: 'bold',
  },
  serviceWarning: {
    backgroundColor: '#FFEBEE',
    padding: 8,
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: '#F44336',
  },
  serviceWarningText: {
    fontSize: 12,
    color: '#C62828',
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 20,
    backgroundColor: '#1976D2',
    borderRadius: 16,
    elevation: 8,
    shadowColor: '#1976D2',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});

export default AllAEDsScreen; 