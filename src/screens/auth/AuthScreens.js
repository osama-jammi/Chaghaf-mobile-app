// ─── Chaghaf · Auth Screens v2 ───────────────────────────────────
import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Animated, Dimensions, KeyboardAvoidingView, Platform, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, RADIUS, TYPOGRAPHY, SHADOW } from '../../constants/colors';
import { Button, Input, ErrorBanner, Icon } from '../../components';
import { useAuth } from '../../context/AuthContext';

const { width, height } = Dimensions.get('window');

// ══════════════════════════════════════════════════════════════════
// Splash
// ══════════════════════════════════════════════════════════════════
export function SplashScreen({ navigation }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale   = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(scale,   { toValue: 1, friction: 8, tension: 40, useNativeDriver: true }),
    ]).start();
    const t = setTimeout(() => navigation.replace('Onboarding'), 2200);
    return () => clearTimeout(t);
  }, []);

  return (
    <View style={sp.bg}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <Animated.View style={[sp.content, { opacity, transform: [{ scale }] }]}>
        <View style={sp.logoMark}>
          <View style={sp.logoInner}>
            <View style={sp.logoBar1} />
            <View style={sp.logoBar2} />
            <View style={sp.logoBar3} />
          </View>
        </View>
        <Text style={sp.wordmark}>CHAGHAF</Text>
        <Text style={sp.tagline}>coworking · community</Text>
      </Animated.View>
      <Text style={sp.location}>Agadir, Maroc</Text>
    </View>
  );
}

const sp = StyleSheet.create({
  bg:       { flex: 1, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  content:  { alignItems: 'center', gap: 14 },
  logoMark: {
    width: 80, height: 80, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)',
  },
  logoInner: { gap: 6, alignItems: 'flex-start' },
  logoBar1:  { width: 32, height: 3, backgroundColor: '#fff', borderRadius: 2 },
  logoBar2:  { width: 24, height: 3, backgroundColor: 'rgba(255,255,255,0.55)', borderRadius: 2 },
  logoBar3:  { width: 18, height: 3, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 2 },
  wordmark: {
    fontSize: 28, fontWeight: '800', color: '#fff',
    letterSpacing: 6, marginTop: 4,
  },
  tagline:  { fontSize: 12, color: 'rgba(255,255,255,0.55)', letterSpacing: 1.5 },
  location: {
    position: 'absolute', bottom: 40,
    fontSize: 11, color: 'rgba(255,255,255,0.35)', letterSpacing: 1,
  },
});

// ══════════════════════════════════════════════════════════════════
// Onboarding
// ══════════════════════════════════════════════════════════════════
const SLIDES = [
  {
    icon:     'business-outline',
    title:    'Votre espace de travail digitalisé',
    subtitle: 'Accès, réservations et communauté — tout en une seule app.',
  },
  {
    icon:     'qr-code-outline',
    title:    'Entrée rapide par QR Code',
    subtitle: 'Présentez votre code à la réception en quelques secondes.',
  },
  {
    icon:     'calendar-outline',
    title:    'Réservez vos salles en 3 clics',
    subtitle: 'Réunion, studio photo, podcast — disponible 7j/7.',
  },
];

