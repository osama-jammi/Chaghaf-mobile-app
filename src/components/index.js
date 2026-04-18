// ─── Chaghaf · Component Library v2 ─────────────────────────────
import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ActivityIndicator, TextInput, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, TYPOGRAPHY, SPACING, SHADOW } from '../constants/colors';

// ── Icon ──────────────────────────────────────────────────────────
export const Icon = ({ name, size = 20, color = COLORS.textSecondary, style }) => (
  <Ionicons name={name} size={size} color={color} style={style} />
);

// ── Button ────────────────────────────────────────────────────────
export const Button = ({
  title, onPress, loading, disabled, variant = 'primary',
  icon, size = 'md', style, fullWidth = true,
}) => {
  const isPrimary  = variant === 'primary';
  const isGhost    = variant === 'ghost';
  const isOutlined = variant === 'outlined';
  const isDanger   = variant === 'danger';
  const isSecondary = variant === 'secondary';

  const getContainerStyle = () => {
    if (isPrimary)   return btn.primary;
    if (isGhost)     return btn.ghost;
    if (isOutlined)  return btn.outlined;
    if (isDanger)    return btn.danger;
    if (isSecondary) return btn.secondary;
    return btn.primary;
  };

  const getLabelStyle = () => {
    if (isGhost || isOutlined) return [btn.label, { color: COLORS.primary }];
    if (isSecondary) return [btn.label, { color: COLORS.textPrimary }];
    return [btn.label, { color: COLORS.white }];
  };

  const iconColor = (isGhost || isOutlined) ? COLORS.primary
    : isSecondary ? COLORS.textPrimary
    : COLORS.white;

  return (
    <TouchableOpacity
      style={[
        btn.base,
        size === 'sm' && btn.sm,
        size === 'lg' && btn.lg,
        fullWidth && { alignSelf: 'stretch' },
        getContainerStyle(),
        (disabled || loading) && btn.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.75}
    >
      {loading ? (
        <ActivityIndicator
          color={isGhost || isOutlined || isSecondary ? COLORS.primary : COLORS.white}
          size="small"
        />
      ) : (
        <View style={btn.inner}>
          {icon && (
            <Icon name={icon} size={size === 'sm' ? 15 : 17} color={iconColor} />
          )}
          <Text style={[...getLabelStyle(), size === 'sm' && btn.labelSm]}>
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const btn = StyleSheet.create({
  base: {
    borderRadius: RADIUS.md,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sm:  { paddingVertical: 9, paddingHorizontal: 14 },
  lg:  { paddingVertical: 17, paddingHorizontal: 24, borderRadius: RADIUS.lg },
  primary:   { backgroundColor: COLORS.primary },
  ghost:     { backgroundColor: 'transparent' },
  secondary: { backgroundColor: COLORS.gray100 },
  outlined: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  danger:  { backgroundColor: COLORS.danger },
  disabled: { opacity: 0.45 },
  inner:   { flexDirection: 'row', alignItems: 'center', gap: 8 },
  label:   { ...TYPOGRAPHY.bodyM, fontWeight: '600' },
  labelSm: { fontSize: 13 },
});

// ── Card ──────────────────────────────────────────────────────────
export const Card = ({ children, style, padding = 16, onPress }) => {
  const containerStyle = [c.base, { padding }, style];
  if (onPress) {
    return (
      <TouchableOpacity style={containerStyle} onPress={onPress} activeOpacity={0.8}>
        {children}
      </TouchableOpacity>
    );
  }
  return <View style={containerStyle}>{children}</View>;
};

const c = StyleSheet.create({
  base: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
});

// ── Row ───────────────────────────────────────────────────────────
export const Row = ({ children, style, gap = 12, center, between }) => (
  <View style={[
    { flexDirection: 'row', gap },
    center && { alignItems: 'center' },
    between && { justifyContent: 'space-between' },
    style,
  ]}>
    {children}
  </View>
);

// ── Input ─────────────────────────────────────────────────────────
export const Input = ({
  label, placeholder, value, onChangeText,
  secureTextEntry, keyboardType, icon,
  error, autoCapitalize = 'none', multiline,
  style, inputRef, rightElement,
}) => (
  <View style={inp.wrap}>
    {label && <Text style={inp.label}>{label}</Text>}
    <View style={[inp.container, error && inp.containerError, multiline && inp.containerMulti]}>
      {icon && <Icon name={icon} size={17} color={COLORS.textTertiary} style={inp.icon} />}
      <TextInput
        ref={inputRef}
        style={[inp.field, icon && inp.fieldWithIcon, multiline && inp.multiline, style]}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textDisabled}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        multiline={multiline}
      />
      {rightElement}
    </View>
    {error && <Text style={inp.error}>{error}</Text>}
  </View>
);

const inp = StyleSheet.create({
  wrap:       { gap: 6 },
  label:      { ...TYPOGRAPHY.smM, color: COLORS.textSecondary, fontWeight: '500' },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    minHeight: 50,
  },
  containerError: { borderColor: COLORS.danger },
  containerMulti: { alignItems: 'flex-start' },
  icon:       { marginLeft: 14 },
  field: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 13,
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
  },
  fieldWithIcon: { paddingLeft: 10 },
  multiline:  { minHeight: 88, textAlignVertical: 'top', paddingTop: 14 },
  error:      { ...TYPOGRAPHY.xs, color: COLORS.danger },
});

// ── Badge ─────────────────────────────────────────────────────────
export const Badge = ({ label, variant = 'default', dot, style }) => {
  const map = {
    default: { bg: COLORS.gray100,    text: COLORS.textSecondary },
    primary: { bg: COLORS.primarySoft, text: COLORS.primary       },
    success: { bg: COLORS.successBg,   text: COLORS.successText    },
    warning: { bg: COLORS.warningBg,   text: COLORS.warningText    },
    danger:  { bg: COLORS.dangerBg,    text: COLORS.dangerText     },
    info:    { bg: COLORS.infoBg,      text: COLORS.infoText       },
    dark:    { bg: COLORS.gray900,     text: COLORS.white          },
  };
  const scheme = map[variant] ?? map.default;

  return (
    <View style={[bdg.base, { backgroundColor: scheme.bg }, style]}>
      {dot && <View style={[bdg.dot, { backgroundColor: scheme.text }]} />}
      <Text style={[bdg.text, { color: scheme.text }]}>{label}</Text>
    </View>
  );
};

const bdg = StyleSheet.create({
  base: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    alignSelf: 'flex-start',
    paddingHorizontal: 9, paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  dot:  { width: 6, height: 6, borderRadius: 3 },
  text: { ...TYPOGRAPHY.xs, fontWeight: '600' },
});

// ── Avatar ────────────────────────────────────────────────────────
export const Avatar = ({ letter, size = 40, color = COLORS.primary, style }) => (
  <View style={[
    av.base,
    { width: size, height: size, borderRadius: size / 2, backgroundColor: color },
    style,
  ]}>
    <Text style={{ fontSize: size * 0.38, color: COLORS.white, fontWeight: '700' }}>
      {(letter ?? '?').charAt(0).toUpperCase()}
    </Text>
  </View>
);

const av = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center' },
});

// ── Divider ───────────────────────────────────────────────────────
export const Divider = ({ style, inset = 0 }) => (
  <View style={[
    { height: 1, backgroundColor: COLORS.border, marginLeft: inset },
    style,
  ]} />
);

// ── Section header ────────────────────────────────────────────────
export const SectionHeader = ({ title, action, onAction, style }) => (
  <View style={[sh.row, style]}>
    <Text style={sh.title}>{title}</Text>
    {action && (
      <TouchableOpacity onPress={onAction}>
        <Text style={sh.action}>{action}</Text>
      </TouchableOpacity>
    )}
  </View>
);

const sh = StyleSheet.create({
  row:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title:  { ...TYPOGRAPHY.label, color: COLORS.textTertiary },
  action: { ...TYPOGRAPHY.smM, color: COLORS.primary },
});

// ── Empty state ───────────────────────────────────────────────────
export const EmptyState = ({ icon, title, subtitle, action, onAction }) => (
  <View style={es.wrap}>
    <View style={es.iconBox}>
      <Icon name={icon ?? 'file-tray-outline'} size={28} color={COLORS.textDisabled} />
    </View>
    <Text style={es.title}>{title}</Text>
    {subtitle && <Text style={es.subtitle}>{subtitle}</Text>}
    {action && (
      <Button
        title={action} onPress={onAction}
        variant="outlined" size="sm"
        style={{ marginTop: 16 }}
      />
    )}
  </View>
);

const es = StyleSheet.create({
  wrap:    { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 32 },
  iconBox: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: COLORS.gray50, alignItems: 'center', justifyContent: 'center', marginBottom: 14,
  },
  title:    { ...TYPOGRAPHY.h4, color: COLORS.textPrimary, marginBottom: 6, textAlign: 'center' },
  subtitle: { ...TYPOGRAPHY.sm, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 20 },
});

