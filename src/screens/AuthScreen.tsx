import { useState } from 'react';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { signIn, signUp } from '../services/auth';

export default function AuthScreen() {
  const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

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

      <Button
        title={submitting ? 'Please wait...' : mode === 'signIn' ? 'Log In' : 'Sign Up'}
        onPress={handleSubmit}
        disabled={submitting || !email.trim() || !password}
      />

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
    fontWeight: '700',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#1f2937',
    color: '#ffffff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  error: {
    color: '#f87171',
    marginBottom: 12,
  },
  switchMode: {
    color: '#60a5fa',
    marginTop: 20,
    textAlign: 'center',
  },
});
