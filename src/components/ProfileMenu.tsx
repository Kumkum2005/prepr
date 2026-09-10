import { useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { signOut } from '../services/auth';

export default function ProfileMenu({ email }: { email: string }) {
  const [open, setOpen] = useState(false);
  const initial = email.trim().charAt(0).toUpperCase() || '?';

  function comingSoon(feature: string) {
    setOpen(false);
    Alert.alert(feature, 'Coming soon.');
  }

  return (
    <>
      <Pressable style={styles.avatar} onPress={() => setOpen(true)}>
        <Text style={styles.avatarText}>{initial}</Text>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <View style={styles.menu}>
            <Text style={styles.email} numberOfLines={1}>{email}</Text>

            <Pressable style={styles.menuItem} onPress={() => comingSoon('Edit Profile')}>
              <Text style={styles.menuItemText}>Edit Profile</Text>
            </Pressable>
            <Pressable style={styles.menuItem} onPress={() => comingSoon('Settings')}>
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
    </>
  );
}

const styles = StyleSheet.create({
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
