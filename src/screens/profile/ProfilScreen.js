// ─── Chaghaf · Profile Screen v2 ─────────────────────────────────
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, RADIUS, TYPOGRAPHY } from '../../constants/colors';
import { Card, Avatar, Badge, Divider, Icon, Row, ListItem } from '../../components';
import { useAuth } from '../../context/AuthContext';
import { SubscriptionApi } from '../../services/api';
import { useFetch } from '../../hooks/useApi';

export function ProfilScreen({ navigation }) {
  const { user, logout } = useAuth();
  const { data: activeSub } = useFetch(SubscriptionApi.getActive, [], { initialData: null });

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Déconnecter', style: 'destructive', onPress: logout },
      ],
    );
  };

  const letter = user?.avatarLetter || user?.fullName?.charAt(0) || '?';

  const menuSections = [
    {
      title: 'Mon compte',
      items: [
        { icon: 'person-outline',       label: 'Mes informations',    sub: 'Nom, email, téléphone',   onPress: null },
        { icon: 'calendar-outline',     label: 'Mes réservations',    sub: 'Historique et à venir',   onPress: null },
        { icon: 'card-outline',         label: 'Mon abonnement',      sub: activeSub ? `Pack ${activeSub.packType?.replace('_', ' ')}` : 'Aucun pack actif', onPress: () => navigation.navigate('Abonnement') },
      ],
    },
    {
      title: 'Préférences',
      items: [
        { icon: 'notifications-outline', label: 'Notifications',      sub: 'Gérer vos alertes',        onPress: null },
        { icon: 'shield-outline',        label: 'Confidentialité',     sub: 'Données et sécurité',      onPress: null },
        { icon: 'help-circle-outline',   label: 'Aide',                sub: 'FAQ et support',           onPress: null },
      ],
    },
    {
      title: '',
      items: [
        { icon: 'log-out-outline', label: 'Se déconnecter', sub: null, onPress: handleLogout, destructive: true },
      ],
    },
  ];

  return (
    <SafeAreaView style={p.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={p.scroll}>

        {/* Profile hero */}
        <View style={p.hero}>
          <Avatar letter={letter} size={68} />
          <Text style={p.heroName}>{user?.fullName ?? 'Utilisateur'}</Text>
          <Text style={p.heroEmail}>{user?.email}</Text>
          <View style={p.heroMeta}>
            <Badge label={user?.role === 'ADMIN' ? 'Administrateur' : 'Membre'} variant="primary" />
            {activeSub && (
              <Badge label={`Pack ${activeSub.packType?.replace('_', ' ')}`} variant="default" />
            )}
          </View>
        </View>

        {/* Subscription card */}
        {activeSub && (
          <Card onPress={() => navigation.navigate('Abonnement')}>
            <Row center between>
              <View style={{ flex: 1 }}>
                <Text style={p.subCardLabel}>Abonnement actif</Text>
                <Text style={p.subCardName}>
                  Pack {activeSub.packType?.replace('_', ' ')} · {activeSub.personsCount} personne{activeSub.personsCount > 1 ? 's' : ''}
                </Text>
                <Row center gap={12} style={{ marginTop: 6 }}>
                  <Row center gap={5}>
                    <Icon name="calendar-outline" size={13} color={COLORS.textTertiary} />
                    <Text style={p.subCardMeta}>Expire le {activeSub.endDate}</Text>
                  </Row>
                  <Row center gap={5}>
                    <Icon name="time-outline" size={13} color={COLORS.textTertiary} />
                    <Text style={p.subCardMeta}>{activeSub.daysLeft} jours restants</Text>
                  </Row>
                </Row>
              </View>
              <Badge
                label={activeSub.status === 'ACTIVE' ? 'Actif' : activeSub.status}
                variant={activeSub.status === 'ACTIVE' ? 'success' : 'warning'}
                dot
              />
            </Row>
          </Card>
        )}

        {/* Stats */}
        <Card>
          <View style={p.statsRow}>
            {[
              { label: 'Sessions',  value: '127', icon: 'pulse-outline'   },
              { label: 'Ce mois',   value: '42h', icon: 'time-outline'    },
              { label: 'Série',     value: '8j',  icon: 'flame-outline'   },
            ].map((stat, i, arr) => (
              <React.Fragment key={stat.label}>
                <View style={p.statItem}>
                  <Text style={p.statValue}>{stat.value}</Text>
                  <Text style={p.statLabel}>{stat.label}</Text>
                </View>
                {i < arr.length - 1 && <View style={p.statDivider} />}
              </React.Fragment>
            ))}
          </View>
        </Card>

        {/* Menu sections */}
        {menuSections.map((section, si) => (
          <View key={si}>
            {section.title ? (
              <Text style={p.sectionTitle}>{section.title}</Text>
            ) : null}
            <Card padding={0}>
              {section.items.map((item, ii) => (
                <View key={item.label}>
                  <TouchableOpacity
                    style={p.menuRow}
                    onPress={item.onPress}
                    disabled={!item.onPress}
                    activeOpacity={item.onPress ? 0.7 : 1}
                  >
                    <View style={[p.menuIconBox, item.destructive && p.menuIconBoxDanger]}>
                      <Icon
                        name={item.icon}
                        size={17}
                        color={item.destructive ? COLORS.danger : COLORS.textSecondary}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[p.menuLabel, item.destructive && { color: COLORS.danger }]}>
                        {item.label}
                      </Text>
                      {item.sub && <Text style={p.menuSub}>{item.sub}</Text>}
                    </View>
                    {item.onPress && !item.destructive && (
                      <Icon name="chevron-forward" size={15} color={COLORS.textDisabled} />
                    )}
                  </TouchableOpacity>
                  {ii < section.items.length - 1 && <Divider inset={58} />}
                </View>
              ))}
            </Card>
          </View>
        ))}

        <Text style={p.footer}>Chaghaf App · v2.0 · Agadir, Maroc</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const p = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: COLORS.bg },
  scroll: { padding: 16, gap: 12, paddingBottom: 40 },

  // Hero
  hero:      { alignItems: 'center', paddingVertical: 24, gap: 8 },
  heroName:  { ...TYPOGRAPHY.h2, color: COLORS.textPrimary },
  heroEmail: { ...TYPOGRAPHY.sm, color: COLORS.textSecondary },
  heroMeta:  { flexDirection: 'row', gap: 8, marginTop: 4 },

  // Sub card
  subCardLabel: { ...TYPOGRAPHY.xs, color: COLORS.textTertiary, marginBottom: 4 },
  subCardName:  { ...TYPOGRAPHY.h4, color: COLORS.textPrimary },
  subCardMeta:  { ...TYPOGRAPHY.xs, color: COLORS.textTertiary },

  // Stats
  statsRow:    { flexDirection: 'row', paddingVertical: 4 },
  statItem:    { flex: 1, alignItems: 'center', gap: 3 },
  statValue:   { ...TYPOGRAPHY.h3, color: COLORS.textPrimary },
  statLabel:   { ...TYPOGRAPHY.xs, color: COLORS.textTertiary },
  statDivider: { width: 1, backgroundColor: COLORS.border },

  // Section title
  sectionTitle: { ...TYPOGRAPHY.label, color: COLORS.textTertiary, marginTop: 6, marginBottom: 8 },

  // Menu
  menuRow:       { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  menuIconBox:   { width: 34, height: 34, borderRadius: RADIUS.sm, backgroundColor: COLORS.gray50, alignItems: 'center', justifyContent: 'center' },
  menuIconBoxDanger: { backgroundColor: COLORS.dangerBg },
  menuLabel:     { ...TYPOGRAPHY.bodyM, color: COLORS.textPrimary, fontWeight: '500' },
  menuSub:       { ...TYPOGRAPHY.xs, color: COLORS.textTertiary, marginTop: 1 },

  footer:    { textAlign: 'center', ...TYPOGRAPHY.xs, color: COLORS.textDisabled, marginTop: 8 },
});
