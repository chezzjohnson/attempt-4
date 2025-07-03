import React from 'react';
import { View, ViewStyle } from 'react-native';
import { BorderRadius, Colors, Shadows, Spacing } from '../../constants/DesignSystem';

// Container Component
interface ContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  backgroundColor?: string;
}

export function Container({ 
  children, 
  style, 
  padding = 'md',
  backgroundColor = Colors.background.primary,
}: ContainerProps) {
  const getPadding = () => {
    switch (padding) {
      case 'none':
        return 0;
      case 'sm':
        return Spacing.sm;
      case 'lg':
        return Spacing.lg;
      case 'xl':
        return Spacing.xl;
      default:
        return Spacing.md;
    }
  };

  return (
    <View
      style={[
        {
          padding: getPadding(),
          backgroundColor,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

// Section Component
interface SectionProps {
  children: React.ReactNode;
  style?: ViewStyle;
  spacing?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  backgroundColor?: string;
}

export function Section({ 
  children, 
  style, 
  spacing = 'md',
  backgroundColor = 'transparent',
}: SectionProps) {
  const getSpacing = () => {
    switch (spacing) {
      case 'none':
        return 0;
      case 'sm':
        return Spacing.sm;
      case 'lg':
        return Spacing.lg;
      case 'xl':
        return Spacing.xl;
      default:
        return Spacing.md;
    }
  };

  return (
    <View
      style={[
        {
          marginBottom: getSpacing(),
          backgroundColor,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

// Divider Component
interface DividerProps {
  style?: ViewStyle;
  color?: string;
  thickness?: number;
  spacing?: 'none' | 'sm' | 'md' | 'lg';
}

export function Divider({ 
  style, 
  color = Colors.neutral[200],
  thickness = 1,
  spacing = 'md',
}: DividerProps) {
  const getSpacing = () => {
    switch (spacing) {
      case 'none':
        return 0;
      case 'sm':
        return Spacing.sm;
      case 'lg':
        return Spacing.lg;
      default:
        return Spacing.md;
    }
  };

  return (
    <View
      style={[
        {
          height: thickness,
          backgroundColor: color,
          marginVertical: getSpacing(),
        },
        style,
      ]}
    />
  );
}

// Spacer Component
interface SpacerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  style?: ViewStyle;
}

export function Spacer({ size = 'md', style }: SpacerProps) {
  const getSize = () => {
    switch (size) {
      case 'xs':
        return Spacing.xs;
      case 'sm':
        return Spacing.sm;
      case 'lg':
        return Spacing.lg;
      case 'xl':
        return Spacing.xl;
      case '2xl':
        return Spacing['2xl'];
      default:
        return Spacing.md;
    }
  };

  return (
    <View
      style={[
        {
          height: getSize(),
        },
        style,
      ]}
    />
  );
}

// Screen Container Component
interface ScreenContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  backgroundColor?: string;
  safeArea?: boolean;
}

export function ScreenContainer({ 
  children, 
  style, 
  backgroundColor = Colors.background.secondary,
  safeArea = true,
}: ScreenContainerProps) {
  return (
    <View
      style={[
        {
          flex: 1,
          backgroundColor,
          paddingHorizontal: Spacing.screen.horizontal,
          paddingTop: safeArea ? Spacing.screen.vertical : 0,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

// Card Container Component
interface CardContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

export function CardContainer({ 
  children, 
  style, 
  variant = 'default',
  padding = 'md',
}: CardContainerProps) {
  const getVariantStyle = () => {
    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: Colors.background.primary,
          borderRadius: BorderRadius.lg,
          ...Shadows.lg,
        };
      case 'outlined':
        return {
          backgroundColor: Colors.background.primary,
          borderRadius: BorderRadius.lg,
          borderWidth: 1,
          borderColor: Colors.neutral[200],
          ...Shadows.sm,
        };
      default:
        return {
          backgroundColor: Colors.background.primary,
          borderRadius: BorderRadius.lg,
          ...Shadows.md,
        };
    }
  };

  const getPadding = () => {
    switch (padding) {
      case 'none':
        return 0;
      case 'sm':
        return Spacing.sm;
      case 'lg':
        return Spacing.lg;
      case 'xl':
        return Spacing.xl;
      default:
        return Spacing.md;
    }
  };

  return (
    <View
      style={[
        {
          padding: getPadding(),
          ...getVariantStyle(),
        },
        style,
      ]}
    >
      {children}
    </View>
  );
} 