import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { TripSitter } from './TripSitterContext';

export interface Note {
  id: string;
  content: string;
  timestamp: Date;
  type: 'during' | 'post' | 'followup';
  followupDay?: number;
}

export interface Intention {
  id: string;
  emoji: string;
  text: string;
  description?: string;
  notes?: Note[];
  ratings?: {
    type: 'post-trip' | '7-day' | '14-day' | '30-day' | 'followup';
    value: number | null;
    timestamp: Date;
  }[];
}

export interface SafetyCheck {
  environment: boolean;
  mental: boolean;
  emergencyPlan: boolean;
  tripSitter: boolean;
  tripSitterInfo?: TripSitter | { name: string; phone: string; relationship: string } | null;
}

interface TripState {
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
  safety: SafetyCheck;
  tripSitter: {
    name: string;
    phoneNumber: string;
    relationship: string;
  } | null;
  intentions: Intention[];
  generalNotes: Note[];
  startTime: Date | null;
  currentPhase: 'come-up' | 'peak' | 'comedown' | null;
  postTripRated: boolean;
}

export interface TripHistory {
  id: string;
  startTime: Date;
  endTime: Date;
  dose: TripState['dose'];
  set: TripState['set'];
  setting: string;
  safety: SafetyCheck;
  tripSitter: TripState['tripSitter'];
  intentions: Intention[];
  generalNotes: Note[];
  postTripRated: boolean;
}

interface TripContextType {
  tripState: TripState;
  tripHistory: TripHistory[];
  updateDose: (dose: TripState['dose']) => void;
  updateSet: (set: TripState['set']) => void;
  updateSetting: (setting: string) => void;
  updateSafety: (safety: SafetyCheck) => void;
  updateTripSitter: (sitter: TripState['tripSitter']) => void;
  updateIntentions: (intentions: Intention[]) => void;
  startTrip: () => void;
  endTrip: (save: boolean) => void;
  updatePhase: (phase: TripState['currentPhase']) => void;
  updateTrip: (newState: TripState) => void;
  updateTripHistory: (newHistory: TripHistory[]) => void;
}

const STORAGE_KEY = '@trip_data';
const HISTORY_KEY = '@trip_history';

