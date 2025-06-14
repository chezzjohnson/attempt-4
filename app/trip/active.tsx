import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTrip } from '../../contexts/TripContext';

const PHASE_COLORS = {
  'come-up': '#FFA726', // Orange
  'peak': '#EF5350',    // Red
  'comedown': '#66BB6A', // Green
};

const PHASES = ['come-up', 'peak', 'comedown'] as const;
type Phase = typeof PHASES[number];

const PHASE_DURATIONS: Record<Phase, number> = {
  'come-up': 60, // 60 minutes
  'peak': 240,   // 4 hours
  'comedown': 120, // 2 hours
};

export default function ActiveTripScreen() {
  const router = useRouter();
  const { tripState, updatePhase, endTrip } = useTrip();
  const [expandedIntention, setExpandedIntention] = useState<string | null>(null);
  const [showTripSitter, setShowTripSitter] = useState(false);

  const [timeElapsed, setTimeElapsed] = useState(0);
  const [timeToNextPhase, setTimeToNextPhase] = useState(0);

  useEffect(() => {
    if (!tripState.startTime) return;

    const interval = setInterval(() => {
      const now = new Date();
      const elapsed = Math.floor((now.getTime() - tripState.startTime!.getTime()) / 1000 / 60);
      setTimeElapsed(elapsed);

      // Calculate time to next phase
      const currentPhaseIndex = PHASES.indexOf(tripState.currentPhase as Phase);
      const nextPhaseIndex = currentPhaseIndex + 1;
      
      if (nextPhaseIndex < PHASES.length) {
        const nextPhase = PHASES[nextPhaseIndex];
        const timeInCurrentPhase = elapsed - getPhaseStartTime(currentPhaseIndex);
        const timeToNext = PHASE_DURATIONS[tripState.currentPhase as Phase] - timeInCurrentPhase;
        setTimeToNextPhase(timeToNext);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [tripState.startTime, tripState.currentPhase]);

  const getPhaseStartTime = (phaseIndex: number) => {
    return PHASES
      .slice(0, phaseIndex)
      .reduce((acc, phase) => acc + PHASE_DURATIONS[phase], 0);
  };

  const getTotalDuration = () => {
    return Object.values(PHASE_DURATIONS).reduce((acc, duration) => acc + duration, 0);
  };

  const getProgressPercentage = () => {
    const totalDuration = getTotalDuration();
    return (timeElapsed / totalDuration) * 100;
  };

  const formatTimeRemaining = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours === 0) {
      return "Less than an hour";
    } else if (remainingMinutes < 30) {
      return `About ${hours} hours`;
    } else {
      return `A little under ${hours + 1} hours`;
    }
  };

  const formatPhaseTimeRemaining = (minutes: number) => {
    // Round to nearest 5 minutes
    const roundedMinutes = Math.round(minutes / 5) * 5;
    
    if (roundedMinutes < 5) {
      return "Less than 5 minutes";
    } else if (roundedMinutes < 60) {
      return `About ${roundedMinutes} minutes`;
    } else {
      const hours = Math.floor(roundedMinutes / 60);
      const remainingMinutes = roundedMinutes % 60;
      if (remainingMinutes === 0) {
        return `About ${hours} hours`;
      } else {
        return `About ${hours} hours and ${remainingMinutes} minutes`;
      }
    }
  };

  const handleCallTripSitter = () => {
    if (tripState.tripSitter) {
      Linking.openURL(`tel:${tripState.tripSitter.phoneNumber}`);
    }
  };

  const handleTextTripSitter = () => {
    if (tripState.tripSitter) {
      Linking.openURL(`sms:${tripState.tripSitter.phoneNumber}`);
    }
  };

  const handleEndTrip = () => {
    const totalDuration = getTotalDuration();
    const timeDifference = totalDuration - timeElapsed;

    if (timeDifference > 60) {
      // Trip ended more than an hour early
      Alert.alert(
        "End Trip Early?",
        `Based on the expected trip duration of ${formatTimeRemaining(totalDuration)}, you're ending more than an hour early. Would you like to save this trip?`,
        [
          {
            text: "Discard Trip",
            style: "destructive",
            onPress: () => {
              Alert.alert(
                "Confirm Discard",
                "Are you sure you want to discard this trip? This action cannot be undone.",
                [
                  {
                    text: "Cancel",
                    style: "cancel"
                  },
                  {
                    text: "Discard",
                    style: "destructive",
                    onPress: () => {
                      endTrip();
                      router.push('/(tabs)');
                    }
                  }
                ]
              );
            }
          },
          {
            text: "Save Trip",
            onPress: () => {
              // TODO: Implement save trip functionality
              endTrip();
              router.push('/(tabs)');
            }
          }
        ]
      );
    } else {
      // Normal trip end
      Alert.alert(
        "End Trip",
        "Would you like to save this trip?",
        [
          {
            text: "Discard Trip",
            style: "destructive",
            onPress: () => {
              Alert.alert(
                "Confirm Discard",
                "Are you sure you want to discard this trip? This action cannot be undone.",
                [
                  {
                    text: "Cancel",
                    style: "cancel"
                  },
                  {
                    text: "Discard",
                    style: "destructive",
                    onPress: () => {
                      endTrip();
                      router.push('/(tabs)');
                    }
                  }
                ]
              );
            }
          },
          {
            text: "Save Trip",
            onPress: () => {
              // TODO: Implement save trip functionality
              endTrip();
              router.push('/(tabs)');
            }
          }
        ]
      );
    }
  };

  const formatStartTime = (date: Date) => {
    return date.toLocaleTimeString([], { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Active Trip</Text>
          <Text style={styles.subtitle}>
            Started at {tripState.startTime ? formatStartTime(tripState.startTime) : ''}
          </Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${getProgressPercentage()}%` }]} />
            <View style={[styles.phaseMarker, { left: '20%' }]} />
            <View style={[styles.phaseMarker, { left: '60%' }]} />
          </View>
          <View style={styles.phaseLabels}>
            <Text style={styles.phaseLabel}>Come Up</Text>
            <Text style={styles.phaseLabel}>Peak</Text>
            <Text style={styles.phaseLabel}>Come Down</Text>
          </View>
        </View>

        {/* Time Information */}
        <View style={styles.timeInfo}>
          <Text style={styles.timeText}>
            {formatTimeRemaining(getTotalDuration() - timeElapsed)} remaining
          </Text>
          {timeToNextPhase > 0 && (
            <Text style={styles.nextPhaseText}>
              {formatPhaseTimeRemaining(timeToNextPhase)} until next phase
            </Text>
          )}
        </View>

        {/* Trip Sitter Section */}
        <View style={styles.section}>
          <Pressable
            style={styles.tripSitterButton}
            onPress={() => setShowTripSitter(!showTripSitter)}
          >
            <MaterialIcons name="person" size={24} color="#666" />
            <Text style={styles.tripSitterButtonText}>Contact Trip Sitter</Text>
          </Pressable>
          
          {showTripSitter && tripState.tripSitter && (
            <View style={styles.tripSitterActions}>
              <Text style={styles.tripSitterName}>
                {tripState.tripSitter.name} ({tripState.tripSitter.relationship})
              </Text>
              <View style={styles.tripSitterButtons}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handleCallTripSitter}
                >
                  <MaterialIcons name="call" size={24} color="#4CAF50" />
                  <Text style={styles.actionButtonText}>Call</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handleTextTripSitter}
                >
                  <MaterialIcons name="message" size={24} color="#2196F3" />
                  <Text style={styles.actionButtonText}>Text</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => Linking.openURL('https://firesideproject.org')}
          >
            <MaterialIcons name="volunteer-activism" size={24} color="#0967D2" />
            <Text style={styles.actionButtonText}>Fireside Project</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => Linking.openURL('https://dancesafe.org')}
          >
            <MaterialIcons name="health-and-safety" size={24} color="#0967D2" />
            <Text style={styles.actionButtonText}>DanceSafe</Text>
          </TouchableOpacity>
        </View>

        {/* Intentions Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Intentions</Text>
          {tripState.intentions.map((intention) => (
            <View key={intention.id} style={styles.intentionCard}>
              <TouchableOpacity
                style={styles.intentionHeader}
                onPress={() => setExpandedIntention(
                  expandedIntention === intention.id ? null : intention.id
                )}
              >
                <Text style={styles.intentionEmoji}>{intention.emoji}</Text>
                <Text style={styles.intentionText}>{intention.text}</Text>
                <MaterialIcons
                  name={expandedIntention === intention.id ? "expand-less" : "expand-more"}
                  size={24}
                  color="#666"
                />
              </TouchableOpacity>
              
              {expandedIntention === intention.id && (
                <View style={styles.intentionContent}>
                  <Text style={styles.intentionDescription}>
                    {intention.description}
                  </Text>
                  <TextInput
                    style={styles.notesInput}
                    placeholder="Add notes about this intention..."
                    multiline
                  />
                </View>
              )}
            </View>
          ))}
        </View>

        {/* End Trip Button */}
        <Pressable
          style={styles.endButton}
          onPress={handleEndTrip}
        >
          <Text style={styles.endButtonText}>End Trip</Text>
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
  },
  progressContainer: {
    marginBottom: 30,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    position: 'relative',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  phaseMarker: {
    position: 'absolute',
    top: -4,
    width: 2,
    height: 16,
    backgroundColor: '#666',
  },
  phaseLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  phaseLabel: {
    fontSize: 12,
    color: '#666',
  },
  timeInfo: {
    marginBottom: 30,
    alignItems: 'center',
  },
  timeText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  nextPhaseText: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  tripSitterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
  },
  tripSitterButtonText: {
    fontSize: 16,
    color: '#1a1a1a',
    marginLeft: 12,
  },
  tripSitterActions: {
    marginTop: 12,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  tripSitterName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  tripSitterButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E4E7EB',
  },
  actionButtonText: {
    color: '#0967D2',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  intentionCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  intentionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  intentionEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  intentionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  intentionContent: {
    padding: 16,
    paddingTop: 0,
  },
  intentionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  notesInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#1a1a1a',
    minHeight: 80,
  },
  endButton: {
    backgroundColor: '#F44336',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  endButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 24,
  },
}); 