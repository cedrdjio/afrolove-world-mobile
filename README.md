# Afrilove World — Mobile (Flutter)

Premium international dating app, built with **Flutter**, re-skinned to the
**Afrilove World** identity (espresso `#2C1B14` + camel gold `#D4A373` on warm
ivory `#F8F4EE`, Satoshi type).

## Run locally

```bash
flutter pub get
flutter run
```

Requires Flutter (stable) + Android SDK. The app talks to its REST backend
(`lib/core/config.dart`) and uses the **afrilove-world** Firebase project
(`android/app/google-services.json`, `lib/firebase_options.dart`) for chat,
auth and notifications.

## Build store artifacts (GitHub Actions)

Every push runs `.github/workflows/build.yml`, which builds and uploads:

- **APK** — `afrilove-world-apk` (sideload / testing)
- **AAB** — `afrilove-world-aab` (Google Play upload)

Download them from the workflow run's **Artifacts** section. The release build
is currently signed with the debug key so CI produces an installable artifact;
before publishing to the Play Store, add an upload keystore and a release
`signingConfig` in `android/app/build.gradle.kts` (store the keystore via
repository secrets).

- **Application ID:** `com.afriloveworld.app` (matches the Firebase Android app)
- **App name:** Afrilove World
- **Launcher icon:** the Afrilove heart mark

## iOS

`flutter build ipa` builds iOS, but it needs a macOS runner + Apple signing
certificates and a `GoogleService-Info.plist` for the iOS Firebase app. The
current `firebase_options.dart` iOS values mirror Android as a placeholder.

## Structure

```
lib/            # app code (137 Dart files): screens, cubits, data, firebase, payments
assets/         # images, icons, lottie, Satoshi fonts
lang/           # localization JSON
android/ ios/   # native projects
```
