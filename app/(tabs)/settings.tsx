import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTripSitter } from '../../contexts/TripSitterContext';

export default function SettingsScreen() {
  const { tripSitters, addTripSitter, removeTripSitter, isLoading } = useTripSitter();
  const [isAddingSitter, setIsAddingSitter] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newSitter, setNewSitter] = useState({
    name: '',
    phone: '',
    relationship: '',
    isUrgent: false,
  });

  const handleAddSitter = async () => {
    if (newSitter.name && newSitter.phone) {
      setIsSaving(true);
      try {
        await addTripSitter(newSitter);
        setNewSitter({ name: '', phone: '', relationship: '', isUrgent: false });
        setIsAddingSitter(false);
      } catch (error) {
        console.error('Error adding trip sitter:', error);
        // You might want to show an error message to the user here
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleDeleteSitter = async (id: string) => {
    try {
      await removeTripSitter(id);
    } catch (error) {
      console.error('Error removing trip sitter:', error);
      // You might want to show an error message to the user here
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0967D2" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Settings</Text>

        {/* Trip Sitter Management Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Trip Sitters</Text>
            <Pressable
              style={styles.addButton}
              onPress={() => setIsAddingSitter(true)}
            >
              <MaterialIcons name="add" size={24} color="#0967D2" />
            </Pressable>
          </View>

          {/* Add New Sitter Form */}
          {isAddingSitter && (
            <View style={styles.addSitterForm}>
              <TextInput
                style={styles.input}
                placeholder="Name"
                value={newSitter.name}
                onChangeText={(text) => setNewSitter({ ...newSitter, name: text })}
                editable={!isSaving}
              />
              <TextInput
                style={styles.input}
                placeholder="Phone Number"
                value={newSitter.phone}
                onChangeText={(text) => setNewSitter({ ...newSitter, phone: text })}
                keyboardType="phone-pad"
                editable={!isSaving}
              />
              <TextInput
                style={styles.input}
                placeholder="Relationship"
                value={newSitter.relationship}
                onChangeText={(text) => setNewSitter({ ...newSitter, relationship: text })}
                editable={!isSaving}
              />
              <View style={styles.formButtons}>
                <Pressable
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => setIsAddingSitter(false)}
                  disabled={isSaving}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={[styles.button, styles.saveButton, isSaving && styles.disabledButton]}
                  onPress={handleAddSitter}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text style={[styles.buttonText, styles.saveButtonText]}>Save</Text>
                  )}
                </Pressable>
              </View>
            </View>
          )}

          {/* Trip Sitter List */}
          <View style={styles.sitterList}>
            {tripSitters.map((sitter) => (
              <View key={sitter.id} style={styles.sitterCard}>
                <View style={styles.sitterInfo}>
                  <Text style={styles.sitterName}>{sitter.name}</Text>
                  <Text style={styles.sitterDetails}>{sitter.phone}</Text>
                  <Text style={styles.sitterDetails}>{sitter.relationship}</Text>
                </View>
                <Pressable
                  style={styles.deleteButton}
                  onPress={() => handleDeleteSitter(sitter.id)}
                >
                  <MaterialIcons name="delete" size={24} color="#E12D39" />
                </Pressable>
              </View>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  addButton: {
    padding: 8,
  },
  addSitterForm: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  input: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E4E7EB',
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#E4E7EB',
  },
  saveButton: {
    backgroundColor: '#0967D2',
  },
  disabledButton: {
    backgroundColor: '#A0AEC0',
  },
  buttonText: {
    fontSize: 16,
    color: '#666',
  },
  saveButtonText: {
    color: 'white',
  },
  sitterList: {
    gap: 12,
  },
  sitterCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 8,
  },
  sitterInfo: {
    flex: 1,
  },
  sitterName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  sitterDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  deleteButton: {
    padding: 8,
  },
}); 