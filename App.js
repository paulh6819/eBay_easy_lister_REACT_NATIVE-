import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { PhotoProvider } from './src/contexts/PhotoContext';
import { ListingProvider } from './src/contexts/ListingContext';
import { TemplateProvider } from './src/contexts/TemplateContext';
import MainNavigator from './src/navigation/MainNavigator';

export default function App() {
  return (
    <PhotoProvider>
      <ListingProvider>
        <TemplateProvider>
          <NavigationContainer>
            <MainNavigator />
            <StatusBar style="auto" />
          </NavigationContainer>
        </TemplateProvider>
      </ListingProvider>
    </PhotoProvider>
  );
}