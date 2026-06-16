import { useColorScheme } from 'nativewind';
import { DarkPalette, LightPalette } from '@/constants/theme';

/**
 * Returns the active color palette based on the NativeWind color scheme.
 * Automatically re-renders components when the user toggles light/dark mode.
 */
export function useThemeColors() {
  const { colorScheme } = useColorScheme();
  return colorScheme === 'dark' ? DarkPalette : LightPalette;
}
