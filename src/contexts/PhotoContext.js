import React, { createContext, useContext, useReducer } from 'react';

const PhotoContext = createContext();

const initialState = {
  uploadedPhotos: [],
  photoGroups: [],
  photosPerListing: 'auto',
  isGrouping: false,
};

function photoReducer(state, action) {
  switch (action.type) {
    case 'ADD_PHOTOS':
      return {
        ...state,
        uploadedPhotos: [...state.uploadedPhotos, ...action.payload],
      };
    case 'REMOVE_PHOTO':
      return {
        ...state,
        uploadedPhotos: state.uploadedPhotos.filter((_, index) => index !== action.payload),
      };
    case 'REORDER_PHOTOS':
      return {
        ...state,
        uploadedPhotos: action.payload,
      };
    case 'SET_PHOTOS_PER_LISTING':
      return {
        ...state,
        photosPerListing: action.payload,
      };
    case 'SET_PHOTO_GROUPS':
      return {
        ...state,
        photoGroups: action.payload,
      };
    case 'SET_GROUPING':
      return {
        ...state,
        isGrouping: action.payload,
      };
    case 'CLEAR_PHOTOS':
      return {
        ...state,
        uploadedPhotos: [],
        photoGroups: [],
      };
    default:
      return state;
  }
}

/**
 * PhotoProvider component that manages photo-related state
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 */
export function PhotoProvider({ children }) {
  const [state, dispatch] = useReducer(photoReducer, initialState);

  const value = {
    ...state,
    addPhotos: (photos) => dispatch({ type: 'ADD_PHOTOS', payload: photos }),
    removePhoto: (index) => dispatch({ type: 'REMOVE_PHOTO', payload: index }),
    reorderPhotos: (photos) => dispatch({ type: 'REORDER_PHOTOS', payload: photos }),
    setPhotosPerListing: (count) => dispatch({ type: 'SET_PHOTOS_PER_LISTING', payload: count }),
    setPhotoGroups: (groups) => dispatch({ type: 'SET_PHOTO_GROUPS', payload: groups }),
    setGrouping: (isGrouping) => dispatch({ type: 'SET_GROUPING', payload: isGrouping }),
    clearPhotos: () => dispatch({ type: 'CLEAR_PHOTOS' }),
  };

  return (
    <PhotoContext.Provider value={value}>
      {children}
    </PhotoContext.Provider>
  );
}

/**
 * Custom hook to use photo context
 * @returns {Object} Photo context value
 */
export function usePhotos() {
  const context = useContext(PhotoContext);
  if (!context) {
    throw new Error('usePhotos must be used within a PhotoProvider');
  }
  return context;
}