import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Button,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
} from 'expo-audio';
import { ChatMessage, continueInterview, INTERVIEW_MODES, InterviewMode } from '../services/claude';
import { saveSession } from '../services/sessions';
import { speak, stopSpeaking } from '../services/speech';
import { transcribeAudio } from '../services/transcribe';

export default function InterviewScreen({ userId }: { userId: string }) {
  const [mode, setMode] = useState<InterviewMode>('behavioral');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [voiceOn, setVoiceOn] = useState(true);
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

  async function sendToInterviewer(history: ChatMessage[]) {
    setLoading(true);
    try {
      const reply = await continueInterview(history, mode);
      setMessages([...history, { role: 'assistant', content: reply }]);
      if (voiceOn) speak(reply);
    } catch (error) {
      setMessages([
        ...history,
        { role: 'assistant', content: 'Something went wrong. Check your API key in .env.' },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function startInterview() {
    setStarted(true);
    const history: ChatMessage[] = [{ role: 'user', content: 'Start the interview.' }];
    setMessages(history);
    sendToInterviewer(history);
  }

  function sendAnswer() {
    if (!input.trim() || loading) return;
    const history: ChatMessage[] = [...messages, { role: 'user', content: input.trim() }];
    setMessages(history);
    setInput('');
    sendToInterviewer(history);
  }

  async function endInterview() {
    stopSpeaking();
    try {
      await saveSession(userId, mode, messages);
    } catch (error) {
      Alert.alert('Could not save session', String(error));
    }
    setStarted(false);
    setMessages([]);
    setInput('');
  }

  async function startRecording() {
    try {
      const { granted } = await requestRecordingPermissionsAsync();
      if (!granted) {
        Alert.alert(
          'Microphone permission needed',
          'Go to your phone Settings > Prepr > Microphone and turn it on.'
        );
        return;
      }
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
      setRecording(true);
    } catch (error) {
      Alert.alert('Could not start recording', String(error));
    }
  }

  async function stopRecordingAndTranscribe() {
    if (!recording) return;
    setRecording(false);
    try {
      await recorder.stop();
      await setAudioModeAsync({ allowsRecording: false });
      const uri = recorder.uri;
      if (!uri) {
        Alert.alert('No recording captured', 'Try holding the button a little longer.');
        return;
      }

      setTranscribing(true);
      const text = await transcribeAudio(uri);
      setInput((prev) => (prev ? `${prev} ${text}` : text));
    } catch (error) {
      Alert.alert('Transcription failed', String(error));
    } finally {
      setTranscribing(false);
    }
  }

  return (
    <View style={styles.container}>
      {!started && (
        <View>
          <Text style={styles.modeLabel}>Choose interview type</Text>
          <View style={styles.modeRow}>
            {INTERVIEW_MODES.map((m) => (
              <Pressable
                key={m.id}
                style={[styles.modeButton, mode === m.id && styles.modeButtonActive]}
                onPress={() => setMode(m.id)}
              >
                <Text style={styles.modeButtonText}>{m.label}</Text>
              </Pressable>
            ))}
          </View>
          <Button title="Start Interview" onPress={startInterview} />
        </View>
      )}

      {started && (
        <>
          <View style={styles.interviewHeader}>
            <Button
              title={voiceOn ? '🔊 Voice On' : '🔇 Voice Off'}
              onPress={() => {
                const next = !voiceOn;
                setVoiceOn(next);
                if (!next) stopSpeaking();
              }}
            />
            <Button title="End Interview" onPress={endInterview} color="#dc2626" />
          </View>

          <ScrollView style={styles.chat}>
            {messages
              .filter((m) => m.content !== 'Start the interview.')
              .map((m, i) => (
                <View
                  key={i}
                  style={[
                    styles.bubble,
                    m.role === 'assistant' ? styles.assistantBubble : styles.userBubble,
                  ]}
                >
                  <Text style={styles.bubbleLabel}>
                    {m.role === 'assistant' ? 'Interviewer' : 'You'}
                  </Text>
                  <Text style={styles.bubbleText}>{m.content}</Text>
                </View>
              ))}
            {loading && <ActivityIndicator color="#ffffff" style={{ marginTop: 12 }} />}
          </ScrollView>

          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Type, or hold the mic button to speak..."
              placeholderTextColor="#6b7280"
              value={input}
              onChangeText={setInput}
              multiline
            />
            <Pressable
              style={[styles.micButton, recording && styles.micButtonActive]}
              onPressIn={startRecording}
              onPressOut={stopRecordingAndTranscribe}
            >
              <Text style={styles.micButtonText}>
                {transcribing
                  ? 'Transcribing...'
                  : recording
                    ? '● Recording... release to stop'
                    : '🎙️ Hold to speak'}
              </Text>
            </Pressable>
            <Button title="Send" onPress={sendAnswer} disabled={loading || transcribing} />
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  interviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  modeLabel: {
    color: '#9ca3af',
    fontSize: 13,
    marginBottom: 8,
  },
  modeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  modeButton: {
    flex: 1,
    backgroundColor: '#1f2937',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  modeButtonActive: {
    backgroundColor: '#1d4ed8',
  },
  modeButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  chat: {
    flex: 1,
    marginBottom: 12,
  },
  bubble: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  assistantBubble: {
    backgroundColor: '#1f2937',
  },
  userBubble: {
    backgroundColor: '#1d4ed8',
  },
  bubbleLabel: {
    color: '#9ca3af',
    fontSize: 11,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  bubbleText: {
    color: '#ffffff',
    fontSize: 15,
    lineHeight: 21,
  },
  inputRow: {
    marginBottom: 20,
  },
  micButton: {
    backgroundColor: '#1f2937',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  micButtonActive: {
    backgroundColor: '#7f1d1d',
  },
  micButtonText: {
    color: '#e5e7eb',
    fontSize: 14,
  },
  input: {
    backgroundColor: '#1f2937',
    color: '#ffffff',
    borderRadius: 8,
    padding: 12,
    minHeight: 60,
    marginBottom: 8,
    textAlignVertical: 'top',
  },
});
