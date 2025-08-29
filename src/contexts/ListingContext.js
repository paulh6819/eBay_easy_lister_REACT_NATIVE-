import React, { createContext, useContext, useReducer } from 'react';

const ListingContext = createContext();

const initialState = {
  generatedListings: [],
  currentListing: null,
  isProcessing: false,
  error: null,
};

function listingReducer(state, action) {
  switch (action.type) {
    case 'SET_PROCESSING':
      return {
        ...state,
        isProcessing: action.payload,
        error: null,
      };
    case 'SET_GENERATED_LISTINGS':
      return {
        ...state,
        generatedListings: action.payload,
        isProcessing: false,
      };
    case 'ADD_GENERATED_LISTING':
      return {
        ...state,
        generatedListings: [...state.generatedListings, action.payload],
      };
    case 'UPDATE_LISTING':
      return {
        ...state,
        generatedListings: state.generatedListings.map((listing, index) =>
          index === action.payload.index ? { ...listing, ...action.payload.data } : listing
        ),
      };
    case 'SET_CURRENT_LISTING':
      return {
        ...state,
        currentListing: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isProcessing: false,
      };
    case 'CLEAR_LISTINGS':
      return {
        ...state,
        generatedListings: [],
        currentListing: null,
        error: null,
      };
    default:
      return state;
  }
}

/**
 * ListingProvider component that manages listing-related state
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 */
export function ListingProvider({ children }) {
  const [state, dispatch] = useReducer(listingReducer, initialState);

  const value = {
    ...state,
    setProcessing: (isProcessing) => dispatch({ type: 'SET_PROCESSING', payload: isProcessing }),
    setGeneratedListings: (listings) => dispatch({ type: 'SET_GENERATED_LISTINGS', payload: listings }),
    addGeneratedListing: (listing) => dispatch({ type: 'ADD_GENERATED_LISTING', payload: listing }),
    updateListing: (index, data) => dispatch({ type: 'UPDATE_LISTING', payload: { index, data } }),
    setCurrentListing: (listing) => dispatch({ type: 'SET_CURRENT_LISTING', payload: listing }),
    setError: (error) => dispatch({ type: 'SET_ERROR', payload: error }),
    clearListings: () => dispatch({ type: 'CLEAR_LISTINGS' }),
  };

  return (
    <ListingContext.Provider value={value}>
      {children}
    </ListingContext.Provider>
  );
}

/**
 * Custom hook to use listing context
 * @returns {Object} Listing context value
 */
export function useListings() {
  const context = useContext(ListingContext);
  if (!context) {
    throw new Error('useListings must be used within a ListingProvider');
  }
  return context;
}