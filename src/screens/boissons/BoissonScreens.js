// ─── Chaghaf · Boissons Screens v2 ───────────────────────────────
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Image, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, RADIUS, TYPOGRAPHY } from '../../constants/colors';
import { CAFE_GUIDE } from '../../constants/data';
import { Card, Button, Header, Icon, Divider, Row, Badge } from '../../components';
import { BoissonApi } from '../../services/api';
import { useFetch } from '../../hooks/useApi';

// Helper : renvoie la source d'image ou null
const getImageSource = (item) => {
  if (item?.imageBase64) {
    const mime = item.imageMimeType || 'image/jpeg';
    return { uri: `data:${mime};base64,${item.imageBase64}` };
  }
  return null;
};

// ══════════════════════════════════════════════════════════════════
// Validation boisson
// ══════════════════════════════════════════════════════════════════
export function ValidationBoissonScreen({ navigation }) {
  return (
    <SafeAreaView style={b.safe} edges={['top']}>
      <Header title="Boissons" onBack={() => navigation.goBack()} />
      <View style={b.validateScreen}>
        <View style={b.validateIcon}>
          <Icon name="cafe-outline" size={36} color={COLORS.primary} />
        </View>
        <Text style={b.validateTitle}>Confirmer votre boisson</Text>
        <Text style={b.validateSub}>
          Votre abonnement inclut 1 boisson par session de travail.
        </Text>
        <Card style={b.ruleCard}>
          <Row center gap={10}>
            <Icon name="information-circle-outline" size={17} color={COLORS.info} />
            <Text style={b.ruleText}>1 boisson incluse par session</Text>
          </Row>
        </Card>
        <View style={b.validateActions}>
          <Button title="Choisir ma boisson" onPress={() => navigation.navigate('ChoixBoisson')} size="lg" />
          <Button title="Annuler" onPress={() => navigation.goBack()} variant="outlined" />
        </View>
      </View>
    </SafeAreaView>
  );
}

