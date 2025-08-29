import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, shadows } from '../constants/colors';
import { AI_PROMPTS } from '../constants/prompts';
import { analyzePhotos } from '../services/listingApi';
import { testServerConnection } from '../services/testConnection';
import { parseListingResponse } from '../utils/responseParser';

/**
 * CreateListingButton component for generating listings
 * @param {Object} props - Component props
 * @param {Array} props.photos - Array of uploaded photos
 * @param {Object} props.selectedListingType - Selected listing type from ListingTypeSelector
 * @param {Function} props.onPress - Callback when button is pressed
 * @param {boolean} props.disabled - Whether button is disabled
 */
export default function CreateListingButton({ 
  photos = [], 
  selectedListingType = null, 
  onPress, 
  disabled = false 
}) {
  const [isLoading, setIsLoading] = useState(false);
  const photoCount = photos.length;
  const canCreateListing = photoCount > 0 && selectedListingType;

  const handlePress = async () => {
    if (!canCreateListing || disabled || isLoading) return;

    setIsLoading(true);

    try {
      // First test server connection
      console.log('🔍 Testing server connection...');
      const connectionTest = await testServerConnection();
      if (!connectionTest.success) {
        throw new Error('Cannot connect to server: ' + connectionTest.error);
      }
      console.log('✅ Server connection successful!');

      // Get the appropriate prompt based on listing type
      let prompt;
      switch (selectedListingType.type) {
        case 'BOOK_ITEM':
          prompt = AI_PROMPTS.BOOK_ITEM(photoCount);
          break;
        case 'BOOK_LOTS':
          prompt = AI_PROMPTS.BOOK_ITEM(photoCount); // Will be updated with actual prompt
          break;
        case 'CD_MUSIC':
          prompt = AI_PROMPTS.ELECTRONICS; // Will be updated with actual prompt
          break;
        case 'DVD_MOVIE':
          prompt = AI_PROMPTS.ELECTRONICS; // Will be updated with actual prompt
          break;
        case 'VHS_LISTING':
          prompt = AI_PROMPTS.ELECTRONICS; // Will be updated with actual prompt
          break;
        case 'GENERAL_LISTING':
          prompt = AI_PROMPTS.GENERAL_ITEM;
          break;
        default:
          prompt = AI_PROMPTS.GENERAL_ITEM;
      }

      console.log('Creating listing with type:', selectedListingType.type);
      
      // Call the new /api/analyze endpoint
      const result = await analyzePhotos({
        photos,
        listingType: selectedListingType.type,
        prompt
      });

      console.log('✅ Raw OpenAI Response:', result);

      // Parse the response based on listing type
      const parsedListing = parseListingResponse(result.rawResponse, selectedListingType.type);
      console.log('✅ Parsed Listing:', JSON.stringify(parsedListing, null, 2));

      // Pass results to parent component with hosted photo URLs
      if (onPress) {
        onPress({
          photos,
          hostedPhotos: result.hostedPhotos || [], // GameSighter URLs from analyze endpoint
          listingType: selectedListingType,
          prompt,
          photoCount,
          rawResponse: result,
          parsedListing
        });
      }

    } catch (error) {
      console.error('❌ Error creating listing:', error);
      // You can add error handling here (toast, alert, etc.)
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonText = () => {
    if (photoCount === 0) {
      return 'Upload Photos First';
    }
    if (!selectedListingType) {
      return 'Select Listing Type First';
    }
    if (isLoading || disabled) {
      return 'Creating Listing...';
    }
    return `Create Single Listing (${photoCount})`;
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        (!canCreateListing || disabled || isLoading) && styles.disabledButton
      ]}
      onPress={handlePress}
      disabled={!canCreateListing || disabled || isLoading}
    >
      <Text style={[
        styles.buttonText,
        (!canCreateListing || disabled || isLoading) && styles.disabledButtonText
      ]}>
        {getButtonText()}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flex: 2,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    ...shadows.sm,
  },
  disabledButton: {
    backgroundColor: colors.textMuted,
    borderColor: colors.borderLight,
  },
  buttonText: {
    color: colors.textInverse,
    fontWeight: '600',
    fontSize: 16,
  },
  disabledButtonText: {
    color: colors.textSecondary,
  },
});