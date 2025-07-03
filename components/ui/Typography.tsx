import React from 'react';
import { Text, TextProps, TextStyle } from 'react-native';
import { Colors, Typography } from '../../constants/DesignSystem';

// Heading Components
interface HeadingProps extends TextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  color?: string;
}

export function Heading({ 
  variant = 'h1', 
  color = Colors.text.primary,
  style, 
  children, 
  ...props 
}: HeadingProps) {
  const getHeadingStyle = (): TextStyle => {
    switch (variant) {
      case 'h1':
        return {
          fontSize: Typography.sizes['5xl'],
          fontWeight: Typography.weights.bold,
          lineHeight: Typography.sizes['5xl'] * Typography.lineHeights.tight,
          letterSpacing: Typography.letterSpacing.tight,
        };
      case 'h2':
        return {
          fontSize: Typography.sizes['4xl'],
          fontWeight: Typography.weights.bold,
          lineHeight: Typography.sizes['4xl'] * Typography.lineHeights.tight,
          letterSpacing: Typography.letterSpacing.tight,
        };
      case 'h3':
        return {
          fontSize: Typography.sizes['3xl'],
          fontWeight: Typography.weights.semibold,
          lineHeight: Typography.sizes['3xl'] * Typography.lineHeights.tight,
        };
      case 'h4':
        return {
          fontSize: Typography.sizes['2xl'],
          fontWeight: Typography.weights.semibold,
          lineHeight: Typography.sizes['2xl'] * Typography.lineHeights.tight,
        };
      case 'h5':
        return {
          fontSize: Typography.sizes.xl,
          fontWeight: Typography.weights.semibold,
          lineHeight: Typography.sizes.xl * Typography.lineHeights.normal,
        };
      case 'h6':
        return {
          fontSize: Typography.sizes.lg,
          fontWeight: Typography.weights.medium,
          lineHeight: Typography.sizes.lg * Typography.lineHeights.normal,
        };
      default:
        return {};
    }
  };

  return (
    <Text
      style={[
        {
          color,
          ...getHeadingStyle(),
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
}

// Body Text Components
interface BodyTextProps extends TextProps {
  variant?: 'large' | 'base' | 'small';
  color?: string;
  weight?: 'normal' | 'medium' | 'semibold';
}

export function BodyText({ 
  variant = 'base', 
  color = Colors.text.primary,
  weight = 'normal',
  style, 
  children, 
  ...props 
}: BodyTextProps) {
  const getBodyStyle = (): TextStyle => {
    const size = variant === 'large' ? Typography.sizes.lg : 
                 variant === 'small' ? Typography.sizes.sm : 
                 Typography.sizes.base;
    
    return {
      fontSize: size,
      fontWeight: Typography.weights[weight],
      lineHeight: size * Typography.lineHeights.normal,
    };
  };

  return (
    <Text
      style={[
        {
          color,
          ...getBodyStyle(),
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
}

// Caption Component
interface CaptionProps extends TextProps {
  color?: string;
  weight?: 'normal' | 'medium';
}

export function Caption({ 
  color = Colors.text.secondary,
  weight = 'normal',
  style, 
  children, 
  ...props 
}: CaptionProps) {
  return (
    <Text
      style={[
        {
          fontSize: Typography.sizes.xs,
          fontWeight: Typography.weights[weight],
          lineHeight: Typography.sizes.xs * Typography.lineHeights.normal,
          color,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
}

// Label Component
interface LabelProps extends TextProps {
  color?: string;
  weight?: 'medium' | 'semibold';
}

export function Label({ 
  color = Colors.text.primary,
  weight = 'medium',
  style, 
  children, 
  ...props 
}: LabelProps) {
  return (
    <Text
      style={[
        {
          fontSize: Typography.sizes.sm,
          fontWeight: Typography.weights[weight],
          lineHeight: Typography.sizes.sm * Typography.lineHeights.normal,
          color,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
} 