// ══════════════════════════════════════════════════════════════════
// Choix boisson
// ══════════════════════════════════════════════════════════════════
export function ChoixBoissonScreen({ navigation }) {
  const [selected, setSelected] = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);

  const { data: boissons, loading: loadingList, error: listError } = useFetch(BoissonApi.getList, []);
  const { data: status, refetch: refetchStatus } = useFetch(BoissonApi.getTodayStatus, []);

  const handleConfirm = async () => {
    if (!selected) return;
    setLoading(true);
    setError(null);
    try {
      const result = await BoissonApi.consume(selected.name);
      navigation.navigate('ConfirmationBoisson', { boisson: selected, result });
      refetchStatus && refetchStatus();
    } catch (e) {
      setError(e.message || 'Erreur lors de la sélection');
    } finally {
      setLoading(false);
    }
  };

  const items = boissons || [];

  return (
    <SafeAreaView style={b.safe} edges={['top']}>
      <Header title="Choisir votre boisson" onBack={() => navigation.goBack()} />

      {/* Contenu scrollable */}
      <View style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={[b.scroll, { paddingBottom: 100 }]}
          showsVerticalScrollIndicator={false}
        >
          {status && (
            <Card style={{ backgroundColor: status.freeAvailable ? COLORS.successBg : COLORS.gray50 }}>
              <Row center gap={10}>
                <Icon
                  name={status.freeAvailable ? 'gift-outline' : 'wallet-outline'}
                  size={18}
                  color={status.freeAvailable ? COLORS.successText : COLORS.textSecondary}
                />
                <Text style={{
                  ...TYPOGRAPHY.smM,
                  color: status.freeAvailable ? COLORS.successText : COLORS.textSecondary,
                  flex: 1,
                }}>
                  {status.message}
                </Text>
              </Row>
            </Card>
          )}

          <Text style={b.pageIntro}>1 boisson gratuite par jour · réinitialisée à 7h</Text>

          {(error || listError) && (
            <View style={b.errorBox}>
              <Icon name="alert-circle-outline" size={15} color={COLORS.dangerText} />
              <Text style={b.errorText}>{error || listError}</Text>
            </View>
          )}

          {loadingList ? (
            <ActivityIndicator color={COLORS.primary} style={{ marginTop: 24 }} />
          ) : items.length === 0 && !listError ? (
            <Text style={[b.pageIntro, { textAlign: 'center', marginTop: 24 }]}>
              Aucune boisson disponible pour le moment.
            </Text>
          ) : (
            <View style={b.boissonGrid}>
              {items.map(item => {
                const active    = selected?.id === item.id;
                const imgSource = getImageSource(item);
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[b.boissonCard, active && b.boissonCardActive]}
                    onPress={() => setSelected(item)}
                    activeOpacity={0.8}
                  >
                    {/* Image ou icône */}
                    <View style={[b.boissonImgBox, active && b.boissonImgBoxActive]}>
                      {imgSource ? (
                        <Image
                          source={imgSource}
                          style={b.boissonImg}
                          resizeMode="cover"
                        />
                      ) : (
                        <Icon
                          name={item.emoji ? undefined : (item.icon ?? 'cafe-outline')}
                          size={26}
                          color={active ? COLORS.white : COLORS.textSecondary}
                        />
                      )}
                    </View>

                    <Text style={[b.boissonName, active && { color: COLORS.primary }]}>
                      {item.name}
                    </Text>

                    {item.price != null && (
                      <Text style={[b.boissonPrice, active && { color: COLORS.primary }]}>
                        {Number(item.price) === 0 ? 'Offerte' : `${item.price} dh`}
                      </Text>
                    )}

                    <Badge label="Inclus" variant={active ? 'primary' : 'default'} />

                    {item.name?.toLowerCase().includes('café') && (
                      <TouchableOpacity
                        style={b.guideLink}
                        onPress={() => navigation.navigate('GuideMachine')}
                      >
                        <Text style={b.guideLinkText}>Guide préparation</Text>
                        <Icon name="arrow-forward" size={11} color={COLORS.primary} />
                      </TouchableOpacity>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </ScrollView>

        {/* Bouton sticky en bas */}
        <View style={b.stickyFooter}>
          <Button
            title={selected ? `Confirmer — ${selected.name}` : 'Sélectionnez une boisson'}
            onPress={handleConfirm}
            loading={loading}
            disabled={!selected}
            size="lg"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

// ══════════════════════════════════════════════════════════════════
// Confirmation boisson
// ══════════════════════════════════════════════════════════════════
export function ConfirmationBoissonScreen({ navigation, route }) {
  const boisson = route?.params?.boisson;
  const result  = route?.params?.result;
  const isFree  = result?.free === true;
  const price   = result?.price ?? 0;

  return (
    <SafeAreaView style={b.safe} edges={['top']}>
      <View style={b.confirmScreen}>
        <View style={b.confirmCheck}>
          <Icon name="checkmark" size={32} color={COLORS.white} />
        </View>
        <Text style={b.confirmTitle}>{boisson?.name}</Text>
        <Text style={b.confirmSub}>
          {isFree
            ? 'Boisson offerte (1ère du jour) — bonne dégustation !'
            : `Boisson facturée: ${price} dh — bonne dégustation !`}
        </Text>
        {boisson?.name?.toLowerCase().includes('café') && (
          <TouchableOpacity style={b.guideBtn} onPress={() => navigation.navigate('GuideMachine')}>
            <Icon name="book-outline" size={16} color={COLORS.primary} />
            <Text style={b.guideBtnText}>Voir le guide de la machine</Text>
          </TouchableOpacity>
        )}
        <Button
          title="Retour à l'accueil"
          onPress={() => navigation.navigate('Home')}
          style={{ width: '100%', marginTop: 28 }}
          size="lg"
        />
      </View>
    </SafeAreaView>
  );
}

// ══════════════════════════════════════════════════════════════════
// Guide machine
// ══════════════════════════════════════════════════════════════════
export function GuideMachineScreen({ navigation }) {
  const [done, setDone] = useState({});
  const toggle  = (step) => setDone(prev => ({ ...prev, [step]: !prev[step] }));
  const allDone = CAFE_GUIDE.every(s => done[s.step]);

  return (
    <SafeAreaView style={b.safe} edges={['top']}>
      <Header title="Guide machine à café" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={b.scroll}>

        <View style={b.videoBox}>
          <View style={b.videoPlay}>
            <Icon name="play" size={24} color={COLORS.white} />
          </View>
          <View>
            <Text style={b.videoTitle}>Tutoriel vidéo</Text>
            <Text style={b.videoSub}>Durée : 1 min 30</Text>
          </View>
        </View>

        <Text style={b.guideTitle}>Instructions</Text>

        <Card padding={0}>
          {CAFE_GUIDE.map((item, i) => (
            <View key={item.step}>
              <TouchableOpacity
                style={[b.stepRow, done[item.step] && b.stepRowDone]}
                onPress={() => toggle(item.step)}
                activeOpacity={0.75}
              >
                <View style={[b.stepNum, done[item.step] && b.stepNumDone]}>
                  {done[item.step]
                    ? <Icon name="checkmark" size={14} color={COLORS.white} />
                    : <Text style={b.stepNumText}>{item.step}</Text>
                  }
                </View>
                <Text style={[b.stepText, done[item.step] && b.stepTextDone]}>
                  {item.text}
                </Text>
              </TouchableOpacity>
              {i < CAFE_GUIDE.length - 1 && <Divider inset={58} />}
            </View>
          ))}
        </Card>

        {allDone && (
          <Card style={b.allDoneCard} padding={16}>
            <Row center gap={10}>
              <Icon name="checkmark-circle" size={20} color={COLORS.successText} />
              <Text style={b.allDoneText}>Votre café est prêt. Bonne dégustation !</Text>
            </Row>
          </Card>
        )}

        <Card>
          <Text style={b.tipsTitle}>Conseils</Text>
          {[
            'Capsules disponibles sur la table à côté de la machine',
            'En cas de problème, contactez le staff via la messagerie',
            'Rincez votre tasse après utilisation',
          ].map((tip, i) => (
            <Row key={i} center gap={10} style={{ paddingVertical: 7 }}>
              <Icon name="ellipse" size={6} color={COLORS.textTertiary} />
              <Text style={b.tipText}>{tip}</Text>
            </Row>
          ))}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const b = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: COLORS.bg },
  scroll:    { padding: 16, gap: 12, paddingBottom: 32 },
  pageIntro: { ...TYPOGRAPHY.body, color: COLORS.textSecondary },
  errorBox:  {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: COLORS.dangerBg, borderRadius: RADIUS.md, padding: 12,
  },
  errorText: { ...TYPOGRAPHY.sm, color: COLORS.dangerText, flex: 1 },

  // Sticky footer
  stickyFooter: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 10,
  },

  // Validate
  validateScreen:  { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 16 },
  validateIcon:    {
    width: 80, height: 80, borderRadius: 24, backgroundColor: COLORS.primarySoft,
    alignItems: 'center', justifyContent: 'center',
  },
  validateTitle:   { ...TYPOGRAPHY.h2, color: COLORS.textPrimary, textAlign: 'center' },
  validateSub:     { ...TYPOGRAPHY.body, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 24 },
  ruleCard:        { width: '100%' },
  ruleText:        { ...TYPOGRAPHY.smM, color: COLORS.infoText, flex: 1 },
  validateActions: { width: '100%', gap: 10, marginTop: 8 },

  // Grid boissons
  boissonGrid:       { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  boissonCard:       {
    width: '47.5%', backgroundColor: COLORS.surface, borderRadius: RADIUS.lg,
    padding: 12, alignItems: 'center', gap: 8,
    borderWidth: 1.5, borderColor: COLORS.border,
  },
  boissonCardActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primarySoft },

  // Image / icon box
  boissonImgBox:      {
    width: 72, height: 72, borderRadius: RADIUS.md,
    backgroundColor: COLORS.gray50,
    alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
  },
  boissonImgBoxActive: { backgroundColor: COLORS.primary },
  boissonImg:          { width: 72, height: 72, borderRadius: RADIUS.md },

  boissonName:  { ...TYPOGRAPHY.smM, color: COLORS.textPrimary, fontWeight: '600', textAlign: 'center' },
  boissonPrice: { ...TYPOGRAPHY.xs, color: COLORS.textTertiary, fontWeight: '500' },
  guideLink:    { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  guideLinkText:{ ...TYPOGRAPHY.xs, color: COLORS.primary, fontWeight: '600' },

  // Confirm
  confirmScreen:  { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  confirmCheck:   { width: 72, height: 72, borderRadius: 36, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  confirmTitle:   { ...TYPOGRAPHY.h2, color: COLORS.textPrimary, textAlign: 'center' },
  confirmSub:     { ...TYPOGRAPHY.body, color: COLORS.textSecondary, textAlign: 'center', marginTop: 10, lineHeight: 24 },
  guideBtn:       {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginTop: 20, backgroundColor: COLORS.primarySoft,
    borderRadius: RADIUS.full, paddingHorizontal: 18, paddingVertical: 10,
  },
  guideBtnText:   { ...TYPOGRAPHY.smM, color: COLORS.primary },

  // Guide machine
  videoBox: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: COLORS.gray900, borderRadius: RADIUS.lg, padding: 20,
  },
  videoPlay:  { width: 50, height: 50, borderRadius: 25, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  videoTitle: { ...TYPOGRAPHY.bodyM, color: COLORS.white, fontWeight: '600' },
  videoSub:   { ...TYPOGRAPHY.xs, color: COLORS.gray400, marginTop: 2 },
  guideTitle: { ...TYPOGRAPHY.h4, color: COLORS.textPrimary },
  stepRow:    { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 14 },
  stepRowDone:{ opacity: 0.55 },
  stepNum:    {
    width: 30, height: 30, borderRadius: 15,
    borderWidth: 2, borderColor: COLORS.border,
    backgroundColor: COLORS.gray50, alignItems: 'center', justifyContent: 'center',
  },
  stepNumDone:  { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  stepNumText:  { ...TYPOGRAPHY.smM, color: COLORS.textPrimary, fontWeight: '600' },
  stepText:     { flex: 1, ...TYPOGRAPHY.body, color: COLORS.textPrimary },
  stepTextDone: { textDecorationLine: 'line-through', color: COLORS.textTertiary },
  allDoneCard:  { backgroundColor: COLORS.successBg, borderColor: `${COLORS.success}30` },
  allDoneText:  { ...TYPOGRAPHY.smM, color: COLORS.successText, flex: 1 },
  tipsTitle:    { ...TYPOGRAPHY.h4, color: COLORS.textPrimary, marginBottom: 8 },
  tipText:      { ...TYPOGRAPHY.sm, color: COLORS.textSecondary, flex: 1 },
});
