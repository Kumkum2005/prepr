import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { signIn, signUp } from '../services/auth';
import { signInWithGoogle } from '../services/googleAuth';

export default function AuthScreen() {
  const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleSubmit() {
    setError('');
    setSubmitting(true);
    try {
      if (mode === 'signIn') {
        await signIn(email.trim(), password);
      } else {
        await signUp(email.trim(), password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogleSignIn() {
    setError('');
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Prepr</Text>
      <Text style={styles.subtitle}>
        {mode === 'signIn' ? 'Log in to continue' : 'Create an account'}
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#6b7280"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#6b7280"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {!!error && <Text style={styles.error}>{error}</Text>}

      <Pressable
        style={[styles.submitButton, (submitting || !email.trim() || !password) && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={submitting || !email.trim() || !password}
      >
        <Text style={styles.submitButtonText}>
          {submitting ? 'Please wait...' : mode === 'signIn' ? 'Log In' : 'Sign Up'}
        </Text>
      </Pressable>

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>or</Text>
        <View style={styles.dividerLine} />
      </View>

      <Pressable
        style={styles.googleButton}
        onPress={handleGoogleSignIn}
        disabled={googleLoading}
      >
        {googleLoading ? (
          <ActivityIndicator color="#111827" />
        ) : (
          <Text style={styles.googleButtonText}>Continue with Google</Text>
        )}
      </Pressable>

      <Text
        style={styles.switchMode}
        onPress={() => setMode(mode === 'signIn' ? 'signUp' : 'signIn')}
      >
        {mode === 'signIn' ? "Don't have an account? Sign up" : 'Already have an account? Log in'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
    paddingTop: 100,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontFamily: 'CourierPrime_400Regular',
    fontWeight: '700',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'CourierPrime_400Regular',
    color: '#9ca3af',
    marginBottom: 24,
  },
  submitButton: {
    backgroundColor: '#4f46e5',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#374151',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontFamily: 'CourierPrime_400Regular',
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#1f2937',
    color: '#ffffff',
    fontFamily: 'CourierPrime_400Regular',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  error: {
    color: '#f87171',
    fontFamily: 'CourierPrime_400Regular',
    marginBottom: 12,
  },
  switchMode: {
    color: '#60a5fa',
    fontFamily: 'CourierPrime_400Regular',
    marginTop: 20,
    textAlign: 'center',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#374151',
  },
  dividerText: {
    color: '#6b7280',
    marginHorizontal: 12,
    fontSize: 12,
    fontFamily: 'CourierPrime_400Regular',
  },
  googleButton: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  googleButtonText: {
    color: '#111827',
    fontSize: 15,
    fontFamily: 'CourierPrime_400Regular',
    fontWeight: '600',
  },
});
