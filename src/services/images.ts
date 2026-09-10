import * as ImagePicker from 'expo-image-picker';
import { supabase } from './supabase';

export async function pickImage(source: 'camera' | 'library'): Promise<string | null> {
  const permission =
    source === 'camera'
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permission.granted) {
    throw new Error(
      source === 'camera'
        ? 'Camera permission needed. Go to Settings > Prepr > Camera and turn it on.'
        : 'Photos permission needed. Go to Settings > Prepr > Photos and turn it on.'
    );
  }

  const result =
    source === 'camera'
      ? await ImagePicker.launchCameraAsync({ quality: 0.6 })
      : await ImagePicker.launchImageLibraryAsync({ quality: 0.6 });

  if (result.canceled || !result.assets?.[0]) return null;
  return result.assets[0].uri;
}

export async function uploadSessionImage(userId: string, localUri: string): Promise<string> {
  const response = await fetch(localUri);
  const blob = await response.blob();

  const ext = localUri.split('.').pop()?.split('?')[0] || 'jpg';
  const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabase.storage
    .from('session-images')
    .upload(path, blob, { contentType: blob.type || 'image/jpeg' });
  if (error) throw error;

  const { data } = supabase.storage.from('session-images').getPublicUrl(path);
  return data.publicUrl;
}
