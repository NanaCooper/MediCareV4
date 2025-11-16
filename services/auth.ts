import { getAuthInstance } from '../utils/firebaseConfig';

/**
 * Sign in with Google (web-first).
 * On web this uses Firebase's signInWithPopup + GoogleAuthProvider.
 * On native (Expo) this will throw with instructions to install/configure expo-auth-session
 * because native flows require platform-specific OAuth client setup.
 */
export async function signInWithGoogle(): Promise<void> {
  const auth = await getAuthInstance();

  const isWeb = typeof window !== 'undefined' && typeof window.document !== 'undefined';

  // Use the modular firebase/auth methods
  const authModule: any = await import('firebase/auth');
  const { GoogleAuthProvider, signInWithPopup } = authModule;

  const provider = new GoogleAuthProvider();

  if (isWeb && typeof signInWithPopup === 'function') {
    // Web popup flow
    await signInWithPopup(auth, provider);
    return;
  }

  // Native environment: use Expo AuthRequest with system browser (no proxy needed).
  try {
    const AuthSession: any = await import('expo-auth-session');

    // Get native OAuth client ID from env or app.json extra
    let clientId: string | undefined = process.env.EXPO_GOOGLE_OAUTH_CLIENT_ID;
    if (!clientId) {
      try {
        const Constants = await import('expo-constants');
        clientId = Constants?.default?.manifest?.extra?.googleClientId || Constants?.default?.expoConfig?.extra?.googleClientId;
      } catch {
        // ignore
      }
    }

    if (!clientId) {
      throw new Error(
        'Native Google Sign-In requires a Google OAuth client ID. Set EXPO_GOOGLE_OAUTH_CLIENT_ID (or add googleClientId to expo.extra in app.json) and register OAuth clients in Firebase/Google Cloud. See README for details.'
      );
    }

    // Use system browser redirect instead of proxy (simpler, no project slug needed)
    const redirectUri = AuthSession.makeRedirectUri({ useProxy: false });

    // Create AuthRequest for Google OAuth
    const request = new (AuthSession as any).AuthRequest({
      clientId,
      redirectUrl: redirectUri,
      scopes: ['openid', 'email', 'profile'],
      responseType: 'id_token',
      extraParams: { nonce: 'nonce' },
    });

    // Prompt user with system browser
    const result = await request.promptAsync();

    if (result?.type === 'success' && result.params?.id_token) {
      const idToken = result.params.id_token as string;
      const firebaseAuth: any = await import('firebase/auth');
      const credential = firebaseAuth.GoogleAuthProvider.credential(idToken);
      const { signInWithCredential } = firebaseAuth;

      await signInWithCredential(auth, credential);
      return;
    }

    throw new Error('Google authentication was cancelled or failed.');
  } catch (err: any) {
    throw new Error(err?.message || 'Failed to sign in with Google on native.');
  }
}

export default {
  signInWithGoogle,
};
