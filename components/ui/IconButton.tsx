import React from 'react';
import { ActivityIndicator, TouchableOpacity, ViewStyle } from 'react-native';
import { BorderRadius, Colors, Spacing } from '../../constants/DesignSystem';

interface IconButtonProps {
  icon: React.ReactNode;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

export function IconButton({
  icon,
  onPress,
  variant = 'ghost',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
}: IconButtonProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: disabled ? Colors.neutral[400] : Colors.primary[500],
          borderColor: 'transparent',
        };
      case 'secondary':
        return {
          backgroundColor: disabled ? Colors.neutral[100] : Colors.background.primary,
          borderColor: disabled ? Colors.neutral[300] : Colors.neutral[200],
        };
      case 'danger':
        return {
          backgroundColor: disabled ? Colors.neutral[400] : Colors.error[500],
          borderColor: 'transparent',
        };
      case 'ghost':
      default:
        return {
          backgroundColor: 'transparent',
          borderColor: 'transparent',
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          padding: Spacing.xs,
          borderRadius: BorderRadius.md,
        };
      case 'large':
        return {
          padding: Spacing.md,
          borderRadius: BorderRadius.xl,
        };
      default:
        return {
          padding: Spacing.sm,
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
          borderWidth: variant === 'secondary' ? 1 : 0,
          borderColor: variantStyles.borderColor,
          borderRadius: sizeStyles.borderRadius,
          padding: sizeStyles.padding,
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'ghost' ? Colors.text.secondary : Colors.text.inverse}
        />
      ) : (
        icon
      )}
    </TouchableOpacity>
  );
} 