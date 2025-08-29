import React, { useState } from 'react';
import { View, Text, ScrollView, Image, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { colors, spacing, borderRadius, shadows } from '../constants/colors';

/**
 * EditableListingCard - A form-based listing card where everything is editable with touch
 * @param {Object} props - Component props
 * @param {Object} props.listing - Listing data object
 * @param {Function} props.onPost - Callback when post is pressed
 * @param {Function} props.onDataChange - Callback when any field changes
 */
export default function EditableListingCard({ listing, onPost, onDataChange }) {
  const [isPosting, setIsPosting] = useState(false);
  
  // Debug logging
  console.log('🔍 EditableListingCard received listing:', {
    id: listing?.id,
    hasPhotos: !!listing?.photos,
    photoCount: listing?.photos?.length || 0,
    hasHostedPhotos: !!listing?.hostedPhotos,
    hostedPhotoCount: listing?.hostedPhotos?.length || 0,
    photos: listing?.photos?.map((p, i) => ({ index: i, uri: p?.uri?.substring(0, 30) + '...' })) || [],
    hostedPhotos: listing?.hostedPhotos?.map((p, i) => ({ index: i, url: p?.url?.substring(0, 50) + '...' })) || []
  });
  const [listingData, setListingData] = useState({
    title: listing?.title || 'Untitled Listing',
    price: listing?.price || '0.00',
    condition: listing?.condition || 'Used',
    category: listing?.category || 'Uncategorized',
    description: listing?.description || '',
    // Item specifics from OpenAI
    author: listing?.item_specifics?.Author || listing?.Author || '',
    format: listing?.item_specifics?.Format || listing?.Format || 'Hardcover',
    language: listing?.item_specifics?.Language || listing?.Language || 'English',
    topic: listing?.item_specifics?.Topic || listing?.Topic || '',
    publisher: listing?.item_specifics?.Publisher || listing?.Publisher || '',
    publicationYear: listing?.item_specifics?.['Publication Year'] || listing?.['Publication Year'] || '',
    isbn: listing?.item_specifics?.ISBN || listing?.ISBN || '',
    edition: listing?.edition || '1st Edition',
    series: listing?.series || '',
    readingLevel: listing?.readingLevel || 'Adult',
    numberOfPages: listing?.numberOfPages || '',
    specialFeatures: listing?.specialFeatures || '',
    // Shipping and quantity
    shipping: listing?.shipping || 'USPS Media Mail',
    quantity: listing?.quantity || 1,
    photos: listing?.photos || [],
    // Preserve the original listing data for posting
    id: listing?.id,
    hostedPhotos: listing?.hostedPhotos || [],
    listingType: listing?.listingType,
    parsedListing: listing?.parsedListing,
  });

  const handleFieldChange = (field, value) => {
    const newData = { ...listingData, [field]: value };
    setListingData(newData);
    if (onDataChange) {
      onDataChange(newData);
    }
  };

  const handlePostListing = async () => {
    if (isPosting || !onPost) return;
    
    setIsPosting(true);
    try {
      // Include all necessary data for posting, preserving hostedPhotos from original listing
      const postData = {
        ...listingData,
        // Ensure we have the critical fields for posting
        id: listing?.id || listingData.id,
        hostedPhotos: listing?.hostedPhotos || listingData.hostedPhotos || [],
        listingType: listing?.listingType || listingData.listingType
      };
      
      console.log('📤 EditableListingCard posting data:', {
        id: postData.id,
        title: postData.title,
        hasHostedPhotos: !!postData.hostedPhotos,
        hostedPhotoCount: postData.hostedPhotos?.length || 0
      });
      
      await onPost(postData);
    } finally {
      setIsPosting(false);
    }
  };

  if (!listing) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Top section - Photos, Title, Price, Condition (keep as display) */}
      <ScrollView horizontal style={styles.photoContainer} showsHorizontalScrollIndicator={false}>
        {listingData.photos.map((photo, index) => (
          <Image key={index} source={{ uri: photo.uri }} style={styles.photo} />
        ))}
      </ScrollView>

      <View style={styles.contentContainer}>
        {/* Title - Editable with character counter */}
        <TouchableOpacity style={styles.fieldContainer}>
          <View style={styles.titleLabelRow}>
            <Text style={styles.fieldLabel}>Title:</Text>
            <Text style={[
              styles.characterCount,
              listingData.title.length > 80 ? styles.characterCountOver : styles.characterCountNormal
            ]}>
              {listingData.title.length}/80
            </Text>
          </View>
          <TextInput
            style={[
              styles.titleInput,
              listingData.title.length > 80 ? styles.inputError : null
            ]}
            value={listingData.title}
            onChangeText={(value) => handleFieldChange('title', value)}
            multiline
            numberOfLines={2}
            placeholder="Enter listing title"
            maxLength={80}
          />
          {listingData.title.length > 80 && (
            <Text style={styles.errorText}>
              Title must be 80 characters or less for eBay
            </Text>
          )}
        </TouchableOpacity>
        
        {/* Price and Condition Row */}
        <View style={styles.priceConditionRow}>
          <TouchableOpacity style={[styles.fieldContainer, { flex: 1, marginRight: spacing.sm }]}>
            <Text style={styles.fieldLabel}>Price:</Text>
            <TextInput
              style={styles.priceInput}
              value={listingData.price.toString()}
              onChangeText={(value) => handleFieldChange('price', value)}
              keyboardType="decimal-pad"
              placeholder="0.00"
            />
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.fieldContainer, { flex: 1 }]}>
            <Text style={styles.fieldLabel}>Condition:</Text>
            <TextInput
              style={styles.conditionInput}
              value={listingData.condition}
              onChangeText={(value) => handleFieldChange('condition', value)}
              placeholder="Very Good"
            />
          </TouchableOpacity>
        </View>

        {/* Category */}
        <TouchableOpacity style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Category:</Text>
          <TextInput
            style={styles.textInput}
            value={listingData.category}
            onChangeText={(value) => handleFieldChange('category', value)}
            placeholder="Books & Magazines > Books"
          />
        </TouchableOpacity>

        {/* Description */}
        <TouchableOpacity style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Description:</Text>
          <TextInput
            style={styles.descriptionInput}
            value={listingData.description}
            onChangeText={(value) => handleFieldChange('description', value)}
            multiline
            numberOfLines={4}
            placeholder="Enter item description..."
          />
        </TouchableOpacity>

        {/* Author */}
        <TouchableOpacity style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Author:</Text>
          <TextInput
            style={styles.textInput}
            value={listingData.author}
            onChangeText={(value) => handleFieldChange('author', value)}
            placeholder="Author name"
          />
        </TouchableOpacity>

        {/* Format */}
        <TouchableOpacity style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Format:</Text>
          <TextInput
            style={styles.textInput}
            value={listingData.format}
            onChangeText={(value) => handleFieldChange('format', value)}
            placeholder="Hardcover"
          />
        </TouchableOpacity>

        {/* Publisher */}
        <TouchableOpacity style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Publisher:</Text>
          <TextInput
            style={styles.textInput}
            value={listingData.publisher}
            onChangeText={(value) => handleFieldChange('publisher', value)}
            placeholder="Publisher name"
          />
        </TouchableOpacity>

        {/* Publication Year */}
        <TouchableOpacity style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Publication Year:</Text>
          <TextInput
            style={styles.textInput}
            value={listingData.publicationYear}
            onChangeText={(value) => handleFieldChange('publicationYear', value)}
            keyboardType="numeric"
            placeholder="2023"
          />
        </TouchableOpacity>

        {/* ISBN */}
        <TouchableOpacity style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>ISBN:</Text>
          <TextInput
            style={styles.textInput}
            value={listingData.isbn}
            onChangeText={(value) => handleFieldChange('isbn', value)}
            placeholder="ISBN number"
          />
        </TouchableOpacity>

        {/* Edition */}
        <TouchableOpacity style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Edition:</Text>
          <TextInput
            style={styles.textInput}
            value={listingData.edition}
            onChangeText={(value) => handleFieldChange('edition', value)}
            placeholder="1st Edition"
          />
        </TouchableOpacity>

        {/* Language */}
        <TouchableOpacity style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Language:</Text>
          <TextInput
            style={styles.textInput}
            value={listingData.language}
            onChangeText={(value) => handleFieldChange('language', value)}
            placeholder="English"
          />
        </TouchableOpacity>

        {/* Topic/Subject */}
        <TouchableOpacity style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Topic/Subject:</Text>
          <TextInput
            style={styles.textInput}
            value={listingData.topic}
            onChangeText={(value) => handleFieldChange('topic', value)}
            placeholder="Subject or topic"
          />
        </TouchableOpacity>

        {/* Shipping and Quantity Row */}
        <View style={styles.shippingQuantityRow}>
          <TouchableOpacity style={[styles.fieldContainer, { flex: 2, marginRight: spacing.sm }]}>
            <Text style={styles.fieldLabel}>Shipping:</Text>
            <TextInput
              style={styles.textInput}
              value={listingData.shipping}
              onChangeText={(value) => handleFieldChange('shipping', value)}
              placeholder="USPS Media Mail"
            />
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.fieldContainer, { flex: 1 }]}>
            <Text style={styles.fieldLabel}>Qty:</Text>
            <TextInput
              style={styles.textInput}
              value={listingData.quantity.toString()}
              onChangeText={(value) => handleFieldChange('quantity', parseInt(value) || 1)}
              keyboardType="numeric"
              placeholder="1"
            />
          </TouchableOpacity>
        </View>

        {/* Post to eBay Button - Only button needed */}
        <TouchableOpacity 
          style={[styles.postButton, isPosting && styles.postButtonDisabled]} 
          onPress={handlePostListing}
          disabled={isPosting}
        >
          <Text style={styles.postButtonText}>
            {isPosting ? 'Posting...' : 'Post to eBay'}
          </Text>
        </TouchableOpacity>
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
  fieldContainer: {
    marginBottom: spacing.md,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  titleInput: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    backgroundColor: colors.surface,
    textAlignVertical: 'top',
  },
  priceConditionRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  priceInput: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    backgroundColor: colors.surface,
  },
  conditionInput: {
    fontSize: 14,
    color: colors.textSecondary,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    backgroundColor: colors.surface,
  },
  textInput: {
    fontSize: 14,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    backgroundColor: colors.surface,
  },
  descriptionInput: {
    fontSize: 14,
    color: colors.textSecondary,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    backgroundColor: colors.surface,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  shippingQuantityRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  postButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    marginTop: spacing.sm,
  },
  postButtonDisabled: {
    backgroundColor: colors.textMuted,
    opacity: 0.6,
  },
  postButtonText: {
    color: colors.textInverse,
    fontWeight: '600',
    fontSize: 16,
  },
  titleLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  characterCount: {
    fontSize: 12,
    fontWeight: '500',
  },
  characterCountNormal: {
    color: colors.textMuted,
  },
  characterCountOver: {
    color: colors.error || '#e74c3c',
  },
  inputError: {
    borderColor: colors.error || '#e74c3c',
    borderWidth: 2,
  },
  errorText: {
    fontSize: 12,
    color: colors.error || '#e74c3c',
    marginTop: spacing.xs,
    fontWeight: '500',
  },
});