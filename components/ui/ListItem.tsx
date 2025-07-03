import React from 'react';
import { TouchableOpacity, View, ViewStyle } from 'react-native';
import { BorderRadius, Colors, Spacing } from '../../constants/DesignSystem';
import { BodyText, Caption } from './Typography';

interface ListItemProps {
  title: string;
  subtitle?: string;
  description?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onPress?: () => void;
  variant?: 'default' | 'elevated' | 'outlined';
  style?: ViewStyle;
}

export function ListItem({
  title,
  subtitle,
  description,
  leftIcon,
  rightIcon,
  onPress,
  variant = 'default',
  style,
}: ListItemProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: Colors.background.primary,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 2,
          borderWidth: 0,
          borderColor: 'transparent',
        };
      case 'outlined':
        return {
          backgroundColor: Colors.background.primary,
          shadowColor: 'transparent',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0,
          shadowRadius: 0,
          elevation: 0,
          borderWidth: 1,
          borderColor: Colors.neutral[200],
        };
      default:
        return {
          backgroundColor: Colors.neutral[50],
          shadowColor: 'transparent',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0,
          shadowRadius: 0,
          elevation: 0,
          borderWidth: 0,
          borderColor: 'transparent',
        };
    }
  };

  const variantStyles = getVariantStyles();
  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          padding: Spacing.md,
          borderRadius: BorderRadius.lg,
          marginBottom: Spacing.sm,
          ...variantStyles,
        },
        style,
      ]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      {leftIcon && (
        <View style={{ marginRight: Spacing.sm }}>
          {leftIcon}
        </View>
      )}
      
      <View style={{ flex: 1 }}>
        <BodyText weight="semibold" style={{ marginBottom: Spacing.xs }}>
          {title}
        </BodyText>
        {subtitle && (
          <Caption style={{ marginBottom: Spacing.xs }}>
            {subtitle}
          </Caption>
        )}
        {description && (
          <Caption color={Colors.text.tertiary}>
            {description}
          </Caption>
        )}
      </View>

      {rightIcon && (
        <View style={{ marginLeft: Spacing.sm }}>
          {rightIcon}
        </View>
      )}
    </Container>
  );
} 