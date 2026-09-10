import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import type { Session } from '@supabase/supabase-js';
import AuthScreen from './src/screens/AuthScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import InterviewScreen from './src/screens/InterviewScreen';
import ProfileMenu from './src/components/ProfileMenu';
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
        <View>
          <Text style={styles.title}>Prepr</Text>
          <Text style={styles.subtitle}>Mock behavioral interview</Text>
        </View>
        <ProfileMenu email={session.user.email ?? ''} />
      </View>

      <View style={styles.tabBar}>
        <Pressable
          style={[styles.tab, view === 'interview' && styles.tabActive]}
          onPress={() => setView('interview')}
        >
          <Text style={[styles.tabText, view === 'interview' && styles.tabTextActive]}>
            Interview
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, view === 'history' && styles.tabActive]}
          onPress={() => setView('history')}
        >
          <Text style={[styles.tabText, view === 'history' && styles.tabTextActive]}>
            History
          </Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#1f2937',
    borderRadius: 10,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#1d4ed8',
  },
  tabText: {
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#ffffff',
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
