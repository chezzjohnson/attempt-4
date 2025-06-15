import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import type { Intention, Note, TripHistory } from '../../contexts/TripContext';
import { useTrip } from '../../contexts/TripContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Trip {
  id: string;
  startTime: Date;
  endTime: Date;
  dose: {
    name: string;
    range: string;
    description: string;
  } | null;
  set: {
    mentalState: string;
    description: string;
  } | null;
  setting: string;
  safety: {
    environment: boolean;
    mental: boolean;
    emergencyPlan: boolean;
    tripSitter: boolean;
    tripSitterInfo: null;
  };
  tripSitter: {
    name: string;
    phoneNumber: string;
    relationship: string;
  } | null;
  intentions: {
    id: string;
    emoji: string;
    text: string;
    description?: string;
    notes?: {
      id: string;
      content: string;
      timestamp: Date;
      type: 'during' | 'post' | 'followup';
      followupDay?: number;
    }[];
    ratings?: {
      type: 'post-trip' | '7-day' | '14-day' | '30-day' | 'followup';
      value: number | null;
      timestamp: Date;
    }[];
  }[];
  generalNotes: {
    id: string;
    content: string;
    timestamp: Date;
    type: 'during' | 'post' | 'followup';
    followupDay?: number;
  }[];
  postTripRated: boolean;
}

