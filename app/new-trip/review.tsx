import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTrip } from '../../contexts/TripContext';

interface Intention {
  emoji: string;
  text: string;
}

const StatusBox = ({ status, text }: { status: 'ready' | 'not-ready'; text: string }) => (
  <View style={[styles.statusBox, status === 'ready' ? styles.readyBox : styles.notReadyBox]}>
    <MaterialIcons 
      name={status === 'ready' ? "check-circle" : "cancel"} 
      size={16} 
      color={status === 'ready' ? "#059669" : "#DC2626"} 
    />
    <Text style={[styles.statusText, status === 'ready' ? styles.readyText : styles.notReadyText]}>
      {text}
    </Text>
  </View>
);

export default function ReviewScreen() {
  const router = useRouter();
  const { tripState, startTrip } = useTrip();

  const handleStartTrip = () => {
    startTrip();
    router.replace('/trip/active');
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Set Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Set</Text>
            <StatusBox status="ready" text="Mental state: Ready" />
          </View>
          <View style={styles.card}>
            <Text style={styles.cardText}>
              Your mental state is prepared for this experience. You're in a good place emotionally and mentally to begin your journey.
            </Text>
          </View>
        </View>

        {/* Setting Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Setting</Text>
            <StatusBox status="ready" text="Environment: Ready" />
          </View>
          <View style={styles.card}>
            <Text style={styles.cardText}>
              Your environment is safe and comfortable. You have everything you need for a positive experience.
            </Text>
          </View>
        </View>

        {/* Trip Sitter Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Trip Sitter</Text>
            <StatusBox 
              status={tripState.safety.tripSitter ? "ready" : "not-ready"} 
              text={tripState.safety.tripSitter ? "Trip sitter: Ready" : "No trip sitter selected"} 
            />
          </View>
          {tripState.safety.tripSitter ? (
            <View style={styles.card}>
              {tripState.safety.tripSitterInfo && (
                <>
                  <Text style={styles.sitterName}>{tripState.safety.tripSitterInfo.name}</Text>
                  <Text style={styles.sitterInfo}>{tripState.safety.tripSitterInfo.relationship}</Text>
                  <Text style={styles.sitterInfo}>{tripState.safety.tripSitterInfo.phone}</Text>
                </>
              )}
            </View>
          ) : (
            <View style={[styles.card, styles.notReadyCard]}>
              <Text style={styles.notReadyText}>No trip sitter selected</Text>
            </View>
          )}
        </View>

        {/* Safety Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Safety</Text>
            <StatusBox status="ready" text="Safety measures: Ready" />
          </View>
          <View style={styles.card}>
            <Text style={styles.cardText}>
              All safety measures are in place. You have a backup plan ready if needed.
            </Text>
          </View>
        </View>

        {/* Intentions Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Intentions</Text>
            <StatusBox 
              status={tripState.intentions.length > 0 ? "ready" : "not-ready"} 
              text={tripState.intentions.length > 0 ? "Intentions: Set" : "No intentions set"} 
            />
          </View>
          {tripState.intentions.length > 0 ? (
            <View style={styles.card}>
              {tripState.intentions.map((intention: Intention, index: number) => (
                <View key={index} style={styles.intentionItem}>
                  <Text style={styles.intentionEmoji}>{intention.emoji}</Text>
                  <Text style={styles.intentionText}>{intention.text}</Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={[styles.card, styles.notReadyCard]}>
              <Text style={styles.notReadyText}>No intentions set</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable style={styles.startButton} onPress={handleStartTrip}>
          <Text style={styles.startButtonText}>Start Trip</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  scrollView: {
    padding: 20,
  },
  section: {
    marginBottom: 32,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  readyBox: {
    backgroundColor: '#ECFDF5',
  },
  notReadyBox: {
    backgroundColor: '#FEE2E2',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  readyText: {
    color: '#059669',
  },
  notReadyText: {
    color: '#DC2626',
  },
  card: {
    padding: 16,
  },
  notReadyCard: {
    backgroundColor: '#FEE2E2',
  },
  cardText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  sitterName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  sitterInfo: {
    fontSize: 16,
    color: '#4B5563',
    marginBottom: 2,
  },
  intentionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  intentionEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  intentionText: {
    fontSize: 14,
    color: '#4B5563',
    flex: 1,
  },
  footer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  startButton: {
    backgroundColor: '#0967D2',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 