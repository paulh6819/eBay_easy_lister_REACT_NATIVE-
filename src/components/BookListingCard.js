import React, { useState } from 'react';
import { View, Text, ScrollView, Image, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { colors, spacing, borderRadius, shadows } from '../constants/colors';

/**
 * BookListingCard - Specialized form for book listings with book-specific fields
 * @param {Object} props - Component props
 * @param {Object} props.listing - Book listing data object
 * @param {Function} props.onPost - Callback when post is pressed
 * @param {Function} props.onDataChange - Callback when any field changes
 */
export default function BookListingCard({ listing, onPost, onDataChange }) {
  const [isPosting, setIsPosting] = useState(false);
  
  // Debug logging
  console.log('📖 BookListingCard received listing:', {
    id: listing?.id,
    title: listing?.title,
    hasPhotos: !!listing?.photos,
    photoCount: listing?.photos?.length || 0,
    hasHostedPhotos: !!listing?.hostedPhotos,
    hostedPhotoCount: listing?.hostedPhotos?.length || 0
  });

  const [bookData, setBookData] = useState({
    // Core listing fields
    title: listing?.title || 'Untitled Book',
    price: listing?.price || '0.00',
    condition: listing?.condition || 'Very Good',
    category: listing?.category || 'Books & Magazines > Fiction & Literature',
    description: listing?.description || '',
    
    // Book-specific fields from OpenAI response
    author: listing?.item_specifics?.Author || listing?.Author || '',
    bookTitle: listing?.item_specifics?.['Book Title'] || listing?.['Book Title'] || '',
    format: listing?.item_specifics?.Format || listing?.Format || 'Hardcover',
    language: listing?.item_specifics?.Language || listing?.Language || 'English',
    topic: listing?.item_specifics?.Topic || listing?.Topic || '',
    publisher: listing?.item_specifics?.Publisher || listing?.Publisher || '',
    publicationYear: listing?.item_specifics?.['Publication Year'] || listing?.['Publication Year'] || '',
    isbn: listing?.item_specifics?.ISBN || listing?.ISBN || '',
    
    // Additional book fields
    edition: listing?.edition || '1st Edition',
    series: listing?.series || '',
    readingLevel: listing?.readingLevel || 'Adult',
    numberOfPages: listing?.numberOfPages || '',
    specialFeatures: listing?.specialFeatures || '',
    
    // Shipping and quantity
    shipping: listing?.shipping || 'USPS Media Mail',
    quantity: listing?.quantity || 1,
    
    // Preserve original data
    photos: listing?.photos || [],
    hostedPhotos: listing?.hostedPhotos || [],
    id: listing?.id,
    listingType: 'BOOK_ITEM',
    parsedListing: listing?.parsedListing
  });

  const handleFieldChange = (field, value) => {
    const newData = { ...bookData, [field]: value };
    setBookData(newData);
    if (onDataChange) {
      onDataChange(newData);
    }
  };

  const validateBookData = () => {
    const errors = [];
    
    if (!bookData.title || bookData.title.trim() === '') {
      errors.push('Title is required');
    }
    
    if (!bookData.author || bookData.author.trim() === '') {
      errors.push('Author is required');
    }
    
    if (bookData.isbn && !isValidISBN(bookData.isbn)) {
      errors.push('Invalid ISBN format');
    }
    
    if (!bookData.condition || !['Very Good', 'Good', 'Acceptable'].includes(bookData.condition)) {
      errors.push('Invalid condition for books');
    }
    
    return errors;
  };

  const isValidISBN = (isbn) => {
    const cleaned = isbn.replace(/[-\s]/g, '');
    return /^\d{10}$/.test(cleaned) || /^\d{13}$/.test(cleaned);
  };

  const handlePostListing = async () => {
    if (isPosting || !onPost) return;
    
    const validationErrors = validateBookData();
    if (validationErrors.length > 0) {
      console.error('❌ Book validation errors:', validationErrors);
      return;
    }
    
    setIsPosting(true);
    try {
      const postData = {
        ...bookData,
        id: listing?.id || bookData.id,
        hostedPhotos: listing?.hostedPhotos || bookData.hostedPhotos || [],
        listingType: 'BOOK_ITEM'
      };
      
      console.log('📖 BookListingCard posting data:', {
        id: postData.id,
        title: postData.title,
        author: postData.author,
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
      {/* Photo Section */}
      <ScrollView horizontal style={styles.photoContainer} showsHorizontalScrollIndicator={false}>
        {bookData.photos.map((photo, index) => (
          <Image key={index} source={{ uri: photo.uri }} style={styles.photo} />
        ))}
      </ScrollView>

      {/* Basic Info Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📖 Book Information</Text>
        
        <View style={styles.field}>
          <Text style={styles.label}>Title</Text>
          <TextInput
            style={styles.input}
            value={bookData.title}
            onChangeText={(text) => handleFieldChange('title', text)}
            placeholder="Enter book title with author"
            multiline
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Author *</Text>
          <TextInput
            style={styles.input}
            value={bookData.author}
            onChangeText={(text) => handleFieldChange('author', text)}
            placeholder="Enter author name"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Book Title (without author)</Text>
          <TextInput
            style={styles.input}
            value={bookData.bookTitle}
            onChangeText={(text) => handleFieldChange('bookTitle', text)}
            placeholder="Enter just the book title"
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.field, { flex: 1, marginRight: spacing.sm }]}>
            <Text style={styles.label}>Price</Text>
            <TextInput
              style={styles.input}
              value={String(bookData.price)}
              onChangeText={(text) => handleFieldChange('price', parseFloat(text) || 0)}
              placeholder="0.00"
              keyboardType="numeric"
            />
          </View>
          
          <View style={[styles.field, { flex: 1, marginLeft: spacing.sm }]}>
            <Text style={styles.label}>Condition</Text>
            <TextInput
              style={styles.input}
              value={bookData.condition}
              onChangeText={(text) => handleFieldChange('condition', text)}
              placeholder="Very Good"
            />
          </View>
        </View>
      </View>

      {/* Book Details Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📚 Publication Details</Text>
        
        <View style={styles.row}>
          <View style={[styles.field, { flex: 1, marginRight: spacing.sm }]}>
            <Text style={styles.label}>Format</Text>
            <TextInput
              style={styles.input}
              value={bookData.format}
              onChangeText={(text) => handleFieldChange('format', text)}
              placeholder="Hardcover"
            />
          </View>
          
          <View style={[styles.field, { flex: 1, marginLeft: spacing.sm }]}>
            <Text style={styles.label}>Language</Text>
            <TextInput
              style={styles.input}
              value={bookData.language}
              onChangeText={(text) => handleFieldChange('language', text)}
              placeholder="English"
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.field, { flex: 1, marginRight: spacing.sm }]}>
            <Text style={styles.label}>Publisher</Text>
            <TextInput
              style={styles.input}
              value={bookData.publisher}
              onChangeText={(text) => handleFieldChange('publisher', text)}
              placeholder="Publisher name"
            />
          </View>
          
          <View style={[styles.field, { flex: 1, marginLeft: spacing.sm }]}>
            <Text style={styles.label}>Publication Year</Text>
            <TextInput
              style={styles.input}
              value={bookData.publicationYear}
              onChangeText={(text) => handleFieldChange('publicationYear', text)}
              placeholder="2023"
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.field, { flex: 1, marginRight: spacing.sm }]}>
            <Text style={styles.label}>ISBN</Text>
            <TextInput
              style={styles.input}
              value={bookData.isbn}
              onChangeText={(text) => handleFieldChange('isbn', text)}
              placeholder="978-0123456789"
            />
          </View>
          
          <View style={[styles.field, { flex: 1, marginLeft: spacing.sm }]}>
            <Text style={styles.label}>Edition</Text>
            <TextInput
              style={styles.input}
              value={bookData.edition}
              onChangeText={(text) => handleFieldChange('edition', text)}
              placeholder="1st Edition"
            />
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Topic/Genre</Text>
          <TextInput
            style={styles.input}
            value={bookData.topic}
            onChangeText={(text) => handleFieldChange('topic', text)}
            placeholder="Fiction, History, Science, etc."
          />
        </View>
      </View>

      {/* Description Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📝 Description</Text>
        <TextInput
          style={[styles.input, styles.descriptionInput]}
          value={bookData.description}
          onChangeText={(text) => handleFieldChange('description', text)}
          placeholder="Detailed description of the book and its condition..."
          multiline
          numberOfLines={4}
        />
      </View>

      {/* Shipping & Category */}
      <View style={styles.section}>
        <View style={styles.field}>
          <Text style={styles.label}>Category</Text>
          <TextInput
            style={styles.input}
            value={bookData.category}
            onChangeText={(text) => handleFieldChange('category', text)}
            placeholder="Books & Magazines > Fiction & Literature"
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.field, { flex: 2, marginRight: spacing.sm }]}>
            <Text style={styles.label}>Shipping</Text>
            <TextInput
              style={styles.input}
              value={bookData.shipping}
              onChangeText={(text) => handleFieldChange('shipping', text)}
              placeholder="USPS Media Mail"
            />
          </View>
          
          <View style={[styles.field, { flex: 1, marginLeft: spacing.sm }]}>
            <Text style={styles.label}>Quantity</Text>
            <TextInput
              style={styles.input}
              value={String(bookData.quantity)}
              onChangeText={(text) => handleFieldChange('quantity', parseInt(text) || 1)}
              placeholder="1"
              keyboardType="numeric"
            />
          </View>
        </View>
      </View>

      {/* Post Button */}
      <TouchableOpacity
        style={[styles.postButton, isPosting && styles.postButtonDisabled]}
        onPress={handlePostListing}
        disabled={isPosting}
      >
        <Text style={styles.postButtonText}>
          {isPosting ? 'Posting Book to eBay...' : 'Post Book to eBay'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  photoContainer: {
    height: 120,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.sm,
    marginRight: spacing.sm,
    backgroundColor: colors.inputBackground,
  },
  section: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  field: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: 14,
    color: colors.text,
    minHeight: 44,
  },
  descriptionInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  postButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    margin: spacing.lg,
    marginTop: 0,
    ...shadows.sm,
  },
  postButtonDisabled: {
    backgroundColor: colors.textMuted,
  },
  postButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});