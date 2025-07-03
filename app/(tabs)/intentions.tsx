import { MaterialIcons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import { Animated, Dimensions, Easing, SafeAreaView, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Card } from '../../components/ui/Card';
import { BodyText, Caption, Heading, Label } from '../../components/ui/Typography';
import { Colors, Spacing } from '../../constants/DesignSystem';
import { IntentionRating, useIntentions } from '../../contexts/IntentionsContext';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function IntentionsScreen() {
  const { intentions, getIntentionAverageRating } = useIntentions();
  const [expandedIntentions, setExpandedIntentions] = useState<Record<string, boolean>>({});
  const [expandedTrips, setExpandedTrips] = useState<Record<string, boolean>>({});
  const [animatingIntentions, setAnimatingIntentions] = useState<Record<string, boolean>>({});
  const [animatingTrips, setAnimatingTrips] = useState<Record<string, boolean>>({});
  
  const intentionAnimations = useRef<Record<string, Animated.Value>>({});
  const intentionArrowAnimations = useRef<Record<string, Animated.Value>>({});
  const tripAnimations = useRef<Record<string, Animated.Value>>({});
  const tripArrowAnimations = useRef<Record<string, Animated.Value>>({});

  const handleIntentionToggle = (intentionId: string) => {
    const isCurrentlyExpanded = expandedIntentions[intentionId];
    const animation = intentionAnimations.current[intentionId];
    const arrowAnimation = intentionArrowAnimations.current[intentionId];
    
    if (!animation || !arrowAnimation) return;
    
    if (isCurrentlyExpanded) {
      setAnimatingIntentions(prev => ({ ...prev, [intentionId]: true }));
      Animated.parallel([
        Animated.timing(animation, {
          toValue: 0,
          duration: 300,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
        Animated.timing(arrowAnimation, {
          toValue: 0,
          duration: 300,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        })
      ]).start(() => {
        setExpandedIntentions(prev => ({ ...prev, [intentionId]: false }));
        setAnimatingIntentions(prev => ({ ...prev, [intentionId]: false }));
      });
    } else {
      setExpandedIntentions(prev => ({ ...prev, [intentionId]: true }));
      setAnimatingIntentions(prev => ({ ...prev, [intentionId]: true }));
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(animation, {
            toValue: 1,
            duration: 300,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: false,
          }),
          Animated.timing(arrowAnimation, {
            toValue: 1,
            duration: 300,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: false,
          })
        ]).start(() => {
          setAnimatingIntentions(prev => ({ ...prev, [intentionId]: false }));
        });
      }, 50);
    }
  };

  const handleTripToggle = (tripKey: string) => {
    const isCurrentlyExpanded = expandedTrips[tripKey];
    const animation = tripAnimations.current[tripKey];
    const arrowAnimation = tripArrowAnimations.current[tripKey];
    
    if (!animation || !arrowAnimation) return;
    
    if (isCurrentlyExpanded) {
      setAnimatingTrips(prev => ({ ...prev, [tripKey]: true }));
      Animated.parallel([
        Animated.timing(animation, {
          toValue: 0,
          duration: 250,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
        Animated.timing(arrowAnimation, {
          toValue: 0,
          duration: 250,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        })
      ]).start(() => {
        setExpandedTrips(prev => ({ ...prev, [tripKey]: false }));
        setAnimatingTrips(prev => ({ ...prev, [tripKey]: false }));
      });
    } else {
      setExpandedTrips(prev => ({ ...prev, [tripKey]: true }));
      setAnimatingTrips(prev => ({ ...prev, [tripKey]: true }));
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(animation, {
            toValue: 1,
            duration: 250,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: false,
          }),
          Animated.timing(arrowAnimation, {
            toValue: 1,
            duration: 250,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: false,
          })
        ]).start(() => {
          setAnimatingTrips(prev => ({ ...prev, [tripKey]: false }));
        });
      }, 50);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  const getRatingData = (intentionId: string) => {
    const ratingTypes: IntentionRating['type'][] = ['post-trip', '7-day', '14-day', '30-day'];
    const data = {
      labels: ['Post', '7d', '14d', '30d'],
      datasets: [{
        data: ratingTypes.map(type => {
          const average = getIntentionAverageRating(intentionId, type);
          return average || 0;
        })
      }]
    };
    return data;
  };

  const renderIntentionCard = (intention: any) => {
    const isExpanded = expandedIntentions[intention.id];
    
    // Initialize animations if they don't exist
    if (!intentionAnimations.current[intention.id]) {
      intentionAnimations.current[intention.id] = new Animated.Value(isExpanded ? 1 : 0);
    }
    if (!intentionArrowAnimations.current[intention.id]) {
      intentionArrowAnimations.current[intention.id] = new Animated.Value(isExpanded ? 1 : 0);
    }

    const ratingData = getRatingData(intention.id);
    const hasRatings = intention.trips.some((trip: any) => trip.ratings.length > 0);

    return (
      <Card key={intention.id} variant="elevated" style={styles.intentionCard}>
        <TouchableOpacity
          style={styles.intentionHeader}
          onPress={() => handleIntentionToggle(intention.id)}
        >
          <View style={styles.intentionHeaderContent}>
            <View style={styles.intentionTitleContainer}>
              <BodyText weight="semibold" style={styles.intentionText}>
                {intention.text}
              </BodyText>
              {intention.description && (
                <Caption style={styles.intentionDescription}>
                  {intention.description}
                </Caption>
              )}
              {intention.tags.length > 1 && (
                <View style={styles.tagsContainer}>
                  {intention.tags.slice(0, 3).map((tag: string, index: number) => (
                    <View key={index} style={styles.tag}>
                      <Caption style={styles.tagText}>{tag}</Caption>
                    </View>
                  ))}
                  {intention.tags.length > 3 && (
                    <Caption style={styles.moreTags}>+{intention.tags.length - 3}</Caption>
                  )}
                </View>
              )}
            </View>
            
            <View style={styles.intentionStats}>
              <View style={styles.usageCount}>
                <Heading variant="h6" color={Colors.primary[500]}>
                  {intention.trips.length}/3
                </Heading>
                <Caption>uses</Caption>
              </View>
              
              {hasRatings && (
                <View style={styles.averageRating}>
                  <Heading variant="h6" color={Colors.success[500]}>
                    {getIntentionAverageRating(intention.id, 'post-trip') || '-'}
                  </Heading>
                  <Caption>avg</Caption>
                </View>
              )}
            </View>

            <Animated.View
              style={{
                transform: [{
                  rotate: intentionArrowAnimations.current[intention.id]?.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '180deg'],
                  }) || '0deg'
                }]
              }}
            >
              <MaterialIcons
                name={isExpanded ? 'expand-less' : 'expand-more'}
                size={20}
                color={Colors.text.secondary}
              />
            </Animated.View>
          </View>
        </TouchableOpacity>

        <Animated.View 
          style={[
            styles.intentionContent,
            {
              opacity: intentionAnimations.current[intention.id] || 0,
              transform: [{
                translateY: intentionAnimations.current[intention.id]?.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-20, 0],
                }) || -20
              }],
            }
          ]}
        >
          {(isExpanded || animatingIntentions[intention.id]) && (
            <>
              {/* Rating Graph */}
              {hasRatings && (
                <View style={styles.ratingGraphContainer}>
                  <Label weight="semibold" style={styles.graphTitle}>
                    Average Ratings Across All Trips
                  </Label>
                  <LineChart
                    data={ratingData}
                    width={SCREEN_WIDTH - 120}
                    height={160}
                    chartConfig={{
                      backgroundColor: Colors.background.primary,
                      backgroundGradientFrom: Colors.background.primary,
                      backgroundGradientTo: Colors.background.primary,
                      decimalPlaces: 1,
                      color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
                      labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                      style: {
                        borderRadius: 16,
                      },
                      propsForDots: {
                        r: '4',
                        strokeWidth: '2',
                        stroke: Colors.primary[500],
                      },
                    }}
                    bezier
                    style={styles.ratingGraph}
                  />
                </View>
              )}

              {/* Trip List */}
              <View style={styles.tripsContainer}>
                <Label weight="semibold" style={styles.tripsTitle}>
                  Trip History
                </Label>
                {intention.trips.map((trip: any, index: number) => {
                  const tripKey = `${intention.id}-${trip.tripId}`;
                  const isTripExpanded = expandedTrips[tripKey];
                  
                  // Initialize trip animations
                  if (!tripAnimations.current[tripKey]) {
                    tripAnimations.current[tripKey] = new Animated.Value(isTripExpanded ? 1 : 0);
                  }
                  if (!tripArrowAnimations.current[tripKey]) {
                    tripArrowAnimations.current[tripKey] = new Animated.Value(isTripExpanded ? 1 : 0);
                  }

                  return (
                    <Card key={tripKey} variant="outlined" style={styles.tripCard}>
                      <TouchableOpacity
                        style={styles.tripHeader}
                        onPress={() => handleTripToggle(tripKey)}
                      >
                        <View style={styles.tripHeaderContent}>
                          <View>
                            <BodyText weight="medium">
                              {trip.tripTitle || `Trip ${index + 1}`}
                            </BodyText>
                            <Caption>{formatDate(trip.tripDate)}</Caption>
                          </View>
                          
                          <View style={styles.tripStats}>
                            <View style={styles.ratingCircles}>
                              {['post-trip', '7-day', '14-day', '30-day'].map((type) => {
                                const rating = trip.ratings.find((r: any) => r.type === type);
                                const isRated = rating?.value !== null;
                                return (
                                  <View key={type} style={[
                                    styles.ratingCircle,
                                    isRated ? styles.ratedCircle : styles.unratedCircle
                                  ]}>
                                    <Caption style={[
                                      styles.ratingCircleText,
                                      isRated ? styles.ratedText : styles.unratedText
                                    ]}>
                                      {rating?.value || '-'}
                                    </Caption>
                                  </View>
                                );
                              })}
                            </View>
                            
                            <Animated.View
                              style={{
                                transform: [{
                                  rotate: tripArrowAnimations.current[tripKey]?.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: ['0deg', '180deg'],
                                  }) || '0deg'
                                }]
                              }}
                            >
                              <MaterialIcons
                                name={isTripExpanded ? 'expand-less' : 'expand-more'}
                                size={16}
                                color={Colors.text.secondary}
                              />
                            </Animated.View>
                          </View>
                        </View>
                      </TouchableOpacity>

                      <Animated.View 
                        style={[
                          styles.tripContent,
                          {
                            opacity: tripAnimations.current[tripKey] || 0,
                            transform: [{
                              translateY: tripAnimations.current[tripKey]?.interpolate({
                                inputRange: [0, 1],
                                outputRange: [-20, 0],
                              }) || -20
                            }],
                          }
                        ]}
                      >
                        {(isTripExpanded || animatingTrips[tripKey]) && (
                          <>
                            {/* Trip Notes */}
                            {trip.notes && trip.notes.length > 0 && (
                              <View style={styles.notesContainer}>
                                <Label weight="semibold" style={styles.notesTitle}>
                                  Notes
                                </Label>
                                {trip.notes.map((note: any) => (
                                  <View key={note.id} style={styles.noteItem}>
                                    <Caption style={styles.noteType}>
                                      {note.type === 'during' ? 'During Trip' : 
                                       note.type === 'post' ? 'Post Trip' : 'Follow-up'}
                                    </Caption>
                                    <BodyText variant="small">{note.content}</BodyText>
                                    <Caption style={styles.noteTimestamp}>
                                      {formatDate(note.timestamp)}
                                    </Caption>
                                  </View>
                                ))}
                              </View>
                            )}

                            {/* Trip Ratings */}
                            {trip.ratings && trip.ratings.length > 0 && (
                              <View style={styles.ratingsContainer}>
                                <Label weight="semibold" style={styles.ratingsTitle}>
                                  Ratings
                                </Label>
                                {trip.ratings.map((rating: any) => (
                                  <View key={rating.type} style={styles.ratingItem}>
                                    <Caption style={styles.ratingType}>
                                      {rating.type === 'post-trip' ? 'Post Trip' :
                                       rating.type === '7-day' ? '7 Day Follow-up' :
                                       rating.type === '14-day' ? '14 Day Follow-up' :
                                       rating.type === '30-day' ? '30 Day Follow-up' : rating.type}
                                    </Caption>
                                    <BodyText variant="small">Rating: {rating.value}/5</BodyText>
                                    <Caption style={styles.ratingTimestamp}>
                                      {formatDate(rating.timestamp)}
                                    </Caption>
                                  </View>
                                ))}
                              </View>
                            )}

                            {/* No content message */}
                            {(!trip.notes || trip.notes.length === 0) && 
                             (!trip.ratings || trip.ratings.length === 0) && (
                              <View style={styles.noContentContainer}>
                                <Caption style={styles.noContentText}>
                                  No notes or ratings for this trip yet
                                </Caption>
                              </View>
                            )}
                          </>
                        )}
                      </Animated.View>
                    </Card>
                  );
                })}
              </View>
            </>
          )}
        </Animated.View>
      </Card>
    );
  };

  if (intentions.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <MaterialIcons name="lightbulb-outline" size={64} color={Colors.text.tertiary} />
          <Heading variant="h3" style={styles.emptyStateTitle}>
            No Intentions Yet
          </Heading>
          <BodyText style={styles.emptyStateText}>
            Create your first intention during a new trip to start tracking your journey
          </BodyText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Heading variant="h1">Intentions</Heading>
          <BodyText variant="large" color={Colors.text.secondary}>
            Track your intentions across all trips
          </BodyText>
        </View>

        <View style={styles.intentionsList}>
          {intentions.map(renderIntentionCard)}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  header: {
    marginBottom: Spacing.xl,
  },
  intentionsList: {
    gap: Spacing.lg,
  },
  intentionCard: {
    marginBottom: Spacing.md,
  },
  intentionHeader: {
    padding: Spacing.md,
  },
  intentionHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  intentionTitleContainer: {
    flex: 1,
  },
  intentionText: {
    marginBottom: Spacing.xs,
  },
  intentionDescription: {
    marginBottom: Spacing.sm,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  tag: {
    backgroundColor: Colors.neutral[100],
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 12,
  },
  tagText: {
    color: Colors.text.secondary,
  },
  moreTags: {
    color: Colors.text.tertiary,
    alignSelf: 'center',
  },
  intentionStats: {
    flexDirection: 'row',
    gap: Spacing.md,
    alignItems: 'center',
  },
  usageCount: {
    alignItems: 'center',
  },
  averageRating: {
    alignItems: 'center',
  },
  intentionContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
  },
  ratingGraphContainer: {
    marginBottom: Spacing.lg,
    alignItems: 'center',
  },
  graphTitle: {
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  ratingGraph: {
    borderRadius: 16,
  },
  tripsContainer: {
    gap: Spacing.md,
  },
  tripsTitle: {
    marginBottom: Spacing.sm,
  },
  tripCard: {
    marginBottom: Spacing.sm,
  },
  tripHeader: {
    padding: Spacing.sm,
  },
  tripHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tripStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  ratingCircles: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  ratingCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratedCircle: {
    backgroundColor: Colors.primary[500],
  },
  unratedCircle: {
    backgroundColor: Colors.neutral[200],
  },
  ratingCircleText: {
    fontSize: 10,
  },
  ratedText: {
    color: Colors.text.inverse,
  },
  unratedText: {
    color: Colors.text.tertiary,
  },
  tripContent: {
    paddingHorizontal: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  notesContainer: {
    gap: Spacing.sm,
  },
  notesTitle: {
    marginBottom: Spacing.xs,
  },
  noteItem: {
    backgroundColor: Colors.neutral[50],
    padding: Spacing.sm,
    borderRadius: 8,
    gap: Spacing.xs,
  },
  noteType: {
    color: Colors.primary[500],
    fontWeight: '500',
  },
  noteTimestamp: {
    color: Colors.text.tertiary,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  emptyStateTitle: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  emptyStateText: {
    textAlign: 'center',
    color: Colors.text.secondary,
  },
  ratingsContainer: {
    gap: Spacing.sm,
  },
  ratingsTitle: {
    marginBottom: Spacing.xs,
  },
  ratingItem: {
    backgroundColor: Colors.neutral[50],
    padding: Spacing.sm,
    borderRadius: 8,
    gap: Spacing.xs,
  },
  ratingType: {
    color: Colors.primary[500],
    fontWeight: '500',
  },
  ratingTimestamp: {
    color: Colors.text.tertiary,
  },
  noContentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noContentText: {
    color: Colors.text.tertiary,
  },
}); 