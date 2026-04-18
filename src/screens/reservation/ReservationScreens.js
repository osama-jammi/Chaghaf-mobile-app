// ─── Chaghaf · Reservation Screens v2 ───────────────────────────
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, RADIUS, TYPOGRAPHY, SHADOW } from '../../constants/colors';
import { Card, Button, Header, Icon, Badge, Divider, Row } from '../../components';
import { ReservationApi } from '../../services/api';
import { useFetch } from '../../hooks/useApi';

// ══════════════════════════════════════════════════════════════════
// Choix de salle
// ══════════════════════════════════════════════════════════════════
export function ChoixSalleScreen({ navigation }) {
  const { data: salles, loading, error } = useFetch(ReservationApi.getSalles, []);

  return (
    <SafeAreaView style={r.safe} edges={['top']}>
      <Header title="Réserver une salle" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={r.scroll}>
        <Text style={r.pageIntro}>Choisissez votre espace de travail</Text>

        {loading && <ActivityIndicator color={COLORS.primary} style={{ marginTop: 24 }} />}
        {error && (
          <View style={r.errorBox}>
            <Icon name="alert-circle-outline" size={15} color={COLORS.dangerText} />
            <Text style={r.errorText}>{error}</Text>
          </View>
        )}

        {(salles || []).map(salle => (
          <TouchableOpacity
            key={salle.id}
            style={r.salleCard}
            onPress={() => navigation.navigate('DateDuree', { salle })}
            activeOpacity={0.8}
          >
            <View style={r.salleTop}>
              <View style={r.salleIconBox}>
                <Icon name={salle.icon ?? 'business-outline'} size={22} color={COLORS.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={r.salleName}>{salle.name}</Text>
                <View style={r.salleCapacity}>
                  <Icon name="people-outline" size={13} color={COLORS.textTertiary} />
                  <Text style={r.salleCapacityText}>{salle.capacity}</Text>
                </View>
              </View>
              <Icon name="chevron-forward" size={16} color={COLORS.textDisabled} />
            </View>

            <Divider style={{ marginVertical: 12 }} />

            <View style={r.salleFeatures}>
              {(salle.features || []).map((f, i) => (
                <View key={i} style={r.featurePill}>
                  <Text style={r.featurePillText}>{f}</Text>
                </View>
              ))}
            </View>

            <View style={r.sallePricing}>
              <View style={r.pricingItem}>
                <Text style={r.pricingLabel}>Demi-journée</Text>
                <Text style={r.pricingValue}>{salle.halfDayPrice} dh</Text>
              </View>
              <View style={r.pricingDivider} />
              <View style={r.pricingItem}>
                <Text style={r.pricingLabel}>Journée complète</Text>
                <Text style={r.pricingValue}>{salle.fullDayPrice} dh</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

// ══════════════════════════════════════════════════════════════════
// Date et durée
// ══════════════════════════════════════════════════════════════════
export function DateDureeScreen({ navigation, route }) {
  const salle = route?.params?.salle;
  const [selectedDate, setSelectedDate] = useState(null);
  const [duration, setDuration]         = useState(null);

  if (!salle) return null;

  const now   = new Date();
  const month = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
                 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'][now.getMonth()];
  const DAYS  = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
  const calDates = [
    [null, null, null, null, null, null, null],
    [null, 1, 2, 3, 4, 5, 6],
    [7, 8, 9, 10, 11, 12, 13],
    [14, 15, 16, 17, 18, 19, 20],
    [21, 22, 23, 24, 25, 26, 27],
    [28, 29, 30, null, null, null, null],
  ];

  const price = duration === 'half' ? salle.halfDayPrice : salle.fullDayPrice;

  const durations = [
    { id: 'half', icon: 'partly-sunny-outline', label: 'Demi-journée',    sub: 'Matin ou après-midi', price: salle.halfDayPrice },
    { id: 'full', icon: 'sunny-outline',        label: 'Journée complète', sub: '8h – 19h',             price: salle.fullDayPrice },
  ];

  return (
    <SafeAreaView style={r.safe} edges={['top']}>
      <Header title={salle.name} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={r.scroll}>

        {/* Calendar */}
        <Card>
          <Text style={r.calTitle}>{month} {now.getFullYear()}</Text>
          <Text style={r.calSubtitle}>Sélectionnez une date</Text>
          <View style={r.calHeader}>
            {DAYS.map((d, i) => <Text key={i} style={r.calDayHead}>{d}</Text>)}
          </View>
          {calDates.map((week, wi) => (
            <View key={wi} style={r.calRow}>
              {week.map((date, di) => {
                const today    = date === now.getDate();
                const past     = date !== null && date < now.getDate();
                const selected = date === selectedDate;
                return (
                  <TouchableOpacity
                    key={di}
                    style={[r.calCell, today && r.calCellToday, selected && r.calCellSelected, past && r.calCellPast]}
                    onPress={() => date && !past && setSelectedDate(date)}
                    disabled={!date || past}
                  >
                    <Text style={[r.calCellText, today && r.calCellTextToday, selected && r.calCellTextSelected, past && r.calCellTextPast]}>
                      {date || ''}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </Card>

        {/* Duration */}
        <View style={r.durationRow}>
          {durations.map(d => {
            const active = duration === d.id;
            return (
              <TouchableOpacity
                key={d.id}
                style={[r.durationCard, active && r.durationCardActive]}
                onPress={() => setDuration(d.id)}
                activeOpacity={0.8}
              >
                <Icon name={d.icon} size={20} color={active ? COLORS.primary : COLORS.textTertiary} />
                <Text style={[r.durationLabel, active && { color: COLORS.primary }]}>{d.label}</Text>
                <Text style={r.durationSub}>{d.sub}</Text>
                <Text style={[r.durationPrice, active && { color: COLORS.primary }]}>{d.price} dh</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Button
          title="Confirmer la réservation"
          onPress={() => selectedDate && duration && navigation.navigate('ConfirmationReservation', { salle, date: selectedDate, duration, price })}
          disabled={!selectedDate || !duration}
          size="lg"
        />
      </ScrollView>
    </SafeAreaView>
  );
}

// ══════════════════════════════════════════════════════════════════
// Confirmation réservation
// ══════════════════════════════════════════════════════════════════
export function ConfirmationReservationScreen({ navigation, route }) {
  const { salle, date, duration, price } = route?.params || {};
  const [confirmed, setConfirmed] = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState(null);

  const now   = new Date();
  const isoDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);
    try {
      await ReservationApi.create(salle.id, isoDate, duration === 'full' ? 'FULL_DAY' : 'HALF_DAY');
      setConfirmed(true);
    } catch (e) {
      setError(e.message || 'Erreur lors de la réservation');
    } finally {
      setLoading(false);
    }
  };

  if (confirmed) {
    return (
      <SafeAreaView style={r.safe} edges={['top']}>
        <View style={r.successScreen}>
          <View style={r.successCheck}>
            <Icon name="checkmark" size={32} color={COLORS.white} />
          </View>
          <Text style={r.successTitle}>Réservation confirmée</Text>
          <Text style={r.successSub}>{salle?.name} · {date} {['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'][now.getMonth()]}</Text>

          <Card style={{ width: '100%', marginTop: 24 }}>
            {[
              ['Salle',  salle?.name],
              ['Date',   `${date} Avril ${now.getFullYear()}`],
              ['Durée',  duration === 'full' ? 'Journée complète' : 'Demi-journée'],
              ['Montant', `${price} dh`],
            ].map(([label, value]) => (
              <View key={label} style={r.confirmRow}>
                <Text style={r.confirmLabel}>{label}</Text>
                <Text style={r.confirmValue}>{value}</Text>
              </View>
            ))}
          </Card>

          <Button title="Retour à l'accueil" onPress={() => navigation.navigate('Home')} style={{ width: '100%', marginTop: 20 }} size="lg" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={r.safe} edges={['top']}>
      <Header title="Récapitulatif" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={r.scroll}>

        {error && (
          <View style={r.errorBox}>
            <Icon name="alert-circle-outline" size={15} color={COLORS.dangerText} />
            <Text style={r.errorText}>{error}</Text>
          </View>
        )}

        {/* Salle preview */}
        <Card>
          <Row center gap={14}>
            <View style={r.previewIcon}>
              <Icon name={salle?.icon ?? 'business-outline'} size={24} color={COLORS.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={r.previewName}>{salle?.name}</Text>
              <Text style={r.previewCapacity}>{salle?.capacity}</Text>
            </View>
            <Badge label="Disponible" variant="success" dot />
          </Row>
        </Card>

        {/* Summary */}
        <Card>
          <Text style={r.sumTitle}>Détails de la réservation</Text>
          {[
            ['Salle',   salle?.name],
            ['Date',    `${date} Avril ${now.getFullYear()}`],
            ['Durée',   duration === 'full' ? 'Journée complète (8h–19h)' : 'Demi-journée'],
          ].map(([label, value]) => (
            <View key={label} style={r.confirmRow}>
              <Text style={r.confirmLabel}>{label}</Text>
              <Text style={r.confirmValue}>{value}</Text>
            </View>
          ))}
          <View style={[r.confirmRow, r.confirmTotal]}>
            <Text style={r.totalLabel}>Total</Text>
            <Text style={r.totalValue}>{price} dh</Text>
          </View>
        </Card>

        <Button title="Confirmer la réservation" onPress={handleConfirm} loading={loading} size="lg" />
        <Button title="Modifier" onPress={() => navigation.goBack()} variant="outlined" />
      </ScrollView>
    </SafeAreaView>
  );
}

const r = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: COLORS.bg },
  scroll:    { padding: 16, gap: 12, paddingBottom: 32 },
  pageIntro: { ...TYPOGRAPHY.body, color: COLORS.textSecondary },
  errorBox:  {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: COLORS.dangerBg, borderRadius: RADIUS.md, padding: 12,
  },
  errorText: { ...TYPOGRAPHY.sm, color: COLORS.dangerText, flex: 1 },

  // Salle card
  salleCard:     { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: 16, borderWidth: 1, borderColor: COLORS.border },
  salleTop:      { flexDirection: 'row', alignItems: 'center', gap: 12 },
  salleIconBox:  { width: 48, height: 48, borderRadius: RADIUS.md, backgroundColor: COLORS.primarySoft, alignItems: 'center', justifyContent: 'center' },
  salleName:     { ...TYPOGRAPHY.h4, color: COLORS.textPrimary },
  salleCapacity: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  salleCapacityText: { ...TYPOGRAPHY.xs, color: COLORS.textTertiary },
  salleFeatures: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  featurePill:   { backgroundColor: COLORS.gray50, borderRadius: RADIUS.full, paddingHorizontal: 10, paddingVertical: 4 },
  featurePillText: { ...TYPOGRAPHY.xs, color: COLORS.textSecondary, fontWeight: '500' },
  sallePricing:  { flexDirection: 'row', backgroundColor: COLORS.bg, borderRadius: RADIUS.md, padding: 12 },
  pricingItem:   { flex: 1, alignItems: 'center' },
  pricingLabel:  { ...TYPOGRAPHY.xs, color: COLORS.textTertiary, marginBottom: 4 },
  pricingValue:  { fontSize: 17, fontWeight: '700', color: COLORS.primary },
  pricingDivider:{ width: 1, backgroundColor: COLORS.border, marginHorizontal: 12 },

  // Calendar
  calTitle:    { ...TYPOGRAPHY.h4, color: COLORS.textPrimary },
  calSubtitle: { ...TYPOGRAPHY.xs, color: COLORS.textTertiary, marginTop: 2, marginBottom: 14 },
  calHeader:   { flexDirection: 'row', marginBottom: 6 },
  calDayHead:  { flex: 1, textAlign: 'center', ...TYPOGRAPHY.xs, color: COLORS.textTertiary, fontWeight: '600' },
  calRow:      { flexDirection: 'row' },
  calCell:     { flex: 1, aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 6 },
  calCellToday:   { backgroundColor: COLORS.gray50 },
  calCellSelected:{ backgroundColor: COLORS.primary },
  calCellPast:    { opacity: 0.3 },
  calCellText:    { ...TYPOGRAPHY.sm, color: COLORS.textPrimary, fontWeight: '500' },
  calCellTextToday:   { color: COLORS.primary, fontWeight: '700' },
  calCellTextSelected:{ color: COLORS.white, fontWeight: '700' },
  calCellTextPast:    { color: COLORS.textDisabled },

  // Duration
  durationRow:      { flexDirection: 'row', gap: 10 },
  durationCard:     {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: 14,
    alignItems: 'center', gap: 4, borderWidth: 1.5, borderColor: COLORS.border,
  },
  durationCardActive: { borderColor: COLORS.primary },
  durationLabel:    { ...TYPOGRAPHY.smM, color: COLORS.textPrimary, fontWeight: '600', textAlign: 'center' },
  durationSub:      { ...TYPOGRAPHY.xs, color: COLORS.textTertiary, textAlign: 'center' },
  durationPrice:    { fontSize: 17, fontWeight: '700', color: COLORS.textPrimary, marginTop: 4 },

  // Confirm
  previewIcon:    { width: 52, height: 52, borderRadius: RADIUS.md, backgroundColor: COLORS.primarySoft, alignItems: 'center', justifyContent: 'center' },
  previewName:    { ...TYPOGRAPHY.h4, color: COLORS.textPrimary },
  previewCapacity:{ ...TYPOGRAPHY.xs, color: COLORS.textTertiary, marginTop: 2 },
  sumTitle:       { ...TYPOGRAPHY.h4, color: COLORS.textPrimary, marginBottom: 10 },
  confirmRow:     { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  confirmLabel:   { ...TYPOGRAPHY.sm, color: COLORS.textSecondary },
  confirmValue:   { ...TYPOGRAPHY.smM, color: COLORS.textPrimary, fontWeight: '500' },
  confirmTotal:   { borderBottomWidth: 0, paddingTop: 14 },
  totalLabel:     { ...TYPOGRAPHY.bodyM, color: COLORS.textPrimary, fontWeight: '600' },
  totalValue:     { fontSize: 20, fontWeight: '700', color: COLORS.primary },

  // Success
  successScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28 },
  successCheck:  { width: 72, height: 72, borderRadius: 36, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  successTitle:  { ...TYPOGRAPHY.h2, color: COLORS.textPrimary, textAlign: 'center' },
  successSub:    { ...TYPOGRAPHY.body, color: COLORS.textSecondary, textAlign: 'center', marginTop: 8 },
});
