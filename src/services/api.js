import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://app-chaghaf.salmondune-842043fe.francecentral.azurecontainerapps.io';

const STORAGE_KEYS = {
  ACCESS_TOKEN:  'chaghaf_access_token',
  REFRESH_TOKEN: 'chaghaf_refresh_token',
  USER:          'chaghaf_user',
};

// ── Token helpers ─────────────────────────────────────────────────
export const TokenStorage = {
  getAccess:  () => AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN),
  getRefresh: () => AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN),

  setTokens: async (access, refresh) => {
    const ops = [];
    if (access != null)  ops.push(AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN,  String(access)));
    else                 ops.push(AsyncStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN));
    if (refresh != null) ops.push(AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, String(refresh)));
    else                 ops.push(AsyncStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN));
    return Promise.all(ops);
  },

  clear: () => Promise.all([
    AsyncStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN),
    AsyncStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN),
    AsyncStorage.removeItem(STORAGE_KEYS.USER),
  ]),

  getUser: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.USER);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  },

  setUser: (user) => {
    if (user == null) return AsyncStorage.removeItem(STORAGE_KEYS.USER);
    return AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },
};

// ── Session expiration callback (set by AuthContext) ─────────────
let onSessionExpired = null;
export const setSessionExpiredHandler = (fn) => { onSessionExpired = fn; };

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// ── Core fetch wrapper ────────────────────────────────────────────
async function request(endpoint, options = {}) {
  const token = await TokenStorage.getAccess();
  const method = options.method || 'GET';

  const headers = {
    'Content-Type': 'application/json',
    Accept:         'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const { body, ...restOptions } = options;

  console.log(`[API] → ${method} ${endpoint}${token ? ' [AUTH]' : ''}`);

  let response;
  try {
    response = await fetch(`${BASE_URL}${endpoint}`, {
      ...restOptions,
      headers,
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
  } catch (e) {
    console.log(`[API] ✗ ${method} ${endpoint} — network error:`, e?.message);
    throw new ApiError(0, 'Connexion impossible. Vérifiez votre réseau.');
  }

  console.log(`[API] ← ${response.status} ${method} ${endpoint}`);

  // 204 No Content → pas de body, retourner null
  if (response.status === 204) return null;

  // Lecture du body (peut être vide ou non-JSON)
  const text = await response.text();
  let data;
  try { data = text ? JSON.parse(text) : null; }
  catch { data = null; }

  // Si 401/403 et qu'on AVAIT envoyé un token → token invalide → logout global
  if ((response.status === 401 || response.status === 403) && token) {
    console.log(`[API] Token rejeté par le backend (${response.status}). Body:`, text);
    await TokenStorage.clear();
    if (onSessionExpired) onSessionExpired();
    throw new ApiError(response.status, 'Session expirée, veuillez vous reconnecter.');
  }

  if (!response.ok) {
    const msg = (data && (data.error || data.message)) || `Erreur ${response.status}`;
    console.log(`[API] ✗ ${method} ${endpoint} body:`, text.substring(0, 300));
    throw new ApiError(response.status, msg);
  }

  return data;
}

// ── Auth ──────────────────────────────────────────────────────────
const extractToken = (data) =>
  data?.accessToken || data?.access_token || data?.token || data?.jwt || data?.idToken || null;

export const AuthApi = {
  register: async (payload) => {
    const data = await request('/api/auth/register', { method: 'POST', body: payload });
    console.log('[Auth] register response keys:', data ? Object.keys(data) : 'null');
    const token = extractToken(data);
    if (!token) {
      console.log('[Auth] ⚠ Aucun token dans la réponse register:', JSON.stringify(data));
      throw new ApiError(500, "Réponse invalide du serveur (pas de token).");
    }
    await TokenStorage.setTokens(token, data.refreshToken);
    await TokenStorage.setUser({ ...data, accessToken: token });
    console.log('[Auth] register OK, token stored (', token.substring(0, 20), '...)');
    return { ...data, accessToken: token };
  },

  login: async (payload) => {
    const data = await request('/api/auth/login', { method: 'POST', body: payload });
    console.log('[Auth] login response keys:', data ? Object.keys(data) : 'null');
    const token = extractToken(data);
    if (!token) {
      console.log('[Auth] ⚠ Aucun token dans la réponse login:', JSON.stringify(data));
      throw new ApiError(500, "Réponse invalide du serveur (pas de token).");
    }
    await TokenStorage.setTokens(token, data.refreshToken);
    await TokenStorage.setUser({ ...data, accessToken: token });
    console.log('[Auth] login OK, token stored (', token.substring(0, 20), '...)');
    return { ...data, accessToken: token };
  },

  logout: async () => {
    await TokenStorage.clear();
  },

  getProfile: () => request('/api/auth/me'),

  updateFcmToken: (fcmToken) =>
    request('/api/auth/fcm-token', { method: 'PUT', body: { fcmToken } }),
};

// ── Subscriptions ─────────────────────────────────────────────────
export const SubscriptionApi = {
  getActive:        () => request('/api/subscriptions/active'),
  getHistory:       () => request('/api/subscriptions/history'),
  getPacks:         () => request('/api/subscriptions/packs'),
  subscribe:        (packType, duration) =>
    request('/api/subscriptions', { method: 'POST', body: { packType, duration } }),
  renew:            () => request('/api/subscriptions/renew', { method: 'POST' }),
  purchaseDayAccess:(accessType) =>
    request('/api/subscriptions/day-access', { method: 'POST', body: { accessType } }),
  requestChange:    (requestedPack, requestedDuration, reason) =>
    request('/api/subscriptions/change-request', {
      method: 'POST',
      body: { requestedPack, requestedDuration, reason },
    }),
  myChangeRequests: () => request('/api/subscriptions/change-requests/me'),
};

// ── Reservations ──────────────────────────────────────────────────
export const ReservationApi = {
  getSalles:     () => request('/api/reservations/salles'),
  getMyReservations: () => request('/api/reservations'),
  create:        (salleId, reservationDate, duration) =>
    request('/api/reservations', {
      method: 'POST',
      body: { salleId, reservationDate, duration },
    }),
  cancel:        (id) => request(`/api/reservations/${id}`, { method: 'DELETE' }),
};

// ── Boissons ──────────────────────────────────────────────────────
export const BoissonApi = {
  getList:        () => request('/api/boissons'),
  consume:        (boissonType) =>
    request('/api/boissons/consume', { method: 'POST', body: { boissonType } }),
  getHistory:     () => request('/api/boissons/history'),
  getCafeGuide:   () => request('/api/boissons/cafe-guide'),
  getTodayStatus: () => request('/api/boissons/today-status'),
};

// ── Snacks ────────────────────────────────────────────────────────
export const SnackApi = {
  getCatalog:   () => request('/api/snacks/catalog'),
  createOrder:  (items, note) =>
    request('/api/snacks/orders', { method: 'POST', body: { items, note } }),
  getMyOrders:  () => request('/api/snacks/orders'),
  getOrder:     (id) => request(`/api/snacks/orders/${id}`),
  updateStatus: (id, status) =>
    request(`/api/snacks/orders/${id}/status`, { method: 'PATCH', body: { status } }),
};

// ── Social ────────────────────────────────────────────────────────
export const SocialApi = {
  getPosts:      (page = 0, size = 20) =>
    request(`/api/posts?page=${page}&size=${size}`),
  createPost:    (content) =>
    request('/api/posts', { method: 'POST', body: { content } }),
  toggleLike:    (postId) =>
    request(`/api/posts/${postId}/like`, { method: 'POST' }),
  sendMessage:   (content, recipientId) =>
    request('/api/messages', { method: 'POST', body: { content, recipientId } }),
  getConversation: (otherId) => request(`/api/messages/${otherId}`),
};

// ── Notifications ─────────────────────────────────────────────────
export const NotificationApi = {
  getAll:         (page = 0) => request(`/api/notifications?page=${page}`),
  getUnreadCount: () => request('/api/notifications/unread-count'),
  markAllRead:    () => request('/api/notifications/mark-read', { method: 'POST' }),
};

// ── Access (check-in/out, occupation) ─────────────────────────────
export const AccessApi = {
  getOccupancy: () => request('/api/access/occupancy'),
  checkIn:      (qrToken) => request('/api/access/check-in', { method: 'POST', body: { qrToken } }),
  checkOut:     () => request('/api/access/check-out', { method: 'POST' }),
  myStatus:     () => request('/api/access/my-status'),
  getQrToken:   () => request('/api/access/qr-token'),
};
