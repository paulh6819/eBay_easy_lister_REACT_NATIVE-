import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { usePhotos } from "../contexts/PhotoContext";
import { analyzePhotos } from "../services/listingApi";

export default function CameraCapture() {
  const [photosPerListing, setPhotosPerListing] = useState(3);
  const [currentPhotoCount, setCurrentPhotoCount] = useState(0);
  const [capturedPhotos, setCapturedPhotos] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const { addPhotos } = usePhotos();

  const handleUseCameraPress = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status === "granted") {
      setCurrentPhotoCount(0);
      setCapturedPhotos([]);
      takeNextPhoto();
    }
  };

  const takeNextPhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const newPhoto = result.assets[0];
      const updatedPhotos = [...capturedPhotos, newPhoto];
      const newPhotoCount = updatedPhotos.length;
      
      setCapturedPhotos(updatedPhotos);
      setCurrentPhotoCount(newPhotoCount);

      if (newPhotoCount < photosPerListing) {
        setTimeout(() => takeNextPhoto(), 1000);
      } else {
        generateListingFromPhotos(updatedPhotos);
      }
    }
  };

  const generateListingFromPhotos = async (photos) => {
    try {
      setIsGenerating(true);
      console.log("Generating listing from photos:", photos.length);

      const photosWithId = photos.map(photo => ({
        uri: photo.uri,
        width: photo.width,
        height: photo.height,
        id: Math.random().toString(36).substr(2, 9),
      }));

      const prompt = `Please analyze these ${photos.length} photos and create a detailed eBay listing. Include title, description, condition, and suggested starting price.`;

      const result = await analyzePhotos({
        photos: photosWithId,
        listingType: 'auto',
        prompt
      });

      console.log("Listing generated successfully:", result);
      
      // Add photos to context for display
      addPhotos(photosWithId);
      
      // Reset for next listing
      setCapturedPhotos([]);
      setCurrentPhotoCount(0);
      
    } catch (error) {
      console.error("Failed to generate listing:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.useCameraButton}
        onPress={handleUseCameraPress}
      >
        <Text style={styles.useCameraButtonText}>📷 Use Camera</Text>
      </TouchableOpacity>

      {currentPhotoCount > 0 && !isGenerating && (
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>
            Photo {currentPhotoCount} of {photosPerListing} taken
          </Text>
        </View>
      )}

      {isGenerating && (
        <View style={styles.generatingContainer}>
          <Text style={styles.generatingText}>🔄 Generating listing...</Text>
        </View>
      )}

      <View style={styles.photosPerListingContainer}>
        <Text style={styles.label}>Photos per listing: {photosPerListing}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollContainer}>
          {[1, 2, 3, 4, 5].map((num) => (
            <TouchableOpacity
              key={num}
              style={[
                styles.numberButton,
                photosPerListing === num && styles.numberButtonSelected
              ]}
              onPress={() => setPhotosPerListing(num)}
            >
              <Text style={[
                styles.numberButtonText,
                photosPerListing === num && styles.numberButtonTextSelected
              ]}>
                {num}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: "center",
  },
  useCameraButton: {
    backgroundColor: "#28a745",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
  },
  useCameraButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  photosPerListingContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
    color: "#333",
  },
  scrollContainer: {
    flexGrow: 0,
  },
  numberButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "#0066CC",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    marginHorizontal: 5,
  },
  numberButtonSelected: {
    backgroundColor: "#0066CC",
  },
  numberButtonText: {
    fontSize: 18,
    color: "#0066CC",
    fontWeight: "bold",
  },
  numberButtonTextSelected: {
    color: "white",
  },
  statusContainer: {
    marginTop: 15,
    padding: 12,
    backgroundColor: "#e3f2fd",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#90caf9",
  },
  statusText: {
    fontSize: 16,
    color: "#1976d2",
    fontWeight: "600",
  },
  generatingContainer: {
    marginTop: 15,
    padding: 12,
    backgroundColor: "#fff3cd",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ffeaa7",
  },
  generatingText: {
    fontSize: 16,
    color: "#856404",
    fontWeight: "600",
  },
});