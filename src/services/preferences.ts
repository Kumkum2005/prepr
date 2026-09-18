import AsyncStorage from '@react-native-async-storage/async-storage';

const VOICE_DEFAULT_KEY = 'prepr:voiceDefault';

export async function getVoiceDefault(): Promise<boolean> {
  const stored = await AsyncStorage.getItem(VOICE_DEFAULT_KEY);
  return stored === null ? true : stored === 'true';
}

export async function setVoiceDefault(enabled: boolean): Promise<void> {
  await AsyncStorage.setItem(VOICE_DEFAULT_KEY, String(enabled));
}
