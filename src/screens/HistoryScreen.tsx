import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { InterviewSession, listSessions } from '../services/sessions';

export default function HistoryScreen({ userId }: { userId: string }) {
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    listSessions(userId)
      .then(setSessions)
      .catch((err) => setError(err instanceof Error ? err.message : String(err)))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#ffffff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  if (sessions.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.empty}>No past sessions yet. Finish an interview to see it here.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {sessions.map((session) => {
        const firstQuestion = session.transcript.find((m) => m.role === 'assistant');
        return (
          <View key={session.id} style={styles.card}>
            <Text style={styles.date}>
              {new Date(session.created_at).toLocaleString()}
            </Text>
            <Text style={styles.preview} numberOfLines={2}>
              {firstQuestion?.content ?? 'Empty session'}
            </Text>
            <Text style={styles.count}>{session.transcript.length} messages</Text>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  error: {
    color: '#f87171',
  },
  empty: {
    color: '#9ca3af',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: '#1f2937',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  date: {
    color: '#9ca3af',
    fontSize: 12,
    marginBottom: 6,
  },
  preview: {
    color: '#ffffff',
    fontSize: 14,
    marginBottom: 6,
  },
  count: {
    color: '#6b7280',
    fontSize: 11,
  },
});
