import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  Alert, 
  Image,
  TouchableOpacity,
  Platform,
  PermissionsAndroid 
} from 'react-native';
import { 
  Card, 
  Title, 
  Button, 
  TextInput, 
  HelperText,
  Chip,
  ActivityIndicator,
  Paragraph,
  Surface,
  Divider
} from 'react-native-paper';
import { SharePointAPI } from '../api/SharePointAPI';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import Geolocation from '@react-native-community/geolocation';

const EditAEDScreen = ({ route, navigation }) => {
  const { mode, aedData } = route.params;
  const isEditMode = mode === 'edit';
  
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
    BatteryInstallDate: new Date().toISOString().split('T')[0],
    BatteryLifespanMonths: '24',
    PadsInstallDate: new Date().toISOString().split('T')[0],
    PadsType: 'Adult',
    PadsLifespanMonths: '24',
    Notes: '',
    PhotoOfLocation: null
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [photoUri, setPhotoUri] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);

  // Populate form if editing
  useEffect(() => {
    if (isEditMode && aedData) {
      setFormData({
        Title: aedData.Title || '',
        BuildingName: aedData.BuildingName || '',
        BuildingCode: aedData.BuildingCode || '',
        Floor: aedData.Floor || '',
        SpecificLocationDescription: aedData.SpecificLocationDescription || '',
        Latitude: aedData.Latitude?.toString() || '',
        Longitude: aedData.Longitude?.toString() || '',
        PubliclyAccessible: aedData.PubliclyAccessible !== false,
        Manufacturer: aedData.Manufacturer || '',
        Model: aedData.Model || '',
        SerialNumber: aedData.SerialNumber || '',
        BatteryInstallDate: aedData.BatteryInstallDate?.split('T')[0] || new Date().toISOString().split('T')[0],
        BatteryLifespanMonths: aedData.BatteryLifespanMonths?.toString() || '24',
        PadsInstallDate: aedData.PadsInstallDate?.split('T')[0] || new Date().toISOString().split('T')[0],
        PadsType: aedData.PadsType || 'Adult',
        PadsLifespanMonths: aedData.PadsLifespanMonths?.toString() || '24',
        Notes: aedData.Notes || '',
        PhotoOfLocation: aedData.PhotoOfLocation || null
      });
      if (aedData.PhotoOfLocation) {
        setPhotoUri(aedData.PhotoOfLocation);
      }
    }
  }, [isEditMode, aedData]);

  // Auto-populate GPS coordinates for new AEDs
  useEffect(() => {
    if (!isEditMode && !formData.Latitude && !formData.Longitude) {
      getCurrentLocation();
    }
  }, []);

  const getCurrentLocation = async () => {
    setLocationLoading(true);
    
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Permission Required', 'Location permission is needed to auto-fill coordinates.');
          setLocationLoading(false);
          return;
        }
      }

      Geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            Latitude: position.coords.latitude.toFixed(6),
            Longitude: position.coords.longitude.toFixed(6)
          }));
          setLocationLoading(false);
        },
        (error) => {
          console.log('Error getting location:', error);
          Alert.alert('Location Error', 'Could not get current location. Please enter coordinates manually.');
          setLocationLoading(false);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    } catch (error) {
      console.log('Location permission error:', error);
      setLocationLoading(false);
    }
  };

  const handleCameraLaunch = () => {
    Alert.alert(
      'Select Photo',
      'Choose how you want to add a photo',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Camera', onPress: () => openCamera() },
        { text: 'Photo Library', onPress: () => openImageLibrary() }
      ]
    );
  };

  const openCamera = () => {
    const options = {
      mediaType: 'photo',
      quality: 0.7,
      maxWidth: 1024,
      maxHeight: 1024,
    };

    launchCamera(options, (response) => {
      if (response.didCancel || response.error) {
        return;
      }
      
      if (response.assets && response.assets[0]) {
        setPhotoUri(response.assets[0].uri);
        setFormData(prev => ({
          ...prev,
          PhotoOfLocation: response.assets[0].uri
        }));
      }
    });
  };

  const openImageLibrary = () => {
    const options = {
      mediaType: 'photo',
      quality: 0.7,
      maxWidth: 1024,
      maxHeight: 1024,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel || response.error) {
        return;
      }
      
      if (response.assets && response.assets[0]) {
        setPhotoUri(response.assets[0].uri);
        setFormData(prev => ({
          ...prev,
          PhotoOfLocation: response.assets[0].uri
        }));
      }
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.Title.trim()) newErrors.Title = 'Title is required';
    if (!formData.BuildingName.trim()) newErrors.BuildingName = 'Building name is required';
    if (!formData.Floor.trim()) newErrors.Floor = 'Floor is required';
    if (!formData.SpecificLocationDescription.trim()) {
      newErrors.SpecificLocationDescription = 'Specific location is required';
    }
    if (!formData.Manufacturer.trim()) newErrors.Manufacturer = 'Manufacturer is required';
    if (!formData.Model.trim()) newErrors.Model = 'Model is required';
    if (!formData.SerialNumber.trim()) newErrors.SerialNumber = 'Serial number is required';

    // Validate coordinates
    const lat = parseFloat(formData.Latitude);
    const lng = parseFloat(formData.Longitude);
    if (isNaN(lat) || lat < -90 || lat > 90) {
      newErrors.Latitude = 'Valid latitude (-90 to 90) is required';
    }
    if (isNaN(lng) || lng < -180 || lng > 180) {
      newErrors.Longitude = 'Valid longitude (-180 to 180) is required';
    }

    // Validate lifespan months
    const batteryLifespan = parseInt(formData.BatteryLifespanMonths);
    const padsLifespan = parseInt(formData.PadsLifespanMonths);
    if (isNaN(batteryLifespan) || batteryLifespan < 1 || batteryLifespan > 120) {
      newErrors.BatteryLifespanMonths = 'Battery lifespan must be 1-120 months';
    }
    if (isNaN(padsLifespan) || padsLifespan < 1 || padsLifespan > 120) {
      newErrors.PadsLifespanMonths = 'Pads lifespan must be 1-120 months';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors before saving.');
      return;
    }

    setLoading(true);
    try {
      // Prepare data for API
      const dataToSave = {
        ...formData,
        Latitude: parseFloat(formData.Latitude),
        Longitude: parseFloat(formData.Longitude),
        BatteryLifespanMonths: parseInt(formData.BatteryLifespanMonths),
        PadsLifespanMonths: parseInt(formData.PadsLifespanMonths),
        BatteryInstallDate: formData.BatteryInstallDate + 'T00:00:00Z',
        PadsInstallDate: formData.PadsInstallDate + 'T00:00:00Z'
      };

      let result;
      if (isEditMode) {
        result = await SharePointAPI.updateAed(dataToSave);
        Alert.alert('Success', 'AED updated successfully!');
      } else {
        result = await SharePointAPI.addAed(dataToSave);
        Alert.alert('Success', 'AED added successfully!');
      }
      
      navigation.goBack();
    } catch (error) {
      console.error('Error saving AED:', error);
      Alert.alert('Error', 'Failed to save AED. Please try again.');
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
      <Card style={styles.headerCard}>
        <Card.Content>
          <Title style={styles.screenTitle}>
            {isEditMode ? 'Edit AED' : 'Add New AED'}
          </Title>
          <Paragraph style={styles.screenSubtitle}>
            {isEditMode ? 'Update AED information' : 'Enter details for new AED'}
          </Paragraph>
        </Card.Content>
      </Card>

      {/* Basic Information */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Basic Information</Title>
          
          <TextInput
            label="AED Title/ID *"
            value={formData.Title}
            onChangeText={(text) => updateField('Title', text)}
            error={!!errors.Title}
            style={styles.input}
            placeholder="e.g., CU-AED-001"
          />
          <HelperText type="error" visible={!!errors.Title}>
            {errors.Title}
          </HelperText>

          <TextInput
            label="Building Name *"
            value={formData.BuildingName}
            onChangeText={(text) => updateField('BuildingName', text)}
            error={!!errors.BuildingName}
            style={styles.input}
            placeholder="e.g., Engineering Center"
          />
          <HelperText type="error" visible={!!errors.BuildingName}>
            {errors.BuildingName}
          </HelperText>

          <TextInput
            label="Building Code"
            value={formData.BuildingCode}
            onChangeText={(text) => updateField('BuildingCode', text)}
            style={styles.input}
            placeholder="e.g., ECOT"
          />

          <TextInput
            label="Floor *"
            value={formData.Floor}
            onChangeText={(text) => updateField('Floor', text)}
            error={!!errors.Floor}
            style={styles.input}
            placeholder="e.g., 1, 2, Basement, Mezzanine"
          />
          <HelperText type="error" visible={!!errors.Floor}>
            {errors.Floor}
          </HelperText>

          <TextInput
            label="Specific Location Description *"
            value={formData.SpecificLocationDescription}
            onChangeText={(text) => updateField('SpecificLocationDescription', text)}
            error={!!errors.SpecificLocationDescription}
            style={styles.input}
            multiline
            numberOfLines={3}
            placeholder="e.g., East wing, near north elevator, mounted on wall next to fire extinguisher"
          />
          <HelperText type="error" visible={!!errors.SpecificLocationDescription}>
            {errors.SpecificLocationDescription}
          </HelperText>

          <View style={styles.accessibilityContainer}>
            <Paragraph style={styles.accessibilityLabel}>Publicly Accessible:</Paragraph>
            <View style={styles.chipContainer}>
              <Chip
                selected={formData.PubliclyAccessible}
                onPress={() => updateField('PubliclyAccessible', true)}
                style={styles.chip}
              >
                Yes
              </Chip>
              <Chip
                selected={!formData.PubliclyAccessible}
                onPress={() => updateField('PubliclyAccessible', false)}
                style={styles.chip}
              >
                No
              </Chip>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Location & Photo */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Location & Photo</Title>
          
          <View style={styles.coordinatesContainer}>
            <View style={styles.coordinateInput}>
              <TextInput
                label="Latitude *"
                value={formData.Latitude}
                onChangeText={(text) => updateField('Latitude', text)}
                error={!!errors.Latitude}
                keyboardType="numeric"
                placeholder="40.007581"
              />
              <HelperText type="error" visible={!!errors.Latitude}>
                {errors.Latitude}
              </HelperText>
            </View>
            
            <View style={styles.coordinateInput}>
              <TextInput
                label="Longitude *"
                value={formData.Longitude}
                onChangeText={(text) => updateField('Longitude', text)}
                error={!!errors.Longitude}
                keyboardType="numeric"
                placeholder="-105.266837"
              />
              <HelperText type="error" visible={!!errors.Longitude}>
                {errors.Longitude}
              </HelperText>
            </View>
          </View>

          <Button
            mode="outlined"
            onPress={getCurrentLocation}
            style={styles.locationButton}
            icon="crosshairs-gps"
            loading={locationLoading}
            disabled={locationLoading}
          >
            {locationLoading ? 'Getting Location...' : 'Get Current Location'}
          </Button>

          <Divider style={styles.divider} />

          {/* Photo Section */}
          <View style={styles.photoSection}>
            <Paragraph style={styles.photoLabel}>Location Photo:</Paragraph>
            {photoUri ? (
              <View style={styles.photoContainer}>
                <Image source={{ uri: photoUri }} style={styles.photoPreview} />
                <Button
                  mode="outlined"
                  onPress={handleCameraLaunch}
                  style={styles.changePhotoButton}
                  icon="camera"
                >
                  Change Photo
                </Button>
              </View>
            ) : (
              <Button
                mode="outlined"
                onPress={handleCameraLaunch}
                style={styles.addPhotoButton}
                icon="camera-plus"
              >
                Add Location Photo
              </Button>
            )}
          </View>
        </Card.Content>
      </Card>

      {/* Device Information */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Device Information</Title>
          
          <TextInput
            label="Manufacturer *"
            value={formData.Manufacturer}
            onChangeText={(text) => updateField('Manufacturer', text)}
            error={!!errors.Manufacturer}
            style={styles.input}
            placeholder="e.g., Philips, Zoll, Cardiac Science"
          />
          <HelperText type="error" visible={!!errors.Manufacturer}>
            {errors.Manufacturer}
          </HelperText>

          <TextInput
            label="Model *"
            value={formData.Model}
            onChangeText={(text) => updateField('Model', text)}
            error={!!errors.Model}
            style={styles.input}
            placeholder="e.g., HeartStart FRx"
          />
          <HelperText type="error" visible={!!errors.Model}>
            {errors.Model}
          </HelperText>

          <TextInput
            label="Serial Number *"
            value={formData.SerialNumber}
            onChangeText={(text) => updateField('SerialNumber', text)}
            error={!!errors.SerialNumber}
            style={styles.input}
            placeholder="Device serial number"
          />
          <HelperText type="error" visible={!!errors.SerialNumber}>
            {errors.SerialNumber}
          </HelperText>
        </Card.Content>
      </Card>

      {/* Battery Information */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Battery Information</Title>
          
          <TextInput
            label="Battery Install Date *"
            value={formData.BatteryInstallDate}
            onChangeText={(text) => updateField('BatteryInstallDate', text)}
            style={styles.input}
            placeholder="YYYY-MM-DD"
          />

          <TextInput
            label="Battery Lifespan (Months) *"
            value={formData.BatteryLifespanMonths}
            onChangeText={(text) => updateField('BatteryLifespanMonths', text)}
            error={!!errors.BatteryLifespanMonths}
            style={styles.input}
            keyboardType="numeric"
            placeholder="24"
          />
          <HelperText type="error" visible={!!errors.BatteryLifespanMonths}>
            {errors.BatteryLifespanMonths}
          </HelperText>
        </Card.Content>
      </Card>

      {/* Pads Information */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Pads Information</Title>
          
          <TextInput
            label="Pads Install Date *"
            value={formData.PadsInstallDate}
            onChangeText={(text) => updateField('PadsInstallDate', text)}
            style={styles.input}
            placeholder="YYYY-MM-DD"
          />

          <View style={styles.padsTypeContainer}>
            <Paragraph style={styles.padsTypeLabel}>Pads Type:</Paragraph>
            <View style={styles.chipContainer}>
              {['Adult', 'Pediatric', 'Universal'].map(type => (
                <Chip
                  key={type}
                  selected={formData.PadsType === type}
                  onPress={() => updateField('PadsType', type)}
                  style={styles.chip}
                >
                  {type}
                </Chip>
              ))}
            </View>
          </View>

          <TextInput
            label="Pads Lifespan (Months) *"
            value={formData.PadsLifespanMonths}
            onChangeText={(text) => updateField('PadsLifespanMonths', text)}
            error={!!errors.PadsLifespanMonths}
            style={styles.input}
            keyboardType="numeric"
            placeholder="24"
          />
          <HelperText type="error" visible={!!errors.PadsLifespanMonths}>
            {errors.PadsLifespanMonths}
          </HelperText>
        </Card.Content>
      </Card>

      {/* Additional Notes */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Additional Notes</Title>
          
          <TextInput
            label="Notes"
            value={formData.Notes}
            onChangeText={(text) => updateField('Notes', text)}
            style={styles.input}
            multiline
            numberOfLines={4}
            placeholder="Any additional information about this AED..."
          />
        </Card.Content>
      </Card>

      {/* Save Button */}
      <Surface style={styles.saveButtonContainer}>
        <Button
          mode="contained"
          onPress={handleSave}
          style={styles.saveButton}
          contentStyle={styles.saveButtonContent}
          disabled={loading}
          loading={loading}
        >
          {loading ? 'Saving...' : (isEditMode ? 'Update AED' : 'Add AED')}
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
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  headerCard: {
    marginBottom: 16,
    elevation: 4,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  screenSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  sectionCard: {
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  input: {
    marginBottom: 8,
  },
  accessibilityContainer: {
    marginTop: 8,
  },
  accessibilityLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    marginRight: 8,
    marginBottom: 8,
  },
  coordinatesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  coordinateInput: {
    flex: 1,
    marginRight: 8,
  },
  locationButton: {
    marginTop: 8,
    marginBottom: 16,
  },
  divider: {
    marginVertical: 16,
  },
  photoSection: {
    marginTop: 8,
  },
  photoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  photoContainer: {
    alignItems: 'center',
  },
  photoPreview: {
    width: 200,
    height: 150,
    borderRadius: 8,
    marginBottom: 8,
  },
  changePhotoButton: {
    marginTop: 8,
  },
  addPhotoButton: {
    alignSelf: 'flex-start',
  },
  padsTypeContainer: {
    marginBottom: 16,
  },
  padsTypeLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  saveButtonContainer: {
    padding: 16,
    borderRadius: 8,
    elevation: 2,
    backgroundColor: 'white',
  },
  saveButton: {
    backgroundColor: '#1976D2',
    elevation: 2,
  },
  saveButtonContent: {
    paddingVertical: 8,
  },
});

export default EditAEDScreen;