import { useCallback, useState } from 'react';
import { GestureResponderEvent, NativeSyntheticEvent, Platform, TargetedEvent } from 'react-native';

/**
 * Hover/press/focus tracking shared by every pressable in the system. Hover and focus
 * are web-only signals (mouse + keyboard); `Pressable` no-ops them on native touch, so
 * this hook is safe to wire unconditionally everywhere.
 */
export function useInteractiveState() {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [focused, setFocused] = useState(false);

  const onHoverIn = useCallback(() => setHovered(true), []);
  const onHoverOut = useCallback(() => {
    setHovered(false);
    setPressed(false);
  }, []);
  const onPressIn = useCallback((_e: GestureResponderEvent) => setPressed(true), []);
  const onPressOut = useCallback((_e: GestureResponderEvent) => setPressed(false), []);
  const onFocus = useCallback((_e: NativeSyntheticEvent<TargetedEvent>) => setFocused(true), []);
  const onBlur = useCallback((_e: NativeSyntheticEvent<TargetedEvent>) => setFocused(false), []);

  return {
    hovered,
    pressed,
    focused,
    handlers: { onHoverIn, onHoverOut, onPressIn, onPressOut, onFocus, onBlur },
  };
}

/** `cursor` only exists on web; guards native from an unknown-style warning. */
export function webCursor(value: 'pointer' | 'not-allowed' | 'text'): Record<string, unknown> {
  return Platform.OS === 'web' ? { cursor: value } : {};
}
