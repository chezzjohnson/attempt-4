import { Stack } from 'expo-router';

export default function NewTripLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#F5F7FA',
        },
        headerTintColor: '#1F2933',
        headerTitleStyle: {
          fontWeight: '600',
        },
        headerShadowVisible: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen
        name="dose-selection"
        options={{
          title: 'Select Dose',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="setting"
        options={{
          title: 'Set & Setting',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="safety"
        options={{
          title: 'Safety Check',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="intentions"
        options={{
          title: 'Set Intentions',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="review"
        options={{
          title: 'Review Trip',
          headerBackTitle: 'Back',
        }}
      />
    </Stack>
  );
} 