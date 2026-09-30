/* eslint-disable react-hooks/immutability --
 * Merging an externally-supplied `inputRef` object with the internal ref is the
 * standard React ref-forwarding idiom (same as `useMergeRefs`): assigning `.current`
 * on a caller-owned ref object is safe and expected, even though the generic
 * "don't mutate props" rule can't distinguish it from an unsafe prop mutation.
 */
import React from 'react';
import {
  NativeSyntheticEvent,
  Pressable,
  TextInput as RNTextInput,
  TextInputKeyPressEventData,
  View,
} from 'react-native';
import { Text } from '../../internal/Text';
import { colors } from '../../tokens/colors';
import { sizing, spacing } from '../../tokens/spacing';
import { em, fontFamily, fontSize, tracking } from '../../tokens/typography';
import { useInteractiveState, webCursor } from '../../internal/useInteractiveState';

/** Prompt-prefixed single-line input. */
export interface TextInputProps {
  value?: string;
  /** Adapted from the web `ChangeEvent` signature: RN's TextInput already yields the string. */
  onChange?: (value: string) => void;
  onKeyDown?: (e: NativeSyntheticEvent<TextInputKeyPressEventData>) => void;
  placeholder?: string;
  /** Prefix character. Default ">" */
  prompt?: string;
  /** Caps label above the field */
  label?: string;
  /** Error text, rendered as "ERR: …" in red */
  error?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  inputRef?: React.Ref<RNTextInput>;
}

export function TextInput({
  value,
  onChange,
  onKeyDown,
  placeholder,
  prompt = '>',
  label,
  error,
  disabled = false,
  autoFocus,
  inputRef,
}: TextInputProps) {
  const { focused, handlers } = useInteractiveState();
  const localRef = React.useRef<RNTextInput>(null);

  const setRefs = (node: RNTextInput | null) => {
    localRef.current = node;
    if (typeof inputRef === 'function') inputRef(node);
    else if (inputRef && 'current' in (inputRef as React.MutableRefObject<RNTextInput | null>)) {
      (inputRef as React.MutableRefObject<RNTextInput | null>).current = node;
    }
  };

  const borderColor = disabled
    ? colors.borderDefault
    : error
      ? colors.borderError
      : focused
        ? colors.borderFocus
        : colors.borderInput;
  const promptColor = disabled
    ? colors.textDisabled
    : error
      ? colors.statusError
      : focused
        ? colors.textAccent
        : colors.textMeta;

  return (
    <Pressable
      onPress={() => localRef.current?.focus()}
      style={{ flexDirection: 'column', gap: spacing.sp2, minWidth: 0, flex: 1 }}
    >
      {label && (
        <Text
          style={{
            fontSize: fontSize.label,
            letterSpacing: em(fontSize.label, tracking.label),
            color: error ? colors.statusError : colors.textMeta,
            textTransform: 'uppercase',
          }}
        >
          {label}
        </Text>
      )}
      <View
        style={{
          height: sizing.hit,
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sp3,
          paddingHorizontal: spacing.sp3,
          borderWidth: 1,
          borderStyle: disabled ? 'dashed' : 'solid',
          borderColor,
          backgroundColor: disabled ? colors.surfacePanel : colors.surfaceApp,
        }}
      >
        <Text style={{ color: promptColor, fontSize: fontSize.body }}>{prompt}</Text>
        <RNTextInput
          ref={setRefs}
          value={value}
          onChangeText={onChange}
          onKeyPress={onKeyDown}
          placeholder={placeholder}
          placeholderTextColor={colors.textMeta}
          editable={!disabled}
          autoFocus={autoFocus}
          onFocus={handlers.onFocus}
          onBlur={handlers.onBlur}
          selectionColor={colors.gold}
          style={[
            {
              flex: 1,
              minWidth: 0,
              height: '100%',
              padding: 0,
              color: disabled ? colors.textDisabled : colors.textBody,
              fontFamily: fontFamily.monoRegular,
              fontSize: fontSize.body,
            },
            webCursor('text'),
          ]}
        />
      </View>
      {error && <Text style={{ fontSize: fontSize.meta, color: colors.statusError }}>ERR: {error}</Text>}
    </Pressable>
  );
}
