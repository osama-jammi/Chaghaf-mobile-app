// ─── Chaghaf App · API Hooks ──────────────────────────────────────
import { useState, useEffect, useCallback } from 'react';

// ── useFetch ──────────────────────────────────────────────────────
// Usage: const { data, loading, error, refetch } = useFetch(fn, deps, options)
export function useFetch(fn, deps = [], options = {}) {
  const { initialData = null, skip = false } = options;
  const [data,    setData]    = useState(initialData);
  const [loading, setLoading] = useState(!skip);
  const [error,   setError]   = useState(null);

  const fetch = useCallback(async () => {
    if (skip) return;
    setLoading(true);
    setError(null);
    try {
      const result = await fn();
      setData(result);
    } catch (err) {
      setError(err.message || 'Erreur serveur');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

// ── useMutation ───────────────────────────────────────────────────
// Usage: const { mutate, loading, error } = useMutation(fn)
export function useMutation(fn) {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  const [data,    setData]    = useState(null);

  const mutate = useCallback(async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fn(payload);
      setData(result);
      return result;
    } catch (err) {
      setError(err.message || 'Erreur serveur');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fn]);

  return { mutate, loading, error, data };
}