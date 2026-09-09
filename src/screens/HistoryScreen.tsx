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

  const behavioralCount = sessions.filter((s) => s.mode === 'behavioral').length;
  const technicalCount = sessions.filter((s) => s.mode === 'technical').length;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.summary}>
        <Text style={styles.summaryText}>
          {sessions.length} session{sessions.length === 1 ? '' : 's'} completed
        </Text>
        <Text style={styles.summarySubtext}>
          {behavioralCount} behavioral · {technicalCount} technical
        </Text>
      </View>

      {sessions.map((session) => {
        const firstQuestion = session.transcript.find((m) => m.role === 'assistant');
        return (
          <View key={session.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.date}>
                {new Date(session.created_at).toLocaleString()}
              </Text>
              <Text style={styles.modeTag}>{session.mode}</Text>
            </View>
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
  summary: {
    backgroundColor: '#1f2937',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  summaryText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  summarySubtext: {
    color: '#9ca3af',
    fontSize: 12,
    marginTop: 4,
  },
  card: {
    backgroundColor: '#1f2937',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  date: {
    color: '#9ca3af',
    fontSize: 12,
  },
  modeTag: {
    color: '#60a5fa',
    fontSize: 11,
    textTransform: 'uppercase',
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
