import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import PhotoUploadScreen from '../screens/PhotoUploadScreen';
import ListingPreviewScreen from '../screens/ListingPreviewScreen';
import TemplatesScreen from '../screens/TemplatesScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function PhotoStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="PhotoUpload" 
        component={PhotoUploadScreen}
        options={{ title: 'Upload Photos' }}
      />
      <Stack.Screen 
        name="ListingPreview" 
        component={ListingPreviewScreen}
        options={{ title: 'Preview Listings' }}
      />
    </Stack.Navigator>
  );
}

export default function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#0066CC',
        tabBarInactiveTintColor: 'gray',
      }}
    >
      <Tab.Screen 
        name="PhotosTab" 
        component={PhotoStack}
        options={{ 
          title: 'Photos',
          headerShown: false,
        }}
      />
      <Tab.Screen 
        name="Templates" 
        component={TemplatesScreen}
        options={{ title: 'Templates' }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
    </Tab.Navigator>
  );
}