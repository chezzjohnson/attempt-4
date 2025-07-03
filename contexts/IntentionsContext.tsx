import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

export interface IntentionRating {
  type: 'post-trip' | '7-day' | '14-day' | '30-day';
  value: number | null;
  timestamp: Date;
}

export interface IntentionNote {
  id: string;
  content: string;
  timestamp: Date;
  type: 'during' | 'post' | 'followup';
}

export interface TripIntentionData {
  tripId: string;
  tripTitle?: string;
  tripDate: Date;
  ratings: IntentionRating[];
  notes: IntentionNote[];
}

export interface Intention {
  id: string;
  text: string;
  description?: string;
  createdAt: Date;
  trips: TripIntentionData[];
  tags: string[]; // Trip titles for display
}

interface IntentionsContextType {
  intentions: Intention[];
  addIntention: (text: string, description?: string) => string;
  updateIntention: (id: string, updates: Partial<Intention>) => void;
  deleteIntention: (id: string) => void;
  addIntentionToTrip: (intentionId: string, tripId: string, tripDate: Date, tripTitle?: string) => void;
  removeIntentionFromTrip: (intentionId: string, tripId: string) => void;
  updateIntentionRating: (intentionId: string, tripId: string, rating: IntentionRating) => void;
  addIntentionNote: (intentionId: string, tripId: string, note: Omit<IntentionNote, 'id'>) => void;
  getIntentionUsageCount: (intentionId: string) => number;
  getIntentionAverageRating: (intentionId: string, ratingType: IntentionRating['type']) => number | null;
  getIntentionsForTrip: (tripId: string) => Intention[];
  getAvailableIntentions: () => Intention[]; // Intentions with < 3 trips
}

const STORAGE_KEY = '@intentions_data';

const IntentionsContext = createContext<IntentionsContextType | undefined>(undefined);

