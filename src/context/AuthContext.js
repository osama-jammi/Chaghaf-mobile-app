import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { AuthApi, TokenStorage } from '../services/api';

const AuthContext = createContext(null);

const initialState = {
  user:        null,
  accessToken: null,
  loading:     true,  // true pendant le chargement initial
  error:       null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'LOADED':
      return { ...state, loading: false, user: action.user, accessToken: action.token };
    case 'LOGIN_SUCCESS':
      return { ...state, loading: false, error: null, user: action.user, accessToken: action.token };
    case 'LOGOUT':
      return { ...initialState, loading: false };
    case 'SET_ERROR':
      return { ...state, loading: false, error: action.error };
    case 'SET_LOADING':
      return { ...state, loading: action.loading, error: null };
    case 'UPDATE_USER':
      return { ...state, user: { ...state.user, ...action.partial } };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Restaurer la session au démarrage
  useEffect(() => {
    (async () => {
      try {
        const [user, token] = await Promise.all([
          TokenStorage.getUser(),
          TokenStorage.getAccess(),
        ]);
        dispatch({ type: 'LOADED', user, token });
      } catch {
        dispatch({ type: 'LOADED', user: null, token: null });
      }
    })();
  }, []);

  const login = async (email, password, fcmToken) => {
    dispatch({ type: 'SET_LOADING', loading: true });
    try {
      const data = await AuthApi.login({ email, password, fcmToken });
      dispatch({ type: 'LOGIN_SUCCESS', user: data, token: data.accessToken });
      return data;
    } catch (err) {
      dispatch({ type: 'SET_ERROR', error: err.message });
      throw err;
    }
  };

  const register = async (payload) => {
    dispatch({ type: 'SET_LOADING', loading: true });
    try {
      const data = await AuthApi.register(payload);
      dispatch({ type: 'LOGIN_SUCCESS', user: data, token: data.accessToken });
      return data;
    } catch (err) {
      dispatch({ type: 'SET_ERROR', error: err.message });
      throw err;
    }
  };

  const logout = async () => {
    await AuthApi.logout();
    dispatch({ type: 'LOGOUT' });
  };

  const updateUser = (partial) => dispatch({ type: 'UPDATE_USER', partial });

  const clearError = () => dispatch({ type: 'SET_ERROR', error: null });

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, updateUser, clearError }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};