import React from 'react';
import { TextInput as RNTextInput, View } from 'react-native';
import { Text } from '../../internal/Text';
import { IconButton } from '../core/IconButton';
import { colors } from '../../tokens/colors';
import { sizing, spacing } from '../../tokens/spacing';
import { fontFamily, fontSize } from '../../tokens/typography';
import { useInteractiveState, webCursor } from '../../internal/useInteractiveState';

/**
 * Message composer: attach · prompt input · mic (empty) / send (has text).
 */
export interface ComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSend?: (value: string) => void;
  onAttach?: () => void;
  onMic?: () => void;
  /** Push-to-talk hold detection — used instead of onMic on touch devices. */
  onMicPressIn?: () => void;
  onMicPressOut?: () => void;
  placeholder?: string;
  disabled?: boolean;
  /** AttachmentTray rendered above the input row */
  tray?: React.ReactNode;
  micLabel?: string;
  /** Agent is thinking or streaming: action button becomes "[■] stop". */
  busy?: boolean;
  onStop?: () => void;
  /** 429: text stays editable, but attach/mic/send/stop are disabled. */
  actionsDisabled?: boolean;
  /** Pending photos in the tray: the action button is "send" even with no caption text. */
  hasAttachments?: boolean;
}

export function Composer({
  value,
  onChange,
  onSend,
  onAttach,
  onMic,
  onMicPressIn,
  onMicPressOut,
  onStop,
  placeholder = 'message',
  disabled = false,
  tray,
  micLabel = 'Record voice note',
  busy = false,
  actionsDisabled = false,
  hasAttachments = false,
}: ComposerProps) {
  const { focused, handlers } = useInteractiveState();
  const has = hasAttachments || Boolean(value && value.trim().length > 0);
  const buttonsDisabled = disabled || actionsDisabled;
  const submit = () => {
    if (has && onSend && !buttonsDisabled) onSend(value);
  };

  return (
    <View
      style={{
        flexDirection: 'column',
        gap: spacing.sp2,
        padding: 10,
        borderTopWidth: 1,
        borderTopColor: colors.borderDefault,
        backgroundColor: colors.surfaceApp,
      }}
    >
      {tray}
      <View style={{ flexDirection: 'row', gap: spacing.sp2, alignItems: 'center' }}>
        <IconButton icon="attach" label="Attach photo" onClick={onAttach} disabled={buttonsDisabled} />
        <View
          style={{
            flex: 1,
            minWidth: 0,
            height: sizing.hit,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            paddingHorizontal: spacing.sp3,
            borderWidth: 1,
            borderStyle: disabled ? 'dashed' : 'solid',
            borderColor: disabled ? colors.borderDefault : focused ? colors.borderFocus : colors.borderInput,
          }}
        >
          <Text style={{ color: focused ? colors.textAccent : colors.textMeta }}>{'>'}</Text>
          <RNTextInput
            value={value}
            onChangeText={onChange}
            placeholder={placeholder}
            placeholderTextColor={colors.textMeta}
            editable={!disabled}
            onFocus={handlers.onFocus}
            onBlur={handlers.onBlur}
            onSubmitEditing={submit}
            returnKeyType="send"
            blurOnSubmit={false}
            selectionColor={colors.gold}
            style={[
              {
                flex: 1,
                minWidth: 0,
                height: '100%',
                padding: 0,
                color: colors.textBody,
                fontFamily: fontFamily.monoRegular,
                fontSize: fontSize.body,
              },
              webCursor('text'),
            ]}
          />
        </View>
        {busy ? (
          <IconButton icon="stop" label="Stop" variant="outline" onClick={onStop} disabled={buttonsDisabled} />
        ) : has ? (
          <IconButton icon="send" label="Send" variant="primary" onClick={submit} disabled={buttonsDisabled} />
        ) : (
          <IconButton
            icon="mic"
            label={micLabel}
            variant="primary"
            onClick={onMic}
            onPressIn={onMicPressIn}
            onPressOut={onMicPressOut}
            disabled={buttonsDisabled}
          />
        )}
      </View>
    </View>
  );
}
