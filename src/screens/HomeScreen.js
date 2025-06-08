import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Card, Title, Paragraph, Button, Surface, ActivityIndicator } from 'react-native-paper';
import { SharePointAPI } from '../api/SharePointAPI';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const [stats, setStats] = useState({
    totalAeds: 0,
    serviceRequired: 0,
    operational: 0
  });
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    try {
      setLoading(true);
      const [allAeds, serviceDueAeds] = await Promise.all([
        SharePointAPI.getAllAeds(),
        SharePointAPI.getServiceDueAeds()
      ]);

      const operational = allAeds.filter(aed => 
        !serviceDueAeds.some(serviceAed => serviceAed.Title === aed.Title)
      ).length;

      setStats({
        totalAeds: allAeds.length,
        serviceRequired: serviceDueAeds.length,
        operational: operational
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [])
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" />
        <Paragraph style={{ marginTop: 16 }}>Loading dashboard...</Paragraph>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <Title style={styles.headerTitle}>CUEMS AED Management</Title>
        <Paragraph style={styles.headerSubtitle}>
          Automated External Defibrillator Inventory System
        </Paragraph>
      </View>

      <View style={styles.statsContainer}>
        <Surface style={[styles.statCard, { backgroundColor: '#E3F2FD' }]}>
          <Title style={styles.statNumber}>{stats.totalAeds}</Title>
          <Paragraph style={styles.statLabel}>Total AEDs</Paragraph>
        </Surface>

        <Surface style={[styles.statCard, { backgroundColor: stats.serviceRequired > 0 ? '#FFEBEE' : '#E8F5E8' }]}>
          <Title style={[styles.statNumber, { color: stats.serviceRequired > 0 ? '#C62828' : '#2E7D32' }]}>
            {stats.serviceRequired}
          </Title>
          <Paragraph style={styles.statLabel}>Service Required</Paragraph>
        </Surface>

        <Surface style={[styles.statCard, { backgroundColor: '#E8F5E8' }]}>
          <Title style={[styles.statNumber, { color: '#2E7D32' }]}>{stats.operational}</Title>
          <Paragraph style={styles.statLabel}>Operational</Paragraph>
        </Surface>
      </View>

      <View style={styles.actionsContainer}>
        <Card style={styles.actionCard}>
          <Card.Content>
            <Title style={styles.actionTitle}>Quick Actions</Title>
            
            <Button
              mode="contained"
              onPress={() => navigation.navigate('Scan')}
              style={[styles.actionButton, { backgroundColor: '#1976D2' }]}
              contentStyle={styles.buttonContent}
              labelStyle={styles.buttonLabel}
            >
              Scan AED QR Code
            </Button>

            <Button
              mode="contained"
              onPress={() => navigation.navigate('AllAEDs')}
              style={[styles.actionButton, { backgroundColor: '#388E3C' }]}
              contentStyle={styles.buttonContent}
              labelStyle={styles.buttonLabel}
            >
              View All AEDs
            </Button>

            <Button
              mode="contained"
              onPress={() => navigation.navigate('ServiceList')}
              style={[styles.actionButton, { backgroundColor: stats.serviceRequired > 0 ? '#D32F2F' : '#757575' }]}
              contentStyle={styles.buttonContent}
              labelStyle={styles.buttonLabel}
            >
              Service List ({stats.serviceRequired})
            </Button>
          </Card.Content>
        </Card>
      </View>
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
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1976D2',
  },
  headerSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    flexWrap: 'wrap',
  },
  statCard: {
    padding: 16,
    borderRadius: 8,
    elevation: 2,
    minWidth: width < 400 ? '48%' : 100,
    alignItems: 'center',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  actionsContainer: {
    flex: 1,
  },
  actionCard: {
    elevation: 4,
  },
  actionTitle: {
    marginBottom: 16,
    color: '#333',
  },
  actionButton: {
    marginBottom: 12,
    elevation: 2,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HomeScreen; 