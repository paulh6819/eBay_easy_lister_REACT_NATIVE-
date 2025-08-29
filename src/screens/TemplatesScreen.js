import React, { useEffect } from 'react';
import { 
  View, 
  ScrollView, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView,
  Alert 
} from 'react-native';
import { useTemplates } from '../contexts/TemplateContext';

export default function TemplatesScreen() {
  const { 
    savedTemplates, 
    soldListings, 
    isLoading, 
    setSavedTemplates,
    setSoldListings,
    deleteTemplate 
  } = useTemplates();

  useEffect(() => {
    loadTemplatesAndSoldItems();
  }, []);

  const loadTemplatesAndSoldItems = () => {
    const mockTemplates = [
      {
        id: 'template_1',
        name: 'Electronics Template',
        title: 'Like New [BRAND] [MODEL] - Works Perfect!',
        description: 'Excellent condition [ITEM] with original packaging...',
        category: 'Electronics',
        condition: 'Used',
        shipping: 'Fast & Free',
        dateCreated: new Date().toISOString(),
      },
      {
        id: 'template_2',
        name: 'Book Template',
        title: '[TITLE] by [AUTHOR] - [CONDITION]',
        description: 'Great book in [CONDITION] condition. Pages are clean...',
        category: 'Books',
        condition: 'Very Good',
        shipping: 'Media Mail',
        dateCreated: new Date().toISOString(),
      },
    ];

    const mockSoldItems = [
      {
        id: 'sold_1',
        title: 'iPhone 12 Pro 256GB Unlocked',
        soldPrice: '650.00',
        soldDate: '2024-01-15',
        category: 'Electronics',
        views: 234,
        watchers: 12,
      },
      {
        id: 'sold_2',
        title: 'The Great Gatsby - F. Scott Fitzgerald',
        soldPrice: '15.99',
        soldDate: '2024-01-10',
        category: 'Books',
        views: 89,
        watchers: 3,
      },
    ];

    setSavedTemplates(mockTemplates);
    setSoldListings(mockSoldItems);
  };

  const handleDeleteTemplate = (templateId, templateName) => {
    Alert.alert(
      'Delete Template',
      `Are you sure you want to delete "${templateName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: () => deleteTemplate(templateId) 
        },
      ]
    );
  };

  const handleCreateTemplate = () => {
    Alert.alert(
      'Create Template',
      'Template creation will be available when integrated with your backend API.'
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Saved Templates</Text>
            <TouchableOpacity onPress={handleCreateTemplate}>
              <Text style={styles.createButton}>+ New</Text>
            </TouchableOpacity>
          </View>
          
          {savedTemplates.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No templates saved yet</Text>
              <Text style={styles.emptySubtext}>
                Create templates to speed up your listing process
              </Text>
            </View>
          ) : (
            savedTemplates.map((template) => (
              <View key={template.id} style={styles.templateCard}>
                <View style={styles.templateHeader}>
                  <Text style={styles.templateName}>{template.name}</Text>
                  <TouchableOpacity
                    onPress={() => handleDeleteTemplate(template.id, template.name)}
                  >
                    <Text style={styles.deleteButton}>Delete</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.templateTitle} numberOfLines={2}>
                  {template.title}
                </Text>
                <Text style={styles.templateDescription} numberOfLines={2}>
                  {template.description}
                </Text>
                <View style={styles.templateMeta}>
                  <Text style={styles.templateCategory}>{template.category}</Text>
                  <Text style={styles.templateDate}>
                    {new Date(template.dateCreated).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recently Sold Items</Text>
          
          {soldListings.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No sold items yet</Text>
              <Text style={styles.emptySubtext}>
                Your sold listings will appear here for reference
              </Text>
            </View>
          ) : (
            soldListings.map((item) => (
              <View key={item.id} style={styles.soldCard}>
                <Text style={styles.soldTitle} numberOfLines={2}>
                  {item.title}
                </Text>
                <View style={styles.soldMeta}>
                  <Text style={styles.soldPrice}>${item.soldPrice}</Text>
                  <Text style={styles.soldDate}>
                    Sold {new Date(item.soldDate).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.soldStats}>
                  <Text style={styles.soldStat}>{item.views} views</Text>
                  <Text style={styles.soldStat}>{item.watchers} watchers</Text>
                  <Text style={styles.soldCategory}>{item.category}</Text>
                </View>
              </View>
            ))
          )}
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  createButton: {
    fontSize: 16,
    color: '#0066CC',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  templateCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  templateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  templateName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  deleteButton: {
    fontSize: 14,
    color: '#dc3545',
  },
  templateTitle: {
    fontSize: 14,
    color: '#0066CC',
    marginBottom: 4,
  },
  templateDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  templateMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  templateCategory: {
    fontSize: 12,
    color: '#999',
  },
  templateDate: {
    fontSize: 12,
    color: '#999',
  },
  soldCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  soldTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  soldMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  soldPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#28a745',
  },
  soldDate: {
    fontSize: 14,
    color: '#666',
  },
  soldStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  soldStat: {
    fontSize: 12,
    color: '#999',
  },
  soldCategory: {
    fontSize: 12,
    color: '#0066CC',
  },
});