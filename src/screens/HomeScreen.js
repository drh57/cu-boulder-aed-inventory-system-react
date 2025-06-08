import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Card, Title, Paragraph, Button, Surface, Divider } from 'react-native-paper';
import { SharePointAPI } from '../api/SharePointAPI';
import { useFocusEffect } from '@react-navigation/native';

const StatCard = ({ title, value, subtitle, color = '#1976D2', onPress }) => (
  <Card style={[styles.statCard, { borderTopColor: color }]} onPress={onPress}>
    <Card.Content style={styles.statContent}>
      <Title style={[styles.statValue, { color }]}>{value}</Title>
      <Paragraph style={styles.statTitle}>{title}</Paragraph>
      {subtitle && (
        <Paragraph style={styles.statSubtitle}>{subtitle}</Paragraph>
      )}
    </Card.Content>
  </Card>
);

const ActionCard = ({ title, description, icon, color, onPress }) => (
  <Card style={styles.actionCard} onPress={onPress}>
    <Card.Content>
      <View style={styles.actionContent}>
        <View style={styles.actionText}>
          <Title style={styles.actionTitle}>{title}</Title>
          <Paragraph style={styles.actionDescription}>{description}</Paragraph>
        </View>
        <Surface style={[styles.actionIcon, { backgroundColor: color }]}>
          <Title style={styles.actionIconText}>{icon}</Title>
        </Surface>
      </View>
    </Card.Content>
  </Card>
);

const HomeScreen = ({ navigation }) => {
  const [dashboardData, setDashboardData] = useState({
    totalAeds: 0,
    operationalCount: 0,
    serviceRequiredCount: 0,
    batteryExpired: 0,
    padsExpired: 0,
    recentChecks: 0
  });
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [allAeds, logEntries] = await Promise.all([
        SharePointAPI.getAllAeds(),
        SharePointAPI.getAllLogEntries()
      ]);

      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));

      const stats = {
        totalAeds: allAeds.length,
        operationalCount: allAeds.filter(aed => aed.CalculatedStatus === 'Operational').length,
        serviceRequiredCount: allAeds.filter(aed => aed.NeedsService).length,
        batteryExpired: allAeds.filter(aed => 
          new Date(aed.CalculatedBatteryExpiryDate) < now
        ).length,
        padsExpired: allAeds.filter(aed => 
          new Date(aed.CalculatedPadsExpiryDate) < now
        ).length,
        recentChecks: logEntries.filter(log => 
          new Date(log.Created) > thirtyDaysAgo
        ).length
      };

      setDashboardData(stats);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
    }, [])
  );

  const handleQuickScan = () => {
    navigation.navigate('Scan');
  };

  const handleViewAllAeds = () => {
    navigation.navigate('AllAEDs');
  };

  const handleServiceList = () => {
    navigation.navigate('ServiceList');
  };

  const handleLogCheck = () => {
    // Navigate to AED selection screen or directly to scan if preferred
    navigation.navigate('AllAEDs');
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Paragraph>Loading dashboard...</Paragraph>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Header */}
      <View style={styles.header}>
        <Title style={styles.headerTitle}>CUEMS AED Management</Title>
        <Paragraph style={styles.headerSubtitle}>
          University of Colorado Boulder Emergency Medical Services
        </Paragraph>
      </View>

      {/* Key Statistics */}
      <View style={styles.sectionContainer}>
        <Title style={styles.sectionTitle}>System Overview</Title>
        
        <View style={styles.statsGrid}>
          <StatCard
            title="Total AEDs"
            value={dashboardData.totalAeds}
            subtitle="Active devices"
            color="#1976D2"
            onPress={handleViewAllAeds}
          />
          
          <StatCard
            title="Operational"
            value={dashboardData.operationalCount}
            subtitle="Ready for use"
            color="#4CAF50"
            onPress={handleViewAllAeds}
          />
          
          <StatCard
            title="Need Service"
            value={dashboardData.serviceRequiredCount}
            subtitle="Automated detection"
            color="#F44336"
            onPress={handleServiceList}
          />
          
          <StatCard
            title="Recent Checks"
            value={dashboardData.recentChecks}
            subtitle="Last 30 days"
            color="#FF9800"
            onPress={() => navigation.navigate('AllAEDs')}
          />
        </View>
      </View>

      {/* Service Alerts */}
      {(dashboardData.batteryExpired > 0 || dashboardData.padsExpired > 0) && (
        <View style={styles.sectionContainer}>
          <Title style={styles.sectionTitle}>Service Alerts</Title>
          
          <View style={styles.alertsGrid}>
            {dashboardData.batteryExpired > 0 && (
              <StatCard
                title="Battery Expired"
                value={dashboardData.batteryExpired}
                subtitle="Require replacement"
                color="#D32F2F"
                onPress={handleServiceList}
              />
            )}
            
            {dashboardData.padsExpired > 0 && (
              <StatCard
                title="Pads Expired"
                value={dashboardData.padsExpired}
                subtitle="Require replacement"
                color="#F57C00"
                onPress={handleServiceList}
              />
            )}
          </View>
        </View>
      )}

      {/* Quick Actions */}
      <View style={styles.sectionContainer}>
        <Title style={styles.sectionTitle}>Quick Actions</Title>
        
        <ActionCard
          title="QR Code Scanner"
          description="Scan AED QR code for quick access"
          icon="📱"
          color="#1976D2"
          onPress={handleQuickScan}
        />
        
        <ActionCard
          title="View All AEDs"
          description="Browse complete inventory"
          icon="📋"
          color="#388E3C"
          onPress={handleViewAllAeds}
        />
        
        <ActionCard
          title="Service Schedule"
          description="View AEDs requiring service with route optimization"
          icon="🔧"
          color="#F57C00"
          onPress={handleServiceList}
        />
        
        <ActionCard
          title="Monthly Checks"
          description="Log routine maintenance checks"
          icon="✅"
          color="#7B1FA2"
          onPress={handleLogCheck}
        />
      </View>

      {/* System Status */}
      <Card style={styles.systemStatusCard}>
        <Card.Content>
          <Title style={styles.systemStatusTitle}>Automated Status System</Title>
          <Paragraph style={styles.systemStatusText}>
            • Real-time expiry monitoring for batteries and pads{'\n'}
            • Automatic service scheduling based on component lifecycles{'\n'}
            • Integration-ready for SharePoint and Azure AD{'\n'}
            • Monthly check tracking and compliance reporting
          </Paragraph>
          <Divider style={styles.divider} />
          <Paragraph style={styles.systemStatusNote}>
            Operational efficiency: {Math.round((dashboardData.operationalCount / dashboardData.totalAeds) * 100)}% of AEDs ready for emergency use
          </Paragraph>
        </Card.Content>
      </Card>
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
    paddingBottom: 32,
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1976D2',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  alertsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    marginBottom: 12,
    elevation: 2,
    borderTopWidth: 4,
  },
  statContent: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  statTitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  statSubtitle: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 2,
  },
  actionCard: {
    marginBottom: 12,
    elevation: 2,
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionText: {
    flex: 1,
    marginRight: 16,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  actionIconText: {
    fontSize: 24,
    color: 'white',
  },
  systemStatusCard: {
    elevation: 3,
    backgroundColor: '#E3F2FD',
  },
  systemStatusTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 8,
  },
  systemStatusText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  divider: {
    marginVertical: 12,
  },
  systemStatusNote: {
    fontSize: 12,
    color: '#1976D2',
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default HomeScreen; 