// ─── Chaghaf · Design System v2 ─────────────────────────────────
// Clean, minimal, professional

export const COLORS = {
  // Brand
  primary:      '#C0392B',
  primaryDark:  '#922B21',
  primaryLight: '#E74C3C',
  primarySoft:  '#FDEDEC',

  // Neutrals
  black:        '#0A0A0A',
  gray950:      '#111111',
  gray900:      '#1C1C1C',
  gray800:      '#2C2C2C',
  gray700:      '#3D3D3D',
  gray600:      '#5A5A5A',
  gray500:      '#737373',
  gray400:      '#9A9A9A',
  gray300:      '#BDBDBD',
  gray200:      '#D6D6D6',
  gray100:      '#EBEBEB',
  gray50:       '#F5F5F4',
  white:        '#FFFFFF',

  // Backgrounds
  bg:           '#F4F3F1',      // Warm off-white background
  bgAlt:        '#EFEEEC',
  surface:      '#FFFFFF',
  surfaceAlt:   '#FAFAF9',

  // Text
  textPrimary:  '#111111',
  textSecondary:'#5A5A5A',
  textTertiary: '#9A9A9A',
  textInverse:  '#FFFFFF',
  textDisabled: '#BDBDBD',

  // Border
  border:       '#E5E4E0',
  borderStrong: '#C9C8C4',

  // Semantic
  success:      '#16A34A',
  successBg:    '#F0FDF4',
  successText:  '#15803D',

  warning:      '#B45309',
  warningBg:    '#FFFBEB',
  warningText:  '#92400E',

  danger:       '#DC2626',
  dangerBg:     '#FEF2F2',
  dangerText:   '#B91C1C',

  info:         '#1D4ED8',
  infoBg:       '#EFF6FF',
  infoText:     '#1E40AF',

  // Overlay
  overlay:      'rgba(17,17,17,0.05)',
  overlayMd:    'rgba(17,17,17,0.10)',
  overlayDark:  'rgba(17,17,17,0.60)',

  // Aliases (compat)
  cream:        '#F4F3F1',
  creamLight:   '#F5F5F4',
  creamDark:    '#E5E4E0',
  textDark:     '#111111',
  textMedium:   '#5A5A5A',
  textLight:    '#9A9A9A',
  divider:      '#E5E4E0',
};

export const RADIUS = {
  xs:   4,
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  xxl:  28,
  full: 9999,
};

export const TYPOGRAPHY = {
  // Display
  display: { fontSize: 32, fontWeight: '700', letterSpacing: -0.8, lineHeight: 38 },
  // Headings
  h1:   { fontSize: 26, fontWeight: '700', letterSpacing: -0.5, lineHeight: 32 },
  h2:   { fontSize: 22, fontWeight: '700', letterSpacing: -0.4, lineHeight: 28 },
  h3:   { fontSize: 18, fontWeight: '600', letterSpacing: -0.2, lineHeight: 24 },
  h4:   { fontSize: 16, fontWeight: '600', letterSpacing: -0.1, lineHeight: 22 },
  // Body
  body:  { fontSize: 15, fontWeight: '400', lineHeight: 22 },
  bodyM: { fontSize: 15, fontWeight: '500', lineHeight: 22 },
  sm:    { fontSize: 13, fontWeight: '400', lineHeight: 18 },
  smM:   { fontSize: 13, fontWeight: '500', lineHeight: 18 },
  xs:    { fontSize: 11, fontWeight: '500', lineHeight: 14 },
  // Label
  label:  { fontSize: 11, fontWeight: '600', letterSpacing: 0.6, textTransform: 'uppercase', lineHeight: 14 },
  // Mono
  mono:   { fontSize: 13, fontFamily: 'monospace', lineHeight: 18 },
};

export const SPACING = {
  '2':  2,
  '4':  4,
  '6':  6,
  '8':  8,
  '12': 12,
  '16': 16,
  '20': 20,
  '24': 24,
  '32': 32,
  '40': 40,
  '48': 48,
};

export const SHADOW = {
  xs: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
};

// Legacy alias
export const ELEVATION = {
  card:  SHADOW.sm,
  modal: SHADOW.lg,
};
