import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  ActivityIndicator,
  Button,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { askClaude } from './src/services/claude';

export default function App() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleAsk() {
    if (!question.trim()) return;
    setLoading(true);
    setAnswer('');
    try {
      const reply = await askClaude(question);
      setAnswer(reply);
    } catch (error) {
      setAnswer('Something went wrong. Check your API key in .env.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Prepr</Text>
      <Text style={styles.subtitle}>Ask a mock interview question</Text>

      <TextInput
        style={styles.input}
        placeholder="e.g. Tell me about a time you handled conflict"
        placeholderTextColor="#6b7280"
        value={question}
        onChangeText={setQuestion}
        multiline
      />

      <Button title={loading ? 'Asking...' : 'Ask Claude'} onPress={handleAsk} disabled={loading} />

      <ScrollView style={styles.answerBox}>
        {loading && <ActivityIndicator color="#ffffff" />}
        {!!answer && <Text style={styles.answerText}>{answer}</Text>}
      </ScrollView>

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
  input: {
    backgroundColor: '#1f2937',
    color: '#ffffff',
    borderRadius: 8,
    padding: 12,
    minHeight: 80,
    marginBottom: 12,
    textAlignVertical: 'top',
  },
  answerBox: {
    marginTop: 20,
  },
  answerText: {
    color: '#e5e7eb',
    fontSize: 15,
    lineHeight: 22,
  },
});
