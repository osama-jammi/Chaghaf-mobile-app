// ─── Chaghaf · Home Screens v2 ───────────────────────────────────
import React, { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, RADIUS, TYPOGRAPHY, SHADOW } from '../../constants/colors';
import { Card, Row, Badge, Avatar, StatCard, Button, EmptyState, LoadingScreen, Icon, ProgressBar, Header } from '../../components';
import { useAuth } from '../../context/AuthContext';
import { useFetch ,useMutation  } from '../../hooks/useApi';
import { SubscriptionApi, NotificationApi, AccessApi } from '../../services/api';

const formatPack = (p) => {
  const map = { BASIC: 'Basique', PREMIUM: 'Premium', VIP: 'VIP', STUDENT: 'Étudiant' };
  return map[p] || p || '—';
};
const formatDuration = (d) => {
  const map = { WEEK: 'Hebdomadaire', WEEKLY: 'Hebdomadaire',
                MONTH: 'Mensuel', MONTHLY: 'Mensuel',
                QUARTER: 'Trimestriel', QUARTERLY: 'Trimestriel',
                YEAR: 'Annuel', YEARLY: 'Annuel', ANNUAL: 'Annuel' };
  return map[d] || d || '';
};
const maxDaysFor = (d) => {
  const map = { WEEK: 7, WEEKLY: 7, MONTH: 30, MONTHLY: 30,
                QUARTER: 90, QUARTERLY: 90, YEAR: 365, YEARLY: 365, ANNUAL: 365 };
  return map[d] || 30;
};

