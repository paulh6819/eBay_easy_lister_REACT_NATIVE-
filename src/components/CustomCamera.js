import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Alert, Animated } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function CustomCamera({ 
  onPhotoTaken,
  onClose,
  currentPhotoCount = 0,
  totalPhotos = 3,
  isVisible = false,
  isGeneratingInBackground = false
}) {
  const [facing, setFacing] = useState('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [listingsGenerated, setListingsGenerated] = useState(0);
  const cameraRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (isVisible && !permission?.granted) {
      requestPermission();
    }
  }, [isVisible, permission]);

  // Check haptics availability and reset listing counter when camera opens/closes
  useEffect(() => {
    const checkHaptics = async () => {
      try {
        console.log('🔍 Checking haptics availability...');
        // Try to get haptic capabilities
        const hasHaptics = await Haptics.selectionAsync();
        console.log('✅ Haptics test completed - device supports haptics');
      } catch (error) {
        console.error('❌ Haptics not available on this device:', error);
      }
    };
    
    if (isVisible) {
      checkHaptics();
      // Reset listings counter when camera opens for a fresh session
      setListingsGenerated(0);
      console.log('📸 Camera opened - reset listings counter to 0');
    }
  }, [isVisible]);

  // Track listings generated and handle animation
  useEffect(() => {
    if (isGeneratingInBackground) {
      // Increment listing counter when generation starts
      setListingsGenerated(prev => prev + 1);
      
      // Fade in and scale up animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      // Fade out and scale down animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [isGeneratingInBackground]);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.button}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePhoto = async () => {
    if (cameraRef.current) {
      try {
        console.log('📸 Taking photo - attempting haptic feedback...');
        
        // Add heavy haptic feedback when taking photo
        try {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          console.log('✅ Haptic feedback triggered successfully');
        } catch (hapticError) {
          console.error('❌ Haptic feedback failed:', hapticError);
        }
        
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: false,
        });
        
        console.log('📸 Photo taken successfully');
        
        if (onPhotoTaken) {
          onPhotoTaken(photo);
        }
      } catch (error) {
        console.error('Error taking photo:', error);
        Alert.alert('Error', 'Failed to take photo');
      }
    }
  };

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  if (!isVisible) {
    return null;
  }

  return (
    <View style={styles.container}>
      <CameraView 
        style={styles.camera} 
        facing={facing} 
        ref={cameraRef}
      >
        {/* Progress Indicators Overlay */}
        <View style={styles.progressOverlay}>
          <View style={styles.progressContainer}>
            {Array.from({ length: totalPhotos }, (_, index) => (
              <View 
                key={index} 
                style={[
                  styles.progressCircle,
                  index < currentPhotoCount && styles.progressCircleCompleted
                ]}
              >
                {index < currentPhotoCount && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Background Generation Message */}
        <Animated.View 
          style={[
            styles.generationMessage,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          <Text style={styles.generationMessageText}>
            🤖 Listing #{listingsGenerated} generating! Keep going!
          </Text>
        </Animated.View>

        {/* Camera Controls */}
        <View style={styles.controlsContainer}>
          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>

          {/* Capture Button */}
          <TouchableOpacity style={styles.captureButton} onPress={takePhoto}>
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>

          {/* Flip Camera Button */}
          <TouchableOpacity style={styles.flipButton} onPress={toggleCameraFacing}>
            <Text style={styles.flipButtonText}>🔄</Text>
          </TouchableOpacity>
        </View>

        {/* Photo Count Display */}
        <View style={styles.countDisplay}>
          <Text style={styles.countText}>
            {currentPhotoCount} / {totalPhotos}
          </Text>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  camera: {
    flex: 1,
    width: screenWidth,
    height: screenHeight,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
    color: 'white',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  progressOverlay: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
  },
  progressContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  progressCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'white',
    marginHorizontal: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressCircleCompleted: {
    backgroundColor: '#28a745',
    borderColor: '#28a745',
  },
  checkmark: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 150,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  closeButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
  },
  flipButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flipButtonText: {
    color: 'white',
    fontSize: 20,
  },
  countDisplay: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  countText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  generationMessage: {
    position: 'absolute',
    top: 120,
    left: 20,
    right: 20,
    alignItems: 'center',
    zIndex: 15,
  },
  generationMessageText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    backgroundColor: 'rgba(40, 167, 69, 0.9)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    textAlign: 'center',
    borderWidth: 2,
    borderColor: '#28a745',
  },
});