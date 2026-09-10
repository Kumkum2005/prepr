import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import type { Session } from '@supabase/supabase-js';
import AuthScreen from './src/screens/AuthScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import InterviewScreen from './src/screens/InterviewScreen';
import { signOut } from './src/services/auth';
import { supabase, supabaseConfigured } from './src/services/supabase';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [view, setView] = useState<'interview' | 'history'>('interview');

  useEffect(() => {
    if (!supabaseConfigured) {
      setCheckingSession(false);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setCheckingSession(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  if (!supabaseConfigured) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.title}>Prepr</Text>
        <Text style={styles.setupText}>
          Add your Supabase URL and anon key to .env to enable accounts and history.
        </Text>
      </View>
    );
  }

  if (checkingSession) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator color="#ffffff" />
      </View>
    );
  }

  if (!session) {
    return (
      <View style={styles.container}>
        <AuthScreen />
        <StatusBar style="light" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Prepr</Text>
        <Text style={styles.subtitle}>Mock behavioral interview</Text>
      </View>

      <View style={styles.headerButtons}>
        <Pressable
          style={styles.headerButton}
          onPress={() => setView(view === 'interview' ? 'history' : 'interview')}
        >
          <Text style={styles.headerButtonText}>
            {view === 'interview' ? 'History' : 'Interview'}
          </Text>
        </Pressable>
        <Pressable style={styles.headerButton} onPress={() => signOut()}>
          <Text style={styles.headerButtonText}>Sign Out</Text>
        </Pressable>
      </View>

      {view === 'interview' ? (
        <InterviewScreen userId={session.user.id} />
      ) : (
        <HistoryScreen userId={session.user.id} />
      )}

      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
    paddingTop: 80,
    paddingHorizontal: 20,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRow: {
    marginBottom: 12,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  headerButton: {
    backgroundColor: '#1f2937',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  headerButtonText: {
    color: '#e5e7eb',
    fontSize: 13,
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 14,
    color: '#9ca3af',
  },
  setupText: {
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 12,
    paddingHorizontal: 20,
  },
});
