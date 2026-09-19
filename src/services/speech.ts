import { setAudioModeAsync } from 'expo-audio';
import * as Speech from 'expo-speech';

function stripMarkdown(text: string): string {
  return text.replace(/\*\*/g, '');
}

export async function speak(text: string) {
  Speech.stop();
  await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: false });
  Speech.speak(stripMarkdown(text), { rate: 1.0 });
}

export function stopSpeaking() {
  Speech.stop();
}
