import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTrip } from '../../contexts/TripContext';

const DOSE_LEVELS = [
  {
    name: 'Mini',
    range: '0.25 - 0.75g',
    description: 'Subtle effects, good for beginners',
    intensity: 1,
    requiresWarning: false,
  },
  {
    name: 'Museum',
    range: '0.5 - 1.5g',
    description: 'Mild effects, increased awareness',
    intensity: 2,
    requiresWarning: false,
  },
  {
    name: 'Moderate',
    range: '2 - 3.5g',
    description: 'Strong effects, good for experienced users',
    intensity: 3,
    requiresWarning: false,
  },
  {
    name: 'Mega',
    range: '3.5 - 5g',
    description: 'Intense effects, for experienced users only',
    intensity: 4,
    requiresWarning: true,
  },
  {
    name: 'Heroic',
    range: '5+ g',
    description: 'Extreme effects, only for very experienced users',
    intensity: 5,
    requiresWarning: true,
  },
];

export default function DoseSelectionScreen() {
  const router = useRouter();
  const [selectedDose, setSelectedDose] = useState<string | null>(null);
  const { updateDose } = useTrip();

  const handleDoseSelect = (dose: string) => {
    setSelectedDose(dose);
  };

  const handleContinue = () => {
    if (selectedDose) {
      const doseData = DOSE_LEVELS.find(d => d.name === selectedDose);
      if (doseData) {
        updateDose({
          name: doseData.name,
          range: doseData.range,
          description: doseData.description,
        });
      }
      router.push('/new-trip/setting');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.title}>Select Your Dose</Text>
          <Text style={styles.subtitle}>
            Choose a dose level that matches your experience and intentions
          </Text>
        </View>

        {/* Dose Level Cards */}
        <View style={styles.cardsContainer}>
          {DOSE_LEVELS.map((dose) => (
            <TouchableOpacity
              key={dose.name}
              style={[
                styles.card,
                selectedDose === dose.name && styles.selectedCard,
              ]}
              onPress={() => handleDoseSelect(dose.name)}
            >
              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <View style={styles.titleContainer}>
                    <Text style={styles.doseName}>{dose.name}</Text>
                    {dose.requiresWarning && (
                      <MaterialIcons
                        name="warning"
                        size={24}
                        color="#E12D39"
                        style={styles.warningIcon}
                      />
                    )}
                  </View>
                  <Text style={styles.doseRange}>{dose.range}</Text>
                  <Text style={styles.doseDescription}>
                    {dose.description}
                    {dose.requiresWarning && 
                      ' - Recommended for experienced users only'}
                  </Text>
                </View>

                <View style={styles.intensityContainer}>
                  <Text style={styles.intensityLabel}>Intensity Level</Text>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill,
                        { width: `${dose.intensity * 20}%` }
                      ]} 
                    />
                  </View>
                </View>

                <Pressable
                  style={[
                    styles.selectButton,
                    selectedDose === dose.name && styles.selectedButton
                  ]}
                  onPress={() => handleDoseSelect(dose.name)}
                >
                  <Text style={[
                    styles.buttonText,
                    selectedDose === dose.name && styles.selectedButtonText
                  ]}>
                    {selectedDose === dose.name ? 'Selected' : 'Select'}
                  </Text>
                </Pressable>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Safety Note */}
        <View style={styles.safetyCard}>
          <View style={styles.safetyContent}>
            <MaterialIcons
              name="warning"
              size={24}
              color="#F59E0B"
              style={styles.safetyIcon}
            />
            <Text style={styles.safetyText}>
              Always start with a lower dose if you're unsure. You can always
              take more, but you can't take less.
            </Text>
          </View>
        </View>

        {/* Continue Button */}
        <Pressable
          style={[styles.continueButton, !selectedDose && styles.disabledButton]}
          onPress={handleContinue}
          disabled={!selectedDose}
        >
          <Text style={styles.continueButtonText}>
            Continue to Set & Setting
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
  cardsContainer: {
    gap: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: '#0967D2',
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  doseName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  warningIcon: {
    marginLeft: 8,
  },
  doseRange: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  doseDescription: {
    fontSize: 14,
    color: '#666',
  },
  intensityContainer: {
    marginBottom: 16,
  },
  intensityLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E4E7EB',
    borderRadius: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#0967D2',
    borderRadius: 4,
  },
  selectButton: {
    width: '100%',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#0967D2',
    alignItems: 'center',
  },
  selectedButton: {
    backgroundColor: '#0967D2',
  },
  buttonText: {
    color: '#0967D2',
    fontWeight: '600',
  },
  selectedButtonText: {
    color: 'white',
  },
  safetyCard: {
    backgroundColor: '#F5F7FA',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E4E7EB',
    marginTop: 16,
    marginBottom: 24,
  },
  safetyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  safetyIcon: {
    marginRight: 12,
  },
  safetyText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
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
}); 