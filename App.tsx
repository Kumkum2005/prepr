import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  ActivityIndicator,
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
  useAudioRecorder,
} from 'expo-audio';
import { ChatMessage, continueInterview } from './src/services/claude';
import { speak, stopSpeaking } from './src/services/speech';
import { transcribeAudio } from './src/services/transcribe';

export default function App() {
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
      const reply = await continueInterview(history);
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
    const history: ChatMessage[] = [
      { role: 'user', content: 'Start the interview.' },
    ];
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

  async function startRecording() {
    const { granted } = await requestRecordingPermissionsAsync();
    if (!granted) return;
    await recorder.prepareToRecordAsync();
    recorder.record();
    setRecording(true);
  }

  async function stopRecordingAndTranscribe() {
    setRecording(false);
    await recorder.stop();
    const uri = recorder.uri;
    if (!uri) return;

    setTranscribing(true);
    try {
      const text = await transcribeAudio(uri);
      setInput((prev) => (prev ? `${prev} ${text}` : text));
    } catch (error) {
      setInput((prev) => prev || '');
    } finally {
      setTranscribing(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Prepr</Text>
          <Text style={styles.subtitle}>Mock behavioral interview</Text>
        </View>
        {started && (
          <Button
            title={voiceOn ? '🔊 Voice On' : '🔇 Voice Off'}
            onPress={() => {
              const next = !voiceOn;
              setVoiceOn(next);
              if (!next) stopSpeaking();
            }}
          />
        )}
      </View>

      {!started && (
        <Button title="Start Interview" onPress={startInterview} />
      )}

      {started && (
        <>
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
                {transcribing ? 'Transcribing...' : recording ? '● Recording... release to stop' : '🎙️ Hold to speak'}
              </Text>
            </Pressable>
            <Button title="Send" onPress={sendAnswer} disabled={loading || transcribing} />
          </View>
        </>
      )}

      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
    paddingTop: 80,
    paddingHorizontal: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 20,
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
