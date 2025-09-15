import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import {
  GoogleSignin,
  statusCodes,
  isErrorWithCode,
} from '@react-native-google-signin/google-signin';
import { router } from 'expo-router';

let authorizedEmails: string[];
try {
  const config = require('../config.json');
  authorizedEmails = config.authorizedEmails;
} catch {
  authorizedEmails = [
    'elaine.batista1105@gmail.com',
    'paulamcunha31@gmail.com',
    'edbpmc@gmail.com',
  ];
}

// TODO: This Android client ID might not work for sign-in
// A proper Web Application client ID should be created in Firebase Console > Authentication > Sign-in method > Google
// Current ID: 83953880984-53ic0es104gb3j474f3t58qun4t0vddt.apps.googleusercontent.com (Android)
// Required: Web Application client ID from same Firebase project

export default function LoginScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    console.log('[LOGIN] Component mounted, checking GoogleSignin availability...');

    // Check if GoogleSignin is available
    if (!GoogleSignin) {
      console.error('[LOGIN] GoogleSignin is not available');
      setErrorMessage('Google Sign-In library is not properly configured');
      return;
    }

    console.log('[LOGIN] GoogleSignin available, checking methods...');
    console.log('[LOGIN] GoogleSignin.configure:', typeof GoogleSignin.configure);
    console.log('[LOGIN] GoogleSignin.isSignedIn:', typeof GoogleSignin.isSignedIn);
    console.log('[LOGIN] GoogleSignin.signIn:', typeof GoogleSignin.signIn);

    try {
      GoogleSignin.configure({
        scopes: ['openid', 'profile', 'email'],
        offlineAccess: false,
        hostedDomain: '',
        forceCodeForRefreshToken: true,
      });

      console.log('[LOGIN] GoogleSignin configured without webClientId - using Android client from google-services.json');

      // Check current sign in status (optional - some versions don't have isSignedIn)
      if (typeof GoogleSignin.isSignedIn === 'function') {
        GoogleSignin.isSignedIn()
          .then((isSignedIn) => {
            console.log('[LOGIN] Current sign-in status:', isSignedIn);
            if (isSignedIn) {
              GoogleSignin.getCurrentUser()
                .then((user) => {
                  console.log('[LOGIN] Current user:', JSON.stringify(user, null, 2));
                })
                .catch((error) => {
                  console.error('[LOGIN] Error getting current user:', error);
                });
            }
          })
          .catch((error) => {
            console.error('[LOGIN] Error checking sign-in status:', error);
          });
      } else {
        console.warn('[LOGIN] GoogleSignin.isSignedIn method not available - this is OK, continuing without status check');
      }
    } catch (error) {
      console.error('[LOGIN] Error during GoogleSignin configuration:', error);
      setErrorMessage('Failed to configure Google Sign-In');
    }
  }, []);

  const signInWithGoogle = async () => {
    console.log('[LOGIN] Sign-in button pressed');

    if (!GoogleSignin || typeof GoogleSignin.signIn !== 'function') {
      console.error('[LOGIN] GoogleSignin.signIn is not available');
      setErrorMessage('Google Sign-In is not properly configured');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage('');
      console.log('[LOGIN] Starting Google Sign-in process...');

      console.log('[LOGIN] Checking Play Services availability...');
      if (typeof GoogleSignin.hasPlayServices === 'function') {
        try {
          await GoogleSignin.hasPlayServices();
          console.log('[LOGIN] Play Services are available');
        } catch (error) {
          console.warn('[LOGIN] Play Services check failed:', error);
        }
      } else {
        console.warn('[LOGIN] GoogleSignin.hasPlayServices not available - continuing without check');
      }

      console.log('[LOGIN] Attempting to sign in...');
      const userInfo: any = await GoogleSignin.signIn();
      console.log('[LOGIN] Sign-in successful, user info:', JSON.stringify(userInfo, null, 2));

      const userEmail = userInfo.data?.user?.email || userInfo.user?.email;
      console.log('[LOGIN] User email:', userEmail);
      console.log('[LOGIN] Authorized emails:', JSON.stringify(authorizedEmails, null, 2));

      if (authorizedEmails.includes(userEmail)) {
        console.log(`[LOGIN] ✅ Access granted to ${userEmail}`);
        console.log('[LOGIN] Navigating to main app...');
        router.replace('/main');
      } else {
        console.log(`[LOGIN] ❌ Access denied for ${userEmail}`);
        setErrorMessage('Access denied. Your email is not authorized.');
        console.log('[LOGIN] Signing out unauthorized user...');
        await GoogleSignin.signOut();
        console.log('[LOGIN] Unauthorized user signed out');
      }
    } catch (error) {
      console.error('[LOGIN] Error during sign-in:', error);

      if (isErrorWithCode(error)) {
        console.log('[LOGIN] Error code:', error.code);
        switch (error.code) {
          case statusCodes.SIGN_IN_CANCELLED:
            console.log('[LOGIN] User cancelled the login flow');
            setErrorMessage('Sign-in was cancelled');
            break;
          case statusCodes.IN_PROGRESS:
            console.log('[LOGIN] Sign-in already in progress');
            setErrorMessage('Sign-in already in progress');
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            console.log('[LOGIN] Google Play Services not available');
            setErrorMessage('Google Play Services not available');
            break;
          default:
            console.log('[LOGIN] Unknown error code:', error.code);
            setErrorMessage('Something went wrong with Google Sign-In');
        }
      } else {
        console.error('[LOGIN] Non-GoogleSignin error:', error);
        setErrorMessage('An unexpected error occurred');
      }
    } finally {
      console.log('[LOGIN] Sign-in process completed, setting loading to false');
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login with Google</Text>

      <Pressable
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={signInWithGoogle}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Sign in with Google</Text>
        )}
      </Pressable>

      {errorMessage ? (
        <Text style={styles.errorText}>{errorMessage}</Text>
      ) : null}

      <Text style={styles.debugText}>
        Debug Info:{'\n'}
        Package: dev.elainedb.rn_claude{'\n'}
        Config: Android client only (no webClientId){'\n'}
        Check console logs for detailed debugging
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 40,
    color: '#333',
  },
  button: {
    backgroundColor: '#4285F4',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 200,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#cccccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 14,
    marginTop: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  debugText: {
    color: '#666',
    fontSize: 12,
    marginTop: 20,
    textAlign: 'center',
    paddingHorizontal: 20,
    fontFamily: 'monospace',
  },
});