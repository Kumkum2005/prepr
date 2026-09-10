import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { InterviewMode } from '../services/claude';
import {
  deleteSession,
  InterviewSession,
  listSessions,
  renameSession,
  setSessionArchived,
} from '../services/sessions';

type ModeFilter = 'all' | InterviewMode;
type SortOrder = 'newest' | 'oldest';

export default function HistoryScreen({ userId }: { userId: string }) {
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [menuFor, setMenuFor] = useState<InterviewSession | null>(null);
  const [renaming, setRenaming] = useState<InterviewSession | null>(null);
  const [renameText, setRenameText] = useState('');
  const [modeFilter, setModeFilter] = useState<ModeFilter>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');

  useEffect(() => {
    refresh();
  }, [userId]);

  function refresh() {
    setLoading(true);
    listSessions(userId)
      .then(setSessions)
      .catch((err) => setError(err instanceof Error ? err.message : String(err)))
      .finally(() => setLoading(false));
  }

  function sessionLabel(session: InterviewSession) {
    if (session.title) return session.title;
    const firstQuestion = session.transcript.find((m) => m.role === 'assistant');
    return firstQuestion?.content ?? 'Empty session';
  }

  function openRename(session: InterviewSession) {
    setMenuFor(null);
    setRenaming(session);
    setRenameText(session.title ?? '');
  }

  async function saveRename() {
    if (!renaming) return;
    const title = renameText.trim();
    try {
      await renameSession(renaming.id, title);
      setSessions((prev) =>
        prev.map((s) => (s.id === renaming.id ? { ...s, title: title || null } : s))
      );
    } catch (err) {
      Alert.alert('Could not rename session', err instanceof Error ? err.message : String(err));
    } finally {
      setRenaming(null);
    }
  }

  async function toggleArchive(session: InterviewSession) {
    setMenuFor(null);
    try {
      await setSessionArchived(session.id, !session.archived);
      setSessions((prev) =>
        prev.map((s) => (s.id === session.id ? { ...s, archived: !s.archived } : s))
      );
    } catch (err) {
      Alert.alert('Could not update session', err instanceof Error ? err.message : String(err));
    }
  }

  function confirmDelete(session: InterviewSession) {
    setMenuFor(null);
    Alert.alert('Delete session?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteSession(session.id);
            setSessions((prev) => prev.filter((s) => s.id !== session.id));
          } catch (err) {
            Alert.alert('Could not delete session', err instanceof Error ? err.message : String(err));
          }
        },
      },
    ]);
  }

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

  const activeCount = sessions.filter((s) => !s.archived).length;
  const archivedCount = sessions.filter((s) => s.archived).length;
  const behavioralCount = sessions.filter((s) => !s.archived && s.mode === 'behavioral').length;
  const technicalCount = sessions.filter((s) => !s.archived && s.mode === 'technical').length;

  const visibleSessions = sessions
    .filter((s) => s.archived === showArchived)
    .filter((s) => modeFilter === 'all' || s.mode === modeFilter)
    .sort((a, b) => {
      const diff = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      return sortOrder === 'newest' ? -diff : diff;
    });

  return (
    <View style={styles.container}>
      {!showArchived && (
        <View style={styles.summary}>
          <Text style={styles.summaryText}>
            {activeCount} session{activeCount === 1 ? '' : 's'} completed
          </Text>
          <Text style={styles.summarySubtext}>
            {behavioralCount} behavioral · {technicalCount} technical
          </Text>
        </View>
      )}

      {archivedCount > 0 && (
        <Pressable onPress={() => setShowArchived(!showArchived)} style={styles.archiveToggle}>
          <Text style={styles.archiveToggleText}>
            {showArchived ? '← Back to active sessions' : `Show archived (${archivedCount})`}
          </Text>
        </Pressable>
      )}

      <View style={styles.filterRow}>
        <View style={styles.filterPills}>
          {(['all', 'behavioral', 'technical'] as ModeFilter[]).map((f) => (
            <Pressable
              key={f}
              style={[styles.filterPill, modeFilter === f && styles.filterPillActive]}
              onPress={() => setModeFilter(f)}
            >
              <Text style={[styles.filterPillText, modeFilter === f && styles.filterPillTextActive]}>
                {f === 'all' ? 'All' : f === 'behavioral' ? 'Behavioral' : 'Technical'}
              </Text>
            </Pressable>
          ))}
        </View>
        <Pressable
          style={styles.sortButton}
          onPress={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
        >
          <Text style={styles.sortButtonText}>
            {sortOrder === 'newest' ? 'Newest first' : 'Oldest first'}
          </Text>
        </Pressable>
      </View>

      {visibleSessions.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.empty}>
            {showArchived ? 'No archived sessions.' : 'No past sessions yet. Finish an interview to see it here.'}
          </Text>
        </View>
      ) : (
        <ScrollView>
          {visibleSessions.map((session) => (
            <View key={session.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.date}>{new Date(session.created_at).toLocaleString()}</Text>
                <View style={styles.cardHeaderRight}>
                  <Text style={styles.modeTag}>{session.mode}</Text>
                  <Pressable onPress={() => setMenuFor(session)} hitSlop={8}>
                    <Text style={styles.menuDots}>⋮</Text>
                  </Pressable>
                </View>
              </View>
              <Text style={styles.preview} numberOfLines={2}>
                {sessionLabel(session)}
              </Text>
              <Text style={styles.count}>{session.transcript.length} messages</Text>
            </View>
          ))}
        </ScrollView>
      )}

      <Modal visible={!!menuFor} transparent animationType="fade" onRequestClose={() => setMenuFor(null)}>
        <Pressable style={styles.overlay} onPress={() => setMenuFor(null)}>
          <View style={styles.actionMenu}>
            {menuFor && (
              <>
                <Pressable style={styles.actionItem} onPress={() => openRename(menuFor)}>
                  <Text style={styles.actionItemText}>Rename</Text>
                </Pressable>
                <Pressable style={styles.actionItem} onPress={() => toggleArchive(menuFor)}>
                  <Text style={styles.actionItemText}>
                    {menuFor.archived ? 'Unarchive' : 'Archive'}
                  </Text>
                </Pressable>
                <View style={styles.divider} />
                <Pressable style={styles.actionItem} onPress={() => confirmDelete(menuFor)}>
                  <Text style={[styles.actionItemText, styles.deleteText]}>Delete</Text>
                </Pressable>
              </>
            )}
          </View>
        </Pressable>
      </Modal>

      <Modal visible={!!renaming} transparent animationType="fade" onRequestClose={() => setRenaming(null)}>
        <View style={styles.overlay}>
          <View style={styles.renameBox}>
            <Text style={styles.renameLabel}>Rename session</Text>
            <TextInput
              style={styles.renameInput}
              placeholder="Session name"
              placeholderTextColor="#6b7280"
              value={renameText}
              onChangeText={setRenameText}
              autoFocus
            />
            <View style={styles.renameButtons}>
              <Pressable style={styles.renameButton} onPress={() => setRenaming(null)}>
                <Text style={styles.actionItemText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.renameButton} onPress={saveRename}>
                <Text style={[styles.actionItemText, styles.saveText]}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
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
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.35)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
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
  archiveToggle: {
    marginBottom: 12,
  },
  archiveToggleText: {
    color: '#60a5fa',
    fontSize: 13,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  filterPills: {
    flexDirection: 'row',
    gap: 6,
  },
  filterPill: {
    backgroundColor: '#1f2937',
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  filterPillActive: {
    backgroundColor: '#1d4ed8',
  },
  filterPillText: {
    color: '#9ca3af',
    fontSize: 12,
    fontWeight: '600',
  },
  filterPillTextActive: {
    color: '#ffffff',
  },
  sortButton: {
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  sortButtonText: {
    color: '#60a5fa',
    fontSize: 12,
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
    alignItems: 'center',
    marginBottom: 6,
  },
  cardHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
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
  menuDots: {
    color: '#9ca3af',
    fontSize: 18,
    fontWeight: '700',
    paddingHorizontal: 4,
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
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionMenu: {
    backgroundColor: '#1f2937',
    borderRadius: 10,
    paddingVertical: 6,
    minWidth: 180,
  },
  actionItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  actionItemText: {
    color: '#e5e7eb',
    fontSize: 14,
  },
  deleteText: {
    color: '#f87171',
  },
  saveText: {
    color: '#60a5fa',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#374151',
    marginVertical: 4,
  },
  renameBox: {
    backgroundColor: '#1f2937',
    borderRadius: 10,
    padding: 16,
    width: '80%',
  },
  renameLabel: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
  },
  renameInput: {
    backgroundColor: '#111827',
    color: '#ffffff',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  renameButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  renameButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
});
