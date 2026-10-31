/**
 * Auth store — JWT token and user identity.
 *
 * Storage strategy
 * ----------------
 * The Zustand `persist` middleware writes state to localStorage under the key
 * `nexus-auth-storage`.  The nexusClient reads the token directly from
 * localStorage via `nexus_token` for simplicity.
 *
 * Previously, `setAuth` manually wrote `nexus_token` to localStorage AND
 * Zustand also persisted the whole state — creating two independent copies
 * of the token.  On logout only `nexus_token` was removed, leaving the
 * Zustand persisted copy behind (a desync bug).
 *
 * Fix: The `persist` middleware now also syncs `nexus_token` via `onRehydrateStorage`
 * and `setAuth`/`logout` maintain a single write path.
 */

import { create } from 'zustand';
import { persist, type StateStorage } from 'zustand/middleware';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: AuthUser, token: string) => void;
  logout: () => void;
}

const TOKEN_KEY = 'nexus_token';
const STORE_KEY = 'nexus-auth-storage';

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (user, token) => {
        // Single write path — keep both Zustand state and nexus_token in sync
        localStorage.setItem(TOKEN_KEY, token);
        set({ user, token, isAuthenticated: true });
      },

      logout: () => {
        // Remove BOTH storage locations so nexusClient sees no token
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(STORE_KEY);
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    {
      name: STORE_KEY,
      partialize: (s) => ({
        user: s.user,
        token: s.token,
        isAuthenticated: s.isAuthenticated,
      }),
      // Keep nexus_token in sync when state is rehydrated from localStorage
      // (e.g. on page refresh) so nexusClient always has a valid token.
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          localStorage.setItem(TOKEN_KEY, state.token);
        } else {
          localStorage.removeItem(TOKEN_KEY);
        }
      },
    }
  )
);