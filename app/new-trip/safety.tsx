import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTrip } from '../../contexts/TripContext';
import { TripSitter, useTripSitter } from '../../contexts/TripSitterContext';

interface SafetyCheck {
  environment: boolean;
  mental: boolean;
  emergencyPlan: boolean;
  tripSitter: boolean;
  tripSitterInfo?: TripSitter | { name: string; phone: string; relationship: string } | null;
}

const REQUIRED_ITEMS: (keyof SafetyCheck)[] = ['environment', 'mental'];

const initialSafetyState: SafetyCheck = {
  environment: true,
  mental: true,
  emergencyPlan: false,
  tripSitter: false,
  tripSitterInfo: null
};

const SAFETY_ITEMS: Record<keyof SafetyCheck, string> = {
  environment: 'Safe environment',
  mental: 'Good mental state',
  emergencyPlan: 'Backup plan',
  tripSitter: 'Trip sitter',
  tripSitterInfo: 'Trip sitter info'
};

const validatePhoneNumber = (phone: string): boolean => {
  // Remove any non-digit characters
  const digitsOnly = phone.replace(/\D/g, '');
  // Check if it's a valid length (7-15 digits)
  return digitsOnly.length >= 7 && digitsOnly.length <= 15;
};

const validateSitterInfo = (sitter: typeof newSitter): boolean => {
  if (!sitter.name.trim()) return false;
  if (!validatePhoneNumber(sitter.phone)) return false;
  if (!sitter.relationship.trim()) return false;
  return true;
};

