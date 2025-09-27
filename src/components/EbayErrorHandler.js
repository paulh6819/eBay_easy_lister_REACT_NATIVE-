import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, ScrollView } from 'react-native';
import { colors, spacing, borderRadius, shadows } from '../constants/colors';

/**
 * EbayErrorHandler - A separate component for displaying eBay listing failure errors
 * Shows detailed error messages from eBay API responses without interfering with other logic
 */
export default function EbayErrorHandler({ 
  error = null, 
  onDismiss = () => {}, 
  visible = false 
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(visible && !!error);
  }, [visible, error]);

  const handleDismiss = () => {
    setIsVisible(false);
    if (onDismiss) {
      onDismiss();
    }
  };

  // Parse eBay error to extract useful information
  const parseEbayError = (errorData) => {
    if (!errorData) return null;

    // Handle different error structures
    let title = 'eBay Listing Failed';
    let message = 'An unknown error occurred';
    let details = null;
    let suggestions = [];

    if (typeof errorData === 'string') {
      message = errorData;
    } else if (errorData.error) {
      message = errorData.error;
      details = errorData.message;
    } else if (errorData.message) {
      message = errorData.message;
    }

    // Common eBay error patterns and user-friendly suggestions
    if (message.toLowerCase().includes('title')) {
      if (message.toLowerCase().includes('long') || message.toLowerCase().includes('80')) {
        title = 'Title Too Long';
        suggestions = [
          'Shorten your title to 80 characters or less',
          'Remove unnecessary words or descriptions',
          'Consider moving details to the description'
        ];
      } else if (message.toLowerCase().includes('required')) {
        title = 'Missing Title';
        suggestions = ['Add a title to your listing'];
      }
    } else if (message.toLowerCase().includes('price')) {
      title = 'Price Issue';
      suggestions = [
        'Check that your price is a valid number',
        'Ensure price is greater than $0.01',
        'Remove currency symbols from price field'
      ];
    } else if (message.toLowerCase().includes('photo') || message.toLowerCase().includes('image')) {
      title = 'Photo Issue';
      suggestions = [
        'Ensure all photos uploaded successfully',
        'Check that photos are valid image files',
        'Try retaking photos if upload failed'
      ];
    } else if (message.toLowerCase().includes('category')) {
      title = 'Category Issue';
      suggestions = [
        'Select a valid eBay category',
        'Try using a different listing type',
        'Check that the item fits the selected category'
      ];
    } else if (message.toLowerCase().includes('condition')) {
      title = 'Condition Issue';
      suggestions = [
        'Select a valid item condition',
        'Make sure condition matches your item'
      ];
    } else if (message.toLowerCase().includes('token') || message.toLowerCase().includes('auth')) {
      title = 'Authentication Issue';
      suggestions = [
        'eBay authentication token may have expired',
        'Contact support to refresh eBay connection'
      ];
    }

    return {
      title,
      message,
      details,
      suggestions
    };
  };

  const errorInfo = parseEbayError(error);

  if (!isVisible || !errorInfo) {
    return null;
  }

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleDismiss}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>❌ {errorInfo.title}</Text>
            </View>

            {/* Main Error Message */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>What happened:</Text>
              <Text style={styles.message}>{errorInfo.message}</Text>
            </View>

            {/* Details if available */}
            {errorInfo.details && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Details:</Text>
                <Text style={styles.details}>{errorInfo.details}</Text>
              </View>
            )}

            {/* Suggestions */}
            {errorInfo.suggestions.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>How to fix:</Text>
                {errorInfo.suggestions.map((suggestion, index) => (
                  <View key={index} style={styles.suggestionItem}>
                    <Text style={styles.bullet}>• </Text>
                    <Text style={styles.suggestion}>{suggestion}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Raw error for debugging (only show if it's different from main message) */}
            {error?.rawResponse && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Technical Details:</Text>
                <View style={styles.rawErrorContainer}>
                  <Text style={styles.rawError} numberOfLines={3} ellipsizeMode="tail">
                    {typeof error.rawResponse === 'string' ? error.rawResponse : JSON.stringify(error.rawResponse)}
                  </Text>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.dismissButton} onPress={handleDismiss}>
              <Text style={styles.dismissButtonText}>Got it</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  container: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    maxHeight: '80%',
    width: '100%',
    maxWidth: 400,
    ...shadows.lg,
  },
  scrollView: {
    maxHeight: 400,
  },
  header: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.error,
    textAlign: 'center',
  },
  section: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  message: {
    fontSize: 16,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  details: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  suggestionItem: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
    alignItems: 'flex-start',
  },
  bullet: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: 'bold',
    marginRight: spacing.xs,
    marginTop: 2,
  },
  suggestion: {
    fontSize: 15,
    color: colors.textPrimary,
    lineHeight: 20,
    flex: 1,
  },
  rawErrorContainer: {
    backgroundColor: colors.surface,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    borderLeftWidth: 3,
    borderLeftColor: colors.error,
  },
  rawError: {
    fontSize: 12,
    color: colors.textMuted,
    fontFamily: 'monospace',
  },
  buttonContainer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  dismissButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  dismissButtonText: {
    color: colors.textInverse,
    fontSize: 16,
    fontWeight: '600',
  },
});