# Afrilove World — Mobile (React Native + Expo)

Premium international dating app — **React Native + Expo** rewrite of the original
Flutter app (ex‑GoMeet), keeping the **Afrilove World** visual identity (espresso +
camel‑gold on warm ivory) shared with the [admin dashboard](https://afrilove-world-admin.vercel.app/).

> This is the migration foundation: the full Afrilove design system, navigation and
> the core flows are implemented and runnable on **Expo Go** today. Heavy native
> modules (Agora audio/video, real‑time Firebase chat, PayPal/Razorpay/wallet
> payments, Google Maps) are scoped as follow‑up phases — see [Roadmap](#roadmap).

---

## ▶️ Test it on your Android phone (Expo Go)

1. Install **Expo Go** from the Play Store.
2. On your computer:
   ```bash
   npm install
   npx expo start
   ```
3. Scan the QR code shown in the terminal with **Expo Go**.

> The app needs **Expo Go SDK 56**. If your installed Expo Go is newer/older,
> install the matching build, or run a dev build. `npx expo start --tunnel` helps
> if your phone and computer aren't on the same network.

Other targets: `npm run android` (emulator), `npm run web` (browser preview).

### No account? It still works
Tap **"Continue as guest"** on the sign‑in screen (or sign in with anything — if the
API is unreachable the app falls back to an offline demo session). Discover, swipe,
likes, matches, chat and premium are all backed by demo data so the whole flow is
testable immediately.

---

## 🎨 Design system

Faithful port of the Flutter tokens (`DESIGN_SYSTEM.md` → `src/theme/theme.ts`).

| Token | Value |
|---|---|
| Primary (Espresso) | `#2C1B14` |
| Secondary (Camel Gold) | `#D4A373` |
| Background (Ivory) | `#F8F4EE` |
| Card | `#FFFFFF` · radius 24 |
| Font | Satoshi (swap for Gotham/Inter in `assets/fonts`) |

Logo: vector port of the Afrilove gradient heart (`src/components/Logo.tsx`).
Light **and** dark themes are wired (`src/theme/ThemeContext.tsx`).

---

## 🗂 Structure

```
app/                      # expo-router routes (file-based navigation)
  index.tsx               # animated splash → routing
  onboarding.tsx          # 4-slide onboarding (original content)
  (auth)/                 # login · register · forgot password
  (tabs)/                 # Discover · Likes · Matches · Chats · Profile
  chat/[id].tsx           # conversation
  profile/[id].tsx        # profile detail
  premium.tsx             # Afrilove Gold paywall
src/
  theme/                  # design tokens + theme context
  components/             # Logo, SwipeCard, reusable UI
  config/config.ts        # backend endpoints (GoMeet contract)
  api/client.ts           # axios client
  context/AuthContext.tsx # session / login
  data/demo.ts            # demo profiles & chats
assets/                   # fonts (Satoshi), onboarding & brand images
```

## 🔌 Backend

The app speaks the legacy GoMeet `*.php` REST contract (`src/config/config.ts`),
the same contract being re‑implemented on the shared Supabase Edge Function used by
the admin dashboard (`BACKEND_MAPPING.md`). Switch `Config.baseUrlApi` to
`Config.supabaseApi` once auth + home endpoints are live there.

## 🛣 Roadmap

- [x] Design system, theming, navigation, splash/onboarding
- [x] Auth (login/register/forgot) + session persistence
- [x] Discover swipe deck, Likes, Matches
- [x] Chat list + conversation UI, Profile detail, Premium paywall
- [x] **Live `user_login` / `home_data` wiring** (typed models + services,
      device location for `lats/longs`, like/dislike posts, graceful demo fallback)
- [x] **Firebase realtime chat** (Firestore — add your config to enable)
- [ ] Agora audio/video calls
- [ ] PayPal / Razorpay / wallet / coins / gifts
- [ ] Google Maps discovery, push notifications (OneSignal)
- [ ] Multi‑language (the `lang/*.json` catalog)

---

## 💬 Enable realtime chat (Firebase)

Chat runs on **Firestore** (`src/firebase/`). It works on local demo data until you
add a Firebase **web app** config — then logged‑in users get live messaging.

1. In the Firebase console, create a Web app and copy its config.
2. Paste it into `app.json` → `expo.extra.firebase` (or set `EXPO_PUBLIC_FIREBASE_*`
   env vars), then restart `npx expo start -c`.
3. Firestore layout used: `chats/{roomId}/messages/{id}` with `roomId` = the two
   user ids sorted + joined, plus a `chats/{roomId}` summary doc.

When no config is present, `firebaseEnabled` is `false` and the conversation screen
falls back to local demo messages — still fully navigable on Expo Go.

## 📍 Live data note

`Discover` calls `home_data.php` for the logged‑in user (resolving device location
for `lats/longs`). Guests and unreachable‑API cases fall back to demo profiles, so the
deck is never empty. Switch `Config.baseUrlApi` → `Config.supabaseApi` in
`src/config/config.ts` once the auth + home endpoints are live on the shared Supabase
Edge Function.
