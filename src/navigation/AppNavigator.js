import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import AllAEDsScreen from '../screens/AllAEDsScreen';
import AEDDetailScreen from '../screens/AEDDetailScreen';
import EditAEDScreen from '../screens/EditAEDScreen';
import ServiceListScreen from '../screens/ServiceListScreen';
import ScanScreen from '../screens/ScanScreen';
import LogCheckScreen from '../screens/LogCheckScreen';
import SimpleMapScreen from '../screens/SimpleMapScreen';

const Stack = createStackNavigator();

// Custom theme for React Native Paper
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#1976D2',
    accent: '#388E3C',
  },
};

const AppNavigator = () => {
  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerStyle: {
              backgroundColor: '#1976D2',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Stack.Screen 
            name="Home" 
            component={HomeScreen}
            options={{
              title: 'CUEMS AED Management',
              headerTitleStyle: {
                fontSize: 18,
                fontWeight: 'bold',
              },
            }}
          />
          
          <Stack.Screen 
            name="AllAEDs" 
            component={AllAEDsScreen}
            options={{
              title: 'All AEDs',
            }}
          />
          
          <Stack.Screen 
            name="AEDDetail" 
            component={AEDDetailScreen}
            options={({ route }) => ({
              title: route.params?.aedTitle || 'AED Details',
            })}
          />
          
          <Stack.Screen 
            name="EditAED" 
            component={EditAEDScreen}
            options={({ route }) => ({
              title: route.params?.mode === 'edit' ? 'Edit AED' : 'Add New AED',
            })}
          />
          
          <Stack.Screen 
            name="ServiceList" 
            component={ServiceListScreen}
            options={{
              title: 'Service Required',
            }}
          />
          
          <Stack.Screen 
            name="Scan" 
            component={ScanScreen}
            options={{
              title: 'Scan AED QR Code',
            }}
          />
          
          <Stack.Screen 
            name="LogCheck" 
            component={LogCheckScreen}
            options={({ route }) => ({
              title: `Log Check - ${route.params?.aedTitle || 'AED'}`,
            })}
          />
          
          <Stack.Screen 
            name="MapView" 
            component={SimpleMapScreen}
            options={({ route }) => ({
              title: `${route.params?.aed?.Title || 'AED'} Location`,
            })}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
};

export default AppNavigator; 