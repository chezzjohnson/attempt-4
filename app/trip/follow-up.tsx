import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { TripHistory, useTrip } from '../../contexts/TripContext';

export default function FollowUpScreen() {
  const { tripId, followUpType } = useLocalSearchParams();
  const router = useRouter();
  const { tripHistory, updateTripHistory } = useTrip();
  const [loading, setLoading] = useState(true);
  const [trip, setTrip] = useState<TripHistory | null>(null);
  const [ratings, setRatings] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    if (tripId && tripHistory) {
      const foundTrip = tripHistory.find(t => t.id === tripId);
      if (foundTrip) {
        setTrip(foundTrip);
        // Initialize ratings with existing values or null
        const initialRatings: { [key: string]: number } = {};
        foundTrip.intentions.forEach(intention => {
          const existingRating = intention.ratings?.find(r => r.type === followUpType);
          initialRatings[intention.id] = existingRating?.value || 0;
        });
        setRatings(initialRatings);
      }
    }
    setLoading(false);
  }, [tripId, tripHistory, followUpType]);

  const getFollowUpTitle = () => {
    switch (followUpType) {
      case '7-day':
        return '7-Day Follow-up';
      case '14-day':
        return '14-Day Follow-up';
      case '30-day':
        return '30-Day Follow-up';
      default:
        return 'Follow-up Rating';
    }
  };

  const handleRating = (intentionId: string, value: number) => {
    setRatings(prev => ({
      ...prev,
      [intentionId]: value
    }));
  };

  const handleSave = async () => {
    if (!trip) return;

    const updatedTrip: TripHistory = {
      ...trip,
      intentions: trip.intentions.map(intention => ({
        ...intention,
        ratings: [
          ...(intention.ratings?.filter(r => r.type !== followUpType) || []),
          {
            type: followUpType as '7-day' | '14-day' | '30-day',
            value: ratings[intention.id],
            timestamp: new Date()
          }
        ]
      }))
    };

    const updatedHistory = tripHistory.map(t => 
      t.id === tripId ? updatedTrip : t
    );

    await updateTripHistory(updatedHistory);
    router.back();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5196F4" />
      </View>
    );
  }

  if (!trip) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Trip not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>{getFollowUpTitle()}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.subtitle}>
          Rate your integration of {trip.intentions.length === 1 ? 'intention' : 'intentions'}
        </Text>
        
        {trip.intentions.map(intention => (
          <View key={intention.id} style={styles.intentionCard}>
            <View style={styles.intentionHeader}>
              <Text style={styles.intentionText}>{intention.text}</Text>
            </View>
            
            <View style={styles.ratingContainer}>
              {[1, 2, 3, 4, 5].map((value) => (
                <TouchableOpacity
                  key={value}
                  style={[
                    styles.ratingButton,
                    ratings[intention.id] === value && styles.ratingButtonSelected
                  ]}
                  onPress={() => handleRating(intention.id, value)}
                >
                  <Text style={[
                    styles.ratingText,
                    ratings[intention.id] === value && styles.ratingTextSelected
                  ]}>
                    {value}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.ratingLabels}>
              <Text style={styles.ratingLabel}>Not at all</Text>
              <Text style={styles.ratingLabel}>Very well</Text>
            </View>
          </View>
        ))}

        <TouchableOpacity
          style={[
            styles.saveButton,
            Object.values(ratings).some(r => r === 0) && styles.saveButtonDisabled
          ]}
          onPress={handleSave}
          disabled={Object.values(ratings).some(r => r === 0)}
        >
          <Text style={styles.saveButtonText}>Save Ratings</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  content: {
    padding: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  intentionCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  intentionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  intentionText: {
    fontSize: 16,
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  ratingButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  ratingButtonSelected: {
    backgroundColor: '#5196F4',
    borderColor: '#5196F4',
  },
  ratingText: {
    fontSize: 16,
    color: '#666',
  },
  ratingTextSelected: {
    color: '#fff',
  },
  ratingLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  ratingLabel: {
    fontSize: 12,
    color: '#666',
  },
  saveButton: {
    backgroundColor: '#5196F4',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  saveButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 