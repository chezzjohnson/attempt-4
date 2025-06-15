import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

export interface TripSitter {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  isUrgent: boolean;
}

interface TripSitterContextType {
  tripSitters: TripSitter[];
  addTripSitter: (sitter: Omit<TripSitter, 'id'>) => Promise<void>;
  removeTripSitter: (id: string) => Promise<void>;
  updateTripSitter: (id: string, sitter: Partial<TripSitter>) => Promise<void>;
  isLoading: boolean;
}

const STORAGE_KEY = '@trip_sitters';

const TripSitterContext = createContext<TripSitterContextType | undefined>(undefined);

export function TripSitterProvider({ children }: { children: React.ReactNode }) {
  const [tripSitters, setTripSitters] = useState<TripSitter[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load trip sitters from storage on mount
  useEffect(() => {
    loadTripSitters();
  }, []);

  const loadTripSitters = async () => {
    try {
      const storedSitters = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedSitters) {
        setTripSitters(JSON.parse(storedSitters));
      }
    } catch (error) {
      console.error('Error loading trip sitters:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveTripSitters = async (sitters: TripSitter[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(sitters));
    } catch (error) {
      console.error('Error saving trip sitters:', error);
    }
  };

  const addTripSitter = async (sitter: Omit<TripSitter, 'id'>) => {
    const newSitter: TripSitter = {
      id: Date.now().toString(),
      ...sitter,
    };
    const updatedSitters = [...tripSitters, newSitter];
    setTripSitters(updatedSitters);
    await saveTripSitters(updatedSitters);
  };

  const removeTripSitter = async (id: string) => {
    const updatedSitters = tripSitters.filter(sitter => sitter.id !== id);
    setTripSitters(updatedSitters);
    await saveTripSitters(updatedSitters);
  };

  const updateTripSitter = async (id: string, updatedSitter: Partial<TripSitter>) => {
    const updatedSitters = tripSitters.map(sitter =>
      sitter.id === id ? { ...sitter, ...updatedSitter } : sitter
    );
    setTripSitters(updatedSitters);
    await saveTripSitters(updatedSitters);
  };

  return (
    <TripSitterContext.Provider
      value={{
        tripSitters,
        addTripSitter,
        removeTripSitter,
        updateTripSitter,
        isLoading,
      }}
    >
      {children}
    </TripSitterContext.Provider>
  );
}

export function useTripSitter() {
  const context = useContext(TripSitterContext);
  if (context === undefined) {
    throw new Error('useTripSitter must be used within a TripSitterProvider');
  }
  return context;
} 