export function OnboardingScreen({ navigation }) {
  const [idx, setIdx] = useState(0);
  const fade = useRef(new Animated.Value(1)).current;
  const slide = SLIDES[idx];

  const goNext = () => {
    if (idx < SLIDES.length - 1) {
      Animated.timing(fade, { toValue: 0, duration: 180, useNativeDriver: true }).start(() => {
        setIdx(idx + 1);
        Animated.timing(fade, { toValue: 1, duration: 250, useNativeDriver: true }).start();
      });
    } else {
      navigation.replace('Login');
    }
  };

  return (
    <View style={ob.bg}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <TouchableOpacity style={ob.skip} onPress={() => navigation.replace('Login')}>
        <Text style={ob.skipText}>Passer</Text>
      </TouchableOpacity>

      <Animated.View style={[ob.content, { opacity: fade }]}>
        <View style={ob.iconWrap}>
          <Ionicons name={slide.icon} size={52} color="rgba(255,255,255,0.9)" />
        </View>
        <Text style={ob.title}>{slide.title}</Text>
        <Text style={ob.subtitle}>{slide.subtitle}</Text>
      </Animated.View>

      <View style={ob.footer}>
        <View style={ob.dots}>
          {SLIDES.map((_, i) => (
            <TouchableOpacity key={i} onPress={() => setIdx(i)}>
              <View style={[ob.dot, i === idx && ob.dotActive]} />
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity style={ob.nextBtn} onPress={goNext} activeOpacity={0.85}>
          <Text style={ob.nextText}>
            {idx === SLIDES.length - 1 ? 'Commencer' : 'Suivant'}
          </Text>
          <Ionicons name="arrow-forward" size={16} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const ob = StyleSheet.create({
  bg:       { flex: 1, backgroundColor: COLORS.primary, paddingHorizontal: 28 },
  skip:     { alignSelf: 'flex-end', marginTop: 60, paddingVertical: 4 },
  skipText: { fontSize: 14, color: 'rgba(255,255,255,0.5)', fontWeight: '500' },
  content:  { flex: 1, justifyContent: 'center', alignItems: 'flex-start', paddingBottom: 40 },
  iconWrap: {
    width: 100, height: 100, borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 36,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
  },
  title:    { fontSize: 28, fontWeight: '700', color: '#fff', letterSpacing: -0.5, lineHeight: 36, marginBottom: 14 },
  subtitle: { fontSize: 16, color: 'rgba(255,255,255,0.65)', lineHeight: 24, maxWidth: '90%' },
  footer:   { paddingBottom: 48, gap: 28 },
  dots:     { flexDirection: 'row', gap: 6 },
  dot:      { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.25)' },
  dotActive:{ width: 22, backgroundColor: '#fff' },
  nextBtn:  {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: '#fff', borderRadius: RADIUS.md,
    paddingVertical: 16, paddingHorizontal: 28, alignSelf: 'stretch',
  },
  nextText: { fontSize: 15, fontWeight: '700', color: COLORS.primary },
});

// ══════════════════════════════════════════════════════════════════
// Login
// ══════════════════════════════════════════════════════════════════
export function LoginScreen({ navigation }) {
  const { login, loading, error, clearError } = useAuth();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPwd,  setShowPwd]  = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) return;
    try {
      await login(email.trim().toLowerCase(), password);
    } catch {}
  };

  return (
    <SafeAreaView style={auth.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={auth.scroll} keyboardShouldPersistTaps="handled">

          {/* Brand */}
          <View style={auth.brand}>
            <View style={auth.brandMark}>
              <View style={[auth.bar, { width: 20 }]} />
              <View style={[auth.bar, { width: 15, opacity: 0.5 }]} />
              <View style={[auth.bar, { width: 10, opacity: 0.3 }]} />
            </View>
            <Text style={auth.brandName}>CHAGHAF</Text>
          </View>

          <View style={auth.heading}>
            <Text style={auth.headingTitle}>Bon retour</Text>
            <Text style={auth.headingSub}>Connectez-vous à votre espace</Text>
          </View>

          {error && <ErrorBanner message={error} onDismiss={clearError} />}

          <View style={auth.form}>
            <Input
              label="Adresse email"
              icon="mail-outline"
              placeholder="ahmed@chaghaf.ma"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
            <Input
              label="Mot de passe"
              icon="lock-closed-outline"
              placeholder="Votre mot de passe"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPwd}
              rightElement={
                <TouchableOpacity
                  style={{ paddingHorizontal: 14 }}
                  onPress={() => setShowPwd(v => !v)}
                >
                  <Icon
                    name={showPwd ? 'eye-off-outline' : 'eye-outline'}
                    size={17}
                    color={COLORS.textDisabled}
                  />
                </TouchableOpacity>
              }
            />
            <TouchableOpacity style={{ alignSelf: 'flex-end', paddingVertical: 2 }}>
              <Text style={auth.forgot}>Mot de passe oublié</Text>
            </TouchableOpacity>
          </View>

          <Button
            title="Se connecter"
            onPress={handleLogin}
            loading={loading}
            disabled={!email.trim() || !password}
            size="lg"
          />

          <View style={auth.switchRow}>
            <Text style={auth.switchText}>Pas encore de compte ?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={auth.switchLink}>S'inscrire</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ══════════════════════════════════════════════════════════════════
// Register
// ══════════════════════════════════════════════════════════════════
export function RegisterScreen({ navigation }) {
  const { register, loading, error, clearError } = useAuth();
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '' });
  const [errors, setErrors] = useState({});

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = 'Ce champ est requis';
    if (!form.email.trim())    e.email    = 'Ce champ est requis';
    if (!form.password || form.password.length < 6) e.password = 'Minimum 6 caractères';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    try {
      await register({
        fullName: form.fullName.trim(),
        email:    form.email.trim().toLowerCase(),
        phone:    form.phone.trim() || undefined,
        password: form.password,
      });
    } catch {}
  };

  return (
    <SafeAreaView style={auth.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={auth.scroll} keyboardShouldPersistTaps="handled">

          <TouchableOpacity style={auth.back} onPress={() => navigation.goBack()}>
            <Icon name="chevron-back" size={18} color={COLORS.textSecondary} />
            <Text style={auth.backText}>Retour</Text>
          </TouchableOpacity>

          <View style={auth.heading}>
            <Text style={auth.headingTitle}>Créer un compte</Text>
            <Text style={auth.headingSub}>Rejoignez la communauté Chaghaf</Text>
          </View>

          {error && <ErrorBanner message={error} onDismiss={clearError} />}

          <View style={auth.form}>
            <Input
              label="Nom complet"
              icon="person-outline"
              placeholder="Ahmed Benali"
              value={form.fullName}
              onChangeText={v => set('fullName', v)}
              autoCapitalize="words"
              error={errors.fullName}
            />
            <Input
              label="Adresse email"
              icon="mail-outline"
              placeholder="ahmed@chaghaf.ma"
              value={form.email}
              onChangeText={v => set('email', v)}
              keyboardType="email-address"
              error={errors.email}
            />
            <Input
              label="Téléphone (optionnel)"
              icon="call-outline"
              placeholder="+212 6 00 00 00"
              value={form.phone}
              onChangeText={v => set('phone', v)}
              keyboardType="phone-pad"
            />
            <Input
              label="Mot de passe"
              icon="lock-closed-outline"
              placeholder="Minimum 6 caractères"
              value={form.password}
              onChangeText={v => set('password', v)}
              secureTextEntry
              error={errors.password}
            />
          </View>

          <Button
            title="Créer mon compte"
            onPress={handleRegister}
            loading={loading}
            size="lg"
          />

          <View style={auth.switchRow}>
            <Text style={auth.switchText}>Déjà un compte ?</Text>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={auth.switchLink}>Se connecter</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const auth = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: COLORS.surface },
  scroll:       { flexGrow: 1, paddingHorizontal: 24, paddingTop: 20, paddingBottom: 40, gap: 24 },
  brand:        { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandMark:    {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: COLORS.primarySoft, gap: 5,
    alignItems: 'center', justifyContent: 'center',
  },
  bar:          { height: 2.5, backgroundColor: COLORS.primary, borderRadius: 2 },
  brandName:    { fontSize: 16, fontWeight: '800', color: COLORS.primary, letterSpacing: 3 },
  heading:      { gap: 6 },
  headingTitle: { ...TYPOGRAPHY.h1, color: COLORS.textPrimary },
  headingSub:   { ...TYPOGRAPHY.body, color: COLORS.textSecondary },
  form:         { gap: 14 },
  forgot:       { ...TYPOGRAPHY.sm, color: COLORS.primary, fontWeight: '500' },
  switchRow:    { flexDirection: 'row', justifyContent: 'center', gap: 6 },
  switchText:   { ...TYPOGRAPHY.sm, color: COLORS.textSecondary },
  switchLink:   { ...TYPOGRAPHY.sm, color: COLORS.primary, fontWeight: '600' },
  back:         { flexDirection: 'row', alignItems: 'center', gap: 6 },
  backText:     { ...TYPOGRAPHY.sm, color: COLORS.textSecondary },
});
