import React from 'react';
import { Pressable } from 'react-native';
import { Text } from '../../internal/Text';
import { colors } from '../../tokens/colors';
import { spacing } from '../../tokens/spacing';
import { fontFamily, fontSize } from '../../tokens/typography';
import { useInteractiveState, webCursor } from '../../internal/useInteractiveState';

/** Toggleable tag — suggested prompts, filters, quick actions on an image. */
export interface ChipProps {
  selected?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

export function Chip({ selected = false, onClick, children }: ChipProps) {
  const { hovered, handlers } = useInteractiveState();
  const emphasized = selected || hovered;
  const fg = selected ? colors.textAccent : colors.textBody;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onClick}
      {...handlers}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sp2,
          paddingVertical: 6,
          paddingHorizontal: 10,
          borderWidth: 1,
          borderColor: emphasized ? colors.gold : colors.borderInput,
          backgroundColor: selected ? colors.surfaceSelected : 'transparent',
        },
        webCursor('pointer'),
      ]}
    >
      <Text style={{ color: fg, fontFamily: fontFamily.monoRegular, fontSize: fontSize.meta }}>
        {selected ? '[x]' : '[ ]'}
      </Text>
      <Text style={{ color: fg, fontFamily: fontFamily.monoRegular, fontSize: fontSize.meta }}>{children}</Text>
    </Pressable>
  );
}
