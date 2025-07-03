import React from 'react';
import {
    ActivityIndicator,
    Text,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '../../constants/DesignSystem';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  icon,
  style,
  textStyle,
}: ButtonProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: disabled ? Colors.neutral[400] : Colors.primary[500],
          borderColor: 'transparent',
          textColor: Colors.text.inverse,
        };
      case 'secondary':
        return {
          backgroundColor: disabled ? Colors.neutral[100] : Colors.background.primary,
          borderColor: disabled ? Colors.neutral[300] : Colors.neutral[200],
          textColor: disabled ? Colors.neutral[400] : Colors.text.primary,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderColor: disabled ? Colors.neutral[300] : Colors.primary[500],
          textColor: disabled ? Colors.neutral[400] : Colors.primary[500],
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          borderColor: 'transparent',
          textColor: disabled ? Colors.neutral[400] : Colors.primary[500],
        };
      default:
        return {
          backgroundColor: Colors.primary[500],
          borderColor: 'transparent',
          textColor: Colors.text.inverse,
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
          paddingHorizontal: Spacing.xl,
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
    <TouchableOpacity
      style={[
        {
          backgroundColor: variantStyles.backgroundColor,
          borderWidth: variant === 'outline' ? 1 : 0,
          borderColor: variantStyles.borderColor,
          borderRadius: sizeStyles.borderRadius,
          paddingHorizontal: sizeStyles.paddingHorizontal,
          paddingVertical: sizeStyles.paddingVertical,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          ...(variant === 'primary' ? Shadows.sm : {}),
        },
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variantStyles.textColor}
          style={{ marginRight: Spacing.sm }}
        />
      ) : (
        icon && <View style={{ marginRight: Spacing.sm }}>{icon}</View>
      )}
      <Text
        style={[
          {
            color: variantStyles.textColor,
            fontSize: sizeStyles.fontSize,
            fontWeight: Typography.weights.semibold,
            textAlign: 'center',
          },
          textStyle,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
} 