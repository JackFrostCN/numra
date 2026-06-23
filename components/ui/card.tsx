import * as React from 'react';
import { View, Pressable, StyleSheet, type ViewProps, type StyleProp, type ViewStyle } from 'react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import { Shadows, Radius } from '@/constants/theme';

export interface CardProps extends ViewProps {
  onPress?: () => void;
  onLongPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

const Card = React.forwardRef<View, CardProps>(({ onPress, onLongPress, style, children, ...props }, ref) => {
  const colors = useThemeColors();

  const cardStyle = [
    {
      backgroundColor: colors.bgCard,
      borderWidth: colors.borderWidth,
      borderColor: colors.border,
      borderRadius: Radius.lg,
      padding: 16,
    },
    Shadows.sm,
    style,
  ];

  if (onPress || onLongPress) {
    return (
      <Pressable
        ref={ref as any}
        onPress={onPress}
        onLongPress={onLongPress}
        style={({ pressed }) => [
          cardStyle,
          pressed && { opacity: 0.7 },
        ]}
        {...(props as any)}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View ref={ref} style={cardStyle} {...props}>
      {children}
    </View>
  );
});
Card.displayName = 'Card';

export { Card };
