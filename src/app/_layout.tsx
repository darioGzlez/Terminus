import { useEffect } from 'react';
import { Stack, usePathname } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import {
  IBMPlexMono_400Regular,
  IBMPlexMono_400Regular_Italic,
  IBMPlexMono_500Medium,
  IBMPlexMono_600SemiBold,
  useFonts,
} from '@expo-google-fonts/ibm-plex-mono';
import { VT323_400Regular } from '@expo-google-fonts/vt323';
import { CRTScreen, colors } from '../design-system';
import { SessionsProvider } from '../state/SessionsContext';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    IBMPlexMono_400Regular,
    IBMPlexMono_500Medium,
    IBMPlexMono_600SemiBold,
    IBMPlexMono_400Regular_Italic,
    VT323_400Regular,
  });
  const pathname = usePathname();

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  // The full-screen photo viewer drops the CRT scanlines/glow for a pure black backdrop.
  const crtLevel = pathname.includes('/photo/') ? 'subtle' : 'standard';

  return (
    <CRTScreen level={crtLevel} style={{ flex: 1 }}>
      <SessionsProvider>
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.surfaceApp } }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="sessions" />
          <Stack.Screen name="s/new" />
          <Stack.Screen name="s/[id]/index" />
          <Stack.Screen name="s/[id]/voice" options={{ presentation: 'fullScreenModal' }} />
          <Stack.Screen name="s/[id]/photo/[msgId]/[n]" options={{ presentation: 'fullScreenModal' }} />
          <Stack.Screen name="design-system" />
        </Stack>
      </SessionsProvider>
    </CRTScreen>
  );
}
