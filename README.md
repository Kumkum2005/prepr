# Prepr

An AI mock-interview coach for iOS, Android, and web. Pick behavioral or
technical, answer out loud or by typing, and get specific, structured
feedback from Claude after every answer. Every session is saved so you can
search it, review it, and pick it back up later.

Built with React Native (Expo) and TypeScript: one codebase for both app
stores and the browser.

## Features

- **Two interview modes** - behavioral (STAR-method feedback) and technical
  (approach, edge cases, complexity), each with its own interviewer prompt
- **Voice in and out** - hold-to-speak answers transcribed with OpenAI
  Whisper; interviewer questions read aloud with text-to-speech
- **Auto-saved sessions** - saved to Supabase after every exchange, so a
  crash or force-quit never loses an interview
- **History** - search by title or transcript text, filter by mode, rename,
  archive, delete, and continue any past session where you left off
- **Photo attachments** - attach whiteboard sketches or diagrams to a session
  (camera or library, stored in Supabase Storage)
- **Accounts** - email/password and Google sign-in, profile photo and display
  name, verified password change
- **Per-user data isolation** - Postgres row-level security on every table
  and storage policy, so users can only touch their own data

## Tech stack

| Area | Choice |
| --- | --- |
| App | React Native, Expo (SDK 57), TypeScript |
| Interviewer | Claude (Anthropic API) |
| Speech-to-text | OpenAI Whisper |
| Text-to-speech | expo-speech |
| Auth, database, storage | Supabase (Postgres + RLS + Storage) |

## Running it locally

```bash
npm install
cp .env.example .env     # then fill in your own keys
npx expo start           # scan the QR code with Expo Go, or press w for web
```

You need your own accounts/keys for:

- **Anthropic** (`EXPO_PUBLIC_ANTHROPIC_API_KEY`) - interviewer
- **OpenAI** (`EXPO_PUBLIC_OPENAI_API_KEY`) - Whisper transcription
- **Supabase** (`EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`) -
  create a free project, then run [`supabase/schema.sql`](supabase/schema.sql)
  in the SQL editor (creates the `sessions` table, storage bucket, and all
  row-level-security policies)

In Supabase, turn off "Confirm email" under Authentication > Providers >
Email for local testing.

## Security note

This is a client-side prototype: the Anthropic and OpenAI keys are read from
`EXPO_PUBLIC_*` variables, which Expo bundles into the app. That is fine for
running it yourself with your own keys, but **do not deploy a public build
with real keys in it**. A production version should move the Claude and
Whisper calls behind a small server-side proxy (e.g. a Supabase Edge
Function) so the keys never reach the client. The Supabase anon key is safe
to ship by design; access is enforced by row-level security.

## Project layout

```
App.tsx                 root: auth gate, tabs, keyboard handling
src/screens/            Interview, History, Auth, EditProfile, Settings
src/components/         ProfileMenu
src/services/           claude, transcribe, speech, sessions, images,
                        auth, googleAuth, supabase
supabase/               schema.sql (fresh setup) + incremental migrations
```

## Roadmap

- [x] Behavioral and technical interview modes with Claude feedback
- [x] Voice input (Whisper) and spoken questions
- [x] Accounts, session history, search, and resume
- [x] Photo attachments, profile editing, settings
- [ ] Server-side proxy for AI calls (required before any public deploy)
- [ ] Custom SMTP provider (Supabase's built-in sender can't edit templates;
      the forgot-password code flow needs the reset email to include `{{ .Token }}`)
- [ ] Full account deletion via Edge Function (App Store requirement)
- [ ] Google/Apple sign-in verified on a development build
- [ ] Email confirmation deep link (`prepr://`)
- [ ] Responsive web layout for desktop
- [ ] App Store and Google Play submission

## License

MIT - see [LICENSE](LICENSE).
