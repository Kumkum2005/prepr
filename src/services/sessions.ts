import { ChatMessage } from './claude';
import { supabase } from './supabase';

export type InterviewSession = {
  id: string;
  created_at: string;
  transcript: ChatMessage[];
};

export async function saveSession(userId: string, transcript: ChatMessage[]) {
  const { error } = await supabase
    .from('sessions')
    .insert({ user_id: userId, transcript });
  if (error) throw error;
}

export async function listSessions(userId: string): Promise<InterviewSession[]> {
  const { data, error } = await supabase
    .from('sessions')
    .select('id, created_at, transcript')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as InterviewSession[];
}