// ══════════════════════════════════════════════════════════════════
// Dashboard
// ══════════════════════════════════════════════════════════════════
export function HomeScreen({ navigation }) {
  const { user } = useAuth();

  const { data: sub, loading: subLoading, refresh: refreshSub } = useFetch(
    SubscriptionApi.getActive, [], { initialData: null },
  );
  const { data: notifData } = useFetch(NotificationApi.getUnreadCount, []);
  const unreadCount = notifData?.count ?? 0;
  const { data: occupancy } = useFetch(AccessApi.getOccupancy, []);

  const firstName = user?.fullName?.split(' ')[0] ?? 'Membre';

  const quickActions = [
    { id: 'reserve',  icon: 'calendar-outline',     label: 'Réserver',  screen: 'Reservation', color: COLORS.info    },
    { id: 'boissons', icon: 'cafe-outline',           label: 'Boissons',  screen: 'Boissons',    color: '#7C3AED'     },
    { id: 'snacks',   icon: 'restaurant-outline',     label: 'Snacks',    screen: 'Snacks',      color: COLORS.success },
    { id: 'social',   icon: 'chatbubble-ellipses-outline', label: 'Social', screen: 'Social',   color: '#D97706'     },
  ];

  return (
    <SafeAreaView style={h.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />

      {/* Header */}
      <View style={h.topbar}>
        <View style={h.userInfo}>
          <Avatar letter={user?.avatarLetter} size={38} />
          <View>
            <Text style={h.greeting}>Bonjour, {firstName}</Text>
            <Text style={h.greetingSub} numberOfLines={1}>{user?.email}</Text>
          </View>
        </View>
        <View style={h.topActions}>
          <TouchableOpacity style={h.iconBtn} onPress={() => navigation.navigate('Notifications')}>
            <Icon name="notifications-outline" size={20} color={COLORS.textPrimary} />
            {unreadCount > 0 && (
              <View style={h.notifBadge}>
                <Text style={h.notifBadgeText}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={h.iconBtn} onPress={() => navigation.navigate('Profile')}>
            <Icon name="person-outline" size={20} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={h.scroll}
        refreshControl={
          <RefreshControl refreshing={subLoading} onRefresh={refreshSub} tintColor={COLORS.primary} />
        }
      >
        {/* Subscription Card */}
        {sub ? (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => navigation.navigate('Abonnement')}
          >
            <LinearGradient
              colors={[COLORS.primary, COLORS.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={h.subCard}
            >
              <View style={h.subCardTop}>
                <View>
                  <Text style={h.subLabel}>Abonnement actif</Text>
                  <Text style={h.subName}>
                    Pack {formatPack(sub.packType)} · {formatDuration(sub.duration)}
                  </Text>
                </View>
                <View style={h.subIconBox}>
                  <Icon name="card-outline" size={22} color="rgba(255,255,255,0.7)" />
                </View>
              </View>

              <ProgressBar
                value={sub.daysLeft ?? 0}
                max={maxDaysFor(sub.duration)}
                color="rgba(255,255,255,0.8)"
                height={3}
                style={{ backgroundColor: 'rgba(255,255,255,0.2)', marginVertical: 16 }}
              />

              <View style={h.subCardBottom}>
                <View>
                  <Text style={h.subMetaLabel}>Jours restants</Text>
                  <Text style={h.subMetaValue}>{sub.daysLeft}</Text>
                </View>
                <View>
                  <Text style={h.subMetaLabel}>Expire le</Text>
                  <Text style={h.subMetaValue}>
                    {new Date(sub.endDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                  </Text>
                </View>
                <TouchableOpacity
                  style={h.renewBtn}
                  onPress={() => navigation.navigate('Renouvellement')}
                >
                  <Text style={h.renewText}>Renouveler</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ) : !subLoading && (
          <Card>
            <EmptyState
              icon="card-outline"
              title="Aucun abonnement"
              subtitle="Souscrivez à un pack pour accéder à l'espace."
              action="Voir les packs"
              onAction={() => navigation.navigate('Abonnement')}
            />
          </Card>
        )}

        {/* QR Code CTA */}
        <TouchableOpacity
          style={h.qrCta}
          onPress={() => navigation.navigate('QRCode')}
          activeOpacity={0.8}
        >
          <View style={h.qrCtaLeft}>
            <View style={h.qrCtaIcon}>
              <Icon name="qr-code-outline" size={20} color={COLORS.primary} />
            </View>
            <View>
              <Text style={h.qrCtaTitle}>QR Code d'entrée</Text>
              <Text style={h.qrCtaSub}>Présenter à la réception</Text>
            </View>
          </View>
          <Icon name="chevron-forward" size={16} color={COLORS.textDisabled} />
        </TouchableOpacity>

        {/* Quick actions */}
        <View>
          <Text style={h.sectionLabel}>Actions rapides</Text>
          <View style={h.actionsGrid}>
            {quickActions.map((a) => (
              <TouchableOpacity
                key={a.id}
                style={h.actionItem}
                onPress={() => navigation.navigate(a.screen)}
                activeOpacity={0.75}
              >
                <View style={[h.actionIcon, { backgroundColor: `${a.color}12` }]}>
                  <Icon name={a.icon} size={22} color={a.color} />
                </View>
                <Text style={h.actionLabel}>{a.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Occupation */}
        <Card>
          <View style={h.occupRow}>
            <View style={[h.occupIcon, { backgroundColor: COLORS.infoBg }]}>
              <Icon name="people-outline" size={17} color={COLORS.info} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={h.occupTitle}>Occupation de l'espace</Text>
              <Text style={h.occupStatus}>
                {occupancy
                  ? `${occupancy.status} · ${occupancy.currentCount}/${occupancy.maxCapacity} personnes`
                  : 'Chargement...'}
              </Text>
            </View>
            <Text style={h.occupPct}>{occupancy?.percent ?? 0}%</Text>
          </View>
          <ProgressBar value={occupancy?.percent ?? 0} max={100} color={COLORS.info} height={5} style={{ marginTop: 12 }} />
        </Card>

        {/* Stats */}
        <View>
          <Text style={h.sectionLabel}>Votre activité</Text>
          <Card>
            <View style={h.statsRow}>
              <StatCard label="Sessions" value="127" icon="pulse-outline" color={COLORS.primary} />
              <View style={h.statDivider} />
              <StatCard label="Ce mois" value="42h" icon="time-outline" color={COLORS.info} />
              <View style={h.statDivider} />
              <StatCard label="Série" value="8j" icon="flame-outline" color="#EA580C" />
            </View>
          </Card>
        </View>

        {/* Day access */}
        <TouchableOpacity
          style={h.dayBanner}
          onPress={() => navigation.navigate('AccesJournee')}
          activeOpacity={0.8}
        >
          <Icon name="ticket-outline" size={17} color={COLORS.primary} />
          <Text style={h.dayBannerText}>Accès journée sans abonnement — dès 20 dh</Text>
          <Icon name="arrow-forward" size={15} color={COLORS.primary} />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const h = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: COLORS.bg },
  topbar:  {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  userInfo:   { flexDirection: 'row', alignItems: 'center', gap: 10 },
  greeting:   { ...TYPOGRAPHY.bodyM, color: COLORS.textPrimary, fontWeight: '600' },
  greetingSub:{ ...TYPOGRAPHY.xs, color: COLORS.textTertiary, marginTop: 1, maxWidth: 200 },
  topActions: { flexDirection: 'row', gap: 8 },
  iconBtn:    {
    width: 36, height: 36, borderRadius: RADIUS.md,
    backgroundColor: COLORS.gray50, alignItems: 'center', justifyContent: 'center',
  },
  notifBadge: {
    position: 'absolute', top: -3, right: -3,
    minWidth: 18, height: 18, paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: COLORS.surface,
  },
  notifBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  scroll:     { padding: 16, gap: 12, paddingBottom: 32 },
  sectionLabel: { ...TYPOGRAPHY.label, color: COLORS.textTertiary, marginBottom: 10, marginTop: 4 },

  // Sub card
  subCard:        { borderRadius: RADIUS.xl, padding: 20 },
  subCardTop:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  subLabel:       { fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: '500', marginBottom: 4 },
  subName:        { fontSize: 18, fontWeight: '700', color: '#fff' },
  subIconBox:     {
    width: 40, height: 40, borderRadius: RADIUS.md,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  subCardBottom:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  subMetaLabel:   { fontSize: 11, color: 'rgba(255,255,255,0.55)', marginBottom: 3 },
  subMetaValue:   { fontSize: 18, fontWeight: '700', color: '#fff' },
  renewBtn:       {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: RADIUS.sm, paddingHorizontal: 14, paddingVertical: 8,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  renewText:      { fontSize: 13, fontWeight: '600', color: '#fff' },

  // QR CTA
  qrCta:      {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: 14,
    borderWidth: 1, borderColor: COLORS.border,
  },
  qrCtaLeft:  { flexDirection: 'row', alignItems: 'center', gap: 12 },
  qrCtaIcon:  {
    width: 38, height: 38, borderRadius: RADIUS.md,
    backgroundColor: COLORS.primarySoft, alignItems: 'center', justifyContent: 'center',
  },
  qrCtaTitle: { ...TYPOGRAPHY.bodyM, color: COLORS.textPrimary, fontWeight: '600' },
  qrCtaSub:   { ...TYPOGRAPHY.xs, color: COLORS.textTertiary, marginTop: 1 },

  // Actions grid
  actionsGrid: { flexDirection: 'row', gap: 10 },
  actionItem:  {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: RADIUS.lg,
    padding: 14, alignItems: 'center', gap: 8,
    borderWidth: 1, borderColor: COLORS.border,
  },
  actionIcon:  { width: 44, height: 44, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center' },
  actionLabel: { ...TYPOGRAPHY.xs, color: COLORS.textPrimary, fontWeight: '600', textAlign: 'center' },

  // Occupation
  occupRow:   { flexDirection: 'row', alignItems: 'center', gap: 12 },
  occupIcon:  { width: 36, height: 36, borderRadius: RADIUS.sm, alignItems: 'center', justifyContent: 'center' },
  occupTitle: { ...TYPOGRAPHY.bodyM, color: COLORS.textPrimary, fontWeight: '600' },
  occupStatus:{ ...TYPOGRAPHY.xs, color: COLORS.textTertiary, marginTop: 1 },
  occupPct:   { ...TYPOGRAPHY.h4, color: COLORS.info },

  // Stats
  statsRow:    { flexDirection: 'row', paddingVertical: 4 },
  statDivider: { width: 1, backgroundColor: COLORS.border },

  // Day banner
  dayBanner:    {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: COLORS.primarySoft, borderRadius: RADIUS.md,
    paddingVertical: 12, paddingHorizontal: 14,
    borderWidth: 1, borderColor: `${COLORS.primary}25`,
  },
  dayBannerText: { flex: 1, ...TYPOGRAPHY.smM, color: COLORS.primary },
});

// ══════════════════════════════════════════════════════════════════
// QR Code Screen
// ══════════════════════════════════════════════════════════════════
export function QRCodeScreen({ navigation }) {
  const { user } = useAuth();
  const { data: sub } = useFetch(SubscriptionApi.getActive, [], { initialData: null });
  const { data: occupancy } = useFetch(AccessApi.getOccupancy, []);
  const QRCode = require('react-native-qrcode-svg').default;

  // Le QR contient: id + token signé (l'ERP scanne et envoie au backend pour valider)
  const qrPayload = JSON.stringify({
    type: 'CHAGHAF_USER',
    userId: user?.userId,
    email: user?.email,
    name: user?.fullName,
    issuedAt: Date.now(),
  });

  return (
    <SafeAreaView style={qr.safe} edges={['top']}>
      <Header title="QR Code d'entrée" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={qr.scroll}>

        {/* User info */}
        <Card>
          <Row center gap={12}>
            <Avatar letter={user?.avatarLetter} size={46} />
            <View style={{ flex: 1 }}>
              <Text style={qr.userName}>{user?.fullName}</Text>
              <Text style={qr.userRole}>
                {sub ? `Pack ${formatPack(sub.packType)}` : 'Sans abonnement'}
              </Text>
            </View>
            <Badge
              label={sub?.status === 'ACTIVE' ? 'Actif' : 'Inactif'}
              variant={sub?.status === 'ACTIVE' ? 'success' : 'danger'}
              dot
            />
          </Row>
        </Card>

        {/* QR Code */}
        <Card style={qr.qrCard} padding={28}>
          <View style={qr.qrFrame}>
            <View style={qr.qrCornerTL} /><View style={qr.qrCornerTR} />
            <View style={qr.qrCornerBL} /><View style={qr.qrCornerBR} />
            <View style={{ backgroundColor: '#fff', padding: 8, borderRadius: 8 }}>
              <QRCode
                value={qrPayload}
                size={180}
                backgroundColor="#fff"
                color={COLORS.textPrimary}
              />
            </View>
          </View>
          <View style={qr.qrMeta}>
            <Text style={qr.qrId}>ID · {user?.userId ?? 'CH-0001'}</Text>
            <View style={qr.metaDot} />
            <Text style={qr.qrDate}>
              {new Date().toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
            </Text>
          </View>
          <Text style={qr.qrNote}>Présentez ce code à la réception pour scanner</Text>
        </Card>

        {/* Occupation actuelle de l'espace (mis à jour au scan) */}
        <Card>
          <Row center gap={12}>
            <View style={qr.occIconBox}>
              <Icon name="people-outline" size={18} color={COLORS.info} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={qr.occTitle}>Place dans l'espace</Text>
              <Text style={qr.occSub}>
                {occupancy
                  ? `${occupancy.currentCount}/${occupancy.maxCapacity ?? 30} personnes — ${occupancy.percent ?? 0}%`
                  : '—/30 personnes'}
              </Text>
            </View>
            <Text style={qr.occBig}>
              {occupancy ? `${occupancy.currentCount}/${occupancy.maxCapacity ?? 30}` : '0/30'}
            </Text>
          </Row>
          <ProgressBar
            value={occupancy?.percent ?? 0}
            max={100}
            color={COLORS.info}
            height={4}
            style={{ marginTop: 10 }}
          />
        </Card>

        {/* Instructions */}
        <Card>
          <Text style={qr.howTitle}>Comment utiliser</Text>
          {[
            { icon: 'scan-outline',             text: 'Présentez ce code à la réception' },
            { icon: 'checkmark-circle-outline',  text: 'Le staff valide votre accès' },
            { icon: 'refresh-circle-outline',    text: 'Un nouveau code est généré automatiquement' },
          ].map((item, i) => (
            <Row key={i} center gap={12} style={[qr.howRow, i < 2 && { borderBottomWidth: 1, borderBottomColor: COLORS.border }]}>
              <View style={qr.howIcon}>
                <Icon name={item.icon} size={17} color={COLORS.primary} />
              </View>
              <Text style={qr.howText}>{item.text}</Text>
            </Row>
          ))}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const qr = StyleSheet.create({
  safe:     { flex: 1, backgroundColor: COLORS.bg },
  scroll:   { padding: 16, gap: 12 },
  userName: { ...TYPOGRAPHY.h4, color: COLORS.textPrimary },
  userRole: { ...TYPOGRAPHY.sm, color: COLORS.textSecondary, marginTop: 2 },
  qrCard:   { alignItems: 'center', gap: 16 },
  qrFrame:  {
    width: 220, height: 220, alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.gray50, borderRadius: RADIUS.lg,
    position: 'relative',
  },
  qrCornerTL: { position: 'absolute', top: 12, left: 12, width: 20, height: 20, borderTopWidth: 3, borderLeftWidth: 3, borderColor: COLORS.primary, borderTopLeftRadius: 4 },
  qrCornerTR: { position: 'absolute', top: 12, right: 12, width: 20, height: 20, borderTopWidth: 3, borderRightWidth: 3, borderColor: COLORS.primary, borderTopRightRadius: 4 },
  qrCornerBL: { position: 'absolute', bottom: 12, left: 12, width: 20, height: 20, borderBottomWidth: 3, borderLeftWidth: 3, borderColor: COLORS.primary, borderBottomLeftRadius: 4 },
  qrCornerBR: { position: 'absolute', bottom: 12, right: 12, width: 20, height: 20, borderBottomWidth: 3, borderRightWidth: 3, borderColor: COLORS.primary, borderBottomRightRadius: 4 },
  qrMeta:   { flexDirection: 'row', alignItems: 'center', gap: 8 },
  metaDot:  { width: 3, height: 3, borderRadius: 1.5, backgroundColor: COLORS.textDisabled },
  qrId:     { ...TYPOGRAPHY.mono, color: COLORS.textSecondary },
  qrDate:   { ...TYPOGRAPHY.xs, color: COLORS.textSecondary },
  qrNote:   { ...TYPOGRAPHY.xs, color: COLORS.textDisabled },
  howTitle: { ...TYPOGRAPHY.h4, color: COLORS.textPrimary, marginBottom: 8 },
  howRow:   { paddingVertical: 12 },
  howIcon:  { width: 34, height: 34, borderRadius: RADIUS.sm, backgroundColor: COLORS.primarySoft, alignItems: 'center', justifyContent: 'center' },
  howText:  { ...TYPOGRAPHY.sm, color: COLORS.textPrimary, flex: 1 },
  occIconBox: { width: 36, height: 36, borderRadius: RADIUS.sm, backgroundColor: COLORS.infoBg, alignItems: 'center', justifyContent: 'center' },
  occTitle: { ...TYPOGRAPHY.bodyM, color: COLORS.textPrimary, fontWeight: '600' },
  occSub:   { ...TYPOGRAPHY.xs, color: COLORS.textTertiary, marginTop: 2 },
  occBig:   { ...TYPOGRAPHY.h4, color: COLORS.info },
});

// ══════════════════════════════════════════════════════════════════
// Accès journée
// ══════════════════════════════════════════════════════════════════
export function AccesJourneeScreen({ navigation }) {
  const [selected, setSelected] = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);

  const opts = [
    {
      id: 'HALF_DAY',
      icon: 'sunny-outline',
      label: 'Demi-journée',
      sub: 'Matin 8h–13h ou Après-midi 13h–19h',
      price: 20,
    },
    {
      id: 'FULL_DAY',
      icon: 'calendar-outline',
      label: 'Journée complète',
      sub: '8h–19h · Accès total à l\'espace',
      price: 30,
    },
  ];

  const handlePurchase = async () => {
    if (!selected) return;
    setLoading(true);
    try {
      await require('../../services/api').SubscriptionApi.purchaseDayAccess(selected);
      navigation.navigate('QRCode');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={dj.safe} edges={['top']}>
      <Header title="Accès à la journée" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={dj.scroll}>

        <Text style={dj.intro}>
          Accédez à l'espace coworking sans abonnement mensuel.
        </Text>

        {error && (
          <View style={dj.errorBox}>
            <Icon name="alert-circle-outline" size={15} color={COLORS.dangerText} />
            <Text style={dj.errorText}>{error}</Text>
          </View>
        )}

        {opts.map((o) => {
          const active = selected === o.id;
          return (
            <TouchableOpacity
              key={o.id}
              style={[dj.option, active && dj.optionActive]}
              onPress={() => setSelected(o.id)}
              activeOpacity={0.8}
            >
              <View style={[dj.optIcon, active && dj.optIconActive]}>
                <Icon name={o.icon} size={20} color={active ? COLORS.white : COLORS.textSecondary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[dj.optLabel, active && { color: COLORS.primary }]}>{o.label}</Text>
                <Text style={dj.optSub}>{o.sub}</Text>
              </View>
              <View style={dj.optRight}>
                <Text style={[dj.optPrice, active && { color: COLORS.primary }]}>{o.price} dh</Text>
                <View style={[dj.radio, active && dj.radioActive]}>
                  {active && <View style={dj.radioDot} />}
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

        {/* What's included */}
        <Card>
          <Text style={dj.inclTitle}>Inclus dans votre accès</Text>
          {[
            { icon: 'cafe-outline',       text: '1 boisson par session' },
            { icon: 'wifi-outline',        text: 'WiFi haut débit' },
            { icon: 'desktop-outline',     text: 'Espace coworking ouvert' },
            { icon: 'restaurant-outline',  text: 'Commande snacks disponible (payant)' },
          ].map((item, i) => (
            <Row key={i} center gap={12} style={[dj.inclRow, i < 3 && { borderBottomWidth: 1, borderBottomColor: COLORS.border }]}>
              <Icon name={item.icon} size={16} color={COLORS.textTertiary} />
              <Text style={dj.inclText}>{item.text}</Text>
            </Row>
          ))}
        </Card>

        <Button
          title={selected
            ? `Payer ${opts.find(o => o.id === selected)?.price} dh et obtenir mon QR`
            : 'Sélectionnez une option'
          }
          onPress={handlePurchase}
          loading={loading}
          disabled={!selected}
          size="lg"
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const dj = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: COLORS.bg },
  scroll:     { padding: 16, gap: 12, paddingBottom: 32 },
  intro:      { ...TYPOGRAPHY.body, color: COLORS.textSecondary },
  errorBox:   {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: COLORS.dangerBg, borderRadius: RADIUS.md, padding: 12,
  },
  errorText:  { ...TYPOGRAPHY.sm, color: COLORS.dangerText, flex: 1 },
  option:     {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: 16,
    borderWidth: 1.5, borderColor: COLORS.border,
  },
  optionActive: { borderColor: COLORS.primary },
  optIcon:    {
    width: 44, height: 44, borderRadius: RADIUS.md,
    backgroundColor: COLORS.gray50, alignItems: 'center', justifyContent: 'center',
  },
  optIconActive: { backgroundColor: COLORS.primary },
  optLabel:   { ...TYPOGRAPHY.bodyM, color: COLORS.textPrimary, fontWeight: '600' },
  optSub:     { ...TYPOGRAPHY.xs, color: COLORS.textTertiary, marginTop: 3 },
  optRight:   { alignItems: 'flex-end', gap: 8 },
  optPrice:   { ...TYPOGRAPHY.h4, color: COLORS.textPrimary },
  radio:      { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  radioActive:{ borderColor: COLORS.primary },
  radioDot:   { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.primary },
  inclTitle:  { ...TYPOGRAPHY.h4, color: COLORS.textPrimary, marginBottom: 8 },
  inclRow:    { paddingVertical: 10 },
  inclText:   { ...TYPOGRAPHY.sm, color: COLORS.textPrimary, flex: 1 },
});
