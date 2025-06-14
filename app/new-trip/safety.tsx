import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTrip } from '../../contexts/TripContext';

interface SafetyCheck {
  environment: boolean;
  mental: boolean;
  supplies: boolean;
  emergency: boolean;
  sitter: boolean;
  medications: boolean;
}

const SAFETY_ITEMS: Record<keyof SafetyCheck, string> = {
  environment: 'Safe environment',
  mental: 'Good mental state',
  supplies: 'Necessary supplies',
  emergency: 'Emergency plan',
  sitter: 'Trip sitter available',
  medications: 'Medications checked',
};

const REQUIRED_ITEMS: (keyof SafetyCheck)[] = ['environment', 'mental'];

const initialSafetyState: SafetyCheck = {
  environment: true,  // Pre-checked from setting screen
  mental: true,       // Pre-checked from set screen
  supplies: false,
  emergency: false,
  sitter: false,
  medications: false,
};

export default function SafetyScreen() {
  const router = useRouter();
  const { tripState, updateSafety, updateTripSitter } = useTrip();
  const [isEditingSitter, setIsEditingSitter] = useState(false);
  const [sitterForm, setSitterForm] = useState({
    name: '',
    phoneNumber: '',
    relationship: '',
  });

  // Initialize safety state if not already set
  React.useEffect(() => {
    if (!tripState.safety.environment && !tripState.safety.mental) {
      updateSafety(initialSafetyState);
    }
  }, []);

  const handleChecklistItemToggle = (key: keyof SafetyCheck) => {
    updateSafety({
      ...tripState.safety,
      [key]: !tripState.safety[key],
    });
  };

  const handleSitterSave = () => {
    updateTripSitter(sitterForm);
    updateSafety({
      ...tripState.safety,
      sitter: true,
    });
    setIsEditingSitter(false);
  };

  const handleSitterEdit = () => {
    if (tripState.tripSitter) {
      setSitterForm(tripState.tripSitter);
    }
    setIsEditingSitter(true);
  };

  const handleSitterRemove = () => {
    updateTripSitter(null);
    updateSafety({
      ...tripState.safety,
      sitter: false,
    });
  };

  const allRequiredChecked = REQUIRED_ITEMS.every(
    (key) => tripState.safety[key]
  );

  const handleContinue = () => {
    if (allRequiredChecked) {
      router.push('/new-trip/intentions');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.title}>Safety Checklist</Text>
          <Text style={styles.subtitle}>
            Please confirm each safety measure before proceeding
          </Text>
        </View>

        {/* Safety Checklist */}
        <View style={styles.checklist}>
          {Object.entries(tripState.safety).map(([key, checked]) => (
            <TouchableOpacity
              key={key}
              style={styles.checklistItem}
              onPress={() => handleChecklistItemToggle(key as keyof SafetyCheck)}
            >
              <View style={[styles.checkbox, checked && styles.checkedBox]}>
                {checked && <MaterialIcons name="check" size={20} color="white" />}
              </View>
              <View style={styles.checklistContent}>
                <Text style={styles.checklistText}>
                  {SAFETY_ITEMS[key as keyof SafetyCheck]}
                  {REQUIRED_ITEMS.includes(key as keyof SafetyCheck) && (
                    <Text style={styles.required}> *</Text>
                  )}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Trip Sitter Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trip Sitter</Text>
          {isEditingSitter ? (
            <View style={styles.sitterForm}>
              <TextInput
                style={styles.input}
                placeholder="Name"
                value={sitterForm.name}
                onChangeText={(text) => setSitterForm(prev => ({ ...prev, name: text }))}
              />
              <TextInput
                style={styles.input}
                placeholder="Phone Number"
                value={sitterForm.phoneNumber}
                onChangeText={(text) => setSitterForm(prev => ({ ...prev, phoneNumber: text }))}
                keyboardType="phone-pad"
              />
              <TextInput
                style={styles.input}
                placeholder="Relationship (e.g., Friend, Partner)"
                value={sitterForm.relationship}
                onChangeText={(text) => setSitterForm(prev => ({ ...prev, relationship: text }))}
              />
              <View style={styles.sitterFormButtons}>
                <Pressable
                  style={[styles.sitterFormButton, styles.cancelButton]}
                  onPress={() => {
                    if (tripState.tripSitter) {
                      setIsEditingSitter(false);
                    }
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.sitterFormButton,
                    styles.saveButton,
                    (!sitterForm.name || !sitterForm.phoneNumber || !sitterForm.relationship) && styles.disabledButton
                  ]}
                  onPress={handleSitterSave}
                  disabled={!sitterForm.name || !sitterForm.phoneNumber || !sitterForm.relationship}
                >
                  <Text style={styles.saveButtonText}>Save</Text>
                </Pressable>
              </View>
            </View>
          ) : tripState.tripSitter ? (
            <View style={styles.sitterCard}>
              <View style={styles.sitterInfo}>
                <Text style={styles.sitterName}>{tripState.tripSitter.name}</Text>
                <Text style={styles.sitterDetail}>{tripState.tripSitter.relationship}</Text>
                <Text style={styles.sitterDetail}>{tripState.tripSitter.phoneNumber}</Text>
              </View>
              <View style={styles.sitterActions}>
                <TouchableOpacity
                  style={styles.sitterActionButton}
                  onPress={handleSitterEdit}
                >
                  <MaterialIcons name="edit" size={20} color="#0967D2" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.sitterActionButton}
                  onPress={handleSitterRemove}
                >
                  <MaterialIcons name="delete" size={20} color="#DC2626" />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.addSitterButton}
              onPress={() => setIsEditingSitter(true)}
            >
              <MaterialIcons name="person-add" size={20} color="#0967D2" />
              <Text style={styles.addSitterText}>Add Trip Sitter</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Continue Button */}
        <Pressable
          style={[
            styles.continueButton,
            !allRequiredChecked && styles.disabledButton
          ]}
          onPress={handleContinue}
          disabled={!allRequiredChecked}
        >
          <Text style={styles.continueButtonText}>
            Continue to Intentions
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  checklist: {
    marginBottom: 24,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E4E7EB',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#0967D2',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkedBox: {
    backgroundColor: '#0967D2',
    borderColor: '#0967D2',
  },
  checklistContent: {
    flex: 1,
  },
  checklistText: {
    fontSize: 16,
    fontWeight: '600',
  },
  required: {
    color: '#E12D39',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  sitterForm: {
    gap: 12,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  sitterFormButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  sitterFormButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e1e1e1',
  },
  saveButton: {
    backgroundColor: '#0967D2',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  addSitterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#0967D2',
    borderRadius: 8,
    padding: 16,
  },
  addSitterText: {
    color: '#0967D2',
    fontSize: 16,
    fontWeight: '600',
  },
  continueButton: {
    backgroundColor: '#0967D2',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#E4E7EB',
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  sitterCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sitterInfo: {
    flex: 1,
  },
  sitterName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  sitterDetail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  sitterActions: {
    flexDirection: 'row',
    gap: 12,
  },
  sitterActionButton: {
    padding: 8,
  },
}); 