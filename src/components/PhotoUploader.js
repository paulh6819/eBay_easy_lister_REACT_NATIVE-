import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { usePhotos } from '../contexts/PhotoContext';

/**
 * PhotoUploader component for selecting and displaying photos
 * @param {Object} props - Component props
 */
export default function PhotoUploader() {
  const { uploadedPhotos, addPhotos, removePhoto } = usePhotos();

  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Sorry, we need camera roll permissions to upload photos!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      const newPhotos = result.assets.map(asset => ({
        uri: asset.uri,
        width: asset.width,
        height: asset.height,
        id: Math.random().toString(36).substr(2, 9),
      }));
      addPhotos(newPhotos);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Sorry, we need camera permissions to take photos!');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
    });

    if (!result.canceled) {
      const newPhoto = {
        uri: result.assets[0].uri,
        width: result.assets[0].width,
        height: result.assets[0].height,
        id: Math.random().toString(36).substr(2, 9),
      };
      addPhotos([newPhoto]);
    }
  };

  const handleRemovePhoto = (index) => {
    Alert.alert(
      'Remove Photo',
      'Are you sure you want to remove this photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => removePhoto(index) },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={pickImages}>
          <Text style={styles.buttonText}>Select from Gallery</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={takePhoto}>
          <Text style={styles.buttonText}>Take Photo</Text>
        </TouchableOpacity>
      </View>

      {uploadedPhotos.length > 0 && (
        <ScrollView horizontal style={styles.photoContainer}>
          {uploadedPhotos.map((photo, index) => (
            <TouchableOpacity
              key={photo.id}
              style={styles.photoWrapper}
              onPress={() => handleRemovePhoto(index)}
            >
              <Image source={{ uri: photo.uri }} style={styles.photo} />
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemovePhoto(index)}
              >
                <Text style={styles.removeText}>×</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {uploadedPhotos.length > 0 && (
        <Text style={styles.photoCount}>
          {uploadedPhotos.length} photo{uploadedPhotos.length !== 1 ? 's' : ''} selected
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  button: {
    flex: 1,
    backgroundColor: '#0066CC',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },
  photoContainer: {
    marginVertical: 16,
  },
  photoWrapper: {
    position: 'relative',
    marginRight: 8,
  },
  photo: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'red',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  photoCount: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
  },
});