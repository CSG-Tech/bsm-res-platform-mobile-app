// authBootstrap.ts
import { getTokens } from '../storage/tokenStorage';
import { createGuestSession } from '../services/authService';

export const ensureSession = async () => {
  const { accessToken } = await getTokens();

  if (!accessToken) {
    console.log('🟡 No token found → creating guest session');
    await createGuestSession();
  }
};
