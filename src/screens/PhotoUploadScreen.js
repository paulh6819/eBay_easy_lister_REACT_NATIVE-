import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, ScrollView, TouchableOpacity, Text, StyleSheet, SafeAreaView } from 'react-native';
import { usePhotos } from '../contexts/PhotoContext';
import PhotoUploader from '../components/PhotoUploader';
import CameraCapture from '../components/CameraCapture';
import BatchControls from '../components/BatchControls';
import PhotoGroupPreview from '../components/PhotoGroupPreview';
import ListingTypeSelector from '../components/ListingTypeSelector';
import CreateListingButton from '../components/CreateListingButton';
import Results from '../components/Results';
import { colors, spacing, borderRadius, shadows } from '../constants/colors';
import { getRandomProcessingMessage } from '../constants/loadingMessages';

export default function PhotoUploadScreen({ navigation }) {
  const { uploadedPhotos, photosPerListing, clearPhotos } = usePhotos();
  const [selectedListingType, setSelectedListingType] = useState(null);
  const [generatedListings, setGeneratedListings] = useState([]);
  const [processingListings, setProcessingListings] = useState([]);

  // Load saved listing type from AsyncStorage on component mount
  useEffect(() => {
    loadSelectedListingType();
  }, []);

  const loadSelectedListingType = async () => {
    try {
      const savedListingType = await AsyncStorage.getItem('selectedListingType');
      if (savedListingType) {
        setSelectedListingType(savedListingType);
      }
    } catch (error) {
      console.log('Error loading listing type:', error);
    }
  };

  const saveSelectedListingType = async (listingType) => {
    try {
      await AsyncStorage.setItem('selectedListingType', listingType);
    } catch (error) {
      console.log('Error saving listing type:', error);
    }
  };

  const handleStartProcessing = () => {
    // Create a processing placeholder when user clicks Generate
    const processingId = Date.now() + Math.random();
    const processingItem = {
      id: processingId,
      timestamp: new Date().toISOString(),
      status: 'processing',
      listingType: selectedListingType,
      message: getRandomProcessingMessage() // Generate unique message for each processing item
    };
    
    setProcessingListings(prev => [...prev, processingItem]);
    console.log('🔄 Started processing listing with ID:', processingId);
    return processingId;
  };

  const handleCreateListing = (listingData, processingId) => {
    // Remove the processing placeholder
    if (processingId) {
      setProcessingListings(prev => prev.filter(item => item.id !== processingId));
    }

    // Handle errors
    if (listingData.error) {
      console.error('❌ Error creating listing:', listingData.error);
      // Could show error toast here
      return;
    }

    console.log('✅ Listing created successfully:', listingData);
    
    // Create a new listing object with unique ID and hosted photo URLs
    const newListing = {
      id: Date.now() + Math.random(), // Unique ID
      timestamp: new Date().toISOString(),
      photos: listingData.photos,
      hostedPhotos: listingData.hostedPhotos || [], // GameSighter URLs ready for eBay
      listingType: listingData.listingType,
      parsedListing: listingData.parsedListing,
      rawResponse: listingData.rawResponse,
      status: 'ready' // ready, editing, posted
    };
    
    setGeneratedListings(prevListings => [...prevListings, newListing]);
    
    // Photos are already cleared when user clicked Generate button
    // Keep the listing type selected so user can easily create more of the same type
    
    console.log('📋 Added new listing to results. Form was already cleared for next listing.');
  };

  const handleListingTypeChange = (listingType) => {
    setSelectedListingType(listingType);
    saveSelectedListingType(listingType);
  };

  const handleClearAllListings = () => {
    setGeneratedListings([]);
    console.log('🗑️ Cleared all generated listings');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Upload Photos</Text>
          <Text style={styles.subtitle}>
            Select photos to create eBay listings
          </Text>
          
          <BatchControls />
        </View>

        <CameraCapture />
        
        <PhotoUploader />
        
        {uploadedPhotos.length > 0 && (
          <>
            <PhotoGroupPreview />
            <ListingTypeSelector 
              onSelectionChange={handleListingTypeChange}
              initialValue={selectedListingType}
            />
          </>
        )}

        {/* Results Section - Visible when there are listings or processing items */}
        {(generatedListings.length > 0 || processingListings.length > 0) && (
          <Results 
            listings={generatedListings}
            processingListings={processingListings}
            onClearAll={handleClearAllListings}
          />
        )}
      </ScrollView>

      {uploadedPhotos.length > 0 && (
        <View style={styles.bottomContainer}>
          <TouchableOpacity 
            style={styles.clearButton} 
            onPress={clearPhotos}
          >
            <Text style={styles.clearButtonText}>Clear Photos</Text>
          </TouchableOpacity>
          
          <CreateListingButton
            photos={uploadedPhotos}
            selectedListingType={selectedListingType}
            onPress={handleCreateListing}
            onPhotoClear={clearPhotos}
            onStartProcessing={handleStartProcessing}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    padding: spacing.md,
    backgroundColor: colors.cardBackground,
    borderBottomWidth: 2,
    borderBottomColor: colors.border,
    borderRadius: borderRadius.lg,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    ...shadows.sm,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  bottomContainer: {
    flexDirection: 'row',
    padding: spacing.md,
    backgroundColor: colors.cardBackground,
    borderTopWidth: 2,
    borderTopColor: colors.border,
    gap: spacing.sm,
    borderRadius: borderRadius.lg,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  clearButton: {
    flex: 1,
    borderWidth: 2,
    borderColor: colors.error,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  clearButtonText: {
    color: colors.error,
    fontWeight: '600',
    fontSize: 16,
  },
});