export default function SafetyScreen() {
  const router = useRouter();
  const { updateSafety } = useTrip();
  const { tripSitters, isLoading } = useTripSitter();
  const [safetyCheck, setSafetyCheck] = useState<SafetyCheck>(initialSafetyState);
  const [selectedSitterId, setSelectedSitterId] = useState<string | null>(null);
  const [showSitterForm, setShowSitterForm] = useState(false);
  const [newSitter, setNewSitter] = useState({
    name: '',
    phone: '',
    relationship: '',
  });
  const [errors, setErrors] = useState<{
    sitterName?: string;
    sitterPhone?: string;
    sitterRelationship?: string;
  }>({});

  const toggleCheck = (item: keyof SafetyCheck) => {
    setSafetyCheck(prev => ({
      ...prev,
      [item]: !prev[item],
    }));
  };

  const handleAddSitter = () => {
    const newErrors = {
      sitterName: !newSitter.name.trim() ? 'Name is required' : undefined,
      sitterPhone: !validatePhoneNumber(newSitter.phone) ? 'Invalid phone number' : undefined,
      sitterRelationship: !newSitter.relationship.trim() ? 'Relationship is required' : undefined,
    };

    setErrors(newErrors);

    if (Object.values(newErrors).some(error => error)) {
      return;
    }

    // ... rest of add sitter logic ...
  };

  const handleContinue = () => {
    const allRequiredChecked = REQUIRED_ITEMS.every(item => safetyCheck[item]);
    
    if (!allRequiredChecked) {
      Alert.alert(
        "Safety Check Required",
        "Please complete all required safety checks before continuing.",
        [{ text: "OK" }]
      );
      return;
    }

    if (safetyCheck.tripSitter && !selectedSitterId && !validateSitterInfo(newSitter)) {
      Alert.alert(
        "Trip Sitter Information Required",
        "Please provide valid trip sitter information or select an existing trip sitter.",
        [{ text: "OK" }]
      );
      return;
    }

    updateSafety({
      ...safetyCheck,
      tripSitterInfo: selectedSitterId 
        ? tripSitters.find(s => s.id === selectedSitterId)
        : newSitter.name ? newSitter : null,
    });
    router.push('/new-trip/intentions');
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0967D2" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F3F4F6' }}>
      <View style={styles.header}>
        <Text style={styles.title}>Safety Checklist</Text>
      </View>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 40, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Text style={styles.subtitle}>
            Please confirm these safety measures before proceeding
          </Text>

          {/* Safety Checklist */}
          <View style={styles.checklist}>
            {Object.entries(SAFETY_ITEMS).map(([key, label]) => {
              if (key === 'tripSitterInfo') return null;
              const isRequired = REQUIRED_ITEMS.includes(key as keyof SafetyCheck);
              return (
                <Pressable
                  key={key}
                  style={styles.checkboxContainer}
                  onPress={() => toggleCheck(key as keyof SafetyCheck)}
                >
                  <View style={[styles.checkbox, safetyCheck[key as keyof SafetyCheck] && styles.checkboxChecked]}>
                    {safetyCheck[key as keyof SafetyCheck] && (
                      <MaterialIcons name="check" size={20} color="#fff" />
                    )}
                  </View>
                  <Text style={styles.checkboxLabel}>
                    {label}
                    {isRequired && <Text style={styles.required}> *</Text>}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Trip Sitter Section */}
          {safetyCheck.tripSitter && (
            <View style={styles.sitterSection}>
              <Text style={styles.sectionTitle}>Trip Sitter</Text>
              
              {/* Select from saved sitters */}
              {tripSitters.length > 0 && (
                <View style={styles.savedSitters}>
                  <Text style={styles.sectionSubtitle}>Select a saved trip sitter:</Text>
                  {tripSitters.map(sitter => (
                    <Pressable
                      key={sitter.id}
                      style={[
                        styles.sitterCard,
                        selectedSitterId === sitter.id && styles.selectedSitterCard
                      ]}
                      onPress={() => setSelectedSitterId(sitter.id)}
                    >
                      <Text style={styles.sitterName}>{sitter.name}</Text>
                      <Text style={styles.sitterDetails}>{sitter.phone}</Text>
                      <Text style={styles.sitterDetails}>{sitter.relationship}</Text>
                    </Pressable>
                  ))}
                </View>
              )}

              {/* Add new sitter */}
              <Pressable
                style={styles.addSitterButton}
                onPress={() => setShowSitterForm(!showSitterForm)}
              >
                <Text style={styles.addSitterText}>
                  {showSitterForm ? 'Cancel' : 'Add New Trip Sitter'}
                </Text>
              </Pressable>

              {showSitterForm && (
                <View style={styles.sitterForm}>
                  <TextInput
                    style={styles.input}
                    placeholder="Name"
                    value={newSitter.name}
                    onChangeText={(text) => setNewSitter({ ...newSitter, name: text })}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Phone Number"
                    value={newSitter.phone}
                    onChangeText={(text) => setNewSitter({ ...newSitter, phone: text })}
                    keyboardType="phone-pad"
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Relationship"
                    value={newSitter.relationship}
                    onChangeText={(text) => setNewSitter({ ...newSitter, relationship: text })}
                  />
                </View>
              )}
            </View>
          )}

          {/* Continue Button */}
          <Pressable
            style={[
              styles.continueButton,
              !REQUIRED_ITEMS.every(item => safetyCheck[item]) && styles.disabledButton
            ]}
            onPress={handleContinue}
            disabled={!REQUIRED_ITEMS.every(item => safetyCheck[item])}
          >
            <Text style={styles.continueButtonText}>
              Continue to Intentions
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  checklist: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
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
  checkboxChecked: {
    backgroundColor: '#0967D2',
  },
  checkboxLabel: {
    fontSize: 16,
    flex: 1,
  },
  required: {
    color: 'red',
  },
  sitterSection: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  savedSitters: {
    marginBottom: 16,
  },
  sitterCard: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedSitterCard: {
    borderWidth: 2,
    borderColor: '#0967D2',
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
  addSitterButton: {
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  addSitterText: {
    color: '#0967D2',
    fontSize: 16,
  },
  sitterForm: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 8,
  },
  input: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E4E7EB',
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
    fontWeight: 'bold',
  },
}); 