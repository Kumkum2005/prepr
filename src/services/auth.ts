import { supabase } from './supabase';

export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function updateProfile(fields: { fullName?: string; avatarUrl?: string }) {
  const data: Record<string, string> = {};
  if (fields.fullName !== undefined) data.full_name = fields.fullName;
  if (fields.avatarUrl !== undefined) data.avatar_url = fields.avatarUrl;

  const { error } = await supabase.auth.updateUser({ data });
  if (error) throw error;
}

export async function updatePassword(password: string) {
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
}

export async function requestPasswordReset(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) throw error;
}

export async function resetPasswordWithCode(email: string, code: string, newPassword: string) {
  const { error: verifyError } = await supabase.auth.verifyOtp({
    email,
    token: code,
    type: 'recovery',
  });
  if (verifyError) throw verifyError;
  await updatePassword(newPassword);
}
