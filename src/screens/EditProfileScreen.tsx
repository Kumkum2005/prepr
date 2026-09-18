import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { updatePassword, updateProfile } from '../services/auth';
import { pickImage, uploadImage } from '../services/images';

export default function EditProfileScreen({
  visible,
  user,
  onClose,
}: {
  visible: boolean;
  user: User;
  onClose: () => void;
}) {
  const [fullName, setFullName] = useState(user.user_metadata?.full_name ?? '');
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(user.user_metadata?.avatar_url);
  const [newPassword, setNewPassword] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setFullName(user.user_metadata?.full_name ?? '');
    setAvatarUrl(user.user_metadata?.avatar_url);
    setNewPassword('');
  }, [visible, user]);

  function handleClose() {
    setFullName(user.user_metadata?.full_name ?? '');
    setAvatarUrl(user.user_metadata?.avatar_url);
    setNewPassword('');
    onClose();
  }

  function changeAvatar() {
    Alert.alert('Change photo', undefined, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Take Photo', onPress: () => handlePickAvatar('camera') },
      { text: 'Choose from Library', onPress: () => handlePickAvatar('library') },
    ]);
  }

  async function handlePickAvatar(source: 'camera' | 'library') {
    try {
      const uri = await pickImage(source);
      if (!uri) return;
      setUploadingAvatar(true);
      const url = await uploadImage(user.id, uri);
      setAvatarUrl(url);
    } catch (error) {
      Alert.alert('Could not update photo', error instanceof Error ? error.message : String(error));
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      await updateProfile({ fullName: fullName.trim(), avatarUrl });
      if (newPassword.trim()) {
        if (newPassword.trim().length < 6) {
          Alert.alert('Password too short', 'Use at least 6 characters.');
          setSaving(false);
          return;
        }
        await updatePassword(newPassword.trim());
      }
      setNewPassword('');
      onClose();
    } catch (error) {
      Alert.alert('Could not save changes', error instanceof Error ? error.message : String(error));
    } finally {
      setSaving(false);
    }
  }

  const initial = (fullName || user.email || '?').trim().charAt(0).toUpperCase();

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Edit Profile</Text>
          <Pressable onPress={handleClose} hitSlop={8}>
            <Text style={styles.closeText}>Close</Text>
          </Pressable>
        </View>

        <Pressable style={styles.avatarWrap} onPress={changeAvatar} disabled={uploadingAvatar}>
          {uploadingAvatar ? (
            <View style={styles.avatar}>
              <ActivityIndicator color="#ffffff" />
            </View>
          ) : avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarInitial}>{initial}</Text>
            </View>
          )}
          <Text style={styles.changePhotoText}>Change photo</Text>
        </Pressable>

        <Text style={styles.label}>Display name</Text>
        <TextInput
          style={styles.input}
          placeholder="Your name"
          placeholderTextColor="#6b7280"
          value={fullName}
          onChangeText={setFullName}
        />

        <Text style={styles.label}>Email</Text>
        <Text style={styles.emailText}>{user.email}</Text>

        <Text style={styles.label}>New password (optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="Leave blank to keep current password"
          placeholderTextColor="#6b7280"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
        />

        <Pressable
          style={styles.saveButton}
          onPress={handleSave}
          disabled={saving || uploadingAvatar}
        >
          <Text style={styles.saveButtonText}>{saving ? 'Saving...' : 'Save Changes'}</Text>
        </Pressable>
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
    fontWeight: '700',
  },
  closeText: {
    color: '#60a5fa',
    fontSize: 14,
  },
  avatarWrap: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#1d4ed8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  avatarInitial: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '700',
  },
  changePhotoText: {
    color: '#60a5fa',
    fontSize: 13,
  },
  label: {
    color: '#9ca3af',
    fontSize: 13,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#1f2937',
    color: '#ffffff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 18,
  },
  emailText: {
    color: '#6b7280',
    fontSize: 15,
    marginBottom: 18,
  },
  saveButton: {
    backgroundColor: '#4f46e5',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
});
