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

  // Native environment: try Expo AuthSession flow.
  try {
    const AuthSession: any = await import('expo-auth-session');

    // You must supply a native OAuth client id for Android/iOS. We look for
    // a client id in environment variables (process.env) or in expo Constants
    // under `extra` (app.json -> extra). If not provided, throw with guidance.
    let clientId: string | undefined = process.env.EXPO_GOOGLE_OAUTH_CLIENT_ID;
    if (!clientId) {
      try {
        const Constants = await import('expo-constants');
        // Try common locations for client id
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

    const redirectUri = AuthSession.makeRedirectUri({ useProxy: true });

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'id_token',
      scope: 'openid email profile',
      nonce: 'nonce',
    });

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

    const result = await AuthSession.startAsync({ authUrl });

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
    // Re-throw with helpful guidance for the developer
    throw new Error(err?.message || 'Failed to sign in with Google on native.');
  }
}

export default {
  signInWithGoogle,
};
