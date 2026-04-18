// ─── Chaghaf · Social Screens v2 ─────────────────────────────────
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  FlatList, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, RADIUS, TYPOGRAPHY } from '../../constants/colors';
import { Avatar, Badge, Button, Header, Icon, Divider, Row, Card } from '../../components';
import { SocialApi } from '../../services/api';
import { useFetch } from '../../hooks/useApi';
import { useAuth } from '../../context/AuthContext';

// ══════════════════════════════════════════════════════════════════
// Fil de posts
// ══════════════════════════════════════════════════════════════════
export function PostsScreen({ navigation }) {
  const { data: posts, loading, refetch } = useFetch(() => SocialApi.getPosts(0, 20), []);
  const [liked, setLiked] = useState({});

  const toggleLike = async (id) => {
    setLiked(prev => ({ ...prev, [id]: !prev[id] }));
    try { await SocialApi.toggleLike(id); }
    catch { setLiked(prev => ({ ...prev, [id]: !prev[id] })); }
  };

  const list = Array.isArray(posts) ? posts : (posts?.content || []);

  return (
    <SafeAreaView style={sc.safe} edges={['top']}>
      {/* Header */}
      <View style={sc.pageHeader}>
        <Text style={sc.pageTitle}>Communauté</Text>
        <TouchableOpacity
          style={sc.newPostBtn}
          onPress={() => navigation.navigate('CreerPost', { onRefresh: refetch })}
        >
          <Icon name="create-outline" size={18} color={COLORS.primary} />
          <Text style={sc.newPostBtnText}>Publier</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color={COLORS.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={list}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={sc.feed}
          showsVerticalScrollIndicator={false}
          onRefresh={refetch}
          refreshing={loading}
          renderItem={({ item }) => (
            <View style={[sc.postCard, item.isOfficial && sc.postCardOfficial]}>
              <View style={sc.postHeader}>
                <Avatar letter={item.avatarLetter || item.avatar || '?'} size={38} />
                <View style={{ flex: 1 }}>
                  <View style={sc.postAuthorRow}>
                    <Text style={sc.postAuthorName}>{item.authorName || item.author}</Text>
                    {item.isOfficial && <Badge label="Staff" variant="primary" style={{ marginLeft: 6 }} />}
                  </View>
                  <Text style={sc.postMeta}>
                    {item.role || 'Membre'} · {item.createdAt || item.time}
                  </Text>
                </View>
              </View>

              <Text style={sc.postBody}>{item.content || item.text}</Text>

              <View style={sc.postActions}>
                <TouchableOpacity style={sc.postAction} onPress={() => toggleLike(item.id)}>
                  <Icon
                    name={liked[item.id] ? 'heart' : 'heart-outline'}
                    size={17}
                    color={liked[item.id] ? '#EF4444' : COLORS.textTertiary}
                  />
                  <Text style={[sc.postActionText, liked[item.id] && { color: '#EF4444' }]}>
                    {(item.likesCount || item.likes || 0) + (liked[item.id] ? 1 : 0)}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={sc.postAction}>
                  <Icon name="chatbubble-outline" size={16} color={COLORS.textTertiary} />
                  <Text style={sc.postActionText}>{item.commentsCount || item.comments || 0}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={sc.postAction}>
                  <Icon name="arrow-redo-outline" size={16} color={COLORS.textTertiary} />
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={sc.empty}>
              <Icon name="document-text-outline" size={32} color={COLORS.textDisabled} />
              <Text style={sc.emptyTitle}>Aucune publication</Text>
              <Text style={sc.emptySub}>Soyez le premier à publier</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

// ══════════════════════════════════════════════════════════════════
// Créer un post
// ══════════════════════════════════════════════════════════════════
export function CreerPostScreen({ navigation, route }) {
  const { user } = useAuth();
  const [text,    setText]    = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const publish = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await SocialApi.createPost(text.trim());
      if (route?.params?.onRefresh) route.params.onRefresh();
      navigation.goBack();
    } catch (e) {
      setError(e.message || 'Erreur lors de la publication');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={sc.safe} edges={['top']}>
      <Header
        title="Nouvelle publication"
        onBack={() => navigation.goBack()}
        right={
          <TouchableOpacity
            style={[sc.publishBtn, (!text.trim() || loading) && { opacity: 0.45 }]}
            onPress={publish}
            disabled={!text.trim() || loading}
          >
            {loading
              ? <ActivityIndicator color={COLORS.white} size="small" />
              : <Text style={sc.publishBtnText}>Publier</Text>
            }
          </TouchableOpacity>
        }
      />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={sc.createBody}>
          {error && (
            <View style={sc.errorBox}>
              <Icon name="alert-circle-outline" size={15} color={COLORS.dangerText} />
              <Text style={sc.errorText}>{error}</Text>
            </View>
          )}

          <View style={sc.createRow}>
            <Avatar letter={user?.avatarLetter || '?'} size={40} />
            <View style={{ flex: 1 }}>
              <Text style={sc.createName}>{user?.fullName}</Text>
              <View style={sc.visibilityPill}>
                <Icon name="globe-outline" size={11} color={COLORS.primary} />
                <Text style={sc.visibilityText}>Visible par tous les membres</Text>
              </View>
            </View>
          </View>

          <TextInput
            style={sc.textInput}
            value={text}
            onChangeText={setText}
            placeholder="Quoi de neuf à Chaghaf ?"
            placeholderTextColor={COLORS.textDisabled}
            multiline
            autoFocus
          />

          <View style={sc.attachBar}>
            {[
              { icon: 'image-outline', label: 'Photo' },
              { icon: 'videocam-outline', label: 'Vidéo' },
              { icon: 'location-outline', label: 'Lieu' },
            ].map(item => (
              <TouchableOpacity key={item.label} style={sc.attachBtn}>
                <Icon name={item.icon} size={18} color={COLORS.textTertiary} />
                <Text style={sc.attachLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ══════════════════════════════════════════════════════════════════
// Messagerie
// ══════════════════════════════════════════════════════════════════
export function MessagesScreen({ navigation }) {
  const conversations = [
    { id: 'c1', name: 'Groupe Chaghaf', avatar: 'C', lastMessage: 'Événement vendredi soir !', time: '09:15', unread: 3, isGroup: true },
    { id: 'c2', name: 'Sara Mimouni',  avatar: 'S', lastMessage: 'Tu viens cet après-midi ?', time: 'Hier', unread: 1 },
    { id: 'c3', name: 'Youssef Tazi',  avatar: 'Y', lastMessage: 'Super la nouvelle salle !',  time: 'Mer',  unread: 0 },
    { id: 'c4', name: 'Staff Chaghaf', avatar: 'S', lastMessage: 'Réservation confirmée',       time: 'Mar',  unread: 0 },
  ];

  return (
    <SafeAreaView style={sc.safe} edges={['top']}>
      <View style={sc.pageHeader}>
        <Text style={sc.pageTitle}>Messages</Text>
        <TouchableOpacity style={sc.newPostBtn}>
          <Icon name="create-outline" size={18} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={conversations}
        keyExtractor={item => item.id}
        renderItem={({ item, index }) => (
          <View>
            <TouchableOpacity
              style={sc.convRow}
              onPress={() => navigation.navigate('Conversation', { conversation: item })}
              activeOpacity={0.8}
            >
              <Avatar
                letter={item.avatar}
                size={46}
                color={item.unread > 0 ? COLORS.primary : COLORS.gray400}
              />
              <View style={sc.convInfo}>
                <View style={sc.convMeta}>
                  <Text style={[sc.convName, item.unread > 0 && { fontWeight: '700' }]}>
                    {item.name}
                  </Text>
                  <Text style={sc.convTime}>{item.time}</Text>
                </View>
                <Text style={[sc.convLast, item.unread > 0 && { color: COLORS.textPrimary, fontWeight: '500' }]} numberOfLines={1}>
                  {item.lastMessage}
                </Text>
              </View>
              {item.unread > 0 && (
                <View style={sc.unreadBadge}>
                  <Text style={sc.unreadText}>{item.unread}</Text>
                </View>
              )}
            </TouchableOpacity>
            <Divider inset={70} />
          </View>
        )}
      />
    </SafeAreaView>
  );
}

// ══════════════════════════════════════════════════════════════════
// Conversation
// ══════════════════════════════════════════════════════════════════
export function ConversationScreen({ navigation, route }) {
  const conversation = route?.params?.conversation;
  const [messages, setMessages] = useState([
    { id: 'm1', sender: 'them', text: 'Bonjour ! Comment se passe votre journée ?', time: '09:10' },
    { id: 'm2', sender: 'me',   text: 'Très bien merci ! Je finalise mon projet.',   time: '09:12' },
    { id: 'm3', sender: 'them', text: 'Vous venez cet après-midi ?',                 time: '09:14' },
    { id: 'm4', sender: 'me',   text: 'Oui, je serai là vers 14h.',                  time: '09:15' },
  ]);
  const [input, setInput] = useState('');

  const send = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, {
      id: `m${Date.now()}`,
      sender: 'me',
      text: input.trim(),
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    }]);
    setInput('');
  };

  return (
    <SafeAreaView style={sc.safe} edges={['top']}>
      <Header title={conversation?.name ?? 'Conversation'} onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <FlatList
          data={messages}
          keyExtractor={item => item.id}
          contentContainerStyle={sc.msgList}
          renderItem={({ item }) => (
            <View style={[sc.msgRow, item.sender === 'me' && sc.msgRowMe]}>
              {item.sender !== 'me' && (
                <Avatar letter={conversation?.avatar ?? '?'} size={28} color={COLORS.gray500} />
              )}
              <View style={[sc.bubble, item.sender === 'me' ? sc.bubbleMe : sc.bubbleThem]}>
                <Text style={[sc.bubbleText, item.sender === 'me' && sc.bubbleTextMe]}>
                  {item.text}
                </Text>
                <Text style={[sc.bubbleTime, item.sender === 'me' && sc.bubbleTimeMe]}>
                  {item.time}
                </Text>
              </View>
            </View>
          )}
        />
        <View style={sc.inputBar}>
          <TextInput
            style={sc.msgInput}
            value={input}
            onChangeText={setInput}
            placeholder="Message..."
            placeholderTextColor={COLORS.textDisabled}
            onSubmitEditing={send}
          />
          <TouchableOpacity
            style={[sc.sendBtn, !input.trim() && { opacity: 0.4 }]}
            onPress={send}
            disabled={!input.trim()}
          >
            <Icon name="arrow-up" size={18} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const sc = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: COLORS.bg },
  pageHeader:  {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  pageTitle:   { ...TYPOGRAPHY.h3, color: COLORS.textPrimary },
  newPostBtn:  {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: COLORS.primarySoft, borderRadius: RADIUS.full,
    paddingHorizontal: 12, paddingVertical: 7,
  },
  newPostBtnText: { ...TYPOGRAPHY.xs, color: COLORS.primary, fontWeight: '600' },

  // Feed
  feed: { gap: 0 },
  postCard: {
    backgroundColor: COLORS.surface, padding: 16, gap: 12,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  postCardOfficial: { borderLeftWidth: 3, borderLeftColor: COLORS.primary },
  postHeader:    { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  postAuthorRow: { flexDirection: 'row', alignItems: 'center' },
  postAuthorName:{ ...TYPOGRAPHY.bodyM, color: COLORS.textPrimary, fontWeight: '600' },
  postMeta:      { ...TYPOGRAPHY.xs, color: COLORS.textTertiary, marginTop: 2 },
  postBody:      { ...TYPOGRAPHY.body, color: COLORS.textPrimary, lineHeight: 22 },
  postActions:   {
    flexDirection: 'row', gap: 20,
    paddingTop: 10, borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  postAction:    { flexDirection: 'row', alignItems: 'center', gap: 5 },
  postActionText:{ ...TYPOGRAPHY.sm, color: COLORS.textTertiary },

  empty:      { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyTitle: { ...TYPOGRAPHY.h4, color: COLORS.textPrimary },
  emptySub:   { ...TYPOGRAPHY.sm, color: COLORS.textSecondary },

  // Create post
  createBody:   { flex: 1, padding: 16, gap: 16 },
  errorBox:     { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.dangerBg, borderRadius: RADIUS.md, padding: 12 },
  errorText:    { ...TYPOGRAPHY.sm, color: COLORS.dangerText, flex: 1 },
  publishBtn:   { backgroundColor: COLORS.primary, borderRadius: RADIUS.full, paddingHorizontal: 14, paddingVertical: 7 },
  publishBtnText: { ...TYPOGRAPHY.smM, color: COLORS.white, fontWeight: '600' },
  createRow:    { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  createName:   { ...TYPOGRAPHY.bodyM, color: COLORS.textPrimary, fontWeight: '600' },
  visibilityPill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.primarySoft, borderRadius: RADIUS.full, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start', marginTop: 4 },
  visibilityText: { ...TYPOGRAPHY.xs, color: COLORS.primary },
  textInput:    { flex: 1, ...TYPOGRAPHY.body, color: COLORS.textPrimary, lineHeight: 24, minHeight: 120, textAlignVertical: 'top' },
  attachBar:    { flexDirection: 'row', gap: 4, borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 12 },
  attachBtn:    { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 8, borderRadius: RADIUS.sm, backgroundColor: COLORS.gray50 },
  attachLabel:  { ...TYPOGRAPHY.xs, color: COLORS.textTertiary },

  // Messages list
  convRow:   { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: COLORS.surface },
  convInfo:  { flex: 1 },
  convMeta:  { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  convName:  { ...TYPOGRAPHY.bodyM, color: COLORS.textPrimary, fontWeight: '500' },
  convTime:  { ...TYPOGRAPHY.xs, color: COLORS.textTertiary },
  convLast:  { ...TYPOGRAPHY.sm, color: COLORS.textTertiary },
  unreadBadge: { width: 20, height: 20, borderRadius: 10, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  unreadText: { fontSize: 11, fontWeight: '700', color: COLORS.white },

  // Chat
  msgList:   { padding: 16, gap: 12 },
  msgRow:    { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  msgRowMe:  { flexDirection: 'row-reverse' },
  bubble:    { maxWidth: '75%', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10, gap: 3 },
  bubbleMe:  { backgroundColor: COLORS.primary, borderBottomRightRadius: 4 },
  bubbleThem:{ backgroundColor: COLORS.surface, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: COLORS.border },
  bubbleText:{ ...TYPOGRAPHY.body, color: COLORS.textPrimary },
  bubbleTextMe: { color: COLORS.white },
  bubbleTime:   { ...TYPOGRAPHY.xs, color: COLORS.textTertiary, alignSelf: 'flex-end' },
  bubbleTimeMe: { color: 'rgba(255,255,255,0.65)' },
  inputBar:  {
    flexDirection: 'row', alignItems: 'flex-end', gap: 10,
    paddingHorizontal: 12, paddingVertical: 10,
    backgroundColor: COLORS.surface, borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  msgInput:  {
    flex: 1, backgroundColor: COLORS.gray50, borderRadius: 22,
    paddingHorizontal: 16, paddingVertical: 10,
    ...TYPOGRAPHY.body, color: COLORS.textPrimary,
    borderWidth: 1, borderColor: COLORS.border, maxHeight: 100,
  },
  sendBtn:   { width: 38, height: 38, borderRadius: 19, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
});
