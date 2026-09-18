import { ChatMessage, InterviewMode } from './claude';
import { supabase } from './supabase';

export type InterviewSession = {
  id: string;
  created_at: string;
  mode: InterviewMode;
  title: string | null;
  archived: boolean;
  transcript: ChatMessage[];
  images: string[];
};

export async function saveSession(
  userId: string,
  mode: InterviewMode,
  transcript: ChatMessage[],
  images: string[]
) {
  const { error } = await supabase
    .from('sessions')
    .insert({ user_id: userId, mode, transcript, images });
  if (error) throw error;
}

export async function listSessions(userId: string): Promise<InterviewSession[]> {
  const { data, error } = await supabase
    .from('sessions')
    .select('id, created_at, mode, title, archived, transcript, images')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as InterviewSession[];
}

export async function updateSessionTranscript(
  id: string,
  transcript: ChatMessage[],
  images: string[]
) {
  const { error } = await supabase.from('sessions').update({ transcript, images }).eq('id', id);
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

export async function deleteAllUserData(userId: string) {
  const { error: rowsError } = await supabase.from('sessions').delete().eq('user_id', userId);
  if (rowsError) throw rowsError;

  const { data: files, error: listError } = await supabase.storage
    .from('session-images')
    .list(userId);
  if (listError) throw listError;

  if (files && files.length > 0) {
    const paths = files.map((f) => `${userId}/${f.name}`);
    const { error: removeError } = await supabase.storage.from('session-images').remove(paths);
    if (removeError) throw removeError;
  }
}
