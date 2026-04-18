import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://chaghaf-back-5t0i.onrender.com';

const STORAGE_KEYS = {
  ACCESS_TOKEN:  'chaghaf_access_token',
  REFRESH_TOKEN: 'chaghaf_refresh_token',
  USER:          'chaghaf_user',
};

// ── Token helpers ─────────────────────────────────────────────────
export const TokenStorage = {
  getAccess:    () => AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN),
  getRefresh:   () => AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN),
  setTokens:    (access, refresh) => Promise.all([
    AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN,  access),
    AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refresh),
  ]),
  clear:        () => Promise.all([
    AsyncStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN),
    AsyncStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN),
    AsyncStorage.removeItem(STORAGE_KEYS.USER),
  ]),
  getUser:      async () => {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.USER);
    return raw ? JSON.parse(raw) : null;
  },
  setUser:      (user) => AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user)),
};

// ── Core fetch wrapper ────────────────────────────────────────────
async function request(endpoint, options = {}, retry = true) {
  const token = await TokenStorage.getAccess();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  // Token expired → essaie de le rafraîchir une fois
  if (response.status === 401 && retry) {
    const refreshed = await refreshAccessToken();
    if (refreshed) return request(endpoint, options, false);
    await TokenStorage.clear();
    throw new ApiError(401, 'Session expirée, veuillez vous reconnecter.');
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(response.status, data.error || data.message || 'Erreur serveur');
  }

  return data;
}

async function refreshAccessToken() {
  try {
    const refreshToken = await TokenStorage.getRefresh();
    if (!refreshToken) return false;

    const res = await fetch(`${BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return false;

    const data = await res.json();
    await TokenStorage.setTokens(data.accessToken, data.refreshToken);
    await TokenStorage.setUser(data);
    return true;
  } catch {
    return false;
  }
}

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// ── Auth ──────────────────────────────────────────────────────────
export const AuthApi = {
  register: async (payload) => {
    const data = await request('/api/auth/register', { method: 'POST', body: payload });
    await TokenStorage.setTokens(data.accessToken, data.refreshToken);
    await TokenStorage.setUser(data);
    return data;
  },

  login: async (payload) => {
    const data = await request('/api/auth/login', { method: 'POST', body: payload });
    await TokenStorage.setTokens(data.accessToken, data.refreshToken);
    await TokenStorage.setUser(data);
    return data;
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
  getList:    () => request('/api/boissons'),
  consume:    (boissonType) =>
    request('/api/boissons/consume', { method: 'POST', body: { boissonType } }),
  getHistory: () => request('/api/boissons/history'),
  getCafeGuide: () => request('/api/boissons/cafe-guide'),
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