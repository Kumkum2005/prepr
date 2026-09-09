import * as Speech from 'expo-speech';

function stripMarkdown(text: string): string {
  return text.replace(/\*\*/g, '');
}

export function speak(text: string) {
  Speech.stop();
  Speech.speak(stripMarkdown(text), { rate: 1.0 });
}

export function stopSpeaking() {
  Speech.stop();
}
