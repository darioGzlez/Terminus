import React from 'react';
import { Image, StyleProp, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CRTLevelProvider } from '../../internal/CRTContext';
import { CRTLevel, crtLevels } from '../../tokens/effects';
import { colors } from '../../tokens/colors';
import { shape } from '../../tokens/spacing';

// Tileable 4×3 PNGs baking in the exact repeating-linear-gradient alpha steps from
// handoff/src/tokens/effects.css (see scripts/gen_scanlines.py-equivalent at gen time).
const SCANLINE_SOURCES: Partial<Record<CRTLevel, ReturnType<typeof require>>> = {
  standard: require('../../assets/scanlines-standard.png'),
  full: require('../../assets/scanlines-full.png'),
};

/**
 * Screen wrapper that applies the retro intensity level (scanlines, glow, vignette).
 */
export interface CRTScreenProps {
  /** subtle = reduce effects (a11y) · standard = product default · full = opt-in CRT mode */
  level?: CRTLevel;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function CRTScreen({ level = 'standard', children, style }: CRTScreenProps) {
  const full = level === 'full';
  const tokens = crtLevels[level];
  const scanlineSource = SCANLINE_SOURCES[level];

  return (
    <CRTLevelProvider level={level}>
      <View
        style={[
          {
            position: 'relative',
            overflow: 'hidden',
            backgroundColor: full ? '#15130C' : colors.surfaceApp,
            borderRadius: full ? 28 : shape.radius,
          },
          style,
        ]}
      >
        {children}

        {/* Radial vignette approximation (full only): CSS uses a true radial-gradient;
            RN has no radial primitive, so four edge gradients fake the falloff. */}
        {full && (
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none' } as any}>
            <LinearGradient
              colors={['rgba(0,0,0,0.55)', 'rgba(0,0,0,0)']}
              style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '30%' }}
            />
            <LinearGradient
              colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.55)']}
              style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '30%' }}
            />
            <LinearGradient
              colors={['rgba(0,0,0,0.45)', 'rgba(0,0,0,0)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: '18%' }}
            />
            <LinearGradient
              colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.45)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: '18%' }}
            />
          </View>
        )}

        {scanlineSource && tokens.scanlineOpacity > 0 && (
          <Image
            source={scanlineSource}
            resizeMode="repeat"
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none' } as any}
          />
        )}
      </View>
    </CRTLevelProvider>
  );
}
