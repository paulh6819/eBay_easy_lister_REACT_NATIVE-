import React, { useState } from 'react';
import { View, Text, ScrollView, Image, StyleSheet, TouchableOpacity, TextInput, Modal } from 'react-native';
import { colors, spacing, borderRadius, shadows } from '../constants/colors';

/**
 * ListingCard component for displaying generated listing metadata
 * @param {Object} props - Component props
 * @param {Object} props.listing - Listing data object
 * @param {Function} props.onEdit - Callback when edit is pressed
 * @param {Function} props.onPost - Callback when post is pressed
 */
export default function ListingCard({ listing, onEdit, onPost }) {
  if (!listing) {
    return null;
  }

  const {
    title = 'Untitled Listing',
    description = 'No description available',
    price = '0.00',
    category = 'Uncategorized',
    condition = 'Used',
    photos = [],
    shipping = 'Standard',
    quantity = 1,
  } = listing;

  return (
    <View style={styles.container}>
      <ScrollView horizontal style={styles.photoContainer}>
        {photos.map((photo, index) => (
          <Image key={index} source={{ uri: photo.uri }} style={styles.photo} />
        ))}
      </ScrollView>

      <View style={styles.contentContainer}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        
        <View style={styles.priceContainer}>
          <Text style={styles.price}>${price}</Text>
          <Text style={styles.condition}>{condition}</Text>
        </View>

        <Text style={styles.category}>{category}</Text>

        <Text style={styles.description} numberOfLines={3}>
          {description}
        </Text>

        <View style={styles.detailsContainer}>
          <Text style={styles.detail}>Qty: {quantity}</Text>
          <Text style={styles.detail}>Shipping: {shipping}</Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.editButton} onPress={onEdit}>
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.postButton} onPress={onPost}>
            <Text style={styles.postButtonText}>Post to eBay</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    marginVertical: spacing.sm,
    borderWidth: 2,
    borderColor: colors.border,
    ...shadows.md,
  },
  photoContainer: {
    padding: spacing.sm,
  },
  photo: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.sm,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  contentContainer: {
    padding: spacing.md,
    paddingTop: 0,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
  },
  condition: {
    fontSize: 14,
    color: colors.textSecondary,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  category: {
    fontSize: 14,
    color: colors.primary,
    marginBottom: spacing.sm,
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  detail: {
    fontSize: 12,
    color: colors.textMuted,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  editButton: {
    flex: 1,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  editButtonText: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  postButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  postButtonText: {
    color: colors.textInverse,
    fontWeight: '600',
  },
});