import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { usePhotos } from "../contexts/PhotoContext";
import { analyzePhotos } from "../services/listingApi";
import { parseListingResponse } from "../utils/responseParser";
import { testServerConnection } from "../services/testConnection";
import { AI_PROMPTS } from "../constants/prompts";

export default function CameraCapture({ 
  selectedListingType, 
  onCreateListing, 
  onStartProcessing, 
  onPhotoClear,
  onShowCamera,
  onCameraClose 
}) {
  const [completedListings, setCompletedListings] = useState(0);

  const { addPhotos, photosPerListing, setPhotosPerListing } = usePhotos();

  const handleUseCameraPress = () => {
    console.log("📷 Use Camera button pressed - INITIAL STATE:", {
      photosPerListing,
      photosPerListingType: typeof photosPerListing,
      completedListings
    });
    console.log("📷 CONTEXT PHOTO STATE:", { photosPerListing });

    // Show custom camera
    if (onShowCamera) {
      onShowCamera(true);
    }
  };


  const triggerAutomaticListingGeneration = async (photos) => {
    try {
      console.log("🤖 AUTO-LISTING FUNCTION CALLED! Triggering listing generation for", photos.length, "photos");
      console.log("🤖 Props check:", {
        selectedListingType,
        hasOnCreateListing: !!onCreateListing,
        hasOnStartProcessing: !!onStartProcessing,
        hasOnPhotoClear: !!onPhotoClear
      });
      
      // Start processing indicator and clear photos immediately (like CreateListingButton does)
      let processingId = null;
      if (onStartProcessing) {
        processingId = onStartProcessing();
      }
      if (onPhotoClear) {
        onPhotoClear();
      }

      // Test server connection
      console.log('🔍 Testing server connection...');
      const connectionTest = await testServerConnection();
      if (!connectionTest.success) {
        throw new Error('Cannot connect to server: ' + connectionTest.error);
      }
      console.log('✅ Server connection successful!');

      // Get the appropriate prompt based on listing type (same logic as CreateListingButton)
      let prompt;
      switch (selectedListingType) {
        case 'BOOK_ITEM':
          prompt = AI_PROMPTS.BOOK_ITEM(photos.length);
          break;
        case 'BOOK_LOTS':
          prompt = AI_PROMPTS.BOOK_ITEM(photos.length);
          break;
        case 'CD_MUSIC':
          prompt = AI_PROMPTS.ELECTRONICS;
          break;
        case 'DVD_MOVIE':
          prompt = AI_PROMPTS.ELECTRONICS;
          break;
        case 'VHS_LISTING':
          prompt = AI_PROMPTS.ELECTRONICS;
          break;
        case 'GENERAL_LISTING':
          prompt = AI_PROMPTS.GENERAL_ITEM;
          break;
        default:
          prompt = AI_PROMPTS.GENERAL_ITEM;
      }

      console.log('🤖 Creating listing with type:', selectedListingType);
      
      // Call the analyze endpoint (same as CreateListingButton)
      const result = await analyzePhotos({
        photos,
        listingType: selectedListingType,
        prompt
      });

      console.log('✅ Raw OpenAI Response:', result);

      // Parse the response based on listing type (same as CreateListingButton)
      const parsedListing = parseListingResponse(result.rawResponse, selectedListingType);
      console.log('✅ Parsed Listing:', JSON.stringify(parsedListing, null, 2));

      // Pass results to parent component (same as CreateListingButton)
      if (onCreateListing) {
        onCreateListing({
          photos,
          hostedPhotos: result.hostedPhotos || [],
          listingType: selectedListingType,
          prompt,
          photoCount: photos.length,
          rawResponse: result,
          parsedListing
        }, processingId);
      }

      setCompletedListings(prev => prev + 1);

    } catch (error) {
      console.error('❌ Error in automatic listing generation:', error);
      
      // Remove processing indicator on error (same as CreateListingButton)
      if (onCreateListing) {
        onCreateListing({ error: error.message }, processingId);
      }
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


      {completedListings > 0 && (
        <View style={styles.completedContainer}>
          <Text style={styles.completedText}>
            ✅ {completedListings} listing{completedListings !== 1 ? "s" : ""} generated
          </Text>
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
  completedContainer: {
    marginTop: 15,
    padding: 12,
    backgroundColor: "#d4edda",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#c3e6cb",
  },
  completedText: {
    fontSize: 16,
    color: "#155724",
    fontWeight: "600",
  },
});