import { useState, useCallback } from 'react';
import { useListings } from '../contexts/ListingContext';
import apiService from '../services/api';

/**
 * Custom hook for listing generation logic
 * @returns {Object} Listing generation utilities and state
 */
export const useListingGeneration = () => {
  const { 
    setProcessing, 
    setGeneratedListings, 
    setError, 
    isProcessing 
  } = useListings();

  const [progress, setProgress] = useState(0);

  const generateListings = useCallback(async (photoGroups, options = {}) => {
    if (!photoGroups || photoGroups.length === 0) {
      setError('No photo groups provided');
      return;
    }

    try {
      setProcessing(true);
      setProgress(0);
      setError(null);

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      // Call backend API to analyze photos
      const listings = await apiService.analyzePhotos(photoGroups, options);
      
      clearInterval(progressInterval);
      setProgress(100);
      
      // Add generated IDs if not provided by backend
      const listingsWithIds = listings.map((listing, index) => ({
        id: listing.id || `listing_${Date.now()}_${index}`,
        ...listing,
      }));

      setGeneratedListings(listingsWithIds);
      
      setTimeout(() => {
        setProgress(0);
      }, 1000);

    } catch (error) {
      console.error('Failed to generate listings:', error);
      setError(error.message || 'Failed to generate listings');
      setProgress(0);
    }
  }, [setProcessing, setGeneratedListings, setError]);

  const postListing = useCallback(async (listing) => {
    try {
      setProcessing(true);
      
      const result = await apiService.postToEbay(listing);
      
      return result;
    } catch (error) {
      console.error('Failed to post listing:', error);
      setError(error.message || 'Failed to post listing');
      throw error;
    } finally {
      setProcessing(false);
    }
  }, [setProcessing, setError]);

  return {
    generateListings,
    postListing,
    isProcessing,
    progress,
  };
};