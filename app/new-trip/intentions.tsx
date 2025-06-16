import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTrip } from '../../contexts/TripContext';

interface Intention {
  id: string;
  text: string;
  emoji: string;
  description: string;
}

const MAX_INTENTION_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 500;
const MAX_INTENTIONS = 5;

export default function IntentionsScreen() {
  const router = useRouter();
  const { tripState, updateIntentions } = useTrip();
  const [newIntention, setNewIntention] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [errors, setErrors] = useState<{
    intention?: string;
    description?: string;
  }>({});

  const validateIntention = (text: string): boolean => {
    if (!text.trim()) return false;
    if (text.length > MAX_INTENTION_LENGTH) return false;
    return true;
  };

  const validateDescription = (text: string): boolean => {
    if (text.length > MAX_DESCRIPTION_LENGTH) return false;
    return true;
  };

  const handleAddIntention = () => {
    const newErrors = {
      intention: !validateIntention(newIntention) 
        ? `Intention must be between 1 and ${MAX_INTENTION_LENGTH} characters` 
        : undefined,
      description: !validateDescription(newDescription)
        ? `Description must be less than ${MAX_DESCRIPTION_LENGTH} characters`
        : undefined,
    };

    setErrors(newErrors);

    if (Object.values(newErrors).some(error => error)) {
      return;
    }

    if (tripState.intentions.length >= MAX_INTENTIONS) {
      Alert.alert(
        "Maximum Intentions Reached",
        `You can add up to ${MAX_INTENTIONS} intentions for your trip.`,
        [{ text: "OK" }]
      );
      return;
    }

    const intention: Intention = {
      id: Date.now().toString(),
      text: newIntention.trim(),
      description: newDescription.trim(),
    };
    updateIntentions([...tripState.intentions, intention]);
    setNewIntention('');
    setNewDescription('');
    setErrors({});
  };

  const handleRemoveIntention = (id: string) => {
    updateIntentions(tripState.intentions.filter(intention => intention.id !== id));
  };

  const handleContinue = () => {
    if (tripState.intentions.length === 0) {
      Alert.alert(
        "No Intentions Added",
        "Would you like to continue without adding any intentions?",
        [
          {
            text: "Cancel",
            style: "cancel"
          },
          {
            text: "Continue",
            onPress: () => router.push('/new-trip/review')
          }
        ]
      );
      return;
    }
    router.push('/new-trip/review');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Intentions</Text>
          <Text style={styles.subtitle}>
            What would you like to explore or learn during this experience?
          </Text>
        </View>

        {/* Intentions List */}
        <View style={styles.intentionsList}>
          {tripState.intentions.map((intention) => (
            <View key={intention.id} style={styles.intentionItem}>
              <View style={styles.intentionContent}>
                <View style={styles.intentionTextContainer}>
                  <Text style={styles.intentionText}>{intention.text}</Text>
                  {intention.description && (
                    <Text style={styles.intentionDescription}>
                      {intention.description}
                    </Text>
                  )}
                </View>
              </View>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemoveIntention(intention.id)}
              >
                <MaterialIcons name="close" size={20} color="#666" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Add New Intention */}
        <View style={styles.addIntention}>
          <TextInput
            style={[styles.input, styles.textInput]}
            placeholder="Add an intention"
            value={newIntention}
            onChangeText={setNewIntention}
          />
          <TextInput
            style={[styles.input, styles.descriptionInput]}
            placeholder="Description (optional)"
            value={newDescription}
            onChangeText={setNewDescription}
            multiline
          />
          <TouchableOpacity
            style={[
              styles.addButton,
              !newIntention.trim() && styles.disabledButton
            ]}
            onPress={handleAddIntention}
            disabled={!newIntention.trim()}
          >
            <Text style={styles.addButtonText}>Add Intention</Text>
          </TouchableOpacity>
        </View>

        {/* Continue Button */}
        <Pressable
          style={styles.continueButton}
          onPress={handleContinue}
        >
          <Text style={styles.continueButtonText}>
            Continue to Review
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2933',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 24,
  },
  intentionsList: {
    marginBottom: 24,
  },
  intentionItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  intentionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  intentionTextContainer: {
    flexDirection: 'column',
  },
  intentionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2933',
  },
  intentionDescription: {
    fontSize: 14,
    color: '#4B5563',
    marginLeft: 36,
  },
  removeButton: {
    padding: 4,
  },
  addIntention: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1F2933',
    padding: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    marginBottom: 12,
  },
  textInput: {
    marginBottom: 12,
  },
  descriptionInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  addButton: {
    backgroundColor: '#0967D2',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#E5E7EB',
  },
  continueButton: {
    backgroundColor: '#0967D2',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 