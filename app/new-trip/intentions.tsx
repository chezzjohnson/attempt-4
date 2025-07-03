import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Caption, Heading } from '../../components/ui/Typography';
import { Colors } from '../../constants/DesignSystem';
import { useIntentions } from '../../contexts/IntentionsContext';
import { useTrip } from '../../contexts/TripContext';

interface Intention {
  id: string;
  text: string;
  description: string;
}

const MAX_INTENTION_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 500;
const MAX_INTENTIONS = 5;

export default function IntentionsScreen() {
  const router = useRouter();
  const { tripState, updateIntentions } = useTrip();
  const { intentions, getIntentionUsageCount, addIntention } = useIntentions();
  const [newIntention, setNewIntention] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
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

  const handleAddNewIntention = () => {
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

    // Add to IntentionsContext
    const intentionId = addIntention(newIntention.trim(), newDescription.trim());
    
    // Add to current trip state
    const intention: Intention = {
      id: intentionId,
      text: newIntention.trim(),
      description: newDescription.trim(),
    };
    
    updateIntentions([...tripState.intentions, intention]);
    setNewIntention('');
    setNewDescription('');
    setErrors({});
    setShowCreateForm(false);
  };

  const handleSelectExistingIntention = (intention: any) => {
    const usageCount = getIntentionUsageCount(intention.id);
    
    if (usageCount >= 3) {
      Alert.alert(
        "Intention Limit Reached",
        "This intention has already been used in 3 trips and cannot be used again.",
        [{ text: "OK" }]
      );
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

    // Check if intention is already selected
    const isAlreadySelected = tripState.intentions.some(tripIntention => tripIntention.id === intention.id);
    if (isAlreadySelected) {
      Alert.alert(
        "Intention Already Selected",
        "This intention is already added to your trip.",
        [{ text: "OK" }]
      );
      return;
    }

    // Add to current trip state
    const tripIntention: Intention = {
      id: intention.id,
      text: intention.text,
      description: intention.description || '',
    };
    
    updateIntentions([...tripState.intentions, tripIntention]);
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

  const availableIntentions = intentions.filter(intention => getIntentionUsageCount(intention.id) < 3);
  const selectedIntentionIds = tripState.intentions.map(intention => intention.id);

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView 
        style={styles.container}
        keyboardShouldPersistTaps="handled"
      >
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
            <Heading variant="h1">Set Your Intentions</Heading>
            <Heading variant="h3" style={styles.subtitle}>
              What would you like to explore or work on during this trip?
            </Heading>
        </View>

          {/* Selected Intentions */}
          <View style={styles.selectedSection}>
            <Heading variant="h2" style={styles.sectionTitle}>
              Selected Intentions ({tripState.intentions.length}/{MAX_INTENTIONS})
            </Heading>
            <Caption style={styles.sectionDescription}>
              Choose up to {MAX_INTENTIONS} intentions for this trip
            </Caption>
            
        <View style={styles.intentionsList}>
          {tripState.intentions.map((intention) => (
            <View key={intention.id} style={styles.intentionItem}>
              <View style={styles.intentionContent}>
                    <MaterialIcons name="check-circle" size={24} color="#10B981" style={{ marginRight: 12 }} />
                <View style={styles.intentionTextContainer}>
                  <Text style={styles.intentionText}>{intention.text}</Text>
                  {intention.description && (
                        <Text style={styles.intentionDescription}>{intention.description}</Text>
                  )}
                </View>
              </View>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemoveIntention(intention.id)}
              >
                    <MaterialIcons name="remove-circle" size={24} color="#EF4444" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
          </View>

          {/* Existing Intentions */}
          <View style={styles.existingSection}>
            <Heading variant="h2" style={styles.sectionTitle}>
              Your Previous Intentions
            </Heading>
            <Caption style={styles.sectionDescription}>
              Select from intentions you've used before
            </Caption>
            
            <View style={styles.existingIntentionsList}>
              {availableIntentions.map((intention) => (
                <TouchableOpacity
                  key={intention.id}
                  style={[
                    styles.existingIntentionItem,
                    tripState.intentions.some(si => si.id === intention.id) && styles.selectedExistingItem
                  ]}
                  onPress={() => handleSelectExistingIntention(intention)}
                  disabled={tripState.intentions.some(si => si.id === intention.id)}
                >
                  <View style={styles.existingIntentionContent}>
                    <Text style={styles.existingIntentionText}>{intention.text}</Text>
                    {intention.description && (
                      <Text style={styles.existingIntentionDescription}>{intention.description}</Text>
                    )}
                    <View style={styles.usageInfo}>
                      <MaterialIcons name="history" size={16} color="#6B7280" />
                      <Caption style={{ marginLeft: 4 }}>
                        Used {getIntentionUsageCount(intention.id)} time{getIntentionUsageCount(intention.id) !== 1 ? 's' : ''}
                      </Caption>
                    </View>
                  </View>
                  {tripState.intentions.some(si => si.id === intention.id) && (
                    <MaterialIcons name="check-circle" size={24} color="#10B981" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Create New Intention */}
          <Card style={styles.createSection}>
            <View style={styles.createHeader}>
              <Heading variant="h3">
                Create New Intention
              </Heading>
              <Button
                title={showCreateForm ? "Cancel" : "Add New"}
                variant={showCreateForm ? "secondary" : "primary"}
                size="small"
                onPress={() => setShowCreateForm(!showCreateForm)}
              />
            </View>
            
            {showCreateForm && (
              <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.addIntention}>
          <TextInput
            style={[styles.input, styles.textInput]}
            placeholder="Add an intention"
            value={newIntention}
            onChangeText={setNewIntention}
                    returnKeyType="next"
                    blurOnSubmit={false}
          />
                  {errors.intention && (
                    <Caption color={Colors.error[500]} style={styles.errorText}>
                      {errors.intention}
                    </Caption>
                  )}
          <TextInput
            style={[styles.input, styles.descriptionInput]}
            placeholder="Description (optional)"
            value={newDescription}
            onChangeText={setNewDescription}
            multiline
                    returnKeyType="done"
                    blurOnSubmit={true}
                    onSubmitEditing={() => {
                      Keyboard.dismiss();
                    }}
                  />
                  {errors.description && (
                    <Caption color={Colors.error[500]} style={styles.errorText}>
                      {errors.description}
                    </Caption>
                  )}
                  <Button
                    title="Add Intention"
                    variant="primary"
                    onPress={handleAddNewIntention}
            disabled={!newIntention.trim()}
                    style={styles.addButton}
                  />
                </View>
              </TouchableWithoutFeedback>
            )}
          </Card>

        {/* Continue Button */}
          <Button
            title="Continue to Review"
            variant="primary"
            size="large"
          onPress={handleContinue}
            style={styles.continueButton}
          />
      </View>
    </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2933',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
  },
  selectedSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  sectionDescription: {
    marginBottom: 16,
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
  existingSection: {
    marginBottom: 24,
  },
  existingIntentionsList: {
    marginBottom: 24,
  },
  existingIntentionItem: {
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
  existingIntentionContent: {
    flexDirection: 'column',
  },
  existingIntentionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2933',
  },
  existingIntentionDescription: {
    fontSize: 14,
    color: '#4B5563',
    marginTop: 4,
  },
  usageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  selectedExistingItem: {
    backgroundColor: '#E5E7EB',
  },
  createSection: {
    marginBottom: 24,
  },
  createHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  addIntention: {
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 12,
  },
  textInput: {
    height: 48,
  },
  descriptionInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  addButton: {
    marginTop: 8,
  },
  errorText: {
    marginBottom: 12,
  },
  continueButton: {
    marginTop: 32,
  },
}); 