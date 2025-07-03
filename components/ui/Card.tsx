import React from 'react';
import { View, ViewStyle } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'small' | 'medium' | 'large';
  style?: ViewStyle;
  onPress?: () => void;
}

export function Card({
  children,
  variant = 'default',
  padding = 'medium',
  style,
  onPress,
}: CardProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: '#ffffff',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 4,
          borderWidth: 0,
          borderColor: 'transparent',
        };
      case 'outlined':
        return {
          backgroundColor: '#ffffff',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
          elevation: 1,
          borderWidth: 1,
          borderColor: '#E2E8F0',
        };
      default:
        return {
          backgroundColor: '#ffffff',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 4,
          elevation: 2,
          borderWidth: 0,
          borderColor: 'transparent',
        };
    }
  };

  const getPaddingStyles = () => {
    switch (padding) {
      case 'none':
        return 0;
      case 'small':
        return 12;
      case 'large':
        return 24;
      default:
        return 16;
    }
  };

  const variantStyles = getVariantStyles();
  const paddingValue = getPaddingStyles();

  return (
    <View
      style={[
        {
          borderRadius: 12,
          padding: paddingValue,
          ...variantStyles,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
} 