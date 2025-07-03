import { MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Tabs } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { BorderRadius, Colors, Shadows, Spacing } from '@/constants/DesignSystem';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary[500],
        tabBarInactiveTintColor: isDark ? Colors.neutral[400] : Colors.neutral[500],
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: () => (
          <BlurView
            intensity={80}
            tint={isDark ? 'dark' : 'light'}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: isDark 
                ? 'rgba(15, 23, 42, 0.8)' 
                : 'rgba(255, 255, 255, 0.8)',
            }}
          />
        ),
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 88,
          paddingBottom: 20,
          paddingTop: 12,
          paddingHorizontal: Spacing.md,
          borderTopWidth: 0,
          ...Shadows.lg,
        },
        tabBarItemStyle: {
          paddingVertical: Spacing.sm,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 4,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <View style={{
              padding: 8,
              borderRadius: BorderRadius.md,
              backgroundColor: focused ? Colors.primary[50] : 'transparent',
            }}>
              <MaterialIcons 
                name="home" 
                size={24} 
                color={color} 
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color, focused }) => (
            <View style={{
              padding: 8,
              borderRadius: BorderRadius.md,
              backgroundColor: focused ? Colors.primary[50] : 'transparent',
            }}>
              <MaterialIcons 
                name="history" 
                size={24} 
                color={color} 
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="intentions"
        options={{
          title: 'Intentions',
          tabBarIcon: ({ color, focused }) => (
            <View style={{
              padding: 8,
              borderRadius: BorderRadius.md,
              backgroundColor: focused ? Colors.primary[50] : 'transparent',
            }}>
              <MaterialIcons 
                name="lightbulb" 
                size={24} 
                color={color} 
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="safety"
        options={{
          title: 'Safety',
          tabBarIcon: ({ color, focused }) => (
            <View style={{
              padding: 8,
              borderRadius: BorderRadius.md,
              backgroundColor: focused ? Colors.primary[50] : 'transparent',
            }}>
              <MaterialIcons 
                name="security" 
                size={24} 
                color={color} 
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => (
            <View style={{
              padding: 8,
              borderRadius: BorderRadius.md,
              backgroundColor: focused ? Colors.primary[50] : 'transparent',
            }}>
              <MaterialIcons 
                name="settings" 
                size={24} 
                color={color} 
              />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
