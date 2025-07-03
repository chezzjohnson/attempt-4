import React from 'react';
import { TextInput, TextInputProps, TextStyle, View, ViewStyle } from 'react-native';
import { BorderRadius, Colors, Spacing, Typography } from '../../constants/DesignSystem';
import { Label } from './Typography';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  variant?: 'default' | 'outlined' | 'filled';
  size?: 'small' | 'medium' | 'large';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
}

export function Input({
  label,
  error,
  variant = 'default',
  size = 'medium',
  leftIcon,
  rightIcon,
  containerStyle,
  inputStyle,
  style,
  ...props
}: InputProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'outlined':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: error ? Colors.error[500] : Colors.neutral[300],
          shadowColor: 'transparent',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0,
          shadowRadius: 0,
          elevation: 0,
        };
      case 'filled':
        return {
          backgroundColor: Colors.neutral[100],
          borderWidth: 0,
          borderColor: 'transparent',
          shadowColor: 'transparent',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0,
          shadowRadius: 0,
          elevation: 0,
        };
      default:
        return {
          backgroundColor: Colors.background.primary,
          borderWidth: 1,
          borderColor: error ? Colors.error[500] : Colors.neutral[200],
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
          elevation: 1,
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          paddingHorizontal: Spacing.sm,
          paddingVertical: Spacing.xs,
          fontSize: Typography.sizes.sm,
          borderRadius: BorderRadius.md,
        };
      case 'large':
        return {
          paddingHorizontal: Spacing.lg,
          paddingVertical: Spacing.md,
          fontSize: Typography.sizes.lg,
          borderRadius: BorderRadius.xl,
        };
      default:
        return {
          paddingHorizontal: Spacing.md,
          paddingVertical: Spacing.sm,
          fontSize: Typography.sizes.base,
          borderRadius: BorderRadius.lg,
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  return (
    <View style={[{ marginBottom: Spacing.md }, containerStyle]}>
      {label && (
        <Label style={{ marginBottom: Spacing.xs, color: Colors.text.primary }}>
          {label}
        </Label>
      )}
      <View
        style={[
          {
            flexDirection: 'row',
            alignItems: 'center',
            borderRadius: sizeStyles.borderRadius,
            ...variantStyles,
          },
          style,
        ]}
      >
        {leftIcon && (
          <View style={{ marginLeft: Spacing.sm, marginRight: Spacing.xs }}>
            {leftIcon}
          </View>
        )}
        <TextInput
          style={[
            {
              flex: 1,
              paddingHorizontal: sizeStyles.paddingHorizontal,
              paddingVertical: sizeStyles.paddingVertical,
              fontSize: sizeStyles.fontSize,
              color: Colors.text.primary,
              fontWeight: Typography.weights.normal,
            },
            inputStyle,
          ]}
          placeholderTextColor={Colors.text.tertiary}
          {...props}
        />
        {rightIcon && (
          <View style={{ marginRight: Spacing.sm, marginLeft: Spacing.xs }}>
            {rightIcon}
          </View>
        )}
      </View>
      {error && (
        <Label
          style={{
            marginTop: Spacing.xs,
            color: Colors.error[500],
            fontSize: Typography.sizes.xs,
          }}
        >
          {error}
        </Label>
      )}
    </View>
  );
} 