import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

/**
 * EditableField component for editing listing metadata
 * @param {Object} props - Component props
 * @param {string} props.label - Field label
 * @param {string} props.value - Field value
 * @param {Function} props.onSave - Callback when value is saved
 * @param {string} props.placeholder - Input placeholder
 * @param {boolean} props.multiline - Whether input should be multiline
 * @param {string} props.keyboardType - Keyboard type for input
 */
export default function EditableField({ 
  label, 
  value, 
  onSave, 
  placeholder = '', 
  multiline = false,
  keyboardType = 'default'
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  const handleSave = () => {
    onSave(editValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <View style={styles.container}>
        <Text style={styles.label}>{label}</Text>
        <TextInput
          style={[styles.input, multiline && styles.multilineInput]}
          value={editValue}
          onChangeText={setEditValue}
          placeholder={placeholder}
          multiline={multiline}
          numberOfLines={multiline ? 4 : 1}
          keyboardType={keyboardType}
          autoFocus
        />
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <TouchableOpacity style={styles.container} onPress={() => setIsEditing(true)}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, multiline && styles.multilineValue]}>
        {value || placeholder}
      </Text>
      <Text style={styles.editHint}>Tap to edit</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#333',
    minHeight: 24,
  },
  multilineValue: {
    minHeight: 60,
  },
  input: {
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#0066CC',
    borderRadius: 6,
    padding: 8,
    backgroundColor: 'white',
    marginBottom: 8,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#0066CC',
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  editHint: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 4,
  },
});