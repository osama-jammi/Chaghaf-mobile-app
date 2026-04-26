// ─── Chaghaf · Subscription Screens v2 ──────────────────────────
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, RADIUS, TYPOGRAPHY, SHADOW } from '../../constants/colors';
import { PACKS, USER } from '../../constants/data';
import { Card, Badge, Button, Header, Icon, ProgressBar, Divider, Row } from '../../components';
import { SubscriptionApi } from '../../services/api';

// ══════════════════════════════════════════════════════════════════
// Mon Abonnement
// ══════════════════════════════════════════════════════════════════
export function AbonnementScreen({ navigation }) {
  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <Header title="Mon Abonnement" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={s.scroll}>

        {/* Alert if expiring soon */}
        {USER.pack.daysLeft <= 5 && (
          <View style={s.alertBar}>
            <Icon name="time-outline" size={15} color={COLORS.warningText} />
            <Text style={s.alertText}>
              Votre abonnement expire dans {USER.pack.daysLeft} jours
            </Text>
          </View>
        )}

        {/* Active pack card */}
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.activeCard}
        >
          <View style={s.activeCardTop}>
            <View>
              <Badge label="Actif" variant="default" dot style={{ backgroundColor: 'rgba(255,255,255,0.15)' }} />
              <Text style={s.activeCardName}>
                Pack {USER.pack.type} · {USER.pack.persons} Personne{USER.pack.persons > 1 ? 's' : ''}
              </Text>
            </View>
            <View style={s.activeCardIcon}>
              <Icon name="card-outline" size={20} color="rgba(255,255,255,0.7)" />
            </View>
          </View>

          <ProgressBar
            value={USER.pack.daysLeft}
            max={30}
            color="rgba(255,255,255,0.8)"
            height={3}
            style={{ backgroundColor: 'rgba(255,255,255,0.2)', marginVertical: 16 }}
          />

          <View style={s.activeCardBottom}>
            <View>
              <Text style={s.activeCardMetaLabel}>Jours restants</Text>
              <Text style={s.activeCardMetaValue}>{USER.pack.daysLeft}</Text>
            </View>
            <View>
              <Text style={s.activeCardMetaLabel}>Expire le</Text>
              <Text style={s.activeCardMetaValue}>{USER.pack.expiresAt}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Actions */}
        <View style={s.actionRow}>
          <TouchableOpacity style={s.actionBtn} onPress={() => navigation.navigate('Renouvellement')}>
            <Icon name="refresh-outline" size={18} color={COLORS.primary} />
            <Text style={s.actionBtnText}>Renouveler</Text>
          </TouchableOpacity>
          <View style={s.actionBtnDivider} />
          <TouchableOpacity style={s.actionBtn} onPress={() => navigation.navigate('ChoixDuree')}>
            <Icon name="swap-horizontal-outline" size={18} color={COLORS.textSecondary} />
            <Text style={[s.actionBtnText, { color: COLORS.textSecondary }]}>Changer</Text>
          </TouchableOpacity>
        </View>

        {/* Available packs */}
        <Text style={s.sectionTitle}>Packs disponibles</Text>
        {PACKS.map(pack => (
          <PackCard
            key={pack.id}
            pack={pack}
            isCurrent={pack.id === 'p2'}
            onSelect={() => navigation.navigate('ChoixDuree', { pack })}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function PackCard({ pack, isCurrent, onSelect }) {
  return (
    <TouchableOpacity
      style={[s.packCard, isCurrent && s.packCardActive]}
      onPress={onSelect}
      activeOpacity={0.8}
    >
      {pack.popular && (
        <View style={s.popularTag}>
          <Text style={s.popularTagText}>Populaire</Text>
        </View>
      )}

      <View style={s.packTop}>
        <View style={[s.packIconBox, isCurrent && s.packIconBoxActive]}>
          <Icon name={pack.icon ?? 'people-outline'} size={18} color={isCurrent ? COLORS.white : COLORS.textSecondary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[s.packName, isCurrent && { color: COLORS.primary }]}>{pack.name}</Text>
          {isCurrent && <Text style={s.packCurrentTag}>Votre pack actuel</Text>}
        </View>
        <View style={s.packPrices}>
          <Text style={[s.packPrice, isCurrent && { color: COLORS.primary }]}>{pack.monthlyPrice} dh</Text>
          <Text style={s.packPriceLabel}>/mois</Text>
        </View>
      </View>

      <Divider style={{ marginVertical: 12 }} />

      <View style={s.packFeatures}>
        {pack.features.map((f, i) => (
          <View key={i} style={s.featureRow}>
            <Icon name="checkmark" size={14} color={isCurrent ? COLORS.primary : COLORS.success} />
            <Text style={s.featureText}>{f}</Text>
          </View>
        ))}
      </View>

      {!isCurrent && (
        <View style={s.packCta}>
          <Text style={s.packCtaText}>Souscrire</Text>
          <Icon name="arrow-forward" size={14} color={COLORS.primary} />
        </View>
      )}
    </TouchableOpacity>
  );
}

// ══════════════════════════════════════════════════════════════════
// Choix durée
// ══════════════════════════════════════════════════════════════════
export function ChoixDureeScreen({ navigation, route }) {
  const [duration, setDuration] = useState('monthly');
  const pack = route?.params?.pack ?? PACKS[1];
  const price    = duration === 'monthly' ? pack.monthlyPrice : pack.annualPrice;
  const savings  = duration === 'annual' ? Math.round(pack.monthlyPrice * 12 - pack.annualPrice) : 0;

  const opts = [
    {
      id: 'monthly',
      icon: 'calendar-outline',
      label: 'Mensuel',
      sub: 'Flexibilité maximale · Résiliable à tout moment',
      price: pack.monthlyPrice,
      perMonth: pack.monthlyPrice,
    },
    {
      id: 'annual',
      icon: 'star-outline',
      label: 'Annuel',
      sub: 'Engagement 12 mois · Économie garantie',
      price: pack.annualPrice,
      perMonth: Math.round(pack.annualPrice / 12),
      savings,
    },
  ];

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <Header title={pack.name} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={s.scroll}>
        <Text style={s.pageIntro}>Choisissez la durée de votre abonnement</Text>

        {opts.map(o => {
          const active = duration === o.id;
          return (
            <TouchableOpacity
              key={o.id}
              style={[s.durationCard, active && s.durationCardActive]}
              onPress={() => setDuration(o.id)}
              activeOpacity={0.8}
            >
              <View style={[s.durationIcon, active && s.durationIconActive]}>
                <Icon name={o.icon} size={18} color={active ? COLORS.white : COLORS.textSecondary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.durationLabel, active && { color: COLORS.primary }]}>{o.label}</Text>
                <Text style={s.durationSub}>{o.sub}</Text>
                {o.savings > 0 && (
                  <View style={s.savingsPill}>
                    <Text style={s.savingsText}>Économie de {o.savings} dh</Text>
                  </View>
                )}
              </View>
              <View style={s.durationRight}>
                <Text style={[s.durationPrice, active && { color: COLORS.primary }]}>{o.price} dh</Text>
                {o.id === 'annual' && (
                  <Text style={s.durationPerMonth}>{o.perMonth} dh/mois</Text>
                )}
                <View style={[s.radio, active && s.radioActive]}>
                  {active && <View style={s.radioDot} />}
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Summary */}
        <Card>
          <Text style={s.summaryTitle}>Récapitulatif</Text>
          {[
            ['Pack',   pack.name],
            ['Durée',  duration === 'monthly' ? 'Mensuel' : 'Annuel (12 mois)'],
            ['Montant', `${price} dh`],
          ].map(([label, value], i, arr) => (
            <View key={label} style={[s.summaryRow, i === arr.length - 1 && s.summaryRowLast]}>
              <Text style={s.summaryLabel}>{label}</Text>
              <Text style={[s.summaryValue, i === arr.length - 1 && { color: COLORS.primary, fontSize: 17, fontWeight: '700' }]}>
                {value}
              </Text>
            </View>
          ))}
        </Card>

        <Button
          title={`Souscrire · ${price} dh`}
          onPress={() => navigation.navigate('Renouvellement', { pack, duration })}
          size="lg"
        />
      </ScrollView>
    </SafeAreaView>
  );
}

// ══════════════════════════════════════════════════════════════════
// Renouvellement
// ══════════════════════════════════════════════════════════════════
export function RenouvellementScreen({ navigation, route }) {
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const pack     = route?.params?.pack ?? PACKS[1];
  const duration = route?.params?.duration ?? 'monthly';
  const price    = duration === 'monthly' ? pack.monthlyPrice : pack.annualPrice;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const backendDuration = duration === 'annual' ? 'YEAR' : 'MONTH';
      const packType = pack.backendType ?? 'BASIC';
      await SubscriptionApi.subscribe(packType, backendDuration);
      setConfirmed(true);
    } catch (err) {
      Alert.alert('Erreur', err.message ?? 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  if (confirmed) {
    return (
      <SafeAreaView style={s.safe} edges={['top']}>
        <View style={s.successScreen}>
          <View style={s.successCheck}>
            <Icon name="checkmark" size={36} color={COLORS.white} />
          </View>
          <Text style={s.successTitle}>Abonnement renouvelé</Text>
          <Text style={s.successSub}>
            {pack.name} · {duration === 'monthly' ? 'Mensuel' : 'Annuel'}{'\n'}
            Votre accès est maintenant actif.
          </Text>
          <Button
            title="Retour à l'accueil"
            onPress={() => navigation.navigate('Home')}
            style={{ width: '100%', marginTop: 32 }}
            size="lg"
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <Header title="Renouvellement" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={s.scroll}>

        {USER.pack.daysLeft <= 5 && (
          <View style={s.alertBar}>
            <Icon name="time-outline" size={15} color={COLORS.warningText} />
            <Text style={s.alertText}>
              Abonnement expirant dans {USER.pack.daysLeft} jours
            </Text>
          </View>
        )}

        <Card>
          <Text style={s.summaryTitle}>Détails du renouvellement</Text>
          {[
            ['Pack',    pack.name],
            ['Durée',   duration === 'monthly' ? 'Mensuel' : 'Annuel (12 mois)'],
            ['Montant', `${price} dh`],
            ['Début',   'Immédiatement'],
          ].map(([label, value], i, arr) => (
            <View key={label} style={[s.summaryRow, i === arr.length - 1 && s.summaryRowLast]}>
              <Text style={s.summaryLabel}>{label}</Text>
              <Text style={[s.summaryValue, i === arr.length - 1 && { color: COLORS.primary, fontWeight: '700' }]}>
                {value}
              </Text>
            </View>
          ))}
        </Card>

        <Button
          title={loading ? 'Traitement en cours…' : 'Confirmer le renouvellement'}
          onPress={handleConfirm}
          disabled={loading}
          size="lg"
        />
        <Button title="Annuler" onPress={() => navigation.goBack()} variant="outlined" />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: COLORS.bg },
  scroll:     { padding: 16, gap: 12, paddingBottom: 32 },
  pageIntro:  { ...TYPOGRAPHY.body, color: COLORS.textSecondary },
  alertBar:   {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: COLORS.warningBg, borderRadius: RADIUS.md,
    padding: 12, borderLeftWidth: 3, borderLeftColor: COLORS.warning,
  },
  alertText:  { ...TYPOGRAPHY.smM, color: COLORS.warningText, flex: 1 },
  sectionTitle: { ...TYPOGRAPHY.h4, color: COLORS.textPrimary, marginTop: 4 },
  actionRow:  {
    flexDirection: 'row', backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden',
  },
  actionBtn:  { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14 },
  actionBtnText: { ...TYPOGRAPHY.smM, color: COLORS.primary, fontWeight: '600' },
  actionBtnDivider: { width: 1, backgroundColor: COLORS.border },

  // Active card
  activeCard:         { borderRadius: RADIUS.xl, padding: 20 },
  activeCardTop:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  activeCardIcon:     { width: 40, height: 40, borderRadius: RADIUS.md, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  activeCardName:     { fontSize: 18, fontWeight: '700', color: '#fff', marginTop: 8 },
  activeCardBottom:   { flexDirection: 'row', gap: 32 },
  activeCardMetaLabel:{ fontSize: 11, color: 'rgba(255,255,255,0.55)', marginBottom: 3 },
  activeCardMetaValue:{ fontSize: 18, fontWeight: '700', color: '#fff' },

  // Pack card
  packCard:       {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.lg,
    padding: 16, borderWidth: 1.5, borderColor: COLORS.border,
  },
  packCardActive: { borderColor: COLORS.primary },
  popularTag:     {
    position: 'absolute', top: -11, right: 14,
    backgroundColor: COLORS.primary, borderRadius: RADIUS.full,
    paddingHorizontal: 10, paddingVertical: 3,
  },
  popularTagText: { ...TYPOGRAPHY.xs, color: COLORS.white, fontWeight: '700' },
  packTop:        { flexDirection: 'row', alignItems: 'center', gap: 12 },
  packIconBox:    { width: 36, height: 36, borderRadius: RADIUS.sm, backgroundColor: COLORS.gray50, alignItems: 'center', justifyContent: 'center' },
  packIconBoxActive: { backgroundColor: COLORS.primary },
  packName:       { ...TYPOGRAPHY.bodyM, color: COLORS.textPrimary, fontWeight: '600' },
  packCurrentTag: { ...TYPOGRAPHY.xs, color: COLORS.primary, marginTop: 1 },
  packPrices:     { alignItems: 'flex-end' },
  packPrice:      { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  packPriceLabel: { ...TYPOGRAPHY.xs, color: COLORS.textTertiary },
  packFeatures:   { gap: 6 },
  featureRow:     { flexDirection: 'row', alignItems: 'center', gap: 8 },
  featureText:    { ...TYPOGRAPHY.sm, color: COLORS.textSecondary, flex: 1 },
  packCta:        {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginTop: 14, paddingTop: 12,
    borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  packCtaText:    { ...TYPOGRAPHY.smM, color: COLORS.primary, fontWeight: '600', flex: 1 },

  // Duration
  durationCard:      {
    flexDirection: 'row', alignItems: 'flex-start', gap: 14,
    backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: 16,
    borderWidth: 1.5, borderColor: COLORS.border,
  },
  durationCardActive:{ borderColor: COLORS.primary },
  durationIcon:      { width: 42, height: 42, borderRadius: RADIUS.md, backgroundColor: COLORS.gray50, alignItems: 'center', justifyContent: 'center' },
  durationIconActive:{ backgroundColor: COLORS.primary },
  durationLabel:     { ...TYPOGRAPHY.bodyM, color: COLORS.textPrimary, fontWeight: '600' },
  durationSub:       { ...TYPOGRAPHY.xs, color: COLORS.textTertiary, marginTop: 3, lineHeight: 16 },
  savingsPill:       { backgroundColor: COLORS.successBg, borderRadius: RADIUS.full, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start', marginTop: 6 },
  savingsText:       { ...TYPOGRAPHY.xs, color: COLORS.successText, fontWeight: '600' },
  durationRight:     { alignItems: 'flex-end', gap: 6 },
  durationPrice:     { fontSize: 17, fontWeight: '700', color: COLORS.textPrimary },
  durationPerMonth:  { ...TYPOGRAPHY.xs, color: COLORS.textTertiary },
  radio:             { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  radioActive:       { borderColor: COLORS.primary },
  radioDot:          { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.primary },

  // Summary
  summaryTitle:    { ...TYPOGRAPHY.h4, color: COLORS.textPrimary, marginBottom: 12 },
  summaryRow:      { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  summaryRowLast:  { borderBottomWidth: 0, paddingTop: 14 },
  summaryLabel:    { ...TYPOGRAPHY.sm, color: COLORS.textSecondary },
  summaryValue:    { ...TYPOGRAPHY.smM, color: COLORS.textPrimary, fontWeight: '500' },

  // Success
  successScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  successCheck:  {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 24,
  },
  successTitle:  { ...TYPOGRAPHY.h2, color: COLORS.textPrimary, textAlign: 'center', marginBottom: 12 },
  successSub:    { ...TYPOGRAPHY.body, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 24 },
});
