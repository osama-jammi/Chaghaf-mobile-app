// ─── Chaghaf · Snacks Screens v2 ─────────────────────────────────
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, FlatList, ActivityIndicator, Image, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, RADIUS, TYPOGRAPHY } from '../../constants/colors';
import { Card, Button, Header, Icon, Badge, Divider, Row } from '../../components';
import { SnackApi } from '../../services/api';
import { useFetch } from '../../hooks/useApi';

// Helper image
const getImageSource = (item) => {
  if (item?.imageBase64) {
    const mime = item.imageMimeType || 'image/jpeg';
    return { uri: `data:${mime};base64,${item.imageBase64}` };
  }
  return null;
};

// ══════════════════════════════════════════════════════════════════
// Menu snacks
// ══════════════════════════════════════════════════════════════════
export function MenuSnacksScreen({ navigation }) {
  const [cart, setCart] = useState({});
  const { data: catalog, loading, error: listError } = useFetch(SnackApi.getCatalog, []);

  const snacks     = catalog || [];
  const categories = [...new Set(snacks.map(s => s.category).filter(Boolean))];

  const add    = (id) => setCart(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  const remove = (id) => setCart(prev => {
    const n = { ...prev };
    if (n[id] > 1) n[id]--;
    else delete n[id];
    return n;
  });

  const totalItems = Object.values(cart).reduce((a, b) => a + b, 0);
  const totalPrice = Object.entries(cart).reduce((sum, [id, qty]) => {
    const item = snacks.find(s => String(s.id) === String(id));
    return sum + (item?.price || 0) * qty;
  }, 0);

  return (
    <SafeAreaView style={sn.safe} edges={['top']}>
      <Header
        title="Snacks & Boissons"
        onBack={() => navigation.goBack()}
        right={
          totalItems > 0 ? (
            <TouchableOpacity
              style={sn.cartBadge}
              onPress={() => navigation.navigate('Panier', { cart, totalPrice, snacks })}
            >
              <Icon name="bag-outline" size={17} color={COLORS.white} />
              <Text style={sn.cartBadgeText}>{totalItems}</Text>
            </TouchableOpacity>
          ) : <View style={{ width: 40 }} />
        }
      />

      <View style={sn.partnerBar}>
        <Icon name="storefront-outline" size={14} color={COLORS.textSecondary} />
        <Text style={sn.partnerText}>Partenaire Chaghaf · Livraison sur place</Text>
      </View>

      {/* Contenu scrollable + bouton sticky */}
      <View style={{ flex: 1 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[sn.scroll, { paddingBottom: totalItems > 0 ? 110 : 32 }]}
        >
          {listError && (
            <View style={sn.errorBox}>
              <Icon name="alert-circle-outline" size={15} color={COLORS.dangerText} />
              <Text style={sn.errorText}>{listError}</Text>
            </View>
          )}

          {loading ? (
            <ActivityIndicator color={COLORS.primary} style={{ marginTop: 40 }} />
          ) : snacks.length === 0 && !listError ? (
            <Text style={{ textAlign: 'center', color: COLORS.textSecondary, marginTop: 24 }}>
              Aucun produit disponible pour le moment.
            </Text>
          ) : (
            categories.map(cat => (
              <View key={cat}>
                <Text style={sn.catTitle}>{cat}</Text>
                <Card padding={0}>
                  {snacks.filter(s => s.category === cat).map((item, idx, arr) => {
                    const imgSource = getImageSource(item);
                    const qty       = cart[item.id] || 0;
                    return (
                      <View key={item.id}>
                        <View style={sn.itemRow}>
                          {/* Image ou icône */}
                          <View style={sn.itemImgBox}>
                            {imgSource ? (
                              <Image
                                source={imgSource}
                                style={sn.itemImg}
                                resizeMode="cover"
                              />
                            ) : (
                              <Text style={sn.itemEmoji}>
                                {item.emoji || '🍽️'}
                              </Text>
                            )}
                          </View>

                          <View style={{ flex: 1 }}>
                            <Text style={sn.itemName}>{item.name}</Text>
                            {item.description ? (
                              <Text style={sn.itemDesc} numberOfLines={1}>
                                {item.description}
                              </Text>
                            ) : null}
                            <Text style={sn.itemPrice}>{item.price} dh</Text>
                          </View>

                          <View style={sn.qtyRow}>
                            {qty > 0 && (
                              <>
                                <TouchableOpacity style={sn.qtyBtn} onPress={() => remove(item.id)}>
                                  <Icon name="remove" size={14} color={COLORS.primary} />
                                </TouchableOpacity>
                                <Text style={sn.qtyNum}>{qty}</Text>
                              </>
                            )}
                            <TouchableOpacity style={[sn.qtyBtn, sn.qtyBtnAdd]} onPress={() => add(item.id)}>
                              <Icon name="add" size={14} color={COLORS.white} />
                            </TouchableOpacity>
                          </View>
                        </View>
                        {idx < arr.length - 1 && <Divider inset={72} />}
                      </View>
                    );
                  })}
                </Card>
              </View>
            ))
          )}
        </ScrollView>

        {/* Bouton sticky commander */}
        {totalItems > 0 && (
          <View style={sn.stickyFooter}>
            <Button
              title={`Commander · ${totalItems} article${totalItems > 1 ? 's' : ''} · ${totalPrice} dh`}
              onPress={() => navigation.navigate('Panier', { cart, totalPrice, snacks })}
              size="lg"
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

// ══════════════════════════════════════════════════════════════════
// Panier
// ══════════════════════════════════════════════════════════════════
export function PanierScreen({ navigation, route }) {
  const initialCart = route?.params?.cart || {};
  const allSnacks   = route?.params?.snacks || [];
  const [cart,    setCart]    = useState(initialCart);
  const [note,    setNote]    = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const add    = (id) => setCart(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  const remove = (id) => setCart(prev => {
    const n = { ...prev };
    if (n[id] > 1) n[id]--;
    else delete n[id];
    return n;
  });

  const items = Object.entries(cart).map(([id, qty]) => ({
    ...allSnacks.find(s => String(s.id) === String(id)), qty,
  })).filter(i => i.id);

  const total = items.reduce((s, i) => s + (i.price || 0) * i.qty, 0);

  const handleOrder = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = items.map(i => ({ id: i.id, name: i.name, price: i.price, quantity: i.qty }));
      const order   = await SnackApi.createOrder(payload, note);
      navigation.navigate('SuiviCommande', { orderId: order.id ?? `CH-${Date.now()}`, total });
    } catch (e) {
      setError(e.message || 'Erreur lors de la commande');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={sn.safe} edges={['top']}>
      <Header title="Mon panier" onBack={() => navigation.goBack()} />

      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={[sn.scroll, { paddingBottom: 120 }]}>
          {error && (
            <View style={sn.errorBox}>
              <Icon name="alert-circle-outline" size={15} color={COLORS.dangerText} />
              <Text style={sn.errorText}>{error}</Text>
            </View>
          )}

          <Card padding={0}>
            {items.map((item, i) => {
              const imgSource = getImageSource(item);
              return (
                <View key={item.id}>
                  <View style={sn.panierRow}>
                    <View style={sn.itemImgBox}>
                      {imgSource ? (
                        <Image source={imgSource} style={sn.itemImg} resizeMode="cover" />
                      ) : (
                        <Text style={sn.itemEmoji}>{item.emoji || '🍽️'}</Text>
                      )}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={sn.itemName}>{item.name}</Text>
                      <Text style={sn.itemPriceSub}>{item.price} dh/unité</Text>
                    </View>
                    <View style={sn.qtyRow}>
                      <TouchableOpacity style={sn.qtyBtn} onPress={() => remove(item.id)}>
                        <Icon name="remove" size={14} color={COLORS.primary} />
                      </TouchableOpacity>
                      <Text style={sn.qtyNum}>{item.qty}</Text>
                      <TouchableOpacity style={[sn.qtyBtn, sn.qtyBtnAdd]} onPress={() => add(item.id)}>
                        <Icon name="add" size={14} color={COLORS.white} />
                      </TouchableOpacity>
                    </View>
                    <Text style={sn.panierLineTotal}>{item.price * item.qty} dh</Text>
                  </View>
                  {i < items.length - 1 && <Divider inset={72} />}
                </View>
              );
            })}
          </Card>

          <Card>
            <Text style={sn.noteLabel}>Instructions de livraison</Text>
            <TextInput
              style={sn.noteInput}
              value={note}
              onChangeText={setNote}
              placeholder="Ex : Pas trop de sauce..."
              placeholderTextColor={COLORS.textDisabled}
              multiline
            />
          </Card>

          <Card>
            {[
              ['Sous-total',   `${total} dh`, false],
              ['Livraison',    'Offerte',      true ],
              ['Délai estimé', '~10 min',      false],
            ].map(([label, value, green]) => (
              <View key={label} style={sn.sumRow}>
                <Text style={sn.sumLabel}>{label}</Text>
                <Text style={[sn.sumValue, green && { color: COLORS.success }]}>{value}</Text>
              </View>
            ))}
            <View style={[sn.sumRow, sn.sumTotal]}>
              <Text style={sn.totalLabel}>Total</Text>
              <Text style={sn.totalValue}>{total} dh</Text>
            </View>
          </Card>
        </ScrollView>

        {/* Bouton sticky */}
        <View style={sn.stickyFooter}>
          <Button
            title={loading ? 'Traitement…' : `Commander · ${total} dh`}
            onPress={handleOrder}
            loading={loading}
            size="lg"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

// ══════════════════════════════════════════════════════════════════
// Suivi commande
// ══════════════════════════════════════════════════════════════════
export function SuiviCommandeScreen({ navigation, route }) {
  const { orderId = 'CH-247', total = 72 } = route?.params || {};

  const steps = [
    { id: 1, label: 'Commande reçue',      done: true,  active: false },
    { id: 2, label: 'En préparation',      done: false, active: true  },
    { id: 3, label: 'En route vers vous',  done: false, active: false },
    { id: 4, label: 'Livré à votre table', done: false, active: false },
  ];

  return (
    <SafeAreaView style={sn.safe} edges={['top']}>
      <Header title="Suivi commande" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={sn.scroll}>

        <Card>
          <Row center between>
            <View>
              <Text style={sn.orderNum}>Commande #{orderId}</Text>
              <Text style={sn.orderTime}>
                {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
            <Badge label={`${total} dh`} variant="primary" />
          </Row>
        </Card>

        <Card>
          <Text style={sn.timelineTitle}>Statut de livraison</Text>
          {steps.map((step, i) => (
            <View key={step.id} style={sn.timelineRow}>
              <View style={sn.timelineLeft}>
                <View style={[sn.timelineDot, step.done && sn.dotDone, step.active && sn.dotActive]}>
                  {step.done
                    ? <Icon name="checkmark" size={12} color={COLORS.white} />
                    : step.active
                      ? <View style={sn.dotInner} />
                      : null
                  }
                </View>
                {i < steps.length - 1 && (
                  <View style={[sn.timelineLine, step.done && sn.lineDone]} />
                )}
              </View>
              <Text style={[
                sn.timelineLabel,
                step.done && sn.labelDone,
                step.active && sn.labelActive,
              ]}>
                {step.label}
              </Text>
            </View>
          ))}
        </Card>

        <View style={sn.etaBar}>
          <View style={sn.etaIconBox}>
            <Icon name="time-outline" size={20} color={COLORS.primary} />
          </View>
          <View>
            <Text style={sn.etaLabel}>Livraison estimée</Text>
            <Text style={sn.etaValue}>~10 minutes</Text>
          </View>
        </View>

        <Card>
          <Text style={sn.contactTitle}>Un problème avec votre commande ?</Text>
          <TouchableOpacity style={sn.contactBtn} onPress={() => navigation.navigate('Social')}>
            <Icon name="chatbubble-outline" size={15} color={COLORS.primary} />
            <Text style={sn.contactBtnText}>Contacter le staff</Text>
          </TouchableOpacity>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const sn = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: COLORS.bg },
  scroll:     { padding: 16, gap: 12 },
  partnerBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 10, paddingHorizontal: 16,
    backgroundColor: COLORS.gray50,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  partnerText: { ...TYPOGRAPHY.xs, color: COLORS.textSecondary, fontWeight: '500' },
  errorBox:   {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: COLORS.dangerBg, borderRadius: RADIUS.md, padding: 12,
  },
  errorText:  { ...TYPOGRAPHY.sm, color: COLORS.dangerText, flex: 1 },

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

  catTitle:     { ...TYPOGRAPHY.label, color: COLORS.textTertiary, marginBottom: 8, marginTop: 4 },

  // Item row
  itemRow:      { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 },
  itemImgBox:   {
    width: 52, height: 52, borderRadius: RADIUS.md,
    backgroundColor: COLORS.gray50,
    alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
  },
  itemImg:      { width: 52, height: 52 },
  itemEmoji:    { fontSize: 26 },
  itemName:     { ...TYPOGRAPHY.bodyM, color: COLORS.textPrimary, fontWeight: '500' },
  itemDesc:     { ...TYPOGRAPHY.xs, color: COLORS.textTertiary, marginTop: 2 },
  itemPrice:    { ...TYPOGRAPHY.smM, color: COLORS.primary, marginTop: 3 },
  itemPriceSub: { ...TYPOGRAPHY.xs, color: COLORS.textTertiary, marginTop: 2 },

  qtyRow:    { flexDirection: 'row', alignItems: 'center', gap: 6 },
  qtyBtn:    { width: 28, height: 28, borderRadius: 14, borderWidth: 1.5, borderColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  qtyBtnAdd: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  qtyNum:    { ...TYPOGRAPHY.bodyM, color: COLORS.textPrimary, minWidth: 18, textAlign: 'center' },

  cartBadge:     {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: COLORS.primary, borderRadius: RADIUS.full,
    paddingHorizontal: 10, paddingVertical: 6,
  },
  cartBadgeText: { ...TYPOGRAPHY.xs, color: COLORS.white, fontWeight: '700' },

  // Panier
  panierRow:       { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 },
  panierLineTotal: { ...TYPOGRAPHY.bodyM, color: COLORS.primary, fontWeight: '700', minWidth: 52, textAlign: 'right' },
  noteLabel:       { ...TYPOGRAPHY.smM, color: COLORS.textSecondary, marginBottom: 8 },
  noteInput:       {
    backgroundColor: COLORS.gray50, borderRadius: RADIUS.sm, padding: 12,
    ...TYPOGRAPHY.body, color: COLORS.textPrimary,
    borderWidth: 1, borderColor: COLORS.border, minHeight: 64,
    textAlignVertical: 'top',
  },
  sumRow:      { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  sumLabel:    { ...TYPOGRAPHY.sm, color: COLORS.textSecondary },
  sumValue:    { ...TYPOGRAPHY.smM, color: COLORS.textPrimary, fontWeight: '500' },
  sumTotal:    { borderBottomWidth: 0, paddingTop: 12 },
  totalLabel:  { ...TYPOGRAPHY.bodyM, color: COLORS.textPrimary, fontWeight: '600' },
  totalValue:  { fontSize: 20, fontWeight: '700', color: COLORS.primary },

  // Order / suivi
  orderNum:  { ...TYPOGRAPHY.bodyM, color: COLORS.textPrimary, fontWeight: '600' },
  orderTime: { ...TYPOGRAPHY.xs, color: COLORS.textTertiary, marginTop: 2 },

  timelineTitle: { ...TYPOGRAPHY.h4, color: COLORS.textPrimary, marginBottom: 16 },
  timelineRow:   { flexDirection: 'row', alignItems: 'flex-start', gap: 14, marginBottom: 4 },
  timelineLeft:  { alignItems: 'center', width: 24 },
  timelineDot:   {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: COLORS.gray100, borderWidth: 2, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
  },
  dotDone:       { backgroundColor: COLORS.success, borderColor: COLORS.success },
  dotActive:     { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  dotInner:      { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.white },
  timelineLine:  { width: 2, height: 22, backgroundColor: COLORS.border, marginVertical: 2 },
  lineDone:      { backgroundColor: COLORS.success },
  timelineLabel: { flex: 1, ...TYPOGRAPHY.sm, color: COLORS.textTertiary, paddingTop: 4 },
  labelDone:     { color: COLORS.successText, fontWeight: '500' },
  labelActive:   { color: COLORS.primary, fontWeight: '600' },

  etaBar:    {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: 16,
    borderWidth: 1, borderColor: COLORS.border,
    borderLeftWidth: 3, borderLeftColor: COLORS.primary,
  },
  etaIconBox:{ width: 40, height: 40, borderRadius: RADIUS.md, backgroundColor: COLORS.primarySoft, alignItems: 'center', justifyContent: 'center' },
  etaLabel:  { ...TYPOGRAPHY.xs, color: COLORS.textTertiary },
  etaValue:  { fontSize: 18, fontWeight: '700', color: COLORS.primary, marginTop: 2 },

  contactTitle:   { ...TYPOGRAPHY.sm, color: COLORS.textSecondary, marginBottom: 10 },
  contactBtn:     {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: COLORS.primarySoft, borderRadius: RADIUS.sm,
    paddingVertical: 10, paddingHorizontal: 14, alignSelf: 'flex-start',
  },
  contactBtnText: { ...TYPOGRAPHY.smM, color: COLORS.primary },
});
