import React, { useEffect } from 'react';
import { Platform, Pressable, View, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Wordmark } from '../components/Wordmark';
import { Text } from '../design-system/internal/Text';
import { Cursor } from '../design-system/components/core/Cursor';
import { colors, fontFamily, fontSize, spacing } from '../design-system';

const BIOS_LINES: { text: string; suffix?: string }[] = [
  { text: 'TERMINUS BIOS v0.1 · (c) 2026' },
  { text: 'Memory test ........ 640K ', suffix: 'OK' },
  { text: 'Voice I/O ........... ', suffix: 'READY' },
  { text: 'Camera .............. ', suffix: 'READY' },
  { text: 'Agent link .......... ', suffix: 'ONLINE' },
];

/** Reproduces screenshots/app/01-boot.png. Any key (web) or tap continues to /chat. */
export function BootScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const go = React.useCallback(() => router.replace('/chat'), [router]);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    const handler = () => go();
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [go]);

  return (
    <Pressable
      onPress={go}
      accessibilityRole="button"
      accessibilityLabel="Press any key to continue"
      style={{ flex: 1, justifyContent: 'center', paddingHorizontal: spacing.sp12 }}
    >
      <View style={{ gap: spacing.sp6 }}>
        <Wordmark size={width < 500 ? fontSize.displayMobile : fontSize.display} />

        <View style={{ gap: 4 }}>
          {BIOS_LINES.map((line, i) => (
            <Text key={i} style={{ fontFamily: fontFamily.monoRegular, fontSize: fontSize.body, color: colors.textBody }}>
              {line.text}
              {line.suffix && <Text style={{ color: colors.statusOk }}>{line.suffix}</Text>}
            </Text>
          ))}
        </View>

        <Text style={{ fontFamily: fontFamily.monoRegular, fontSize: fontSize.body, color: colors.textBody, marginTop: spacing.sp4 }}>
          PRESS ANY KEY
          <Cursor color={colors.textBody} />
        </Text>
      </View>
    </Pressable>
  );
}
