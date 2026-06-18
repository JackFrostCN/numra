import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { Pressable } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { NB, Fonts } from '@/constants/theme';
import { useThemeColors } from '@/hooks/useThemeColors';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface FABProps {
  onPress: () => void;
  icon?: string;
}

export function FAB({ onPress, icon = 'add' }: FABProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const colors = useThemeColors();

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

  return (
    <View style={styles.container}>
      {/* Hard shadow */}
      <View
        style={[
          styles.shadow,
          { backgroundColor: colors.border },
        ]}
      />
      <AnimatedPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.fab,
          {
            backgroundColor: '#FFD93D',
            borderColor: colors.border,
            borderWidth: colors.borderWidth,
          },
          animatedStyle,
        ]}
      >
        <MaterialIcons name={icon as any} size={28} color="#000000" />
      </AnimatedPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    zIndex: 100,
  },
  shadow: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 4,
    top: NB.shadowOffset,
    left: NB.shadowOffset,
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