export function IntentionsProvider({ children }: { children: React.ReactNode }) {
  const [intentions, setIntentions] = useState<Intention[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load intentions from storage
  useEffect(() => {
    loadIntentions();
  }, []);

  const loadIntentions = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
        const intentionsWithDates = parsed.map((intention: any) => ({
          ...intention,
          createdAt: new Date(intention.createdAt),
          trips: intention.trips.map((trip: any) => ({
            ...trip,
            tripDate: new Date(trip.tripDate),
            ratings: trip.ratings.map((rating: any) => ({
              ...rating,
              timestamp: new Date(rating.timestamp)
            })),
            notes: trip.notes.map((note: any) => ({
              ...note,
              timestamp: new Date(note.timestamp)
            }))
          }))
        }));
        setIntentions(intentionsWithDates);
      }
    } catch (error) {
      console.error('Error loading intentions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveIntentions = async (newIntentions: Intention[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newIntentions));
    } catch (error) {
      console.error('Error saving intentions:', error);
    }
  };

  const addIntention = (text: string, description?: string): string => {
    const newIntention: Intention = {
      id: Date.now().toString(),
      text: text.trim(),
      description: description?.trim(),
      createdAt: new Date(),
      trips: [],
      tags: []
    };

    const updatedIntentions = [...intentions, newIntention];
    setIntentions(updatedIntentions);
    saveIntentions(updatedIntentions);
    return newIntention.id;
  };

  const updateIntention = (id: string, updates: Partial<Intention>) => {
    const updatedIntentions = intentions.map(intention =>
      intention.id === id ? { ...intention, ...updates } : intention
    );
    setIntentions(updatedIntentions);
    saveIntentions(updatedIntentions);
  };

  const deleteIntention = (id: string) => {
    const updatedIntentions = intentions.filter(intention => intention.id !== id);
    setIntentions(updatedIntentions);
    saveIntentions(updatedIntentions);
  };

  const addIntentionToTrip = (intentionId: string, tripId: string, tripDate: Date, tripTitle?: string) => {
    const updatedIntentions = intentions.map(intention => {
      if (intention.id === intentionId) {
        const newTripData: TripIntentionData = {
          tripId,
          tripTitle,
          tripDate,
          ratings: [],
          notes: []
        };

        const updatedTrips = [...intention.trips, newTripData];
        const updatedTags = tripTitle && !intention.tags.includes(tripTitle) 
          ? [...intention.tags, tripTitle] 
          : intention.tags;

        return {
          ...intention,
          trips: updatedTrips,
          tags: updatedTags
        };
      }
      return intention;
    });

    setIntentions(updatedIntentions);
    saveIntentions(updatedIntentions);
  };

  const removeIntentionFromTrip = (intentionId: string, tripId: string) => {
    const updatedIntentions = intentions.map(intention => {
      if (intention.id === intentionId) {
        const updatedTrips = intention.trips.filter(trip => trip.tripId !== tripId);
        // Rebuild tags based on remaining trips
        const updatedTags = updatedTrips
          .map(trip => trip.tripTitle)
          .filter(Boolean) as string[];

        return {
          ...intention,
          trips: updatedTrips,
          tags: updatedTags
        };
      }
      return intention;
    });

    setIntentions(updatedIntentions);
    saveIntentions(updatedIntentions);
  };

  const updateIntentionRating = (intentionId: string, tripId: string, rating: IntentionRating) => {
    const updatedIntentions = intentions.map(intention => {
      if (intention.id === intentionId) {
        const updatedTrips = intention.trips.map(trip => {
          if (trip.tripId === tripId) {
            const existingRatingIndex = trip.ratings.findIndex(r => r.type === rating.type);
            const updatedRatings = [...trip.ratings];
            
            if (existingRatingIndex >= 0) {
              updatedRatings[existingRatingIndex] = rating;
            } else {
              updatedRatings.push(rating);
            }

            return { ...trip, ratings: updatedRatings };
          }
          return trip;
        });

        return { ...intention, trips: updatedTrips };
      }
      return intention;
    });

    setIntentions(updatedIntentions);
    saveIntentions(updatedIntentions);
  };

  const addIntentionNote = (intentionId: string, tripId: string, note: Omit<IntentionNote, 'id'>) => {
    const newNote: IntentionNote = {
      ...note,
      id: Date.now().toString()
    };

    const updatedIntentions = intentions.map(intention => {
      if (intention.id === intentionId) {
        const updatedTrips = intention.trips.map(trip => {
          if (trip.tripId === tripId) {
            return { ...trip, notes: [...trip.notes, newNote] };
          }
          return trip;
        });

        return { ...intention, trips: updatedTrips };
      }
      return intention;
    });

    setIntentions(updatedIntentions);
    saveIntentions(updatedIntentions);
  };

  const getIntentionUsageCount = (intentionId: string): number => {
    const intention = intentions.find(i => i.id === intentionId);
    return intention ? intention.trips.length : 0;
  };

  const getIntentionAverageRating = (intentionId: string, ratingType: IntentionRating['type']): number | null => {
    const intention = intentions.find(i => i.id === intentionId);
    if (!intention) return null;

    const ratings = intention.trips
      .flatMap(trip => trip.ratings)
      .filter(rating => rating.type === ratingType && rating.value !== null)
      .map(rating => rating.value as number);

    if (ratings.length === 0) return null;

    const average = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
    return Math.round(average * 10) / 10; // Round to 1 decimal place
  };

  const getIntentionsForTrip = (tripId: string): Intention[] => {
    return intentions.filter(intention => 
      intention.trips.some(trip => trip.tripId === tripId)
    );
  };

  const getAvailableIntentions = (): Intention[] => {
    return intentions.filter(intention => intention.trips.length < 3);
  };

  const value: IntentionsContextType = {
    intentions,
    addIntention,
    updateIntention,
    deleteIntention,
    addIntentionToTrip,
    removeIntentionFromTrip,
    updateIntentionRating,
    addIntentionNote,
    getIntentionUsageCount,
    getIntentionAverageRating,
    getIntentionsForTrip,
    getAvailableIntentions
  };

  if (isLoading) {
    return null; // Or a loading spinner
  }

  return (
    <IntentionsContext.Provider value={value}>
      {children}
    </IntentionsContext.Provider>
  );
}

export function useIntentions() {
  const context = useContext(IntentionsContext);
  if (context === undefined) {
    throw new Error('useIntentions must be used within an IntentionsProvider');
  }
  return context;
} 