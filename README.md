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
- [x] Phase 1 — MVP: one behavioral interview mode, text-based Q&A loop with Claude, feedback after each answer
- [x] Phase 2 — Voice: speech-to-text input, text-to-speech questions
- [x] Phase 3 — Accounts & history: Supabase auth, save past sessions
- [x] Phase 4 — More modes: coding/system-design questions, progress dashboard
- [ ] Phase 5 — Polish & app store prep: icons, screenshots, privacy policy, store listings
- [ ] Phase 6 — Submit to App Store & Google Play

## Known improvements for later

- Voice recording → transcription feels slow; look into speeding up the
  record/upload/transcribe round trip.
- Email confirmation is currently turned off in Supabase (the confirmation
  link tries to open a website that doesn't exist). Before real users sign
  up, set up a proper deep link (e.g. `prepr://`) so confirmation opens
  back into the app instead of a browser.
- Google Sign-In is coded but not fully working yet — it needs a
  development build (not Expo Go) to test the login redirect properly,
  which needs an Apple Developer account for iOS. Revisit alongside Apple
  Sign-In once that account exists.
- Settings currently offers "Delete All My Data" (sessions + photos) but
  not full account deletion (removing the login itself). Apple requires
  in-app account deletion for App Store approval if account creation is
  offered in-app — this needs a Supabase Edge Function (the client key
  can't delete auth users directly). Build before Phase 6 submission.

## Getting started

```bash
npm install
npm run ios      # or: npm run android / npm run web
```

Copy `.env.example` to `.env` and fill in your own API keys before running
anything that talks to Claude or Supabase.
