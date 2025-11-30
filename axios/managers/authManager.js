import { createGuestSession, refreshToken as refresh } from '../services/authService';
import { getTokens } from '../storage/tokenStorage';

export const AuthState = {
  UNKNOWN: 'UNKNOWN',
  GUEST: 'GUEST',
  USER: 'USER',
};

let currentState = AuthState.UNKNOWN;

/**
 * Bootstraps the authentication state at app start.
 * Decides whether to refresh, reuse, or create guest session.
 */
export const initializeAuth = async () => {
  try {
    const { accessToken, refreshToken } = await getTokens();

    if (accessToken && refreshToken) {
      // Try refreshing to validate tokens
      const refreshed = await refresh();
      if (refreshed?.accessToken) {
        currentState = AuthState.USER;
        return currentState;
      }
    }

    // Otherwise, create a guest session
    await createGuestSession();
    currentState = AuthState.GUEST;
    return currentState;
  } catch (err) {
    console.log('Auth bootstrap error, switching to guest:', err);
    await createGuestSession();
    currentState = AuthState.GUEST;
    return currentState;
  }
};

export const getAuthState = () => currentState;
