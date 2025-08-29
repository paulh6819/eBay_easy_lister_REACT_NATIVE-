import React from 'react';
import { View, Text, ScrollView, Image, StyleSheet } from 'react-native';
import { usePhotos } from '../contexts/PhotoContext';

/**
 * PhotoGroupPreview component showing how photos will be grouped
 * @param {Object} props - Component props
 */
export default function PhotoGroupPreview() {
  const { uploadedPhotos, photosPerListing } = usePhotos();

  const createGroups = () => {
    if (uploadedPhotos.length === 0 || photosPerListing === 'auto') {
      return [];
    }

    const groups = [];
    for (let i = 0; i < uploadedPhotos.length; i += photosPerListing) {
      groups.push(uploadedPhotos.slice(i, i + photosPerListing));
    }
    return groups;
  };

  const groups = createGroups();

  if (groups.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Listing Preview ({groups.length} listings)</Text>
      
      <ScrollView style={styles.scrollContainer}>
        {groups.map((group, groupIndex) => (
          <View key={groupIndex} style={styles.group}>
            <Text style={styles.groupTitle}>Listing {groupIndex + 1}</Text>
            <ScrollView horizontal style={styles.photoRow}>
              {group.map((photo, photoIndex) => (
                <Image
                  key={photo.id}
                  source={{ uri: photo.uri }}
                  style={styles.groupPhoto}
                />
              ))}
            </ScrollView>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  scrollContainer: {
    maxHeight: 300,
  },
  group: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#0066CC',
  },
  photoRow: {
    flexDirection: 'row',
  },
  groupPhoto: {
    width: 60,
    height: 60,
    borderRadius: 6,
    marginRight: 8,
  },
});