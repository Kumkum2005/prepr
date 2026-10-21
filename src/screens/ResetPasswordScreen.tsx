import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { requestPasswordReset, resetPasswordWithCode } from '../services/auth';

export default function ResetPasswordScreen({
  initialEmail,
  onBack,
}: {
  initialEmail: string;
  onBack: () => void;
}) {
  const [email, setEmail] = useState(initialEmail);
  const [codeSent, setCodeSent] = useState(false);
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSendCode() {
    setError('');
    setBusy(true);
    try {
      await requestPasswordReset(email.trim());
      setCodeSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleReset() {
    setError('');
    if (newPassword.length < 6) {
      setError('Use at least 6 characters for your new password.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New password and confirmation don't match.");
      return;
    }

    setBusy(true);
    try {
      await resetPasswordWithCode(email.trim(), code.trim(), newPassword);
      Alert.alert('Password updated', 'You are now logged in with your new password.');
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setBusy(false);
    }
  }

  const canSend = !busy && !!email.trim();
  const canReset = !busy && !!code.trim() && !!newPassword && !!confirmPassword;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Prepr</Text>
      <Text style={styles.subtitle}>Reset your password</Text>

      <TextInput
        style={[styles.input, codeSent && styles.inputLocked]}
        placeholder="Email"
        placeholderTextColor="#6b7280"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        editable={!codeSent}
      />

      {!codeSent ? (
        <>
          {!!error && <Text style={styles.error}>{error}</Text>}
          <Pressable
            style={[styles.button, !canSend && styles.buttonDisabled]}
            onPress={handleSendCode}
            disabled={!canSend}
          >
            <Text style={styles.buttonText}>{busy ? 'Sending...' : 'Send reset code'}</Text>
          </Pressable>
        </>
      ) : (
        <>
          <Text style={styles.helper}>
            If an account exists for that email, we sent it a code. Enter it below with your new
            password.
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Code from the email"
            placeholderTextColor="#6b7280"
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="New password"
            placeholderTextColor="#6b7280"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
          />
          <TextInput
            style={styles.input}
            placeholder="Confirm new password"
            placeholderTextColor="#6b7280"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
          {!!error && <Text style={styles.error}>{error}</Text>}
          <Pressable
            style={[styles.button, !canReset && styles.buttonDisabled]}
            onPress={handleReset}
            disabled={!canReset}
          >
            <Text style={styles.buttonText}>{busy ? 'Resetting...' : 'Reset password'}</Text>
          </Pressable>
          <Text style={styles.link} onPress={handleSendCode}>
            Resend code
          </Text>
        </>
      )}

      <Text style={styles.link} onPress={onBack}>
        Back to log in
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
  input: {
    backgroundColor: '#1f2937',
    color: '#ffffff',
    fontFamily: 'CourierPrime_400Regular',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  inputLocked: {
    opacity: 0.5,
  },
  helper: {
    color: '#9ca3af',
    fontSize: 13,
    fontFamily: 'CourierPrime_400Regular',
    marginBottom: 12,
  },
  error: {
    color: '#f87171',
    fontFamily: 'CourierPrime_400Regular',
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#4f46e5',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#374151',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 15,
    fontFamily: 'CourierPrime_400Regular',
    fontWeight: '600',
  },
  link: {
    color: '#60a5fa',
    fontFamily: 'CourierPrime_400Regular',
    marginTop: 20,
    textAlign: 'center',
  },
});
