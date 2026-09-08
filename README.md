# Prepr

An AI-powered mock interview coach. Talk through behavioral and technical
interview questions out loud, get structured feedback in real time, and
track your progress across sessions.

Built with React Native (Expo) so the same codebase ships to both the App
Store and Google Play. The interviewer is powered by Claude, with speech-to-
text and text-to-speech for a real spoken conversation.

## Tech stack

- **App**: React Native + Expo + TypeScript
- **AI**: Claude (Anthropic API) — agentic interview flow, structured feedback
- **Voice**: speech-to-text (user answers) + text-to-speech (AI questions)
- **Backend**: Supabase (auth, Postgres, session history)

## Roadmap

- [x] Project scaffold
- [ ] Phase 1 — MVP: one behavioral interview mode, text-based Q&A loop with Claude, feedback after each answer
- [ ] Phase 2 — Voice: speech-to-text input, text-to-speech questions
- [ ] Phase 3 — Accounts & history: Supabase auth, save past sessions
- [ ] Phase 4 — More modes: coding/system-design questions, progress dashboard
- [ ] Phase 5 — Polish & app store prep: icons, screenshots, privacy policy, store listings
- [ ] Phase 6 — Submit to App Store & Google Play

## Getting started

```bash
npm install
npm run ios      # or: npm run android / npm run web
```

Copy `.env.example` to `.env` and fill in your own API keys before running
anything that talks to Claude or Supabase.
