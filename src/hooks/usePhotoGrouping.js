import { useMemo } from 'react';
import { usePhotos } from '../contexts/PhotoContext';
import { groupPhotos, calculateEstimatedListings } from '../utils/photoUtils';

/**
 * Custom hook for photo grouping logic
 * @returns {Object} Photo grouping utilities and data
 */
export const usePhotoGrouping = () => {
  const { uploadedPhotos, photosPerListing } = usePhotos();

  const photoGroups = useMemo(() => {
    return groupPhotos(uploadedPhotos, photosPerListing);
  }, [uploadedPhotos, photosPerListing]);

  const estimatedListings = useMemo(() => {
    return calculateEstimatedListings(uploadedPhotos.length, photosPerListing);
  }, [uploadedPhotos.length, photosPerListing]);

  const canAnalyze = useMemo(() => {
    return uploadedPhotos.length > 0 && photosPerListing !== 'auto';
  }, [uploadedPhotos.length, photosPerListing]);

  return {
    photoGroups,
    estimatedListings,
    canAnalyze,
    totalPhotos: uploadedPhotos.length,
  };
};