import { useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { signOut } from '../services/auth';
import EditProfileScreen from '../screens/EditProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';

export default function ProfileMenu({ user }: { user: User }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const fullName: string | undefined = user.user_metadata?.full_name;
  const avatarUrl: string | undefined = user.user_metadata?.avatar_url;
  const email = user.email ?? '';
  const initial = (fullName || email || '?').trim().charAt(0).toUpperCase();

  return (
    <>
      <Pressable style={styles.avatarButton} onPress={() => setOpen(true)}>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.avatar} />
        ) : (
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
        )}
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <View style={styles.menu}>
            <Text style={styles.email} numberOfLines={1}>
              {fullName || email}
            </Text>

            <Pressable
              style={styles.menuItem}
              onPress={() => {
                setOpen(false);
                setEditing(true);
              }}
            >
              <Text style={styles.menuItemText}>Edit Profile</Text>
            </Pressable>
            <Pressable
              style={styles.menuItem}
              onPress={() => {
                setOpen(false);
                setSettingsOpen(true);
              }}
            >
              <Text style={styles.menuItemText}>Settings</Text>
            </Pressable>
            <View style={styles.divider} />
            <Pressable
              style={styles.menuItem}
              onPress={() => {
                setOpen(false);
                signOut();
              }}
            >
              <Text style={[styles.menuItemText, styles.signOutText]}>Sign Out</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      <EditProfileScreen visible={editing} user={user} onClose={() => setEditing(false)} />
      <SettingsScreen
        visible={settingsOpen}
        userId={user.id}
        onClose={() => setSettingsOpen(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  avatarButton: {
    width: 36,
    height: 36,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1d4ed8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 15,
    fontFamily: 'CourierPrime_400Regular',
    fontWeight: '700',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  menu: {
    position: 'absolute',
    top: 84,
    right: 20,
    backgroundColor: '#1f2937',
    borderRadius: 10,
    paddingVertical: 6,
    minWidth: 180,
  },
  email: {
    color: '#6b7280',
    fontSize: 12,
    fontFamily: 'CourierPrime_400Regular',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  menuItem: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  menuItemText: {
    color: '#e5e7eb',
    fontSize: 14,
    fontFamily: 'CourierPrime_400Regular',
  },
  signOutText: {
    color: '#f87171',
  },
  divider: {
    height: 1,
    backgroundColor: '#374151',
    marginVertical: 4,
  },
});
