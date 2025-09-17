import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { colors, spacing, borderRadius, shadows } from '../constants/colors';
import { getRandomProcessingMessage } from '../constants/loadingMessages';
import EditableListingCard from './EditableListingCard';
import BookListingCard from './BookListingCard';
import { postAllListings, postSingleListing } from '../services/ebayPostingService';
import { postBookToEbay } from '../services/bookListingService';

/**
 * Results component for displaying OpenAI generated listings
 * @param {Object} props - Component props
 * @param {Array} props.listings - Array of generated listings
 * @param {Array} props.processingListings - Array of listings being processed
 * @param {Function} props.onClearAll - Callback to clear all listings
 * @param {boolean} props.loading - Loading state
 * @param {string} props.error - Error message if any
 */
export default function Results({ listings = [], processingListings = [], onClearAll, loading = false, error = null }) {
  const [postingAll, setPostingAll] = useState(false);
  
  // Debug logging to understand listing structure
  console.log('📋 Results component received listings:', {
    count: listings.length,
    listings: listings.map(l => ({
      id: l.id,
      hasPhotos: !!l.photos,
      photoCount: l.photos?.length || 0,
      hasHostedPhotos: !!l.hostedPhotos,
      hostedPhotoCount: l.hostedPhotos?.length || 0,
      hasParsedListing: !!l.parsedListing,
      title: l.parsedListing?.title || l.title || 'No title'
    }))
  });
  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingCard}>
          <Text style={styles.loadingText}>Generating listings...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorCard}>
          <Text style={styles.errorTitle}>Error</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </View>
    );
  }

  if (listings.length === 0 && processingListings.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No listings generated yet</Text>
        </View>
      </View>
    );
  }

  const handleDataChange = (listingId, newData) => {
    console.log('📝 Listing data changed:', listingId, newData);
    // Update the listing data in parent state with edited form data
    const updatedListings = listings.map(listing => {
      if (listing.id === listingId) {
        return {
          ...listing,
          editedData: newData // Store edited data separately from original parsedListing
        };
      }
      return listing;
    });
    
    // We need to call a parent function to update the state
    // For now, we'll store it locally and use it in Post All
    window.listingEdits = window.listingEdits || {};
    window.listingEdits[listingId] = newData;
  };

  const handlePostListing = async (listingData) => {
    try {
      console.log('📤 Posting single listing to eBay:', listingData);
      
      // Route to appropriate posting service based on listing type
      let result;
      if (isBookListing(listingData)) {
        console.log('📖 Routing to book posting service');
        result = await postBookToEbay(listingData);
      } else {
        console.log('📦 Routing to general posting service');
        result = await postSingleListing(listingData);
      }
      
      if (result.success) {
        Alert.alert(
          'Success!',
          `Listing "${listingData.title}" posted successfully to eBay!`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Posting Failed',
          `Failed to post "${listingData.title}": ${result.message}`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Error',
        `An error occurred while posting: ${error.message}`,
        [{ text: 'OK' }]
      );
    }
  };

  // Helper function to determine if a listing is a book
  const isBookListing = (listing) => {
    return listing.listingType === 'BOOK_ITEM' || 
           listing.listingType?.type === 'BOOK_ITEM' ||
           listing.listingType?.title?.includes('Book');
  };

  const handlePostAllListings = async () => {
    if (listings.length === 0) return;
    
    Alert.alert(
      'Post All Listings',
      `Are you sure you want to post all ${listings.length} listings to eBay?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Post All', 
          onPress: async () => {
            setPostingAll(true);
            try {
              console.log('📤 Starting batch posting of all listings');
              
              // Convert listings to the format expected by posting service
              // Use edited form data if available, otherwise fall back to original OpenAI data
              const listingsToPost = listings.map(listing => {
                const editedData = window.listingEdits?.[listing.id];
                const sourceData = editedData || listing.parsedListing;
                
                return {
                  id: listing.id,
                  title: sourceData.title || 'Untitled Listing',
                  price: sourceData.price || '0.00',
                  condition: sourceData.condition || 'Used',
                  category: sourceData.category || 'Uncategorized',
                  description: sourceData.description || '',
                  photos: listing.photos,
                  hostedPhotos: listing.hostedPhotos || [],
                  itemSpecifics: sourceData.item_specifics || sourceData.itemSpecifics || {},
                  listingType: listing.listingType?.type || listing.listingType || 'GENERAL_LISTING',
                  // Include all book-specific fields if they exist in edited data
                  ...(editedData && {
                    author: editedData.author,
                    bookTitle: editedData.bookTitle,
                    isbn: editedData.isbn,
                    format: editedData.format,
                    publisher: editedData.publisher,
                    publicationYear: editedData.publicationYear,
                    topic: editedData.topic,
                    edition: editedData.edition
                  })
                };
              });
              
              const result = await postAllListings(listingsToPost);
              
              if (result.success) {
                Alert.alert(
                  'Batch Posting Complete!',
                  result.message,
                  [{ text: 'OK' }]
                );
              } else {
                Alert.alert(
                  'Batch Posting Failed',
                  result.message || 'Failed to post listings',
                  [{ text: 'OK' }]
                );
              }
            } catch (error) {
              Alert.alert(
                'Error',
                `Batch posting failed: ${error.message}`,
                [{ text: 'OK' }]
              );
            } finally {
              setPostingAll(false);
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>Generated Listings</Text>
          <Text style={styles.subtitle}>{listings.length} listing{listings.length !== 1 ? 's' : ''} ready</Text>
        </View>
        <View style={styles.headerButtons}>
          {listings.length > 1 && (
            <TouchableOpacity 
              style={[styles.postAllButton, postingAll && styles.postAllButtonDisabled]} 
              onPress={handlePostAllListings}
              disabled={postingAll}
            >
              <Text style={styles.postAllText}>
                {postingAll ? 'Posting...' : 'Post All'}
              </Text>
            </TouchableOpacity>
          )}
          {onClearAll && (
            <TouchableOpacity style={styles.clearAllButton} onPress={onClearAll}>
              <Text style={styles.clearAllText}>Clear All</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      <ScrollView 
        style={styles.scrollContainer} 
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
      >
        {/* Show processing listings first */}
        {processingListings.map((processingItem) => (
          <View key={processingItem.id} style={styles.processingCard}>
            <View style={styles.processingContent}>
              <ActivityIndicator 
                size="large" 
                color={colors.primary} 
                style={styles.processingSpinner} 
              />
              <View style={styles.processingText}>
                <Text style={styles.processingTitle}>{processingItem.message}</Text>
                <Text style={styles.processingSubtitle}>
                  Please wait while we work our magic
                </Text>
                <Text style={styles.processingType}>
                  {processingItem.listingType === 'BOOK_ITEM' ? '📚 Book Listing' : 
                   processingItem.listingType === 'BOOK_LOTS' ? '📚 Book Lots' : 
                   processingItem.listingType === 'CD_MUSIC' ? '🎵 CD/Music' : 
                   processingItem.listingType === 'DVD_MOVIE' ? '🎬 DVD/Movie' : 
                   processingItem.listingType === 'VHS_LISTING' ? '📼 VHS' : 
                   '📦 General Item'}
                </Text>
              </View>
            </View>
          </View>
        ))}

        {/* Show completed listings */}
        {listings.map((listing) => {
          // Determine if this is a book listing
          const isBook = listing.listingType?.type === 'BOOK_ITEM' || 
                        listing.listingType?.title?.includes('Book');

          // Debug log the original listing data structure
          console.log('🔍 Results.js - Original listing structure:', {
            id: listing.id,
            hasParseList: !!listing.parsedListing,
            parsedListingKeys: Object.keys(listing.parsedListing || {}),
            parsedListingContent: listing.parsedListing,
            listingType: listing.listingType
          });

          const listingData = {
            ...listing.parsedListing,
            photos: listing.photos,
            hostedPhotos: listing.hostedPhotos,
            id: listing.id,
            status: listing.status,
            listingType: listing.listingType?.type || listing.listingType
          };

          console.log('📋 Results.js - Data passed to BookListingCard:', {
            id: listingData.id,
            title: listingData.title,
            author: listingData.author,
            isbn: listingData.isbn,
            item_specifics: listingData.item_specifics,
            allKeys: Object.keys(listingData)
          });

          // Render appropriate card component
          if (isBook) {
            return (
              <BookListingCard 
                key={listing.id} 
                listing={listingData}
                onDataChange={(newData) => handleDataChange(listing.id, newData)}
                onPost={(listingData) => handlePostListing(listingData)}
              />
            );
          } else {
            return (
              <EditableListingCard 
                key={listing.id} 
                listing={{
                  ...listingData,
                  listingType: listing.listingType.title
                }}
                onDataChange={(newData) => handleDataChange(listing.id, newData)}
                onPost={(listingData) => handlePostListing(listingData)}
              />
            );
          }
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    marginTop: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.cardBackground,
    borderBottomWidth: 2,
    borderBottomColor: colors.border,
    borderRadius: borderRadius.lg,
    marginHorizontal: spacing.md,
    ...shadows.sm,
  },
  headerLeft: {
    flex: 1,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  postAllButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  postAllButtonDisabled: {
    backgroundColor: colors.textMuted,
    opacity: 0.6,
  },
  postAllText: {
    color: colors.textInverse,
    fontWeight: '600',
    fontSize: 14,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  clearAllButton: {
    backgroundColor: colors.error,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  clearAllText: {
    color: colors.textInverse,
    fontWeight: '600',
    fontSize: 14,
  },
  scrollContainer: {
    maxHeight: 400, // Limit height so it doesn't take over the screen
    padding: spacing.md,
  },
  loadingCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    padding: spacing.xl,
    margin: spacing.md,
    alignItems: 'center',
    ...shadows.sm,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  errorCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.error,
    padding: spacing.md,
    margin: spacing.md,
    ...shadows.sm,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.error,
    marginBottom: spacing.sm,
  },
  errorText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  emptyCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.borderLight,
    padding: spacing.xl,
    margin: spacing.md,
    alignItems: 'center',
    ...shadows.sm,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  processingCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.primary + '40',
    margin: spacing.md,
    ...shadows.sm,
  },
  processingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
  },
  processingSpinner: {
    marginRight: spacing.lg,
  },
  processingText: {
    flex: 1,
  },
  processingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  processingSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  processingType: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '500',
  },
});