import React, { useEffect, useState } from 'react';
import { 
  View, 
  ScrollView, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ActivityIndicator,
  Alert,
  Modal 
} from 'react-native';
import { usePhotos } from '../contexts/PhotoContext';
import { useListings } from '../contexts/ListingContext';
import ListingCard from '../components/ListingCard';
import EditableField from '../components/EditableField';

export default function ListingPreviewScreen({ navigation }) {
  const { uploadedPhotos, photosPerListing, photoGroups } = usePhotos();
  const { 
    generatedListings, 
    isProcessing, 
    setProcessing, 
    setGeneratedListings,
    updateListing 
  } = useListings();
  
  const [editingListing, setEditingListing] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);

  useEffect(() => {
    if (uploadedPhotos.length > 0 && generatedListings.length === 0) {
      generateListings();
    }
  }, [uploadedPhotos]);

  const generateListings = async () => {
    setProcessing(true);
    
    try {
      const groups = createPhotoGroups();
      const mockListings = groups.map((group, index) => ({
        id: `listing_${index}`,
        title: `Generated Listing ${index + 1}`,
        description: 'AI-generated description will appear here after backend integration.',
        price: '25.00',
        category: 'Electronics',
        condition: 'Used',
        photos: group,
        shipping: 'Standard',
        quantity: 1,
      }));
      
      setTimeout(() => {
        setGeneratedListings(mockListings);
        setProcessing(false);
      }, 2000);
      
    } catch (error) {
      Alert.alert('Error', 'Failed to generate listings. Please try again.');
      setProcessing(false);
    }
  };

  const createPhotoGroups = () => {
    if (photosPerListing === 'auto') {
      return [uploadedPhotos];
    }
    
    const groups = [];
    for (let i = 0; i < uploadedPhotos.length; i += photosPerListing) {
      groups.push(uploadedPhotos.slice(i, i + photosPerListing));
    }
    return groups;
  };

  const handleEditListing = (listing, index) => {
    setEditingListing({ ...listing, index });
    setEditModalVisible(true);
  };

  const handleSaveEdit = (field, value) => {
    if (editingListing) {
      const updatedListing = { ...editingListing, [field]: value };
      setEditingListing(updatedListing);
      updateListing(editingListing.index, { [field]: value });
    }
  };

  const handlePostListing = (listing) => {
    Alert.alert(
      'Post to eBay',
      `Ready to post "${listing.title}" to eBay?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Post', 
          onPress: () => {
            Alert.alert('Success', 'Listing posted to eBay! (This will integrate with your backend API)');
          }
        },
      ]
    );
  };

  if (isProcessing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066CC" />
          <Text style={styles.loadingText}>Analyzing photos...</Text>
          <Text style={styles.loadingSubtext}>
            AI is generating listing metadata for your photos
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Generated Listings</Text>
        <Text style={styles.subtitle}>
          {generatedListings.length} listing{generatedListings.length !== 1 ? 's' : ''} ready
        </Text>
      </View>

      <ScrollView style={styles.scrollContainer}>
        {generatedListings.map((listing, index) => (
          <ListingCard
            key={listing.id}
            listing={listing}
            onEdit={() => handleEditListing(listing, index)}
            onPost={() => handlePostListing(listing)}
          />
        ))}
      </ScrollView>

      <Modal
        visible={editModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Listing</Text>
            <Text 
              style={styles.doneButton}
              onPress={() => setEditModalVisible(false)}
            >
              Done
            </Text>
          </View>
          
          <ScrollView style={styles.modalContent}>
            {editingListing && (
              <>
                <EditableField
                  label="Title"
                  value={editingListing.title}
                  onSave={(value) => handleSaveEdit('title', value)}
                  placeholder="Enter listing title"
                />
                
                <EditableField
                  label="Description"
                  value={editingListing.description}
                  onSave={(value) => handleSaveEdit('description', value)}
                  placeholder="Enter listing description"
                  multiline
                />
                
                <EditableField
                  label="Price"
                  value={editingListing.price}
                  onSave={(value) => handleSaveEdit('price', value)}
                  placeholder="0.00"
                  keyboardType="numeric"
                />
                
                <EditableField
                  label="Category"
                  value={editingListing.category}
                  onSave={(value) => handleSaveEdit('category', value)}
                  placeholder="Select category"
                />
                
                <EditableField
                  label="Condition"
                  value={editingListing.condition}
                  onSave={(value) => handleSaveEdit('condition', value)}
                  placeholder="New/Used/Refurbished"
                />
              </>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  scrollContainer: {
    flex: 1,
    paddingVertical: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  doneButton: {
    fontSize: 16,
    color: '#0066CC',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
});