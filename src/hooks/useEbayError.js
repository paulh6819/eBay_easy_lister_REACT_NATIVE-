import { useState } from 'react';

/**
 * useEbayError - Simple hook for managing eBay error state
 * Provides a clean way to show eBay errors without disrupting existing logic
 */
export const useEbayError = () => {
  const [error, setError] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  const showError = (errorData) => {
    console.log('🚨 eBay Error:', errorData);
    setError(errorData);
    setIsVisible(true);
  };

  const hideError = () => {
    setIsVisible(false);
    // Clear error after animation completes
    setTimeout(() => setError(null), 300);
  };

  const clearError = () => {
    setError(null);
    setIsVisible(false);
  };

  return {
    error,
    isVisible,
    showError,
    hideError,
    clearError
  };
};