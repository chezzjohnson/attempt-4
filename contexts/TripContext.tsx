import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
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

interface PendingSync {
  type: 'trip' | 'history';
  data: TripState | TripHistory[];
  timestamp: number;
}

const PENDING_SYNC_KEY = '@pending_sync';

export function TripProvider({ children }: { children: React.ReactNode }) {
  const [tripState, setTripState] = useState<TripState>(initialState);
  const [tripHistory, setTripHistory] = useState<TripHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [pendingSync, setPendingSync] = useState<PendingSync[]>([]);

  // Monitor network status
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      const wasOffline = !isOnline;
      const isNowOnline = state.isConnected ?? false;
      setIsOnline(isNowOnline);

      // If we're coming back online, try to sync pending changes
      if (wasOffline && isNowOnline) {
        syncPendingChanges();
      }
    });

    return () => unsubscribe();
  }, [isOnline]);

  // Load pending sync data on mount
  useEffect(() => {
    loadPendingSync();
  }, []);

  const loadPendingSync = async () => {
    try {
      const storedSync = await AsyncStorage.getItem(PENDING_SYNC_KEY);
      if (storedSync) {
        setPendingSync(JSON.parse(storedSync));
      }
    } catch (error) {
      console.error('Error loading pending sync data:', error);
    }
  };

  const savePendingSync = async (sync: PendingSync[]) => {
    try {
      await AsyncStorage.setItem(PENDING_SYNC_KEY, JSON.stringify(sync));
      setPendingSync(sync);
    } catch (error) {
      console.error('Error saving pending sync data:', error);
    }
  };

  const syncPendingChanges = async () => {
    if (!isOnline || pendingSync.length === 0) return;

    const newPendingSync = [...pendingSync];
    const errors: Error[] = [];

    for (const sync of pendingSync) {
      try {
        if (sync.type === 'trip') {
          await saveTripData(sync.data as TripState);
        } else if (sync.type === 'history') {
          await saveTripHistory(sync.data as TripHistory[]);
        }
        // Remove successful sync from pending
        newPendingSync.shift();
      } catch (error) {
        errors.push(error as Error);
      }
    }

    if (errors.length > 0) {
      console.error('Errors during sync:', errors);
    }

    await savePendingSync(newPendingSync);
  };

  const saveTripData = async (data: TripState) => {
    if (!isOnline) {
      // Store for later sync
      const newPendingSync: PendingSync[] = [...pendingSync, {
        type: 'trip',
        data,
        timestamp: Date.now()
      }];
      await savePendingSync(newPendingSync);
      return;
    }

    const maxRetries = 3;
    let retryCount = 0;

    while (retryCount < maxRetries) {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        return;
      } catch (error) {
        retryCount++;
        if (retryCount === maxRetries) {
          console.error('Failed to save trip data after', maxRetries, 'attempts:', error);
          // Store for later sync
          const newPendingSync: PendingSync[] = [...pendingSync, {
            type: 'trip',
            data,
            timestamp: Date.now()
          }];
          await savePendingSync(newPendingSync);
        }
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
      }
    }
  };

  const saveTripHistory = async (history: TripHistory[]) => {
    if (!isOnline) {
      // Store for later sync
      const newPendingSync: PendingSync[] = [...pendingSync, {
        type: 'history',
        data: history,
        timestamp: Date.now()
      }];
      await savePendingSync(newPendingSync);
      return;
    }

    const maxRetries = 3;
    let retryCount = 0;

    while (retryCount < maxRetries) {
      try {
        await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(history));
        return;
      } catch (error) {
        retryCount++;
        if (retryCount === maxRetries) {
          console.error('Failed to save trip history after', maxRetries, 'attempts:', error);
          // Store for later sync
          const newPendingSync: PendingSync[] = [...pendingSync, {
            type: 'history',
            data: history,
            timestamp: Date.now()
          }];
          await savePendingSync(newPendingSync);
        }
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
      }
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
    if (save && tripState.startTime) {
      // Create a backup of the current state before updating
      const backupState = { ...tripState };
      
      // Update the trip state with end time
      const updatedTripState = {
        ...tripState,
        endTime: new Date(),
      };
      
      // Save the updated state
      setTripState(updatedTripState);
      saveTripData(updatedTripState);
      
      // Keep the backup in memory in case we need to recover
      setTimeout(() => {
        if (tripState.startTime === backupState.startTime) {
          // If the state hasn't changed, we can clear the backup
          return;
        }
        // If the state has changed, we might need to recover
        console.warn('Trip state changed unexpectedly after endTrip');
      }, 5000);
      
      return;
    }
    
    // Only reset if we're not saving or if there's no start time
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