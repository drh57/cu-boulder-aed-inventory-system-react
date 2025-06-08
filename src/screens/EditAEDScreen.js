import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { 
  Card, 
  Title, 
  TextInput, 
  Button, 
  Switch, 
  HelperText,
  ActivityIndicator,
  Divider,
  RadioButton
} from 'react-native-paper';
import { SharePointAPI } from '../api/SharePointAPI';

const EditAEDScreen = ({ route, navigation }) => {
  const { mode, aedData } = route.params;
  const isEditing = mode === 'edit';
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    Title: '',
    BuildingName: '',
    BuildingCode: '',
    Floor: '',
    SpecificLocationDescription: '',
    Latitude: '',
    Longitude: '',
    PubliclyAccessible: true,
    Manufacturer: '',
    Model: '',
    SerialNumber: '',
    BatteryInstallDate: '',
    BatteryLifespanMonths: '48',
    PadsInstallDate: '',
    PadsType: 'Adult',
    PadsLifespanMonths: '24',
    OverallStatus: 'Operational',
    LastMonthlyCheckBy: 'Derek Haase',
    LastMonthlyCheckStatus: 'Pass',
    LastMonthlyCheckNotes: '',
    Notes: ''
  });
  
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEditing && aedData) {
      setFormData({
        ...aedData,
        BatteryInstallDate: formatDateForInput(aedData.BatteryInstallDate),
        PadsInstallDate: formatDateForInput(aedData.PadsInstallDate),
        Latitude: aedData.Latitude.toString(),
        Longitude: aedData.Longitude.toString(),
        BatteryLifespanMonths: aedData.BatteryLifespanMonths.toString(),
        PadsLifespanMonths: aedData.PadsLifespanMonths.toString()
      });
    }
  }, [isEditing, aedData]);

  const formatDateForInput = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!formData.Title.trim()) newErrors.Title = 'AED ID is required';
    if (!formData.BuildingName.trim()) newErrors.BuildingName = 'Building name is required';
    if (!formData.BuildingCode.trim()) newErrors.BuildingCode = 'Building code is required';
    if (!formData.Floor.trim()) newErrors.Floor = 'Floor is required';
    if (!formData.SpecificLocationDescription.trim()) newErrors.SpecificLocationDescription = 'Location description is required';
    if (!formData.Manufacturer.trim()) newErrors.Manufacturer = 'Manufacturer is required';
    if (!formData.Model.trim()) newErrors.Model = 'Model is required';
    if (!formData.SerialNumber.trim()) newErrors.SerialNumber = 'Serial number is required';

    // Validate coordinates
    const lat = parseFloat(formData.Latitude);
    const lng = parseFloat(formData.Longitude);
    if (isNaN(lat) || lat < -90 || lat > 90) {
      newErrors.Latitude = 'Valid latitude required (-90 to 90)';
    }
    if (isNaN(lng) || lng < -180 || lng > 180) {
      newErrors.Longitude = 'Valid longitude required (-180 to 180)';
    }

    // Validate dates
    if (!formData.BatteryInstallDate) newErrors.BatteryInstallDate = 'Battery install date is required';
    if (!formData.PadsInstallDate) newErrors.PadsInstallDate = 'Pads install date is required';

    // Validate lifespans
    const batteryLifespan = parseInt(formData.BatteryLifespanMonths);
    const padsLifespan = parseInt(formData.PadsLifespanMonths);
    if (isNaN(batteryLifespan) || batteryLifespan <= 0) {
      newErrors.BatteryLifespanMonths = 'Valid battery lifespan required';
    }
    if (isNaN(padsLifespan) || padsLifespan <= 0) {
      newErrors.PadsLifespanMonths = 'Valid pads lifespan required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateExpiryDate = (installDate, lifespanMonths) => {
    const install = new Date(installDate);
    const expiry = new Date(install);
    expiry.setMonth(expiry.getMonth() + parseInt(lifespanMonths));
    return expiry.toISOString();
  };

  const handleSave = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please correct the errors in the form');
      return;
    }

    try {
      setLoading(true);
      
      const dataToSave = {
        ...formData,
        Latitude: parseFloat(formData.Latitude),
        Longitude: parseFloat(formData.Longitude),
        BatteryLifespanMonths: parseInt(formData.BatteryLifespanMonths),
        PadsLifespanMonths: parseInt(formData.PadsLifespanMonths),
        BatteryInstallDate: new Date(formData.BatteryInstallDate).toISOString(),
        PadsInstallDate: new Date(formData.PadsInstallDate).toISOString(),
        CalculatedBatteryExpiryDate: calculateExpiryDate(formData.BatteryInstallDate, formData.BatteryLifespanMonths),
        CalculatedPadsExpiryDate: calculateExpiryDate(formData.PadsInstallDate, formData.PadsLifespanMonths),
        LastMonthlyCheckDate: new Date().toISOString()
      };

      if (isEditing) {
        await SharePointAPI.updateAed(dataToSave);
        Alert.alert('Success', 'AED updated successfully', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        await SharePointAPI.addAed(dataToSave);
        Alert.alert('Success', 'AED added successfully', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (error) {
      console.error('Error saving AED:', error);
      Alert.alert('Error', `Failed to ${isEditing ? 'update' : 'add'} AED`);
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Card style={styles.formCard}>
        <Card.Content>
          <Title style={styles.formTitle}>
            {isEditing ? 'Edit AED' : 'Add New AED'}
          </Title>
          
          {/* Basic Information */}
          <Title style={styles.sectionTitle}>Basic Information</Title>
          
          <TextInput
            label="AED ID *"
            value={formData.Title}
            onChangeText={(value) => updateField('Title', value)}
            style={styles.input}
            error={!!errors.Title}
            disabled={isEditing} // Don't allow editing the ID
          />
          <HelperText type="error" visible={!!errors.Title}>
            {errors.Title}
          </HelperText>

          <TextInput
            label="Building Name *"
            value={formData.BuildingName}
            onChangeText={(value) => updateField('BuildingName', value)}
            style={styles.input}
            error={!!errors.BuildingName}
          />
          <HelperText type="error" visible={!!errors.BuildingName}>
            {errors.BuildingName}
          </HelperText>

          <TextInput
            label="Building Code *"
            value={formData.BuildingCode}
            onChangeText={(value) => updateField('BuildingCode', value)}
            style={styles.input}
            error={!!errors.BuildingCode}
          />
          <HelperText type="error" visible={!!errors.BuildingCode}>
            {errors.BuildingCode}
          </HelperText>

          <TextInput
            label="Floor *"
            value={formData.Floor}
            onChangeText={(value) => updateField('Floor', value)}
            style={styles.input}
            error={!!errors.Floor}
          />
          <HelperText type="error" visible={!!errors.Floor}>
            {errors.Floor}
          </HelperText>

          <TextInput
            label="Specific Location Description *"
            value={formData.SpecificLocationDescription}
            onChangeText={(value) => updateField('SpecificLocationDescription', value)}
            style={styles.input}
            multiline
            numberOfLines={2}
            error={!!errors.SpecificLocationDescription}
          />
          <HelperText type="error" visible={!!errors.SpecificLocationDescription}>
            {errors.SpecificLocationDescription}
          </HelperText>

          <View style={styles.switchContainer}>
            <Title style={styles.switchLabel}>Publicly Accessible</Title>
            <Switch
              value={formData.PubliclyAccessible}
              onValueChange={(value) => updateField('PubliclyAccessible', value)}
            />
          </View>

          <Divider style={styles.divider} />

          {/* Location Coordinates */}
          <Title style={styles.sectionTitle}>Coordinates</Title>
          
          <TextInput
            label="Latitude *"
            value={formData.Latitude}
            onChangeText={(value) => updateField('Latitude', value)}
            style={styles.input}
            keyboardType="numeric"
            error={!!errors.Latitude}
          />
          <HelperText type="error" visible={!!errors.Latitude}>
            {errors.Latitude}
          </HelperText>

          <TextInput
            label="Longitude *"
            value={formData.Longitude}
            onChangeText={(value) => updateField('Longitude', value)}
            style={styles.input}
            keyboardType="numeric"
            error={!!errors.Longitude}
          />
          <HelperText type="error" visible={!!errors.Longitude}>
            {errors.Longitude}
          </HelperText>

          <Divider style={styles.divider} />

          {/* Device Information */}
          <Title style={styles.sectionTitle}>Device Information</Title>
          
          <TextInput
            label="Manufacturer *"
            value={formData.Manufacturer}
            onChangeText={(value) => updateField('Manufacturer', value)}
            style={styles.input}
            error={!!errors.Manufacturer}
          />
          <HelperText type="error" visible={!!errors.Manufacturer}>
            {errors.Manufacturer}
          </HelperText>

          <TextInput
            label="Model *"
            value={formData.Model}
            onChangeText={(value) => updateField('Model', value)}
            style={styles.input}
            error={!!errors.Model}
          />
          <HelperText type="error" visible={!!errors.Model}>
            {errors.Model}
          </HelperText>

          <TextInput
            label="Serial Number *"
            value={formData.SerialNumber}
            onChangeText={(value) => updateField('SerialNumber', value)}
            style={styles.input}
            error={!!errors.SerialNumber}
          />
          <HelperText type="error" visible={!!errors.SerialNumber}>
            {errors.SerialNumber}
          </HelperText>

          <Divider style={styles.divider} />

          {/* Battery Information */}
          <Title style={styles.sectionTitle}>Battery Information</Title>
          
          <TextInput
            label="Battery Install Date *"
            value={formData.BatteryInstallDate}
            onChangeText={(value) => updateField('BatteryInstallDate', value)}
            style={styles.input}
            placeholder="YYYY-MM-DD"
            error={!!errors.BatteryInstallDate}
          />
          <HelperText type="error" visible={!!errors.BatteryInstallDate}>
            {errors.BatteryInstallDate}
          </HelperText>

          <TextInput
            label="Battery Lifespan (months) *"
            value={formData.BatteryLifespanMonths}
            onChangeText={(value) => updateField('BatteryLifespanMonths', value)}
            style={styles.input}
            keyboardType="numeric"
            error={!!errors.BatteryLifespanMonths}
          />
          <HelperText type="error" visible={!!errors.BatteryLifespanMonths}>
            {errors.BatteryLifespanMonths}
          </HelperText>

          <Divider style={styles.divider} />

          {/* Pads Information */}
          <Title style={styles.sectionTitle}>Pads Information</Title>
          
          <TextInput
            label="Pads Install Date *"
            value={formData.PadsInstallDate}
            onChangeText={(value) => updateField('PadsInstallDate', value)}
            style={styles.input}
            placeholder="YYYY-MM-DD"
            error={!!errors.PadsInstallDate}
          />
          <HelperText type="error" visible={!!errors.PadsInstallDate}>
            {errors.PadsInstallDate}
          </HelperText>

          <Title style={styles.radioTitle}>Pads Type</Title>
          <RadioButton.Group 
            onValueChange={(value) => updateField('PadsType', value)} 
            value={formData.PadsType}
          >
            <View style={styles.radioOption}>
              <RadioButton value="Adult" />
              <Title style={styles.radioLabel}>Adult</Title>
            </View>
            <View style={styles.radioOption}>
              <RadioButton value="Pediatric" />
              <Title style={styles.radioLabel}>Pediatric</Title>
            </View>
            <View style={styles.radioOption}>
              <RadioButton value="Adult/Pediatric" />
              <Title style={styles.radioLabel}>Adult/Pediatric</Title>
            </View>
          </RadioButton.Group>

          <TextInput
            label="Pads Lifespan (months) *"
            value={formData.PadsLifespanMonths}
            onChangeText={(value) => updateField('PadsLifespanMonths', value)}
            style={styles.input}
            keyboardType="numeric"
            error={!!errors.PadsLifespanMonths}
          />
          <HelperText type="error" visible={!!errors.PadsLifespanMonths}>
            {errors.PadsLifespanMonths}
          </HelperText>

          <Divider style={styles.divider} />

          {/* Additional Information */}
          <Title style={styles.sectionTitle}>Additional Information</Title>
          
          <TextInput
            label="Notes"
            value={formData.Notes}
            onChangeText={(value) => updateField('Notes', value)}
            style={styles.input}
            multiline
            numberOfLines={3}
          />

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <Button
              mode="outlined"
              onPress={() => navigation.goBack()}
              style={styles.cancelButton}
              disabled={loading}
            >
              Cancel
            </Button>
            
            <Button
              mode="contained"
              onPress={handleSave}
              style={styles.saveButton}
              loading={loading}
              disabled={loading}
            >
              {isEditing ? 'Update AED' : 'Add AED'}
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
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  formCard: {
    elevation: 2,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 16,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 12,
  },
  input: {
    marginBottom: 4,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 16,
  },
  switchLabel: {
    fontSize: 16,
  },
  divider: {
    marginVertical: 16,
  },
  radioTitle: {
    fontSize: 16,
    marginBottom: 8,
    marginTop: 8,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  radioLabel: {
    fontSize: 16,
    marginLeft: 8,
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
  saveButton: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: '#1976D2',
  },
});

export default EditAEDScreen;