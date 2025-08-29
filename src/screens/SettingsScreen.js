import React, { useState } from 'react';
import { 
  View, 
  ScrollView, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView,
  Switch,
  Alert 
} from 'react-native';

export default function SettingsScreen() {
  const [settings, setSettings] = useState({
    autoAnalyze: false,
    highQualityImages: true,
    notifications: true,
    autoPost: false,
    saveTemplates: true,
  });

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleConnectEbay = () => {
    Alert.alert(
      'Connect eBay Account',
      'eBay authentication will be handled by your backend API.',
      [{ text: 'OK' }]
    );
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will delete all photos, listings, and templates. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear Data', 
          style: 'destructive', 
          onPress: () => {
            Alert.alert('Success', 'Data cleared successfully');
          }
        },
      ]
    );
  };

  const SettingRow = ({ title, subtitle, value, onValueChange, type = 'switch' }) => (
    <View style={styles.settingRow}>
      <View style={styles.settingText}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {type === 'switch' ? (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: '#767577', true: '#0066CC' }}
          thumbColor={'#f4f3f4'}
        />
      ) : (
        <TouchableOpacity onPress={onValueChange}>
          <Text style={styles.settingAction}>{value}</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>eBay Integration</Text>
          
          <TouchableOpacity style={styles.connectButton} onPress={handleConnectEbay}>
            <Text style={styles.connectButtonText}>Connect eBay Account</Text>
            <Text style={styles.connectSubtext}>Required to post listings</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Photo Processing</Text>
          
          <SettingRow
            title="Auto-analyze photos"
            subtitle="Automatically generate listings when photos are uploaded"
            value={settings.autoAnalyze}
            onValueChange={(value) => handleSettingChange('autoAnalyze', value)}
          />
          
          <SettingRow
            title="High quality images"
            subtitle="Use maximum resolution for better eBay presentation"
            value={settings.highQualityImages}
            onValueChange={(value) => handleSettingChange('highQualityImages', value)}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Listings</Text>
          
          <SettingRow
            title="Auto-post approved listings"
            subtitle="Automatically post listings after you approve them"
            value={settings.autoPost}
            onValueChange={(value) => handleSettingChange('autoPost', value)}
          />
          
          <SettingRow
            title="Save as templates"
            subtitle="Save successful listings as templates"
            value={settings.saveTemplates}
            onValueChange={(value) => handleSettingChange('saveTemplates', value)}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          
          <SettingRow
            title="Push notifications"
            subtitle="Get notified about listing status and sales"
            value={settings.notifications}
            onValueChange={(value) => handleSettingChange('notifications', value)}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          
          <TouchableOpacity style={styles.dataButton} onPress={handleClearData}>
            <Text style={styles.dataButtonText}>Clear All Data</Text>
            <Text style={styles.dataSubtext}>Delete photos, listings, and templates</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>Version</Text>
            <Text style={styles.aboutValue}>1.0.0</Text>
          </View>
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>Build</Text>
            <Text style={styles.aboutValue}>2024.01.28</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    flex: 1,
  },
  section: {
    backgroundColor: 'white',
    marginBottom: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingText: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  settingAction: {
    fontSize: 16,
    color: '#0066CC',
    fontWeight: '600',
  },
  connectButton: {
    backgroundColor: '#0066CC',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  connectButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  connectSubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  dataButton: {
    backgroundColor: '#dc3545',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  dataButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  dataSubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  aboutLabel: {
    fontSize: 16,
    color: '#333',
  },
  aboutValue: {
    fontSize: 16,
    color: '#666',
  },
});