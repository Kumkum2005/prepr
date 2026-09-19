import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Button,
  Image,
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
import { pickImage, uploadImage } from '../services/images';
import { InterviewSession, saveSession, updateSessionTranscript } from '../services/sessions';
import { speak, stopSpeaking } from '../services/speech';
import { transcribeAudio } from '../services/transcribe';

export default function InterviewScreen({
  userId,
  displayName,
  resumeSession,
  onResumed,
}: {
  userId: string;
  displayName: string;
  resumeSession: InterviewSession | null;
  onResumed: () => void;
}) {
  const [mode, setMode] = useState<InterviewMode>('behavioral');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [voiceOn, setVoiceOn] = useState(true);
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const sessionIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!resumeSession) return;
    setMode(resumeSession.mode);
    setMessages(resumeSession.transcript);
    setImages(resumeSession.images);
    sessionIdRef.current = resumeSession.id;
    setStarted(true);
    onResumed();
  }, [resumeSession]);

  async function persistSession(currentMessages: ChatMessage[], currentImages: string[]) {
    if (sessionIdRef.current) {
      await updateSessionTranscript(sessionIdRef.current, currentMessages, currentImages);
    } else {
      sessionIdRef.current = await saveSession(userId, mode, currentMessages, currentImages);
    }
  }

  async function sendToInterviewer(history: ChatMessage[]) {
    setLoading(true);
    try {
      const reply = await continueInterview(history, mode);
      const updated = [...history, { role: 'assistant' as const, content: reply }];
      setMessages(updated);
      if (voiceOn) speak(reply);
      try {
        await persistSession(updated, images);
      } catch (saveError) {
        console.error('Auto-save failed', saveError);
      }
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
    sessionIdRef.current = null;
    setImages([]);
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
      await persistSession(messages, images);
    } catch (error) {
      Alert.alert('Could not save session', error instanceof Error ? error.message : String(error));
    }
    setStarted(false);
    setMessages([]);
    setInput('');
    sessionIdRef.current = null;
    setImages([]);
  }

  function addImage() {
    Alert.alert('Attach photo', undefined, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Take Photo', onPress: () => handlePickImage('camera') },
      { text: 'Choose from Library', onPress: () => handlePickImage('library') },
    ]);
  }

  async function handlePickImage(source: 'camera' | 'library') {
    try {
      const uri = await pickImage(source);
      if (!uri) return;
      setUploadingImage(true);
      const url = await uploadImage(userId, uri);
      const updated = [...images, url];
      setImages(updated);
      await persistSession(messages, updated);
    } catch (error) {
      Alert.alert('Could not attach photo', error instanceof Error ? error.message : String(error));
    } finally {
      setUploadingImage(false);
    }
  }

  async function removeImage(index: number) {
    const updated = images.filter((_, i) => i !== index);
    setImages(updated);
    try {
      await persistSession(messages, updated);
    } catch (error) {
      console.error('Auto-save failed', error);
    }
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
      await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });
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
        <View style={styles.modeScreen}>
          <Text style={styles.greeting}>Hey {displayName},</Text>
          <Text style={styles.greetingSubtext}>Ready to practice for your next interview?</Text>
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
                if (!next) {
                  stopSpeaking();
                } else {
                  const lastQuestion = [...messages].reverse().find((m) => m.role === 'assistant');
                  if (lastQuestion) speak(lastQuestion.content);
                }
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

          {(images.length > 0 || uploadingImage) && (
            <ScrollView horizontal style={styles.imageRow} showsHorizontalScrollIndicator={false}>
              {images.map((url, i) => (
                <View key={url} style={styles.thumbnailWrap}>
                  <Image source={{ uri: url }} style={styles.thumbnail} />
                  <Pressable style={styles.thumbnailRemove} onPress={() => removeImage(i)}>
                    <Text style={styles.thumbnailRemoveText}>×</Text>
                  </Pressable>
                </View>
              ))}
              {uploadingImage && (
                <View style={[styles.thumbnail, styles.thumbnailLoading]}>
                  <ActivityIndicator color="#ffffff" size="small" />
                </View>
              )}
            </ScrollView>
          )}

          {(recording || transcribing) && (
            <Text style={styles.statusText}>
              {recording ? '● Recording... release mic to stop' : 'Transcribing...'}
            </Text>
          )}

          <View style={styles.inputBar}>
            <Pressable
              style={styles.iconButton}
              onPress={addImage}
              disabled={uploadingImage}
            >
              <Text style={styles.iconButtonText}>📷</Text>
            </Pressable>

            <TextInput
              style={styles.inputBarText}
              placeholder="Type, or hold mic to speak..."
              placeholderTextColor="#6b7280"
              value={input}
              onChangeText={setInput}
              multiline
            />

            <Pressable
              style={[styles.iconButton, recording && styles.micButtonActive]}
              onPressIn={startRecording}
              onPressOut={stopRecordingAndTranscribe}
            >
              <Text style={styles.iconButtonText}>🎙️</Text>
            </Pressable>

            <Pressable
              style={[styles.sendButton, (loading || transcribing || !input.trim()) && styles.sendButtonDisabled]}
              onPress={sendAnswer}
              disabled={loading || transcribing || !input.trim()}
            >
              <Text style={styles.sendButtonText}>➤</Text>
            </Pressable>
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
  modeScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  greeting: {
    color: '#ffffff',
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
  },
  greetingSubtext: {
    color: '#9ca3af',
    fontSize: 14,
    marginTop: 6,
    marginBottom: 36,
    textAlign: 'center',
  },
  modeLabel: {
    color: '#9ca3af',
    fontSize: 13,
    marginBottom: 12,
    textAlign: 'center',
  },
  modeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },
  modeButton: {
    backgroundColor: '#1f2937',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  modeButtonActive: {
    backgroundColor: '#4f46e5',
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
  imageRow: {
    marginBottom: 10,
  },
  thumbnailWrap: {
    marginRight: 8,
  },
  thumbnail: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: '#1f2937',
  },
  thumbnailLoading: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnailRemove: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#dc2626',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnailRemoveText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 14,
  },
  statusText: {
    color: '#f87171',
    fontSize: 12,
    marginBottom: 6,
    textAlign: 'center',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#1f2937',
    borderRadius: 20,
    paddingHorizontal: 6,
    paddingVertical: 6,
    marginBottom: 20,
    gap: 4,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonText: {
    fontSize: 18,
  },
  micButtonActive: {
    backgroundColor: '#7f1d1d',
  },
  inputBarText: {
    flex: 1,
    color: '#ffffff',
    fontSize: 15,
    maxHeight: 100,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#4f46e5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#374151',
  },
  sendButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});
