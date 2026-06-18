import * as React from 'react';
import { View, Pressable, StyleSheet, type ViewProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { useThemeColors } from '@/hooks/useThemeColors';
import { NB } from '@/constants/theme';

export interface CardProps extends ViewProps {
  onPress?: () => void;
  onLongPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const Card = React.forwardRef<View, CardProps>(({ onPress, onLongPress, style, children, ...props }, ref) => {
  const colors = useThemeColors();
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  const handlePressIn = () => {
    translateX.value = withTiming(NB.pressOffset, { duration: NB.pressDuration });
    translateY.value = withTiming(NB.pressOffset, { duration: NB.pressDuration });
  };

  const handlePressOut = () => {
    translateX.value = withTiming(0, { duration: NB.pressDuration });
    translateY.value = withTiming(0, { duration: NB.pressDuration });
  };

  const cardStyle = [
    {
      backgroundColor: colors.bgCard,
      borderWidth: colors.borderWidth,
      borderColor: colors.border,
      borderRadius: 4,
      padding: 16,
    },
    style,
  ];

  // Shadow view (sits behind the card)
  const shadowView = (
    <View
      style={[
        StyleSheet.absoluteFill,
        {
          backgroundColor: colors.border,
          borderRadius: 4,
          top: NB.shadowOffset,
          left: NB.shadowOffset,
          right: -NB.shadowOffset,
          bottom: -NB.shadowOffset,
        },
      ]}
    />
  );

  if (onPress || onLongPress) {
    return (
      <View style={{ position: 'relative' }}>
        {shadowView}
        <AnimatedPressable
          onPress={onPress}
          onLongPress={onLongPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={animatedStyle}
        >
          <View ref={ref} style={cardStyle} {...props}>
            {children}
          </View>
        </AnimatedPressable>
      </View>
    );
  }

  return (
    <View style={{ position: 'relative' }}>
      {shadowView}
      <View ref={ref} style={cardStyle} {...props}>
        {children}
      </View>
    </View>
  );
});
Card.displayName = 'Card';

export { Card };
