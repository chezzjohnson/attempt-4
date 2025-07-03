import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useReducer, useState } from 'react';
import { useIntentions } from './IntentionsContext';
import { TripSitter } from './TripSitterContext';

export interface Note {
  id: string;
  content: string;
  timestamp: Date;
  type: 'during' | 'post-trip' | 'x-days' | '7d' | '14d' | '30d';
  daysAfterTrip?: number;  // For x-days notes
}

export interface Intention {
  id: string;
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
  id?: string;  // Optional since it's only set when loading from history
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

interface PendingSync {
  type: 'trip' | 'history';
  data: TripState | TripHistory[];
  timestamp: number;
}

const PENDING_SYNC_KEY = '@pending_sync';

type TripAction =
  | { type: 'UPDATE_DOSE'; payload: TripState['dose'] }
  | { type: 'UPDATE_SET'; payload: TripState['set'] }
  | { type: 'UPDATE_SETTING'; payload: string }
  | { type: 'UPDATE_SAFETY'; payload: SafetyCheck }
  | { type: 'UPDATE_TRIP_SITTER'; payload: TripState['tripSitter'] }
  | { type: 'UPDATE_INTENTIONS'; payload: Intention[] }
  | { type: 'START_TRIP'; payload: string }
  | { type: 'END_TRIP'; payload: boolean }
  | { type: 'UPDATE_PHASE'; payload: TripState['currentPhase'] }
  | { type: 'UPDATE_TRIP'; payload: TripState }
  | { type: 'UPDATE_TRIP_HISTORY'; payload: TripHistory[] };

const tripReducer = (state: TripState, action: TripAction): TripState => {
  switch (action.type) {
    case 'UPDATE_DOSE':
      return { ...state, dose: action.payload };
    case 'UPDATE_SET':
      return { ...state, set: action.payload };
    case 'UPDATE_SETTING':
      return { ...state, setting: action.payload };
    case 'UPDATE_SAFETY':
      return { ...state, safety: action.payload };
    case 'UPDATE_TRIP_SITTER':
      return { ...state, tripSitter: action.payload };
    case 'UPDATE_INTENTIONS':
      return { ...state, intentions: action.payload };
    case 'START_TRIP':
      return { ...state, id: action.payload, startTime: new Date(), currentPhase: 'come-up' };
    case 'END_TRIP':
      return action.payload ? initialState : { ...state, startTime: null, currentPhase: null };
    case 'UPDATE_PHASE':
      return { ...state, currentPhase: action.payload };
    case 'UPDATE_TRIP':
      return action.payload;
    case 'UPDATE_TRIP_HISTORY':
      return state; // This doesn't affect the current trip state
    default:
      return state;
  }
};

export const TripProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(tripReducer, initialState);
  const [tripHistory, setTripHistory] = useState<TripHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addIntentionToTrip } = useIntentions();

  // Load trip history from AsyncStorage on mount
  useEffect(() => {
    loadTripHistory();
  }, []);

  const loadTripHistory = async () => {
    try {
      const storedHistory = await AsyncStorage.getItem(HISTORY_KEY);
      if (storedHistory) {
        const parsedHistory = JSON.parse(storedHistory);
        // Convert string dates back to Date objects
        const historyWithDates = parsedHistory.map((trip: any) => ({
          ...trip,
          startTime: new Date(trip.startTime),
          endTime: new Date(trip.endTime),
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
          })),
          generalNotes: trip.generalNotes.map((note: any) => ({
            ...note,
            timestamp: new Date(note.timestamp)
          }))
        }));
        setTripHistory(historyWithDates);
        
        // Add existing intentions to IntentionsContext
        historyWithDates.forEach((trip: TripHistory) => {
          trip.intentions.forEach((intention: Intention) => {
            addIntentionToTrip(intention.id, trip.id, trip.startTime, trip.dose?.name || 'Trip');
          });
        });
      } else {
        // Create sample data for testing if no history exists
        await createSampleTripData();
      }
    } catch (error) {
      console.error('Error loading trip history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createSampleTripData = async () => {
    const sampleTrips: TripHistory[] = [
      {
        id: '1',
        startTime: new Date('2024-01-15T20:00:00'),
        endTime: new Date('2024-01-16T02:00:00'),
        dose: {
          name: 'Psilocybin',
          range: '2.5g',
          description: 'Golden Teacher mushrooms'
        },
        set: {
          mentalState: 'Curious and open',
          description: 'Feeling ready for introspection'
        },
        setting: 'Home, safe environment',
        safety: {
          environment: true,
          mental: true,
          emergencyPlan: true,
          tripSitter: true,
          tripSitterInfo: null,
        },
        tripSitter: {
          name: 'Sarah',
          phoneNumber: '555-0123',
          relationship: 'Friend'
        },
        intentions: [
          {
            id: 'intention-1',
            text: 'Explore self-compassion',
            description: 'Learn to be kinder to myself',
            notes: [],
            ratings: []
          },
          {
            id: 'intention-2',
            text: 'Process grief',
            description: 'Work through recent loss',
            notes: [],
            ratings: []
          }
        ],
        generalNotes: [],
        postTripRated: true
      },
      {
        id: '2',
        startTime: new Date('2024-02-10T19:00:00'),
        endTime: new Date('2024-02-11T01:00:00'),
        dose: {
          name: 'LSD',
          range: '100μg',
          description: 'Clean, tested substance'
        },
        set: {
          mentalState: 'Creative and inspired',
          description: 'Wanting to explore artistic expression'
        },
        setting: 'Nature, forest setting',
        safety: {
          environment: true,
          mental: true,
          emergencyPlan: true,
          tripSitter: true,
          tripSitterInfo: null,
        },
        tripSitter: {
          name: 'Mike',
          phoneNumber: '555-0456',
          relationship: 'Partner'
        },
        intentions: [
          {
            id: 'intention-1', // Reusing the same intention
            text: 'Explore self-compassion',
            description: 'Learn to be kinder to myself',
            notes: [],
            ratings: []
          },
          {
            id: 'intention-3',
            text: 'Connect with nature',
            description: 'Deepen my relationship with the natural world',
            notes: [],
            ratings: []
          }
        ],
        generalNotes: [],
        postTripRated: false
      }
    ];

    await saveTripHistory(sampleTrips);
    
    // Add intentions to IntentionsContext
    sampleTrips.forEach((trip: TripHistory) => {
      trip.intentions.forEach((intention: Intention) => {
        addIntentionToTrip(intention.id, trip.id, trip.startTime, trip.dose?.name || 'Trip');
      });
    });
  };

  const saveTripHistory = async (newHistory: TripHistory[]) => {
    try {
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
      setTripHistory(newHistory);
    } catch (error) {
      console.error('Error saving trip history:', error);
    }
  };

  const updateDose = (dose: TripState['dose']) => {
    dispatch({ type: 'UPDATE_DOSE', payload: dose });
  };

  const updateSet = (set: TripState['set']) => {
    dispatch({ type: 'UPDATE_SET', payload: set });
  };

  const updateSetting = (setting: string) => {
    dispatch({ type: 'UPDATE_SETTING', payload: setting });
  };

  const updateSafety = (safety: SafetyCheck) => {
    dispatch({ type: 'UPDATE_SAFETY', payload: safety });
  };

  const updateTripSitter = (sitter: TripState['tripSitter']) => {
    dispatch({ type: 'UPDATE_TRIP_SITTER', payload: sitter });
  };

  const updateIntentions = (intentions: Intention[]) => {
    dispatch({ type: 'UPDATE_INTENTIONS', payload: intentions });
  };

  const startTrip = () => {
    const tripId = `trip-${Date.now()}`;
    dispatch({ type: 'START_TRIP', payload: tripId });
  };

  const endTrip = (save: boolean) => {
    if (save && state.startTime) {
      // Create a new trip history entry
      const newTrip: TripHistory = {
        id: state.id || Date.now().toString(),
        startTime: state.startTime,
        endTime: new Date(),
        dose: state.dose,
        set: state.set,
        setting: state.setting,
        safety: state.safety,
        tripSitter: state.tripSitter,
        intentions: state.intentions,
        generalNotes: state.generalNotes,
        postTripRated: false
      };

      // Add to trip history
      const updatedHistory = [newTrip, ...tripHistory];
      saveTripHistory(updatedHistory);

      // Add trip to IntentionsContext for each intention
      state.intentions.forEach(intention => {
        addIntentionToTrip(intention.id, newTrip.id, newTrip.startTime, newTrip.dose?.name || 'Trip');
      });
    }
    dispatch({ type: 'END_TRIP', payload: save });
  };

  const updatePhase = (phase: TripState['currentPhase']) => {
    dispatch({ type: 'UPDATE_PHASE', payload: phase });
  };

  const updateTrip = (newState: TripState) => {
    dispatch({ type: 'UPDATE_TRIP', payload: newState });
  };

  const updateTripHistory = (newHistory: TripHistory[]) => {
    saveTripHistory(newHistory);
  };

  return (
    <TripContext.Provider value={{
      tripState: state,
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
    }}>
      {children}
    </TripContext.Provider>
  );
};

export function useTrip() {
  const context = useContext(TripContext);
  if (context === undefined) {
    throw new Error('useTrip must be used within a TripProvider');
  }
  return context;
} 