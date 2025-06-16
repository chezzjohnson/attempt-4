import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTrip } from '../../contexts/TripContext';

const DOSE_LEVELS = [
  {
    name: 'Mini',
    range: '0.25 - 0.75g',
    min: 0.25,
    max: 0.75,
    description: 'Subtle effects, good for beginners',
    intensity: 1,
    requiresWarning: false,
  },
  {
    name: 'Museum',
    range: '0.75 - 2g',
    min: 0.75,
    max: 2,
    description: 'Mild effects, increased awareness',
    intensity: 2,
    requiresWarning: false,
  },
  {
    name: 'Moderate',
    range: '2 - 3.5g',
    min: 2,
    max: 3.5,
    description: 'Strong effects, good for experienced users',
    intensity: 3,
    requiresWarning: false,
  },
  {
    name: 'Mega',
    range: '3.5 - 5g',
    min: 3.5,
    max: 5,
    description: 'Intense effects, for experienced users only',
    intensity: 4,
    requiresWarning: true,
  },
  {
    name: 'Heroic',
    range: '5+ g',
    min: 5,
    max: Infinity,
    description: 'Extreme effects, only for very experienced users',
    intensity: 5,
    requiresWarning: true,
  },
];

export default function DoseSelectionScreen() {
  const router = useRouter();
  const [selectedDose, setSelectedDose] = useState<string | null>(null);
  const [exactDose, setExactDose] = useState('');
  const [showSavedMessage, setShowSavedMessage] = useState(false);
  const [isDoseSaved, setIsDoseSaved] = useState(false);
  const { updateDose } = useTrip();

  const handleDoseSelect = (dose: string) => {
    setSelectedDose(dose);
    setExactDose(''); // Clear exact dose when selecting a range
    setIsDoseSaved(false); // Reset saved state when selecting a new dose
  };

  const handleExactDoseChange = (text: string) => {
    // Only allow numbers and one decimal point
    const cleanedText = text.replace(/[^0-9.]/g, '');
    
    // Handle decimal point logic
    if (cleanedText.length > 0) {
      const parts = cleanedText.split('.');
      if (parts.length > 2) {
        // If more than one decimal point, keep only the first one
        setExactDose(parts[0] + '.' + parts.slice(1).join(''));
        return;
      }
      
      // Limit to 2 decimal places
      if (parts[1] && parts[1].length > 2) {
        setExactDose(parts[0] + '.' + parts[1].slice(0, 2));
        return;
      }
    }
    
    setExactDose(cleanedText);
    setIsDoseSaved(false); // Reset saved state when changing dose
    setSelectedDose(null); // Clear selected dose when typing
  };

  const handleSaveExactDose = () => {
    const doseNum = parseFloat(exactDose);
    if (!isNaN(doseNum)) {
      const matchingDose = DOSE_LEVELS.find(
        level => doseNum >= level.min && doseNum <= level.max
      );
      if (matchingDose) {
        setSelectedDose(matchingDose.name);
        setShowSavedMessage(true);
        setIsDoseSaved(true);
        setTimeout(() => {
          setShowSavedMessage(false);
        }, 1500);
      } else {
        setSelectedDose(null);
        setShowSavedMessage(true);
        setIsDoseSaved(true);
        setTimeout(() => {
          setShowSavedMessage(false);
        }, 1500);
      }
    }
  };

  const handleContinue = () => {
    if (selectedDose || exactDose) {
      const doseData = DOSE_LEVELS.find(d => d.name === selectedDose);
      if (doseData) {
        const doseInfo = {
          name: doseData.name,
          range: exactDose ? `${exactDose}g` : doseData.range,
          description: doseData.description,
        };
        updateDose(doseInfo);
        router.push('/new-trip/setting');
      }
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

        {/* Exact Dose Input */}
        <View style={styles.exactDoseContainer}>
          <Text style={styles.sectionTitle}>Enter Exact Dose</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={exactDose}
              onChangeText={handleExactDoseChange}
              placeholder="Input exact dose level"
              keyboardType="decimal-pad"
              maxLength={5}
            />
            <Text style={styles.unitText}>g</Text>
          </View>
          <TouchableOpacity
            style={[
              styles.saveButton,
              (!exactDose || isDoseSaved) && styles.disabledButton
            ]}
            onPress={handleSaveExactDose}
            disabled={!exactDose || isDoseSaved}
          >
            <Text style={[
              styles.saveButtonText,
              isDoseSaved && styles.disabledButtonText
            ]}>
              {isDoseSaved ? 'Dose Saved' : 'Save Exact Dose'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Selected Dose Display */}
        {(selectedDose || (exactDose && isDoseSaved)) && (
          <View style={styles.selectedDoseContainer}>
            <Text style={styles.selectedDoseText}>
              {exactDose && isDoseSaved
                ? `${exactDose}g ${selectedDose ? `(${selectedDose})` : ''}`
                : selectedDose}
            </Text>
          </View>
        )}

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
          style={[styles.continueButton, !selectedDose && !exactDose && styles.disabledButton]}
          onPress={handleContinue}
          disabled={!selectedDose && !exactDose}
        >
          <Text style={styles.continueButtonText}>
            Continue to Set & Setting
          </Text>
        </Pressable>

        {/* Saved Message */}
        {showSavedMessage && (
          <View style={styles.savedMessage}>
            <Text style={styles.savedMessageText}>
              {exactDose 
                ? `Saved ${exactDose}g ${selectedDose ? `(${selectedDose})` : ''}`
                : `Saved ${selectedDose} dose`}
            </Text>
          </View>
        )}
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  exactDoseContainer: {
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
  },
  unitText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 4,
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
  savedMessage: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -100 }, { translateY: -20 }],
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  savedMessageText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: '#0967D2',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButtonText: {
    color: '#9CA3AF',
  },
  selectedDoseContainer: {
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#0967D2',
  },
  selectedDoseText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0967D2',
    textAlign: 'center',
  },
}); 