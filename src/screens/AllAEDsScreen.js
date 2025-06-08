import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Searchbar, Card, Title, Paragraph, Chip, ActivityIndicator, FAB } from 'react-native-paper';
import { SharePointAPI } from '../api/SharePointAPI';
import { useFocusEffect } from '@react-navigation/native';

const AEDListItem = ({ item, onPress }) => {
  const isExpired = () => {
    const now = new Date();
    const batteryExpiry = new Date(item.CalculatedBatteryExpiryDate);
    const padsExpiry = new Date(item.CalculatedPadsExpiryDate);
    return batteryExpiry < now || padsExpiry < now || item.OverallStatus.includes('Needs');
  };

  const getStatusColor = () => {
    if (isExpired()) return '#F44336';
    return '#4CAF50';
  };

  const getStatusText = () => {
    const now = new Date();
    const batteryExpiry = new Date(item.CalculatedBatteryExpiryDate);
    const padsExpiry = new Date(item.CalculatedPadsExpiryDate);
    
    if (batteryExpiry < now && padsExpiry < now) return 'Battery & Pads Expired';
    if (batteryExpiry < now) return 'Battery Expired';
    if (padsExpiry < now) return 'Pads Expired';
    if (item.OverallStatus.includes('Needs')) return item.OverallStatus;
    return 'Operational';
  };

  return (
    <Card style={styles.listItem} onPress={onPress}>
      <Card.Content>
        <View style={styles.listItemHeader}>
          <Title style={styles.aedTitle}>{item.Title}</Title>
          <Chip 
            style={[styles.statusChip, { backgroundColor: getStatusColor() }]}
            textStyle={{ color: 'white', fontSize: 10 }}
          >
            {getStatusText()}
          </Chip>
        </View>
        
        <Paragraph style={styles.buildingName}>{item.BuildingName}</Paragraph>
        <Paragraph style={styles.location}>
          Floor {item.Floor} - {item.SpecificLocationDescription}
        </Paragraph>
        <Paragraph style={styles.manufacturer}>
          {item.Manufacturer} {item.Model}
        </Paragraph>
        
        <View style={styles.lastCheckContainer}>
          <Paragraph style={styles.lastCheck}>
            Last Check: {new Date(item.LastMonthlyCheckDate).toLocaleDateString()} by {item.LastMonthlyCheckBy}
          </Paragraph>
          <Chip 
            style={[styles.checkStatusChip, { 
              backgroundColor: item.LastMonthlyCheckStatus === 'Pass' ? '#E8F5E8' : '#FFEBEE' 
            }]}
            textStyle={{ 
              color: item.LastMonthlyCheckStatus === 'Pass' ? '#2E7D32' : '#C62828',
              fontSize: 10 
            }}
          >
            {item.LastMonthlyCheckStatus}
          </Chip>
        </View>
      </Card.Content>
    </Card>
  );
};

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
    if (query.trim() === '') {
      setFilteredAeds(aeds);
    } else {
      const filtered = aeds.filter(aed =>
        aed.Title.toLowerCase().includes(query.toLowerCase()) ||
        aed.BuildingName.toLowerCase().includes(query.toLowerCase()) ||
        aed.BuildingCode.toLowerCase().includes(query.toLowerCase()) ||
        aed.SpecificLocationDescription.toLowerCase().includes(query.toLowerCase()) ||
        aed.Manufacturer.toLowerCase().includes(query.toLowerCase()) ||
        aed.Model.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredAeds(filtered);
    }
  };

  const navigateToDetail = (aed) => {
    navigation.navigate('AEDDetail', { aedTitle: aed.Title });
  };

  const navigateToAdd = () => {
    navigation.navigate('EditAED', { mode: 'add' });
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" />
        <Paragraph style={{ marginTop: 16 }}>Loading AEDs...</Paragraph>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search AEDs..."
        onChangeText={handleSearch}
        value={searchQuery}
        style={styles.searchBar}
      />
      
      <FlatList
        data={filteredAeds}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <AEDListItem 
            item={item} 
            onPress={() => navigateToDetail(item)}
          />
        )}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={navigateToAdd}
        label="Add AED"
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
    marginHorizontal: 16,
    marginVertical: 8,
    elevation: 2,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 80, // Space for FAB
  },
  listItem: {
    marginBottom: 12,
    elevation: 2,
  },
  listItemHeader: {
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
  statusChip: {
    elevation: 1,
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
    marginBottom: 4,
  },
  manufacturer: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  lastCheckContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastCheck: {
    fontSize: 12,
    color: '#777',
    flex: 1,
    marginRight: 8,
  },
  checkStatusChip: {
    elevation: 1,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#1976D2',
  },
});

export default AllAEDsScreen; 