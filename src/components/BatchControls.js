import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { usePhotos } from '../contexts/PhotoContext';
import { colors, spacing, borderRadius, shadows } from '../constants/colors';

/**
 * BatchControls component for managing photos per listing
 * @param {Object} props - Component props
 */
export default function BatchControls() {
  const { photosPerListing, setPhotosPerListing, uploadedPhotos } = usePhotos();

  const batchOptions = [
    { value: 2, label: '2 photos' },
    { value: 3, label: '3 photos' },
    { value: 4, label: '4 photos' },
    { value: 'auto', label: 'Whatever is uploaded' },
  ];

  const estimatedListings = photosPerListing === 'auto' 
    ? '?' 
    : Math.ceil(uploadedPhotos.length / photosPerListing);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Photos per listing:</Text>
      
      <View style={styles.optionsContainer}>
        {batchOptions.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.option,
              photosPerListing === option.value && styles.selectedOption
            ]}
            onPress={() => setPhotosPerListing(option.value)}
          >
            <Text style={[
              styles.optionText,
              photosPerListing === option.value && styles.selectedOptionText
            ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {uploadedPhotos.length > 0 && (
        <Text style={styles.estimate}>
          Estimated listings: {estimatedListings}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacing.sm,
    color: colors.textPrimary,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  option: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
  },
  selectedOption: {
    backgroundColor: colors.primary,
    borderColor: colors.border,
  },
  optionText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  selectedOptionText: {
    color: colors.textInverse,
    fontWeight: '600',
  },
  estimate: {
    marginTop: spacing.sm,
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
});