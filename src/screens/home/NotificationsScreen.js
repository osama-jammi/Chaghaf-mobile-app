// ─── Chaghaf · Notifications Screen ──────────────────────────────
import React, { useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, RADIUS, TYPOGRAPHY } from '../../constants/colors';
import { Card, Header, Icon, Row } from '../../components';
import { NotificationApi } from '../../services/api';
import { useFetch } from '../../hooks/useApi';

const ICONS = {
  RESERVATION:           'calendar-outline',
  SUBSCRIPTION:          'card-outline',
  SUBSCRIPTION_REQUEST:  'document-text-outline',
  DAY_ACCESS:            'ticket-outline',
  BOISSON:               'cafe-outline',
  CHECK_IN:              'enter-outline',
  SNACK_ORDER:           'restaurant-outline',
  SYSTEM:                'megaphone-outline',
};

// Date complète : "il y a Xmin" pour <1h, sinon "JJ MMM · HH:MM"
const formatFullDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const now = new Date();
  const diffMin = Math.floor((now - d) / 60000);
  if (diffMin < 1) return "À l'instant";
  if (diffMin < 60) return `Il y a ${diffMin} min`;
  const sameDay = d.toDateString() === now.toDateString();
  const time = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  if (sameDay) return `Aujourd'hui · ${time}`;
  const yesterday = new Date(now); yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return `Hier · ${time}`;
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) + ' · ' + time;
};

export function NotificationsScreen({ navigation }) {
  const { data, loading, error, refetch } = useFetch(NotificationApi.getAll, []);

  // Tri : non-lus (envoyés/nouveaux) en haut, puis lus, par date desc
  const list = useMemo(() => {
    const arr = Array.isArray(data) ? data : (data?.content || []);
    return [...arr].sort((a, b) => {
      const aRead = a.read ? 1 : 0;
      const bRead = b.read ? 1 : 0;
      if (aRead !== bRead) return aRead - bRead;
      const ad = new Date(a.createdAt || 0).getTime();
      const bd = new Date(b.createdAt || 0).getTime();
      return bd - ad;
    });
  }, [data]);

  const unreadCount = list.filter(n => !n.read).length;

  const handleMarkAllRead = async () => {
    try {
      await NotificationApi.markAllRead();
      refetch && refetch();
    } catch (e) {}
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <Header
        title="Notifications"
        onBack={() => navigation.goBack()}
        right={
          unreadCount > 0 ? (
            <TouchableOpacity onPress={handleMarkAllRead} style={s.markAllBtn}>
              <Icon name="checkmark-done-outline" size={18} color={COLORS.primary} />
            </TouchableOpacity>
          ) : null
        }
      />

      {/* Compteur en tête : nombre de notifications */}
      {!loading && list.length > 0 && (
        <View style={s.countBar}>
          <View style={s.countPill}>
            <Text style={s.countPillText}>{list.length}</Text>
          </View>
          <Text style={s.countLabel}>
            {unreadCount > 0
              ? `${unreadCount} non lue${unreadCount > 1 ? 's' : ''} sur ${list.length}`
              : `${list.length} notification${list.length > 1 ? 's' : ''}`}
          </Text>
        </View>
      )}

      {loading ? (
        <ActivityIndicator color={COLORS.primary} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView
          contentContainerStyle={s.scroll}
          refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} tintColor={COLORS.primary} />}
        >
          {error ? (
            <Card><Text style={s.errorText}>{error}</Text></Card>
          ) : list.length === 0 ? (
            <View style={s.empty}>
              <Icon name="notifications-off-outline" size={48} color={COLORS.textDisabled} />
              <Text style={s.emptyText}>Aucune notification pour le moment</Text>
              <Text style={s.emptyHint}>Les notifications de plus de 2 jours sont supprimées automatiquement.</Text>
            </View>
          ) : (
            <>
              {unreadCount > 0 && (
                <Text style={s.sectionLabel}>Nouvelles · envoyées</Text>
              )}
              {list.map((n, idx) => {
                // Insère le séparateur "déjà lues" entre la dernière non-lue et la première lue
                const showReadHeader = idx > 0 && !list[idx - 1].read && n.read;
                return (
                  <React.Fragment key={n.id}>
                    {showReadHeader && (
                      <Text style={[s.sectionLabel, { marginTop: 12 }]}>Déjà lues</Text>
                    )}
                    <Card style={[s.notifCard, !n.read && s.notifUnread]} padding={14}>
                      <Row gap={12}>
                        <View style={[s.iconBox, !n.read && s.iconBoxUnread]}>
                          <Icon
                            name={ICONS[n.type] || 'notifications-outline'}
                            size={18}
                            color={!n.read ? COLORS.primary : COLORS.textSecondary}
                          />
                        </View>
                        <View style={{ flex: 1 }}>
                          <View style={s.notifHeader}>
                            <Text style={[s.notifTitle, !n.read && { fontWeight: '700' }]} numberOfLines={1}>
                              {n.title}
                            </Text>
                            {!n.read && <View style={s.unreadDot} />}
                          </View>
                          {n.body ? <Text style={s.notifBody}>{n.body}</Text> : null}
                          <View style={s.notifFooter}>
                            <Icon name="time-outline" size={12} color={COLORS.textTertiary} />
                            <Text style={s.notifTime}>{formatFullDate(n.createdAt)}</Text>
                          </View>
                        </View>
                      </Row>
                    </Card>
                  </React.Fragment>
                );
              })}
            </>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: COLORS.bg },
  scroll:     { padding: 16, gap: 8, paddingBottom: 32 },
  markAllBtn: {
    width: 36, height: 36, borderRadius: RADIUS.md,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center', justifyContent: 'center',
  },
  countBar:    {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  countPill:   {
    minWidth: 28, height: 22, borderRadius: 11,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    alignItems: 'center', justifyContent: 'center',
  },
  countPillText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  countLabel:    { ...TYPOGRAPHY.sm, color: COLORS.textSecondary, flex: 1 },
  sectionLabel:  { ...TYPOGRAPHY.label, color: COLORS.textTertiary, marginTop: 4, marginBottom: 6 },
  notifCard:    { backgroundColor: COLORS.surface },
  notifUnread:  { backgroundColor: COLORS.primarySoft, borderColor: COLORS.primary, borderWidth: 1 },
  iconBox:      {
    width: 38, height: 38, borderRadius: RADIUS.md,
    backgroundColor: COLORS.gray50,
    alignItems: 'center', justifyContent: 'center',
  },
  iconBoxUnread:{ backgroundColor: COLORS.primarySoft },
  notifHeader:  { flexDirection: 'row', alignItems: 'center', gap: 8 },
  notifTitle:   { ...TYPOGRAPHY.bodyM, color: COLORS.textPrimary, fontWeight: '500', flex: 1 },
  unreadDot:    { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary },
  notifBody:    { ...TYPOGRAPHY.sm, color: COLORS.textSecondary, marginTop: 4, lineHeight: 19 },
  notifFooter:  { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  notifTime:    { ...TYPOGRAPHY.xs, color: COLORS.textTertiary },
  empty:        { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 8 },
  emptyText:    { ...TYPOGRAPHY.body, color: COLORS.textTertiary },
  emptyHint:    { ...TYPOGRAPHY.xs, color: COLORS.textDisabled, textAlign: 'center', paddingHorizontal: 32 },
  errorText:    { ...TYPOGRAPHY.sm, color: COLORS.dangerText },
});