const initialState: TripState = {
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

const TripContext = createContext<TripContextType | undefined>(undefined);

export function TripProvider({ children }: { children: React.ReactNode }) {
  const [tripState, setTripState] = useState<TripState>(initialState);
  const [tripHistory, setTripHistory] = useState<TripHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load trip data and history from storage on mount
  useEffect(() => {
    loadTripData();
    loadTripHistory();
  }, []);

  const loadTripData = async () => {
    try {
      const storedData = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        // Convert string dates back to Date objects
        if (parsedData.startTime) {
          parsedData.startTime = new Date(parsedData.startTime);
        }
        if (parsedData.generalNotes) {
          parsedData.generalNotes = parsedData.generalNotes.map((note: any) => ({
            ...note,
            timestamp: new Date(note.timestamp)
          }));
        }
        if (parsedData.intentions) {
          parsedData.intentions = parsedData.intentions.map((intention: any) => ({
            ...intention,
            notes: intention.notes?.map((note: any) => ({
              ...note,
              timestamp: new Date(note.timestamp)
            })),
            ratings: intention.ratings?.map((rating: any) => ({
              ...rating,
              timestamp: new Date(rating.timestamp)
            }))
          }));
        }
        setTripState(parsedData);
      }
    } catch (error) {
      console.error('Error loading trip data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTripHistory = async () => {
    try {
      const storedHistory = await AsyncStorage.getItem(HISTORY_KEY);
      if (storedHistory) {
        const parsedHistory = JSON.parse(storedHistory).map((trip: any) => ({
          ...trip,
          startTime: new Date(trip.startTime),
          endTime: new Date(trip.endTime),
          generalNotes: trip.generalNotes.map((note: any) => ({
            ...note,
            timestamp: new Date(note.timestamp)
          })),
          intentions: trip.intentions.map((intention: any) => ({
            ...intention,
            notes: intention.notes?.map((note: any) => ({
              ...note,
              timestamp: new Date(note.timestamp)
            })),
            ratings: intention.ratings?.map((rating: any) => ({
              ...rating,
              timestamp: new Date(rating.timestamp)
            }))
          }))
        }));
        setTripHistory(parsedHistory);
      }
    } catch (error) {
      console.error('Error loading trip history:', error);
    }
  };

  const saveTripData = async (data: TripState) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving trip data:', error);
    }
  };

  const saveTripHistory = async (history: TripHistory[]) => {
    try {
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('Error saving trip history:', error);
    }
  };

  const updateDose = (dose: TripState['dose']) => {
    const newState = { ...tripState, dose };
    setTripState(newState);
    saveTripData(newState);
  };

  const updateSet = (set: TripState['set']) => {
    const newState = { ...tripState, set };
    setTripState(newState);
    saveTripData(newState);
  };

  const updateSetting = (setting: string) => {
    const newState = { ...tripState, setting };
    setTripState(newState);
    saveTripData(newState);
  };

  const updateSafety = (safety: SafetyCheck) => {
    const newState = { ...tripState, safety };
    setTripState(newState);
    saveTripData(newState);
  };

  const updateTripSitter = (sitter: TripState['tripSitter']) => {
    const newState = { ...tripState, tripSitter: sitter };
    setTripState(newState);
    saveTripData(newState);
  };

  const updateIntentions = (intentions: Intention[]) => {
    const newState = { ...tripState, intentions };
    setTripState(newState);
    saveTripData(newState);
  };

  const startTrip = () => {
    const newState: TripState = {
      ...tripState,
      startTime: new Date(),
      currentPhase: 'come-up' as const,
    };
    setTripState(newState);
    saveTripData(newState);
  };

  const endTrip = (save: boolean) => {
    console.log('TripContext - endTrip called with save:', save);
    console.log('TripContext - current tripState:', JSON.stringify(tripState, null, 2));
    
    if (save && tripState.startTime) {
      const completedTrip: TripHistory = {
        id: tripState.startTime.toISOString(),
        startTime: tripState.startTime,
        endTime: new Date(),
        dose: tripState.dose,
        set: tripState.set,
        setting: tripState.setting,
        safety: tripState.safety,
        tripSitter: tripState.tripSitter,
        intentions: tripState.intentions,
        generalNotes: tripState.generalNotes,
        postTripRated: tripState.postTripRated,
      };
      console.log('TripContext - saving completed trip:', JSON.stringify(completedTrip, null, 2));
      const newHistory = [...tripHistory, completedTrip];
      setTripHistory(newHistory);
      saveTripHistory(newHistory);
      
      // Don't reset the trip state yet - it will be reset after post-trip ratings
      console.log('TripContext - preserving trip state for post-trip screen');
      return;
    }
    
    // Only reset if we're not saving or if there's no start time
    console.log('TripContext - resetting tripState to initial state');
    setTripState(initialState);
    saveTripData(initialState);
  };

  const updatePhase = (phase: TripState['currentPhase']) => {
    const newState = { ...tripState, currentPhase: phase };
    setTripState(newState);
    saveTripData(newState);
  };

  const updateTrip = (newState: TripState) => {
    setTripState(newState);
    saveTripData(newState);
  };

  const updateTripHistory = (newHistory: TripHistory[]) => {
    setTripHistory(newHistory);
    saveTripHistory(newHistory);
  };

  return (
    <TripContext.Provider
      value={{
        tripState,
        tripHistory,
        updateDose,
        updateSet,
        updateSetting,
        updateSafety,
        updateTripSitter,
        updateIntentions,
        startTrip,
        endTrip,
        updatePhase,
        updateTrip,
        updateTripHistory,
      }}
    >
      {children}
    </TripContext.Provider>
  );
}

export function useTrip() {
  const context = useContext(TripContext);
  if (context === undefined) {
    throw new Error('useTrip must be used within a TripProvider');
  }
  return context;
} 