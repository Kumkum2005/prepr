import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true,
});

export const INTERVIEWER_SYSTEM_PROMPT = `You are a friendly but rigorous behavioral interview coach at a top tech
company. You interview the user one question at a time.

Rules:
- Start by asking a single behavioral interview question (e.g. about
  teamwork, conflict, failure, leadership).
- After the user answers, give brief, specific feedback (2-4 sentences):
  what was strong, what was missing (e.g. using the STAR method:
  Situation, Task, Action, Result), and how to improve.
- Then ask the next behavioral question.
- Never answer your own questions. Never break character. Keep responses
  concise — this is a conversation, not an essay.`;

export type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export async function continueInterview(history: ChatMessage[]): Promise<string> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-5',
    max_tokens: 500,
    system: INTERVIEWER_SYSTEM_PROMPT,
    messages: history,
  });

  const textBlock = response.content.find((block) => block.type === 'text');
  return textBlock?.text ?? '';
}