export default function HistoryScreen() {
  const router = useRouter();
  const { tripHistory, updateTrip, tripState } = useTrip();
  const [expandedTrip, setExpandedTrip] = useState<string | null>(null);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString(undefined, {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getRatingAverage = (ratings: { value: number | null }[]) => {
    const validRatings = ratings.filter(r => r.value !== null) as { value: number }[];
    if (validRatings.length === 0) return null;
    return validRatings.reduce((acc, curr) => acc + curr.value, 0) / validRatings.length;
  };

  const getRatingData = (trip: TripHistory) => {
    // Only show graph if there are intentions with ratings
    const hasRatings = trip.intentions.some(intention => 
      intention.ratings && intention.ratings.some(rating => rating.value !== null)
    );

    if (!hasRatings) return null;

    // Define the rating categories and their order
    const categories = [
      { type: 'post-trip', label: 'Post' },
      { type: '7-day', label: '7d' },
      { type: '14-day', label: '14d' },
      { type: '30-day', label: '30d' }
    ];

    // Initialize data structure with all categories
    const data = {
      labels: categories.map(cat => cat.label),
      datasets: [{
        data: categories.map(cat => {
          // Find all ratings for this category
          const categoryRatings: number[] = [];
          trip.intentions.forEach(intention => {
            intention.ratings?.forEach(rating => {
              if (rating.type === cat.type && rating.value !== null) {
                categoryRatings.push(rating.value);
              }
            });
          });

          // Calculate average if there are ratings, otherwise return 0
          if (categoryRatings.length > 0) {
            const sum = categoryRatings.reduce((acc, val) => acc + val, 0);
            return Math.round(sum / categoryRatings.length);
          }
          return 0;
        })
      }]
    };

    return data;
  };

  const handleRateTrip = (trip: TripHistory) => {
    console.log('Navigating to post-trip with trip:', JSON.stringify(trip, null, 2));
    // Update the current trip state with the selected trip's data
    updateTrip({
      ...tripState,
      startTime: trip.startTime,
      intentions: trip.intentions,
      generalNotes: trip.generalNotes,
      postTripRated: trip.postTripRated,
      dose: trip.dose,
      set: trip.set,
      setting: trip.setting,
      safety: trip.safety,
      tripSitter: trip.tripSitter,
      currentPhase: null
    });
    router.push('/trip/post-trip');
  };

  const renderTripCard = (trip: TripHistory) => {
    const isExpanded = expandedTrip === trip.id;
    const ratingData = getRatingData(trip);
    const hasIntentions = trip.intentions && trip.intentions.length > 0;

    return (
      <Pressable
        key={trip.id}
        style={[styles.tripCard, isExpanded && styles.expandedCard]}
        onPress={() => setExpandedTrip(isExpanded ? null : trip.id)}
      >
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.dateText}>{formatDate(trip.startTime)}</Text>
            <Text style={styles.timeText}>
              {formatTime(trip.startTime)} - {formatTime(trip.endTime)}
            </Text>
          </View>
          <MaterialIcons
            name={isExpanded ? 'expand-less' : 'expand-more'}
            size={24}
            color="#666"
          />
        </View>

        {isExpanded && (
          <>
            {/* Dose Information */}
            {trip.dose && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Dose</Text>
                <View style={styles.doseInfo}>
                  <Text style={styles.doseName}>{trip.dose.name}</Text>
                  <Text style={styles.doseRange}>{trip.dose.range}</Text>
                  <Text style={styles.doseDescription}>{trip.dose.description}</Text>
                </View>
              </View>
            )}

            {/* Intentions */}
            {hasIntentions && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Intentions</Text>
                {trip.intentions.map((intention: Intention) => (
                  <View key={intention.id} style={styles.intentionCard}>
                    <View style={styles.intentionHeader}>
                      <Text style={styles.intentionEmoji}>{intention.emoji}</Text>
                      <Text style={styles.intentionText}>{intention.text}</Text>
                    </View>
                    {intention.description && (
                      <Text style={styles.intentionDescription}>{intention.description}</Text>
                    )}
                    {intention.ratings && intention.ratings.length > 0 && (
                      <View style={styles.ratingsContainer}>
                        {intention.ratings.map((rating: { type: string; value: number | null }, index: number) => (
                          <View key={index} style={styles.ratingItem}>
                            <Text style={styles.ratingType}>{rating.type}</Text>
                            <Text style={styles.ratingValue}>
                              {rating.value !== null ? rating.value : 'Not rated'}
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}
                    {intention.notes && intention.notes.length > 0 && (
                      <View style={styles.notesContainer}>
                        {intention.notes.map((note: Note) => (
                          <View key={note.id} style={styles.noteItem}>
                            <Text style={styles.noteContent}>{note.content}</Text>
                            <Text style={styles.noteTimestamp}>
                              {new Date(note.timestamp).toLocaleString()}
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}

            {/* General Notes */}
            {trip.generalNotes && trip.generalNotes.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Notes</Text>
                {trip.generalNotes.map((note: Note) => (
                  <View key={note.id} style={styles.noteItem}>
                    <Text style={styles.noteContent}>{note.content}</Text>
                    <Text style={styles.noteTimestamp}>
                      {new Date(note.timestamp).toLocaleString()}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Rating Progress Chart */}
            {ratingData && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Rating Progress</Text>
                <LineChart
                  data={ratingData}
                  width={SCREEN_WIDTH - 40}
                  height={220}
                  chartConfig={{
                    backgroundColor: '#ffffff',
                    backgroundGradientFrom: '#ffffff',
                    backgroundGradientTo: '#ffffff',
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(81, 150, 244, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    style: {
                      borderRadius: 16
                    },
                    propsForDots: {
                      r: '0',
                      strokeWidth: '0',
                      stroke: 'transparent'
                    },
                    propsForBackgroundLines: {
                      strokeDasharray: '',
                      stroke: '#E5E7EB',
                      strokeWidth: 1
                    },
                    propsForLabels: {
                      fontSize: 12
                    }
                  }}
                  bezier
                  style={styles.chart}
                  segments={4}
                  fromZero={true}
                  yAxisInterval={1}
                  yAxisSuffix=""
                  yAxisLabel=""
                  renderDotContent={({ x, y, index }) => {
                    const value = ratingData.datasets[0].data[index];
                    if (value === 0) {
                      return (
                        <View
                          style={[
                            styles.dotLabel,
                            {
                              left: x - 10,
                              top: y - 20,
                              backgroundColor: '#E5E7EB'
                            }
                          ]}
                        >
                          <Text style={styles.dotLabelText}>-</Text>
                        </View>
                      );
                    }
                    return (
                      <View
                        style={[
                          styles.dotLabel,
                          {
                            left: x - 10,
                            top: y - 20
                          }
                        ]}
                      >
                        <Text style={styles.dotLabelText}>{value}</Text>
                      </View>
                    );
                  }}
                />
              </View>
            )}

            {/* Rate Trip Button */}
            {hasIntentions && !trip.postTripRated && (
              <Pressable
                style={styles.rateButton}
                onPress={() => handleRateTrip(trip)}
              >
                <Text style={styles.rateButtonText}>Rate Integration of Intentions</Text>
              </Pressable>
            )}
          </>
        )}
      </Pressable>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Trip History</Text>
      </View>
      {tripHistory.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No trips recorded yet</Text>
        </View>
      ) : (
        tripHistory.map(renderTripCard)
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
  },
  tripCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  expandedCard: {
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  timeText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 12,
  },
  doseInfo: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  doseName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  doseRange: {
    fontSize: 14,
    color: '#4B5563',
    marginTop: 4,
  },
  doseDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
  },
  intentionCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  intentionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  intentionEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  intentionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    flex: 1,
  },
  intentionDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  ratingsContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  ratingItem: {
    marginBottom: 8,
  },
  ratingType: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
    marginBottom: 2,
  },
  ratingValue: {
    fontSize: 14,
    color: '#6B7280',
  },
  notesContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  noteItem: {
    marginBottom: 8,
  },
  noteContent: {
    fontSize: 14,
    color: '#1F2937',
    marginBottom: 2,
  },
  noteTimestamp: {
    fontSize: 12,
    color: '#6B7280',
  },
  rateButton: {
    backgroundColor: '#0967D2',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  rateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  dotLabel: {
    position: 'absolute',
    backgroundColor: '#5196F4',
    borderRadius: 10,
    padding: 4,
    minWidth: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotLabelText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
}); 