import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList } from 'react-native';
import { colors, spacing, borderRadius, shadows } from '../constants/colors';
import { AI_PROMPTS } from '../constants/prompts';

/**
 * ListingTypeSelector component for choosing listing type and associated prompt
 * @param {Object} props - Component props
 * @param {Function} props.onSelectionChange - Callback when selection changes
 * @param {string} props.selectedType - Currently selected listing type
 */
export default function ListingTypeSelector({ onSelectionChange, selectedType = 'BOOK_LOTS', initialValue }) {
  const [selected, setSelected] = useState(initialValue || selectedType);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Update selected when initialValue changes
  useEffect(() => {
    if (initialValue) {
      setSelected(initialValue);
    }
  }, [initialValue]);

  const listingTypes = [
    {
      id: 'BOOK_ITEM',
      title: '📚 Book Listing',
      description: 'Optimized for books with author, ISBN, publisher details',
      prompt: AI_PROMPTS.BOOK_ITEM,
      emoji: '📚'
    },
    {
      id: 'BOOK_LOTS',
      title: '📚 Book Lots Listing',
      description: 'Create book lots listing (group multiple books together)',
      prompt: AI_PROMPTS.BOOK_ITEM, // Will be updated with actual prompt
      emoji: '📚'
    },
    {
      id: 'CD_MUSIC',
      title: '🎵 CD/Music Listing',
      description: 'Optimized for CDs, albums, and music media with detailed metadata',
      prompt: AI_PROMPTS.ELECTRONICS, // Will be updated with actual prompt
      emoji: '🎵'
    },
    {
      id: 'DVD_MOVIE',
      title: '🎬 DVD/Movie Listing',
      description: 'Optimized for DVDs, Blu-rays, and movie media with detailed metadata',
      prompt: AI_PROMPTS.ELECTRONICS, // Will be updated with actual prompt
      emoji: '🎬'
    },
    {
      id: 'VHS_LISTING',
      title: '📼 VHS Listing',
      description: 'Optimized for VHS tapes and video media with detailed metadata',
      prompt: AI_PROMPTS.ELECTRONICS, // Will be updated with actual prompt
      emoji: '📼'
    },
    {
      id: 'GENERAL_LISTING',
      title: '📦 General Listing',
      description: 'For electronics, collectibles, home items, etc.',
      prompt: AI_PROMPTS.GENERAL_ITEM,
      emoji: '📦'
    }
  ];

  const handleSelection = (listingType) => {
    setSelected(listingType.id);
    setIsDropdownOpen(false);
    if (onSelectionChange) {
      onSelectionChange(listingType.id);
    }
  };

  const selectedOption = listingTypes.find(type => type.id === selected) || listingTypes[1];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Listing Type</Text>
      
      {/* Dropdown Trigger */}
      <TouchableOpacity
        style={styles.dropdownTrigger}
        onPress={() => setIsDropdownOpen(!isDropdownOpen)}
      >
        <View style={styles.selectedDisplay}>
          <Text style={styles.selectedTitle}>
            {selectedOption.emoji} {selectedOption.title.replace(/📚|🎵|🎬|📼|📦/g, '').trim()}
          </Text>
          <Text style={styles.selectedDescription}>
            {selectedOption.description}
          </Text>
        </View>
        <Text style={[styles.dropdownArrow, isDropdownOpen && styles.dropdownArrowOpen]}>
          ▼
        </Text>
      </TouchableOpacity>

      {/* Dropdown Options */}
      {isDropdownOpen && (
        <View style={styles.dropdownContainer}>
          {listingTypes.map((listingType) => (
            <TouchableOpacity
              key={listingType.id}
              style={[
                styles.dropdownOption,
                selected === listingType.id && styles.selectedDropdownOption
              ]}
              onPress={() => handleSelection(listingType)}
            >
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>
                  {listingType.emoji} {listingType.title.replace(/📚|🎵|🎬|📼|📦/g, '').trim()}
                </Text>
                <Text style={styles.optionDescription}>
                  {listingType.description}
                </Text>
              </View>
              {selected === listingType.id && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    padding: spacing.md,
    margin: spacing.md,
    ...shadows.sm,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  dropdownTrigger: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.border,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedDisplay: {
    flex: 1,
  },
  selectedTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  selectedDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  dropdownArrow: {
    fontSize: 16,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
  dropdownArrowOpen: {
    transform: [{ rotate: '180deg' }],
  },
  dropdownContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.border,
    marginTop: spacing.xs,
    ...shadows.md,
  },
  dropdownOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  selectedDropdownOption: {
    backgroundColor: colors.primaryLight + '20',
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  checkmark: {
    fontSize: 18,
    color: colors.primary,
    fontWeight: 'bold',
    marginLeft: spacing.sm,
  },
});