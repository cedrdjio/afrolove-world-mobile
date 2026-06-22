# Afrilove World — Mobile (React Native + Expo)

Premium international dating app — **React Native + Expo** client for **AfriLove
World**, sharing one **Supabase** backend with the
[Next.js admin dashboard](https://afrilove-world-admin.vercel.app/) and keeping the
Afrilove visual identity (espresso + camel‑gold on warm ivory).

---

## ▶️ Run it (Expo Go, Android)

```bash
npm install
npx expo start
```

Scan the QR code with **Expo Go** (SDK 54). On an emulator press `a`; for a quick
browser preview press `w`. Use `npx expo start --tunnel` if your phone and computer
aren't on the same network.

### Try it now
- **Test account:** `test@afrilove.app` / `test1234`
- or **Continue as guest** on the sign‑in screen (offline demo data).

If the backend is ever unreachable, the app gracefully falls back to demo data so
the whole flow stays navigable on Expo Go.

---

## 🏗 Architecture

```
Expo app  ──(publishable key + signed session token)──▶  Supabase Edge Function `api`
                                                              │ (service-role, server-side)
                                                              ▼
                                                         Postgres (shared with admin)
Realtime chat ───────────────────────────────────────▶  Firebase Firestore
```

- The app talks **only** to the Edge Function gateway (`supabase/functions/api`),
  which runs server‑side with the service‑role key and returns a clean
  `{ ok, ... }` JSON envelope. Routes are RESTful: `/config`, `/auth/login`,
  `/auth/register`, `/auth/forgot`, `/home`, `/like`, `/likes-me`, `/matches`,
  `/profile`, `/plans`, `/wallet/*`, `/gifts`, … (no legacy `.php` contract).
- The app ships only the **publishable (anon) key** — never the secret key. Login
  returns a signed **session token**; authenticated routes derive the user from it.
- Chat is realtime on **Firestore**.

## 🔑 Configuration

Backend keys live in `app.json` → `expo.extra` (overridable via `EXPO_PUBLIC_*`):

| Key | Purpose |
|---|---|
| `extra.supabase.url` / `publishableKey` | Supabase project + publishable key |
| `extra.firebase.*` | Firebase web config for Firestore chat |

> The Edge Function reads `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` from the
> project's function secrets (auto‑injected) — never stored in the app.

## 🗂 Structure

```
app/                      # expo-router screens
  (auth)/                 # login · register · forgot  → /auth/* routes
  (tabs)/                 # Discover · Likes · Matches · Chats · Profile
  chat/[id].tsx           # realtime conversation (Firestore)
  profile/[id].tsx · premium.tsx
src/
  config/supabase.ts      # Supabase URL + publishable key + gateway base
  api/client.ts           # fetch client (publishable key + session token)
  api/services.ts         # typed wrappers for every gateway route
  context/AuthContext.tsx # session + token persistence
  hooks/useHomeFeed.ts    # /home feed + device location + like/dislike
  firebase/               # Firestore chat
  data/models.ts · data/demo.ts
  theme/ · components/
supabase/functions/api/   # the Edge Function gateway (source of truth)
```

## 🛣 Roadmap

- [x] Afrilove design system, theming, navigation, splash/onboarding
- [x] Auth on Supabase (login/register/forgot) + signed session token
- [x] Discover `/home` feed (device location, like/dislike, match detection)
- [x] Likes, Matches, Profile detail, Premium paywall
- [x] Firebase realtime chat
- [x] Clean RESTful Edge Function gateway (no legacy contract)
- [ ] Photo upload on register/edit (multipart already supported by the gateway)
- [ ] In‑app payments (plans, wallet, coins, gifts wired to gateway routes)
- [ ] Google Maps discovery, push notifications (OneSignal), multi‑language

## 💬 Realtime chat + Firebase Auth (one identity)

Chat/presence run on **Firestore** under **Firebase Auth**, but users keep a
single identity — their Supabase user id:

1. After Supabase login, the app calls `POST /auth/firebase-token` on the Edge
   Function, which mints a **Firebase custom token** (`uid` = the Supabase user
   id) and the app does `signInWithCustomToken`.
2. Firestore rules (`firestore.rules`) then trust `request.auth.uid` to scope
   each room to its two members and let users write only their own presence.

### One-time backend setup
1. **Firebase console → Project settings → Service accounts → Generate new
   private key.** Copy the downloaded JSON.
2. **Supabase → Edge Functions → `api` → Secrets**: add
   `FIREBASE_SERVICE_ACCOUNT` = the full service-account JSON (one line).
3. **Firebase console → Authentication → Get started** (enables custom-token
   sign-in).
4. **Firebase console → Firestore Database → Create database**, then paste
   `firestore.rules` into the Rules tab and Publish.

Works identically on **iOS and Android** (Firebase JS SDK). Until the secret is
set the conversation screen falls back to local demo messages, so the app stays
runnable.