// ── Screen header / Navbar ────────────────────────────────────────
export const Header = ({ title, onBack, right, subtitle, transparent }) => (
  <View style={[hdr.wrap, transparent && hdr.transparent]}>
    {onBack ? (
      <TouchableOpacity style={hdr.backBtn} onPress={onBack}>
        <Icon name="chevron-back" size={20} color={COLORS.textPrimary} />
      </TouchableOpacity>
    ) : <View style={{ width: 40 }} />}

    <View style={hdr.center}>
      <Text style={hdr.title} numberOfLines={1}>{title}</Text>
      {subtitle && <Text style={hdr.subtitle} numberOfLines={1}>{subtitle}</Text>}
    </View>

    {right ?? <View style={{ width: 40 }} />}
  </View>
);

const hdr = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  transparent: { backgroundColor: 'transparent', borderBottomWidth: 0 },
  backBtn: {
    width: 38, height: 38, borderRadius: RADIUS.md,
    backgroundColor: COLORS.gray100,
    alignItems: 'center', justifyContent: 'center',
  },
  center:   { flex: 1, alignItems: 'center', paddingHorizontal: 8 },
  title:    { ...TYPOGRAPHY.h4, color: COLORS.textPrimary },
  subtitle: { ...TYPOGRAPHY.xs, color: COLORS.textTertiary, marginTop: 1 },
});

