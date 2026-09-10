import { ChatMessage, InterviewMode } from './claude';
import { supabase } from './supabase';

export type InterviewSession = {
  id: string;
  created_at: string;
  mode: InterviewMode;
  title: string | null;
  archived: boolean;
  transcript: ChatMessage[];
};

export async function saveSession(userId: string, mode: InterviewMode, transcript: ChatMessage[]) {
  const { error } = await supabase
    .from('sessions')
    .insert({ user_id: userId, mode, transcript });
  if (error) throw error;
}

export async function listSessions(userId: string): Promise<InterviewSession[]> {
  const { data, error } = await supabase
    .from('sessions')
    .select('id, created_at, mode, title, archived, transcript')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as InterviewSession[];
}

export async function updateSessionTranscript(id: string, transcript: ChatMessage[]) {
  const { error } = await supabase.from('sessions').update({ transcript }).eq('id', id);
  if (error) throw error;
}

export async function renameSession(id: string, title: string) {
  const { error } = await supabase.from('sessions').update({ title }).eq('id', id);
  if (error) throw error;
}

export async function setSessionArchived(id: string, archived: boolean) {
  const { error } = await supabase.from('sessions').update({ archived }).eq('id', id);
  if (error) throw error;
}

export async function deleteSession(id: string) {
  const { error } = await supabase.from('sessions').delete().eq('id', id);
  if (error) throw error;
}
