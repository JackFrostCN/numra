import { useCallback, useEffect, useState } from 'react';
import * as Haptics from 'expo-haptics';
import { useSQLiteContext } from 'expo-sqlite';
import { getSetting } from '@/db/queries';

/**
 * Provides haptic feedback methods that respect the user's haptics setting.
 * Reads 'haptics_enabled' from the settings table (defaults to enabled).
 */
export function useHaptics() {
  const db = useSQLiteContext();
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    getSetting(db, 'haptics_enabled').then((val) => {
      setEnabled(val !== 'false');
    });
  }, [db]);

  const light = useCallback(() => {
    if (enabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [enabled]);

  const medium = useCallback(() => {
    if (enabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, [enabled]);

  const heavy = useCallback(() => {
    if (enabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  }, [enabled]);

  const success = useCallback(() => {
    if (enabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [enabled]);

  const warning = useCallback(() => {
    if (enabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  }, [enabled]);

  const error = useCallback(() => {
    if (enabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  }, [enabled]);

  const selection = useCallback(() => {
    if (enabled) Haptics.selectionAsync();
  }, [enabled]);

  return { light, medium, heavy, success, warning, error, selection, enabled, setEnabled };
}
