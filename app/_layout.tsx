import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { useColorScheme } from 'react-native';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { AuthProvider } from '../contexts/AuthContext';
import { FirebaseProvider } from '../contexts/FirebaseContext';
import { IntentionsProvider } from '../contexts/IntentionsContext';
import { ThemeProvider as CustomThemeProvider } from '../contexts/ThemeContext';
import { TripProvider, useTrip } from '../contexts/TripContext';
import { TripSitterProvider } from '../contexts/TripSitterContext';

function AppContent() {
  const colorScheme = useColorScheme();
  const { tripState } = useTrip();
  const isActiveTrip = tripState.startTime !== null;

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          headerShown: false,
          gestureEnabled: false,
        }}
      >
        {isActiveTrip ? (
          // During active trip, ONLY show the active trip screen
          <Stack.Screen
            name="trip/active"
            options={{
              headerShown: false,
              gestureEnabled: false,
              animation: 'none',
              // Prevent any navigation
              navigationBarHidden: true,
            }}
          />
        ) : (
          // Normal navigation when no active trip
          <>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="new-trip/dose-selection" options={{ headerShown: false }} />
            <Stack.Screen name="new-trip/set" options={{ headerShown: false }} />
            <Stack.Screen name="new-trip/setting" options={{ headerShown: false }} />
            <Stack.Screen name="new-trip/safety" options={{ headerShown: false }} />
            <Stack.Screen name="new-trip/intentions" options={{ headerShown: false }} />
            <Stack.Screen name="new-trip/review" options={{ headerShown: false }} />
          </>
        )}
      </Stack>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <FirebaseProvider>
        <AuthProvider>
          <CustomThemeProvider>
            <IntentionsProvider>
              <TripProvider>
                <TripSitterProvider>
                  <AppContent />
                  <StatusBar style="auto" />
                </TripSitterProvider>
              </TripProvider>
            </IntentionsProvider>
          </CustomThemeProvider>
        </AuthProvider>
      </FirebaseProvider>
    </ErrorBoundary>
  );
}
