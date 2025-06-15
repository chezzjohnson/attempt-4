import React, { createContext, useContext, useState } from 'react';
import { TripSitter } from './TripSitterContext';

interface Intention {
  id: string;
  text: string;
  emoji: string;
  description: string;
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
  startTime: Date | null;
  currentPhase: 'come-up' | 'peak' | 'comedown' | null;
}

interface TripContextType {
  tripState: TripState;
  updateDose: (dose: TripState['dose']) => void;
  updateSet: (set: TripState['set']) => void;
  updateSetting: (setting: string) => void;
  updateSafety: (safety: SafetyCheck) => void;
  updateTripSitter: (sitter: TripState['tripSitter']) => void;
  updateIntentions: (intentions: Intention[]) => void;
  startTrip: () => void;
  endTrip: () => void;
  updatePhase: (phase: TripState['currentPhase']) => void;
}

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
  startTime: null,
  currentPhase: null,
};

const TripContext = createContext<TripContextType | undefined>(undefined);

export function TripProvider({ children }: { children: React.ReactNode }) {
  const [tripState, setTripState] = useState<TripState>(initialState);

  const updateDose = (dose: TripState['dose']) => {
    setTripState(prev => ({ ...prev, dose }));
  };

  const updateSet = (set: TripState['set']) => {
    setTripState(prev => ({ ...prev, set }));
  };

  const updateSetting = (setting: string) => {
    setTripState(prev => ({ ...prev, setting }));
  };

  const updateSafety = (safety: SafetyCheck) => {
    setTripState(prev => ({ ...prev, safety }));
  };

  const updateTripSitter = (sitter: TripState['tripSitter']) => {
    setTripState(prev => ({ ...prev, tripSitter: sitter }));
  };

  const updateIntentions = (intentions: Intention[]) => {
    setTripState(prev => ({ ...prev, intentions }));
  };

  const startTrip = () => {
    setTripState(prev => ({
      ...prev,
      startTime: new Date(),
      currentPhase: 'come-up',
    }));
  };

  const endTrip = () => {
    setTripState(initialState);
  };

  const updatePhase = (phase: TripState['currentPhase']) => {
    setTripState(prev => ({ ...prev, currentPhase: phase }));
  };

  return (
    <TripContext.Provider
      value={{
        tripState,
        updateDose,
        updateSet,
        updateSetting,
        updateSafety,
        updateTripSitter,
        updateIntentions,
        startTrip,
        endTrip,
        updatePhase,
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