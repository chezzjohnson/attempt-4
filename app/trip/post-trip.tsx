import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useIntentions } from '../../contexts/IntentionsContext';
import { Intention, TripHistory, useTrip } from '../../contexts/TripContext';

const RATING_LABELS = {
  1: 'Not at all',
  2: 'Not very well',
  3: 'Somewhat',
  4: 'Well',
  5: 'Very well'
};

interface IntentionRating {
  intentionId: string;
  rating: number | null;
}

const initialState = {
  dose: null,
  set: null,
  setting: '',
  safety: {
    environment: false,
    mental: false,
    emergencyPlan: false,
    tripSitter: false,
    tripSitterInfo: null,
  },
  tripSitter: null,
  intentions: [],
  generalNotes: [],
  startTime: null,
  currentPhase: null,
  postTripRated: false,
};

export default function PostTripScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { tripState, updateTrip, tripHistory, updateTripHistory } = useTrip();
  const { updateIntentionRating } = useIntentions();
  const [isLoading, setIsLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [ratings, setRatings] = useState<IntentionRating[]>([]);
  const [showRateLater, setShowRateLater] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTrip, setCurrentTrip] = useState<TripHistory | null>(null);
  const navigationListenerRef = useRef<(() => void) | undefined>(undefined);

  // Prevent navigation away while saving
  useEffect(() => {
    navigationListenerRef.current = navigation.addListener('beforeRemove', (e: any) => {
      if (isSaving) {
        e.preventDefault();
      }
    });

    return () => {
      if (navigationListenerRef.current) {
        navigationListenerRef.current();
      }
    };
  }, [isSaving, navigation]);

  // Get the most recent trip from history (the one that was just ended)
  useEffect(() => {
    if (tripHistory.length > 0) {
      const mostRecentTrip = tripHistory[0]; // Most recent trip is first in the array
      setCurrentTrip(mostRecentTrip);
      
      if (mostRecentTrip.intentions && mostRecentTrip.intentions.length > 0) {
        setRatings(
          mostRecentTrip.intentions.map(intention => ({
            intentionId: intention.id,
            rating: null
          }))
        );
        setIsLoading(false);
      } else {
        setIsLoading(false);
      }
    } else {
      // If no history, try to use trip state as fallback
      if (tripState.intentions && tripState.intentions.length > 0) {
        // Convert TripState to TripHistory format for consistency
        const tripAsHistory: TripHistory = {
          id: tripState.id || `trip-${Date.now()}`,
          startTime: tripState.startTime || new Date(),
          endTime: new Date(), // Use current time as end time
          dose: tripState.dose,
          set: tripState.set,
          setting: tripState.setting,
          safety: tripState.safety,
          tripSitter: tripState.tripSitter,
          intentions: tripState.intentions,
          generalNotes: tripState.generalNotes,
          postTripRated: tripState.postTripRated
        };
        setCurrentTrip(tripAsHistory);
        setRatings(
          tripState.intentions.map(intention => ({
            intentionId: intention.id,
            rating: null
          }))
        );
        setIsLoading(false);
      } else {
        // If no intentions after 5 seconds, stop loading
        const timeout = setTimeout(() => {
          setIsLoading(false);
          console.log('No intentions found in trip history or state');
        }, 5000);
        
        return () => clearTimeout(timeout);
      }
    }
  }, [tripHistory, tripState.intentions]);

  const handleRating = (intentionId: string, rating: number) => {
    setRatings(prev => 
      prev.map(r => r.intentionId === intentionId ? { ...r, rating } : r)
    );
  };

  const handleRateLater = async () => {
    try {
      setIsSaving(true);
      setError(null);

      Alert.alert(
        "Rate Later",
        "Are you sure you want to rate your intentions later? You can come back to rate them at any time.",
        [
          {
            text: "Cancel",
            style: "cancel",
            onPress: () => {
              setIsSaving(false);
            }
          },
          {
            text: "Rate Later",
            onPress: async () => {
              try {
                setShowRateLater(true);
                // Update the trip in history
                const updatedHistory = tripHistory.map(trip => {
                  if (trip.id === currentTrip?.id) {
                    return {
                      ...trip,
                      postTripRated: false
                    };
                  }
                  return trip;
                });

                // Update history
                await updateTripHistory(updatedHistory);

                // Show success notification
                setShowSuccess(true);
                Animated.sequence([
                  Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                  }),
                  Animated.delay(1500),
                  Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                  })
                ]).start(() => {
                  setShowSuccess(false);
                  // Reset trip state and navigate back to history
                  updateTrip(initialState);
                  router.replace('/(tabs)/history');
                });
              } catch (error) {
                console.error('Error saving for later:', error);
                setError('Failed to save for later. Please try again.');
              } finally {
                setIsSaving(false);
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error in handleRateLater:', error);
      setError('An unexpected error occurred. Please try again.');
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);

      if (!currentTrip?.intentions || currentTrip.intentions.length === 0) {
        throw new Error('No intentions found in trip');
      }

      // Ensure trip has a proper ID
      const tripId = currentTrip.id || `trip-${Date.now()}`;

      // Save ratings to IntentionsContext
      currentTrip.intentions.forEach((intention: Intention) => {
        const rating = ratings.find(r => r.intentionId === intention.id);
        if (rating?.rating !== null && rating?.rating !== undefined) {
          updateIntentionRating(intention.id, tripId, {
            type: 'post-trip',
            value: rating.rating,
            timestamp: new Date()
          });
        }
      });

      // Update the trip in history
      const updatedHistory = tripHistory.map(trip => {
        if (trip.id === tripId) {
          return {
            ...trip,
            postTripRated: !showRateLater
          };
        }
        return trip;
      });

      // Update history
      await updateTripHistory(updatedHistory);

      // Show success notification
      setShowSuccess(true);
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(1500),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start(() => {
        setShowSuccess(false);
        // Reset trip state and navigate back to history
        updateTrip(initialState);
        router.replace('/(tabs)/history');
      });
    } catch (error) {
      console.error('Error saving ratings:', error);
      setError('Failed to save ratings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const allRated = ratings.every(r => r.rating !== null);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0967D2" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={48} color="#EF5350" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              setError(null);
              setIsLoading(true);
              // Retry loading data
              if (tripHistory.length > 0) {
                const mostRecentTrip = tripHistory[0];
                setCurrentTrip(mostRecentTrip);
                if (mostRecentTrip.intentions && mostRecentTrip.intentions.length > 0) {
                  setRatings(
                    mostRecentTrip.intentions.map(intention => ({
                      intentionId: intention.id,
                      rating: null
                    }))
                  );
                }
                setIsLoading(false);
              }
            }}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!currentTrip?.intentions || currentTrip.intentions.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {currentTrip?.intentions?.length === 1 ? 'No Intention to Rate' : 'No Intentions to Rate'}
          </Text>
          <Text style={styles.subtitle}>
            This trip doesn't have any {currentTrip?.intentions?.length === 1 ? 'intention' : 'intentions'} to rate. You can add {currentTrip?.intentions?.length === 1 ? 'an intention' : 'intentions'} before starting your next trip.
          </Text>
        </View>
        <View style={styles.footer}>
          <Pressable
            style={[styles.button, styles.saveButton]}
            onPress={() => {
              updateTrip(initialState);
              router.replace('/(tabs)');
            }}
          >
            <Text style={styles.buttonText}>Return to Home</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {showSuccess && (
        <Animated.View 
          style={[
            styles.successNotification,
            { opacity: fadeAnim }
          ]}
        >
          <MaterialIcons name="check-circle" size={24} color="#fff" />
          <Text style={styles.successText}>
            {showRateLater 
              ? (currentTrip.intentions.length === 1 
                ? "Intention saved for later rating" 
                : "Intentions saved for later rating")
              : (currentTrip.intentions.length === 1
                ? "Rating Saved Successfully!"
                : "Ratings Saved Successfully!")
            }
          </Text>
        </Animated.View>
      )}
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Rate Your Experience</Text>
          <Text style={styles.subtitle}>
            How well did you integrate each intention into your trip?
          </Text>
        </View>

        {currentTrip.intentions.map((intention: Intention) => {
          const currentRating = ratings.find(r => r.intentionId === intention.id)?.rating;
          return (
            <View key={intention.id} style={styles.intentionCard}>
              <View style={styles.intentionHeader}>
                <Text style={styles.intentionText}>{intention.text}</Text>
              </View>

              <View style={styles.ratingContainer}>
                {[1, 2, 3, 4, 5].map((rating) => (
                  <Pressable
                    key={rating}
                    style={[
                      styles.ratingButton,
                      currentRating === rating && styles.ratingButtonSelected
                    ]}
                    onPress={() => handleRating(intention.id, rating)}
                  >
                    <Text style={[
                      styles.ratingNumber,
                      currentRating === rating && styles.ratingNumberSelected
                    ]}>
                      {rating}
                    </Text>
                  </Pressable>
                ))}
              </View>
              {currentRating && (
                <Text style={styles.ratingLabel}>
                  {RATING_LABELS[currentRating as keyof typeof RATING_LABELS]}
                </Text>
              )}
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={[styles.button, styles.rateLaterButton]}
          onPress={handleRateLater}
          disabled={isSaving}
        >
          <Text style={styles.buttonText}>Rate Later</Text>
        </Pressable>
        <Pressable
          style={[
            styles.button, 
            styles.saveButton,
            !allRated && styles.saveButtonDisabled
          ]}
          onPress={handleSave}
          disabled={!allRated || isSaving}
        >
          <Text style={styles.buttonText}>Save Ratings</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#4B5563',
  },
  scrollView: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 24,
  },
  intentionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  intentionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  intentionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  ratingButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  ratingButtonSelected: {
    backgroundColor: '#0967D2',
    borderColor: '#0967D2',
  },
  ratingNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4B5563',
  },
  ratingNumberSelected: {
    color: '#fff',
  },
  ratingLabel: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
  },
  footer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  rateLaterButton: {
    backgroundColor: '#4B5563',
    borderWidth: 1,
    borderColor: '#6B7280',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  saveButton: {
    backgroundColor: '#0967D2',
  },
  saveButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  rateLaterButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  successNotification: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#10B981',
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },
  successText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#EF5350',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#0967D2',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 