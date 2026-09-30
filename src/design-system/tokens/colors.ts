// Mirrors handoff/src/tokens/colors.css exactly. Source of truth for every color in the app.

export const palette = {
  bg0: '#0B0A07',
  bg1: '#13120D',
  bg2: '#1C1A13',
  line: '#2F2B1F',
  lineStrong: '#4D4631',
  blackTrue: '#000000',

  goldHi: '#FFD35C',
  gold: '#F4B41A',
  goldLo: '#9C7412',
  goldTint: '#2A200A',

  ink: '#EDE6D0',
  inkDim: '#A39A80',
  inkFaint: '#6E6752',

  red: '#FF6A4D',
  green: '#9ED36A',
} as const;

export const colors = {
  ...palette,

  // surfaces
  surfaceApp: palette.bg0,
  surfacePanel: palette.bg1,
  surfaceRaised: palette.bg2,
  surfaceHover: palette.bg2,
  surfaceSelected: palette.goldTint,
  surfaceViewer: palette.blackTrue,

  // borders
  borderDefault: palette.line,
  borderInput: palette.lineStrong,
  borderFocus: palette.gold,
  borderError: palette.red,

  // text
  textBody: palette.ink,
  textMeta: palette.inkDim,
  textDisabled: palette.inkFaint,
  textAccent: palette.gold,
  textAccentHover: palette.goldHi,
  textOnAccent: palette.bg0,
  textCode: palette.goldHi,

  // actions
  actionBg: palette.gold,
  actionBgHover: palette.goldHi,
  actionBgPressed: palette.goldLo,
  actionFg: palette.bg0,

  // status
  statusRec: palette.red,
  statusError: palette.red,
  statusOk: palette.green,

  // audio
  waveUnplayed: palette.inkFaint,
  wavePlayed: palette.gold,
  meterListening: palette.ink,
  meterSpeaking: palette.gold,
} as const;

export type Colors = typeof colors;