// ── Loading screen ────────────────────────────────────────────────
export const LoadingScreen = ({ message }) => (
  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.bg }}>
    <ActivityIndicator size="large" color={COLORS.primary} />
    {message && <Text style={{ ...TYPOGRAPHY.sm, color: COLORS.textSecondary, marginTop: 12 }}>{message}</Text>}
  </View>
);

// ── Error banner ──────────────────────────────────────────────────
export const ErrorBanner = ({ message, onDismiss }) => {
  if (!message) return null;
  return (
    <View style={er.wrap}>
      <Icon name="alert-circle-outline" size={16} color={COLORS.dangerText} />
      <Text style={er.text}>{message}</Text>
      {onDismiss && (
        <TouchableOpacity onPress={onDismiss} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Icon name="close" size={15} color={COLORS.dangerText} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const er = StyleSheet.create({
  wrap: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: COLORS.dangerBg, borderRadius: RADIUS.md,
    padding: 12, borderLeftWidth: 3, borderLeftColor: COLORS.danger,
  },
  text: { flex: 1, ...TYPOGRAPHY.sm, color: COLORS.dangerText },
});

// ── Stat card ─────────────────────────────────────────────────────
export const StatCard = ({ label, value, icon, color = COLORS.primary, style }) => (
  <View style={[stc.base, style]}>
    <View style={[stc.iconBox, { backgroundColor: `${color}12` }]}>
      <Icon name={icon} size={16} color={color} />
    </View>
    <Text style={stc.value}>{value}</Text>
    <Text style={stc.label}>{label}</Text>
  </View>
);

const stc = StyleSheet.create({
  base:    { flex: 1, alignItems: 'center', gap: 5, paddingVertical: 4 },
  iconBox: { width: 36, height: 36, borderRadius: RADIUS.sm, alignItems: 'center', justifyContent: 'center' },
  value:   { ...TYPOGRAPHY.h3, color: COLORS.textPrimary },
  label:   { ...TYPOGRAPHY.xs, color: COLORS.textTertiary, textAlign: 'center' },
});

// ── List item ─────────────────────────────────────────────────────
export const ListItem = ({
  icon, iconBg, title, subtitle, right,
  onPress, destructive, showChevron = true,
}) => (
  <TouchableOpacity
    style={li.base}
    onPress={onPress}
    activeOpacity={onPress ? 0.7 : 1}
    disabled={!onPress}
  >
    {icon && (
      <View style={[li.iconBox, iconBg ? { backgroundColor: iconBg } : li.iconBoxDefault]}>
        <Icon
          name={icon}
          size={17}
          color={destructive ? COLORS.danger : iconBg ? COLORS.white : COLORS.textSecondary}
        />
      </View>
    )}
    <View style={li.content}>
      <Text style={[li.title, destructive && { color: COLORS.danger }]}>{title}</Text>
      {subtitle && <Text style={li.subtitle}>{subtitle}</Text>}
    </View>
    {right !== undefined
      ? right
      : (onPress && showChevron) && (
          <Icon name="chevron-forward" size={15} color={COLORS.textDisabled} />
        )
    }
  </TouchableOpacity>
);

const li = StyleSheet.create({
  base:        { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  iconBox:     { width: 34, height: 34, borderRadius: RADIUS.sm, alignItems: 'center', justifyContent: 'center' },
  iconBoxDefault: { backgroundColor: COLORS.gray50 },
  content:     { flex: 1 },
  title:       { ...TYPOGRAPHY.bodyM, color: COLORS.textPrimary },
  subtitle:    { ...TYPOGRAPHY.sm, color: COLORS.textSecondary, marginTop: 1 },
});

// ── Progress bar ──────────────────────────────────────────────────
export const ProgressBar = ({ value = 0, max = 100, color = COLORS.primary, height = 4, style }) => (
  <View style={[pb.track, { height }, style]}>
    <View style={[
      pb.fill,
      { height, backgroundColor: color, width: `${Math.min(100, Math.max(0, (value / max) * 100))}%` },
    ]} />
  </View>
);

const pb = StyleSheet.create({
  track: { backgroundColor: COLORS.gray100, borderRadius: RADIUS.full, overflow: 'hidden' },
  fill:  { borderRadius: RADIUS.full },
});

// ── Aliases ───────────────────────────────────────────────────────
export const PrimaryButton   = (props) => <Button {...props} variant="primary" />;
export const SecondaryButton = (props) => <Button {...props} variant="secondary" />;
export const ScreenHeader    = Header;
