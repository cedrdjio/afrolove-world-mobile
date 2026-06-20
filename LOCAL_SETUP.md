# AfriLove World — Local development setup

Step‑by‑step to run the Flutter app on your machine. Works on **macOS,
Windows and Linux** (commands noted where they differ).

The backend is already hosted (Supabase Edge Function + Firebase), so you do
**not** need to run a server locally to use the app.

---

## 1. Prerequisites (install once)

| Tool | Version | Notes |
|------|---------|-------|
| **Flutter SDK** | stable **3.44.x** (same as CI) | https://docs.flutter.dev/get-started/install |
| **Android Studio** | latest | provides the Android SDK, platform-tools & an emulator |
| **Android SDK** | API **36** (compileSdk) | install via Android Studio → SDK Manager |
| **Java JDK** | **17** | required by AGP 8.13 / Gradle 9.3 |
| **Git** | any | |
| **Xcode** (macOS only) | latest | only if you target iOS |
| **CocoaPods** (macOS only) | `sudo gem install cocoapods` | iOS dependencies |

Check everything is green:
```bash
flutter doctor
```
Fix anything with a ❌ before continuing (accept Android licenses with
`flutter doctor --android-licenses`).

> Tip: pin the Flutter version to match CI to avoid surprises:
> `flutter --version` should show **3.44.x**. If not, use FVM
> (`dart pub global activate fvm && fvm install 3.44.2 && fvm use 3.44.2`).

---

## 2. Get the code
```bash
git clone https://github.com/cedrdjio/afrolove-world-mobile.git
cd afrolove-world-mobile
git checkout claude/admiring-pascal-qml1va
```

## 3. Install dependencies
```bash
flutter pub get
```
macOS / iOS only:
```bash
cd ios && pod install && cd ..
```

## 4. Configuration (already wired — nothing to do for a quick run)
- **Backend API**: `lib/core/config.dart` already points to your Supabase
  Edge Function (`…/functions/v1/api`).
- **Firebase**: `android/app/google-services.json` + `lib/firebase_options.dart`
  point to your `afrilove-world` project.
- **Keys**: OneSignal + Google Maps are set in `config.dart` /
  `AndroidManifest.xml`.

> `android/local.properties` is generated automatically on first build (it
> stores `flutter.sdk` and `sdk.dir`). It is git-ignored — don't commit it.

## 5. Run the app
List devices / start an emulator, then run:
```bash
flutter devices
flutter emulators --launch <emulator_id>   # or plug in a phone with USB debugging
flutter run
```
Hot reload: press **r** in the terminal, hot restart: **R**.

Run a specific flavor of build:
```bash
flutter run --debug      # default, fast, with DevTools
flutter run --release    # production performance
flutter run -d chrome    # NOTE: this app targets mobile; web is not supported
```

## 6. Build artifacts locally
```bash
# Smallest installable APK for your phone (arm64):
flutter build apk --release --target-platform android-arm64

# All per-ABI APKs:
flutter build apk --release --split-per-abi

# Play Store bundle:
flutter build appbundle --release
```
Outputs:
- APK → `build/app/outputs/flutter-apk/`
- AAB → `build/app/outputs/bundle/release/`

---

## 7. Common issues

| Symptom | Fix |
|---|---|
| `Kotlin version … lower than 2.0.0` | Use Flutter **3.44.x** + JDK **17** (already configured in the repo). |
| `minSdkVersion` / Firebase error | Project is set to `minSdk 23` — keep it. |
| Gradle/AGP download is slow on first build | Normal; Gradle 9.3 + AGP 8.13 are fetched once. |
| Images don't load | The API returns **absolute** URLs and `Config.baseUrl` is `""` — don't change it. |
| `pod install` fails (macOS) | `cd ios && pod repo update && pod install`. |
| Build fails after pulling | `flutter clean && flutter pub get`. |

---

## 8. (Optional) Run the backend locally

You normally use the hosted Supabase function. To iterate on the API locally:

```bash
# Install the Supabase CLI: https://supabase.com/docs/guides/cli
supabase login
supabase link --project-ref sbvlkjaifqocakgxvdea

# Serve the Edge Function locally (http://localhost:54321/functions/v1/api)
supabase functions serve api --no-verify-jwt

# Deploy a change to the hosted function
supabase functions deploy api --no-verify-jwt
```
To point the app at the local function during dev, temporarily set
`baseUrlApi` in `lib/core/config.dart` to your machine IP, e.g.
`http://10.0.2.2:54321/functions/v1/api` (Android emulator → host loopback).
**Don't commit that change.**

---

## 9. Useful commands
```bash
flutter analyze          # static analysis / lints
flutter pub outdated     # dependency status
flutter clean            # wipe build/ caches
flutter logs             # device logs
```
