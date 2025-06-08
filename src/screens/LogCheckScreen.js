import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { 
  Card, 
  Title, 
  Paragraph,
  TextInput, 
  Button, 
  RadioButton,
  HelperText,
  ActivityIndicator,
  Divider
} from 'react-native-paper';
import { SharePointAPI } from '../api/SharePointAPI';

const LogCheckScreen = ({ route, navigation }) => {
  const { aedTitle } = route.params;
  const [aed, setAed] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [checkData, setCheckData] = useState({
    checkStatus: 'Pass',
    checkNotes: '',
    checkedBy: 'Derek Haase'
  });
  
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadAedDetails();
  }, [aedTitle]);

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

  const validateForm = () => {
    const newErrors = {};

    if (!checkData.checkedBy.trim()) {
      newErrors.checkedBy = 'Checked by field is required';
    }
    
    if (!checkData.checkNotes.trim()) {
      newErrors.checkNotes = 'Check notes are required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please correct the errors in the form');
      return;
    }

    try {
      setSubmitting(true);
      
      // Update the AED with the new check information
      const updatedAed = {
        ...aed,
        LastMonthlyCheckDate: new Date().toISOString(),
        LastMonthlyCheckBy: checkData.checkedBy,
        LastMonthlyCheckStatus: checkData.checkStatus,
        LastMonthlyCheckNotes: checkData.checkNotes,
        Modified: new Date().toISOString()
      };

      // Update the AED record
      await SharePointAPI.updateAed(updatedAed);

      // Create a log entry
      const logEntry = {
        Title: `${aed.Title} - Monthly Check - ${new Date().toLocaleDateString()}`,
        AedLinkTitle: aed.Title,
        SubmissionTimestamp: new Date().toISOString(),
        SubmittedBy: checkData.checkedBy,
        SubmissionType: 'Monthly Check',
        SummaryOfAction: checkData.checkNotes
      };

      await SharePointAPI.createLogEntry(logEntry);

      Alert.alert(
        'Success', 
        'Monthly check logged successfully',
        [
          {
            text: 'View AED Details',
            onPress: () => {
              navigation.goBack();
              navigation.navigate('AEDDetail', { aedTitle: aed.Title });
            }
          },
          {
            text: 'Done',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      console.error('Error logging check:', error);
      Alert.alert('Error', 'Failed to log monthly check');
    } finally {
      setSubmitting(false);
    }
  };

  const updateField = (field, value) => {
    setCheckData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* AED Information Header */}
      <Card style={styles.aedInfoCard}>
        <Card.Content>
          <Title style={styles.aedTitle}>{aed.Title}</Title>
          <Paragraph style={styles.buildingName}>{aed.BuildingName}</Paragraph>
          <Paragraph style={styles.location}>
            Floor {aed.Floor} - {aed.SpecificLocationDescription}
          </Paragraph>
          <Paragraph style={styles.manufacturer}>
            {aed.Manufacturer} {aed.Model}
          </Paragraph>
          
          <Divider style={styles.divider} />
          
          <Paragraph style={styles.lastCheck}>
            Last Check: {formatDate(aed.LastMonthlyCheckDate)} by {aed.LastMonthlyCheckBy}
          </Paragraph>
          <Paragraph style={styles.lastCheckStatus}>
            Status: {aed.LastMonthlyCheckStatus}
          </Paragraph>
        </Card.Content>
      </Card>

      {/* Check Form */}
      <Card style={styles.formCard}>
        <Card.Content>
          <Title style={styles.formTitle}>Log Monthly Check</Title>
          
          {/* Checked By */}
          <TextInput
            label="Checked By *"
            value={checkData.checkedBy}
            onChangeText={(value) => updateField('checkedBy', value)}
            style={styles.input}
            error={!!errors.checkedBy}
          />
          <HelperText type="error" visible={!!errors.checkedBy}>
            {errors.checkedBy}
          </HelperText>

          {/* Check Status */}
          <Title style={styles.radioTitle}>Check Status *</Title>
          <RadioButton.Group 
            onValueChange={(value) => updateField('checkStatus', value)} 
            value={checkData.checkStatus}
          >
            <View style={styles.radioOption}>
              <RadioButton value="Pass" />
              <View style={styles.radioContent}>
                <Title style={[styles.radioLabel, { color: '#4CAF50' }]}>Pass</Title>
                <Paragraph style={styles.radioDescription}>
                  AED appears to be functioning normally
                </Paragraph>
              </View>
            </View>
            
            <View style={styles.radioOption}>
              <RadioButton value="Pass - Minor Issues" />
              <View style={styles.radioContent}>
                <Title style={[styles.radioLabel, { color: '#FF9800' }]}>Pass - Minor Issues</Title>
                <Paragraph style={styles.radioDescription}>
                  AED functional but has minor issues noted
                </Paragraph>
              </View>
            </View>
            
            <View style={styles.radioOption}>
              <RadioButton value="Fail - Needs Attention" />
              <View style={styles.radioContent}>
                <Title style={[styles.radioLabel, { color: '#F44336' }]}>Fail - Needs Attention</Title>
                <Paragraph style={styles.radioDescription}>
                  AED requires immediate attention or service
                </Paragraph>
              </View>
            </View>
          </RadioButton.Group>

          {/* Check Notes */}
          <TextInput
            label="Check Notes *"
            value={checkData.checkNotes}
            onChangeText={(value) => updateField('checkNotes', value)}
            style={[styles.input, styles.notesInput]}
            multiline
            numberOfLines={4}
            placeholder="Describe what you observed during the check..."
            error={!!errors.checkNotes}
          />
          <HelperText type="error" visible={!!errors.checkNotes}>
            {errors.checkNotes}
          </HelperText>
          
          <HelperText type="info">
            Include details about: visual indicators, physical condition, accessibility, signage, etc.
          </HelperText>

          <Divider style={styles.divider} />

          {/* Checklist Guidance */}
          <Title style={styles.checklistTitle}>Monthly Check Guidelines</Title>
          <View style={styles.checklistContainer}>
            <Paragraph style={styles.checklistItem}>
              ✓ Verify AED status lights are normal (green/ready)
            </Paragraph>
            <Paragraph style={styles.checklistItem}>
              ✓ Check that AED is in designated location
            </Paragraph>
            <Paragraph style={styles.checklistItem}>
              ✓ Ensure AED is easily accessible
            </Paragraph>
            <Paragraph style={styles.checklistItem}>
              ✓ Verify signage is visible and undamaged
            </Paragraph>
            <Paragraph style={styles.checklistItem}>
              ✓ Check for any physical damage to unit
            </Paragraph>
            <Paragraph style={styles.checklistItem}>
              ✓ Ensure pads and battery are not expired
            </Paragraph>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <Button
              mode="outlined"
              onPress={() => navigation.goBack()}
              style={styles.cancelButton}
              disabled={submitting}
            >
              Cancel
            </Button>
            
            <Button
              mode="contained"
              onPress={handleSubmit}
              style={styles.submitButton}
              loading={submitting}
              disabled={submitting}
            >
              Log Check
            </Button>
          </View>
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
  aedInfoCard: {
    marginBottom: 16,
    elevation: 2,
  },
  aedTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  buildingName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 4,
  },
  location: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  manufacturer: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  divider: {
    marginVertical: 12,
  },
  lastCheck: {
    fontSize: 14,
    color: '#666',
  },
  lastCheckStatus: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  formCard: {
    elevation: 2,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    marginBottom: 4,
  },
  notesInput: {
    marginTop: 16,
  },
  radioTitle: {
    fontSize: 16,
    marginBottom: 12,
    marginTop: 16,
    color: '#333',
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingVertical: 4,
  },
  radioContent: {
    marginLeft: 8,
    flex: 1,
  },
  radioLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  radioDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  checklistTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  checklistContainer: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  checklistItem: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
  submitButton: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: '#1976D2',
  },
});

export default LogCheckScreen; 