import React from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import { colors } from '../../tokens/colors';

// 8×8 bitmaps, identical to handoff/src/assets/icons/icons.json.
const ICONS = {
  mic: ['..####..', '..####..', '..####..', '#.####.#', '#......#', '.######.', '...##...', '.######.'],
  send: ['....#...', '....##..', '#######.', '########', '#######.', '....##..', '....#...', '........'],
  camera: ['........', '..###...', '########', '#..##..#', '#.#..#.#', '#.#..#.#', '#..##..#', '########'],
  image: ['########', '#......#', '#....#.#', '#......#', '#..#...#', '#.###.##', '########', '........'],
  speaker: ['...#..#.', '..##...#', '####.#.#', '####.#.#', '####.#.#', '..##...#', '...#..#.', '........'],
  wave: ['....#...', '..#.#...', '..#.#.#.', '#.#.#.#.', '#.#.#.#.', '..#.#.#.', '..#.#...', '....#...'],
  play: ['........', '.##.....', '.####...', '.######.', '.######.', '.####...', '.##.....', '........'],
  stop: ['........', '.######.', '.######.', '.######.', '.######.', '.######.', '.######.', '........'],
  attach: ['...##...', '...##...', '...##...', '########', '########', '...##...', '...##...', '...##...'],
  close: ['##....##', '.##..##.', '..####..', '...##...', '..####..', '.##..##.', '##....##', '........'],
  check: ['........', '.......#', '......##', '.....##.', '#...##..', '##.##...', '.###....', '..#.....'],
  warn: ['...##...', '..#..#..', '..#..#..', '.#.##.#.', '.#.##.#.', '#......#', '#..##..#', '########'],
  agent: ['...##...', '########', '#......#', '#.#..#.#', '#......#', '#.####.#', '#......#', '########'],
  user: ['..####..', '.#....#.', '.#....#.', '..####..', '........', '.######.', '#......#', '########'],
  copy: ['#####...', '#...#...', '#.#####.', '#.#...#.', '###...#.', '..#...#.', '..#####.', '........'],
  keyboard: ['........', '########', '#.#.#.##', '##.#.#.#', '#.####.#', '########', '........', '........'],
} as const;

export type PixelIconName = keyof typeof ICONS;

/** 8×8 bitmap icon. Render only at integer multiples of 8: 16, 24, 32, 48. */
export interface PixelIconProps {
  name: PixelIconName;
  /** px — use 16 | 24 | 32 | 48. Default 16. */
  size?: 16 | 24 | 32 | 48 | number;
  /** Any hex color. Default `colors.textBody`. */
  color?: string;
  /** Accessible label; omit for decorative icons. */
  title?: string;
  style?: StyleProp<ViewStyle>;
}

export function PixelIcon({ name, size = 16, color = colors.textBody, title, style }: PixelIconProps) {
  const rows = ICONS[name] ?? ICONS.close;
  const cell = size / 8;

  const pixels = React.useMemo(() => {
    const out: { x: number; y: number }[] = [];
    rows.forEach((row, y) => {
      for (let x = 0; x < 8; x++) if (row[x] === '#') out.push({ x, y });
    });
    return out;
  }, [rows]);

  return (
    <View
      style={[{ width: size, height: size, flexShrink: 0 }, style]}
      accessible={!!title}
      accessibilityRole={title ? 'image' : undefined}
      accessibilityLabel={title}
      importantForAccessibility={title ? 'yes' : 'no-hide-descendants'}
    >
      {pixels.map((p, i) => (
        <View
          key={i}
          style={{
            position: 'absolute',
            left: p.x * cell,
            top: p.y * cell,
            width: cell,
            height: cell,
            backgroundColor: color,
          }}
        />
      ))}
    </View>
  );
}

PixelIcon.names = Object.keys(ICONS) as PixelIconName[];
