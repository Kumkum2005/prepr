import { useState } from 'react';
import Constants from 'expo-constants';
import { Alert, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { deleteAllUserData } from '../services/sessions';

export default function SettingsScreen({
  visible,
  userId,
  onClose,
}: {
  visible: boolean;
  userId: string;
  onClose: () => void;
}) {
  const [deleting, setDeleting] = useState(false);

  function confirmDeleteAllData() {
    Alert.alert(
      'Delete all my data?',
      'This permanently deletes every interview session and photo you have saved. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete Everything', style: 'destructive', onPress: handleDeleteAllData },
      ]
    );
  }

  async function handleDeleteAllData() {
    setDeleting(true);
    try {
      await deleteAllUserData(userId);
      Alert.alert('Done', 'All your sessions and photos have been deleted.');
    } catch (error) {
      Alert.alert('Could not delete data', error instanceof Error ? error.message : String(error));
    } finally {
      setDeleting(false);
    }
  }

  const version = Constants.expoConfig?.version ?? '1.0.0';

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <Pressable onPress={onClose} hitSlop={8}>
            <Text style={styles.closeText}>Close</Text>
          </Pressable>
        </View>

        <Text style={styles.sectionTitle}>Data</Text>
        <Pressable
          style={styles.dangerButton}
          onPress={confirmDeleteAllData}
          disabled={deleting}
        >
          <Text style={styles.dangerButtonText}>
            {deleting ? 'Deleting...' : 'Delete All My Data'}
          </Text>
        </Pressable>
        <Text style={styles.helperText}>
          Removes all your interview sessions and attached photos. Your account login stays
          active.
        </Text>

        <View style={styles.sectionDivider} />
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.aboutText}>Prepr v{version}</Text>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    color: '#ffffff',
    fontSize: 20,
    fontFamily: 'CourierPrime_400Regular',
    fontWeight: '700',
  },
  closeText: {
    color: '#60a5fa',
    fontSize: 14,
    fontFamily: 'CourierPrime_400Regular',
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'CourierPrime_400Regular',
    fontWeight: '700',
    marginBottom: 12,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: '#1f2937',
    marginVertical: 24,
  },
  dangerButton: {
    backgroundColor: '#7f1d1d',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  dangerButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontFamily: 'CourierPrime_400Regular',
    fontWeight: '600',
  },
  helperText: {
    color: '#6b7280',
    fontSize: 12,
    fontFamily: 'CourierPrime_400Regular',
  },
  aboutText: {
    color: '#9ca3af',
    fontSize: 13,
    fontFamily: 'CourierPrime_400Regular',
  },
});
