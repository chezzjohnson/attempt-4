import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
  const [expandedIntention, setExpandedIntention] = useState<string | null>(null);

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

  const getFollowUpButton = (type: '7-day' | '14-day' | '30-day', intention: Intention, trip: TripHistory) => {
    const hasFollowUpRating = intention.ratings?.some((rating: { type: string; value: number | null }) => 
      rating.type === type && rating.value !== null
    );

    // Calculate days since trip
    const tripEndTime = new Date(trip.endTime);
    const now = new Date();
    const daysSinceTrip = Math.floor((now.getTime() - tripEndTime.getTime()) / (1000 * 60 * 60 * 24));

    // Check if enough time has passed
    const isAvailable = (() => {
      switch (type) {
        case '7-day':
          return daysSinceTrip >= 7;
        case '14-day':
          return daysSinceTrip >= 14;
        case '30-day':
          return daysSinceTrip >= 30;
        default:
          return false;
      }
    })();

    if (hasFollowUpRating) {
      return (
        <View style={styles.followUpButton}>
          <MaterialIcons name="check-circle" size={20} color="#10B981" />
          <Text style={[styles.followUpButtonText, { color: '#10B981' }]}>
            {type === '7-day' ? '7d' : type === '14-day' ? '14d' : '30d'} Rated
          </Text>
        </View>
      );
    }

    if (!isAvailable) {
      const daysRemaining = (() => {
        switch (type) {
          case '7-day':
            return 7 - daysSinceTrip;
          case '14-day':
            return 14 - daysSinceTrip;
          case '30-day':
            return 30 - daysSinceTrip;
          default:
            return 0;
        }
      })();

      return (
        <View style={[styles.followUpButton, styles.followUpButtonDisabled]}>
          <MaterialIcons name="schedule" size={20} color="#9CA3AF" />
          <Text style={[styles.followUpButtonText, { color: '#9CA3AF' }]}>
            {daysRemaining}d left
          </Text>
        </View>
      );
    }

    return (
      <TouchableOpacity
        style={styles.followUpButton}
        onPress={() => router.push({
          pathname: '/trip/follow-up',
          params: { tripId: trip.id, followUpType: type }
        })}
      >
        <MaterialIcons name="schedule" size={20} color="#5196F4" />
        <Text style={styles.followUpButtonText}>
          {type === '7-day' ? '7d' : type === '14-day' ? '14d' : '30d'} Follow-up
        </Text>
      </TouchableOpacity>
    );
  };

  const getIntentionRatingData = (intention: Intention) => {
    if (!intention.ratings?.length) return null;

    const categories = [
      { type: 'post-trip', label: 'Post' },
      { type: '7-day', label: '7d' },
      { type: '14-day', label: '14d' },
      { type: '30-day', label: '30d' }
    ];

    return {
      labels: categories.map(cat => cat.label),
      datasets: [{
        data: categories.map(cat => {
          const rating = intention.ratings?.find(r => r.type === cat.type);
          return rating?.value || 0;
        })
      }]
    };
  };

  const renderRatingTimeline = (intention: Intention) => {
    const categories = [
      { type: 'post-trip', label: 'Post' },
      { type: '7-day', label: '7d' },
      { type: '14-day', label: '14d' },
      { type: '30-day', label: '30d' }
    ];

    return (
      <View style={styles.timelineContainer}>
        {categories.map((cat, index) => {
          const rating = intention.ratings?.find(r => r.type === cat.type);
          const value = rating?.value || 0;
          const isRated = value > 0;

          return (
            <View key={cat.type} style={styles.timelineItem}>
              <View style={[
                styles.timelineDot,
                isRated ? styles.timelineDotActive : styles.timelineDotInactive
              ]}>
                <Text style={[
                  styles.timelineDotText,
                  isRated ? styles.timelineDotTextActive : styles.timelineDotTextInactive
                ]}>
                  {isRated ? value : '-'}
                </Text>
              </View>
              {index < categories.length - 1 && (
                <View style={[
                  styles.timelineLine,
                  isRated ? styles.timelineLineActive : styles.timelineLineInactive
                ]} />
              )}
            </View>
          );
        })}
      </View>
    );
  };

  const renderTripCard = (trip: TripHistory) => {
    const isExpanded = expandedTrip === trip.id;
    const hasIntentions = trip.intentions && trip.intentions.length > 0;
    const hasRatings = trip.intentions.some(intention => 
      intention.ratings && intention.ratings.some(rating => rating.value !== null)
    );
    const ratingData = getRatingData(trip);

    return (
      <View style={styles.tripCard}>
        <TouchableOpacity
          style={styles.tripHeader}
          onPress={() => setExpandedTrip(isExpanded ? null : trip.id)}
        >
          <View style={styles.tripHeaderContent}>
            <Text style={styles.tripTitle}>
              {trip.dose?.name || `Trip on ${new Date(trip.startTime).toLocaleDateString()}`}
            </Text>
            <View>
              <Text style={styles.tripDate}>
                {new Date(trip.startTime).toLocaleDateString()}
              </Text>
              <Text style={styles.tripTime}>
                {new Date(trip.startTime).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </Text>
            </View>
          </View>
          <MaterialIcons
            name={isExpanded ? 'expand-less' : 'expand-more'}
            size={24}
            color="#666"
          />
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.tripContent}>
            {/* Rate Now Button for unrated trips with intentions */}
            {!trip.postTripRated && trip.intentions && trip.intentions.length > 0 && (
              <View style={styles.rateNowContainer}>
                <TouchableOpacity
                  style={styles.rateNowButton}
                  onPress={() => handleRateTrip(trip)}
                >
                  <MaterialIcons name="star" size={20} color="#FFFFFF" />
                  <Text style={styles.rateNowButtonText}>Rate Now</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Dose Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Dose Information</Text>
              <View style={styles.doseInfo}>
                <Text style={styles.doseText}>
                  {trip.dose ? `${trip.dose.name} (${trip.dose.range})` : 'No dose recorded'}
                </Text>
              </View>
            </View>

            {/* Intentions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {trip.intentions.length === 1 ? 'Intention' : 'Intentions'}
              </Text>
              {trip.intentions.map(intention => (
                <View key={intention.id} style={styles.intentionCard}>
                  <View style={styles.intentionHeader}>
                    <View style={styles.intentionHeaderContent}>
                      <View style={styles.intentionTitleContainer}>
                        <Text style={styles.intentionText}>{intention.text}</Text>
                        {intention.description && (
                          <Text style={styles.intentionDescription}>
                            {intention.description}
                          </Text>
                        )}
                      </View>
                    </View>
                    <View style={styles.intentionRightContent}>
                      {renderRatingTimeline(intention)}
                      <TouchableOpacity
                        onPress={() => setExpandedIntention(
                          expandedIntention === intention.id ? null : intention.id
                        )}
                      >
                        <MaterialIcons
                          name={expandedIntention === intention.id ? 'expand-less' : 'expand-more'}
                          size={24}
                          color="#666"
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {expandedIntention === intention.id && (
                    <View style={styles.intentionContent}>
                      {/* Rating Progress Chart */}
                      {getIntentionRatingData(intention) && (
                        <View style={styles.ratingChartContainer}>
                          <Text style={styles.ratingChartTitle}>Rating Progress</Text>
                          <View style={styles.chartWrapper}>
                            <LineChart
                              data={getIntentionRatingData(intention)!}
                              width={SCREEN_WIDTH - 112}
                              height={180}
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
                                const value = getIntentionRatingData(intention)!.datasets[0].data[index];
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
                        </View>
                      )}

                      {/* Follow-up Rating Buttons */}
                      <View style={styles.followUpSection}>
                        <Text style={styles.followUpTitle}>Integration Follow-ups</Text>
                        <View style={styles.followUpButtons}>
                          {getFollowUpButton('7-day', intention, trip)}
                          {getFollowUpButton('14-day', intention, trip)}
                          {getFollowUpButton('30-day', intention, trip)}
                        </View>
                      </View>

                      {/* Notes */}
                      {intention.notes && intention.notes.length > 0 && (
                        <View style={styles.notesContainer}>
                          <Text style={styles.notesTitle}>Notes</Text>
                          {intention.notes.map((note, index) => (
                            <View key={index} style={styles.noteItem}>
                              <Text style={styles.noteText}>{note.content}</Text>
                              <Text style={styles.noteTime}>
                                {formatTime(note.timestamp)}
                              </Text>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                  )}
                </View>
              ))}
            </View>

            {/* General Notes */}
            {trip.generalNotes && trip.generalNotes.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>General Notes</Text>
                <View style={styles.generalNotesContainer}>
                  {trip.generalNotes.map((note: Note) => (
                    <View key={note.id} style={styles.noteItem}>
                      <Text style={styles.noteText}>{note.content}</Text>
                      <Text style={styles.noteTime}>
                        {formatTime(note.timestamp)}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F3F4F6' }}>
      <View style={styles.header}>
        <Text style={styles.title}>Trip History</Text>
      </View>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 40, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {tripHistory.map((trip) => renderTripCard(trip))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  tripCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tripHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  tripTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  tripDate: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  tripTime: {
    fontSize: 14,
    color: '#6B7280',
  },
  tripContent: {
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
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
  doseText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  intentionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
    overflow: 'hidden',
  },
  intentionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  intentionHeaderContent: {
    flexDirection: 'row',
    flex: 1,
  },
  intentionTitleContainer: {
    flex: 1,
    marginLeft: 12,
  },
  intentionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  intentionDescription: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  intentionContent: {
    padding: 16,
    backgroundColor: '#F9FAFB',
  },
  emoji: {
    fontSize: 20,
    marginRight: 8,
  },
  chartWrapper: {
    alignItems: 'center',
    marginTop: 8,
  },
  ratingChartContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
  },
  ratingChartTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  followUpSection: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
  },
  followUpTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  followUpButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  followUpButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  followUpButtonDisabled: {
    opacity: 0.7,
  },
  followUpButtonText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#5196F4',
  },
  notesContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  notesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  noteItem: {
    marginBottom: 12,
  },
  noteText: {
    fontSize: 14,
    color: '#1F2937',
    marginBottom: 4,
  },
  noteTime: {
    fontSize: 12,
    color: '#6B7280',
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
  generalNotesContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  rateNowContainer: {
    marginBottom: 16,
  },
  rateNowButton: {
    backgroundColor: '#5196F4',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  rateNowButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  intentionRightContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: 140,
  },
  timelineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timelineDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineDotActive: {
    backgroundColor: '#5196F4',
  },
  timelineDotInactive: {
    backgroundColor: '#E5E7EB',
  },
  timelineDotText: {
    fontSize: 10,
    fontWeight: '600',
  },
  timelineDotTextActive: {
    color: '#FFFFFF',
  },
  timelineDotTextInactive: {
    color: '#9CA3AF',
  },
  timelineLine: {
    width: 12,
    height: 2,
  },
  timelineLineActive: {
    backgroundColor: '#5196F4',
  },
  timelineLineInactive: {
    backgroundColor: '#E5E7EB',
  },
}); 