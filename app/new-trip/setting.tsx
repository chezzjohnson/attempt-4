import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTrip } from '../../contexts/TripContext';

export default function SettingScreen() {
  const router = useRouter();
  const { updateSet, updateSetting } = useTrip();
  const [isSettingSelected, setIsSettingSelected] = useState(false);
  const [isSetConfirmed, setIsSetConfirmed] = useState(false);

  const handleSettingSelect = () => {
    setIsSettingSelected(!isSettingSelected);
    if (!isSettingSelected) {
      updateSetting('Good setting');
    } else {
      updateSetting('');
    }
  };

  const handleSetConfirm = () => {
    setIsSetConfirmed(!isSetConfirmed);
    if (!isSetConfirmed) {
      updateSet({
        mentalState: 'Ready',
        description: 'I am in a good mental state and ready for this experience',
      });
    } else {
      updateSet(null);
    }
  };

  const handleContinue = () => {
    if (isSettingSelected && isSetConfirmed) {
      router.push('/new-trip/safety');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.title}>Set & Setting</Text>
          <Text style={styles.subtitle}>
            Your environment and mental state are crucial for a safe and meaningful experience
          </Text>
        </View>

        {/* Setting Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Setting</Text>
          <Text style={styles.sectionDescription}>
            Choose a comfortable and safe environment for your experience
          </Text>
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={handleSettingSelect}
          >
            <View style={[styles.checkbox, isSettingSelected && styles.checkedBox]}>
              {isSettingSelected && (
                <MaterialIcons name="check" size={20} color="white" />
              )}
            </View>
            <Text style={styles.checkboxLabel}>
              In a good setting
            </Text>
          </TouchableOpacity>
        </View>

        {/* Set Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Set</Text>
          <Text style={styles.sectionDescription}>
            Confirm that you are in a good mental state for this experience
          </Text>
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={handleSetConfirm}
          >
            <View style={[styles.checkbox, isSetConfirmed && styles.checkedBox]}>
              {isSetConfirmed && (
                <MaterialIcons name="check" size={20} color="white" />
              )}
            </View>
            <Text style={styles.checkboxLabel}>
              I am in a good mental state and ready for this experience
            </Text>
          </TouchableOpacity>
        </View>

        {/* Continue Button */}
        <Pressable
          style={[
            styles.continueButton,
            (!isSettingSelected || !isSetConfirmed) && styles.disabledButton
          ]}
          onPress={handleContinue}
          disabled={!isSettingSelected || !isSetConfirmed}
        >
          <Text style={styles.continueButtonText}>
            Continue to Safety
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
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
  checkboxLabel: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  continueButton: {
    backgroundColor: '#0967D2',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
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