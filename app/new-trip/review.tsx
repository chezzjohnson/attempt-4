import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTrip } from '../../contexts/TripContext';

export default function ReviewScreen() {
  const router = useRouter();
  const { tripState, startTrip } = useTrip();

  const handleStartTrip = () => {
    startTrip();
    router.push('/trip/active');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Review Your Selections</Text>
          <Text style={styles.subtitle}>
            Please review your choices before starting your journey
          </Text>
        </View>

        {/* Dose Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="opacity" size={24} color="#666" />
            <Text style={styles.sectionTitle}>Dose</Text>
          </View>
          <View style={styles.sectionContent}>
            {tripState.dose && (
              <>
                <Text style={styles.doseText}>{tripState.dose.name}</Text>
                <Text style={styles.doseRange}>{tripState.dose.range}</Text>
                <Text style={styles.doseDescription}>
                  {tripState.dose.description}
                </Text>
              </>
            )}
          </View>
        </View>

        {/* Set & Setting Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="psychology" size={24} color="#666" />
            <Text style={styles.sectionTitle}>Set & Setting</Text>
          </View>
          <View style={styles.sectionContent}>
            {tripState.set && (
              <>
                <Text style={styles.settingText}>
                  Mental State: {tripState.set.mentalState}
                </Text>
                <Text style={styles.settingDescription}>
                  {tripState.set.description}
                </Text>
              </>
            )}
            <Text style={styles.settingDescription}>
              {tripState.setting}
            </Text>
          </View>
        </View>

        {/* Safety Check Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="security" size={24} color="#666" />
            <Text style={styles.sectionTitle}>Safety Check</Text>
          </View>
          <View style={styles.sectionContent}>
            {Object.entries(tripState.safety).map(([key, value]) => (
              <View key={key} style={styles.safetyItem}>
                <MaterialIcons
                  name={value ? "check-circle" : "cancel"}
                  size={20}
                  color={value ? "#4CAF50" : "#F44336"}
                />
                <Text style={styles.safetyText}>
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </Text>
              </View>
            ))}
            {tripState.tripSitter && (
              <View style={styles.tripSitterInfo}>
                <Text style={styles.tripSitterLabel}>Trip Sitter:</Text>
                <Text style={styles.tripSitterText}>
                  {tripState.tripSitter.name} ({tripState.tripSitter.relationship})
                </Text>
                <Text style={styles.tripSitterPhone}>
                  {tripState.tripSitter.phoneNumber}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Intentions Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="flag" size={24} color="#666" />
            <Text style={styles.sectionTitle}>Intentions</Text>
          </View>
          <View style={styles.sectionContent}>
            {tripState.intentions.map((intention) => (
              <View key={intention.id} style={styles.intentionItem}>
                <Text style={styles.intentionEmoji}>{intention.emoji}</Text>
                <View style={styles.intentionTextContainer}>
                  <Text style={styles.intentionText}>{intention.text}</Text>
                  {intention.description && (
                    <Text style={styles.intentionDescription}>
                      {intention.description}
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Start Journey Button */}
        <Pressable
          style={styles.startButton}
          onPress={handleStartTrip}
        >
          <Text style={styles.startButtonText}>Start Your Journey</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  section: {
    marginBottom: 30,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginLeft: 8,
  },
  sectionContent: {
    paddingLeft: 32,
  },
  doseText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  doseRange: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  doseDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  settingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  safetyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  safetyText: {
    fontSize: 14,
    color: '#1a1a1a',
    marginLeft: 8,
  },
  tripSitterInfo: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  tripSitterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  tripSitterText: {
    fontSize: 14,
    color: '#666',
  },
  tripSitterPhone: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  intentionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  intentionEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  intentionTextContainer: {
    flex: 1,
  },
  intentionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  intentionDescription: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  startButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
}); 