// File generated for the AfriLove World Firebase project (afrilove-world).
// ignore_for_file: lines_longer_than_80_chars, avoid_classes_with_only_static_members
import 'package:firebase_core/firebase_core.dart' show FirebaseOptions;
import 'package:flutter/foundation.dart'
    show defaultTargetPlatform, kIsWeb, TargetPlatform;

class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform {
    if (kIsWeb) {
      return android;
    }
    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        return android;
      case TargetPlatform.iOS:
        return ios;
      default:
        return android;
    }
  }

  static const FirebaseOptions android = FirebaseOptions(
    apiKey: 'AIzaSyDJINNe9iwb6_GYsLi6V_XfTUxgaywuCRE',
    appId: '1:949332317190:android:f729fb77c3fe3f8279df87',
    messagingSenderId: '949332317190',
    projectId: 'afrilove-world',
    storageBucket: 'afrilove-world.firebasestorage.app',
  );

  // iOS uses GoogleService-Info.plist; these values mirror the Android app and
  // should be replaced with the iOS app's own values when it is created.
  static const FirebaseOptions ios = FirebaseOptions(
    apiKey: 'AIzaSyDJINNe9iwb6_GYsLi6V_XfTUxgaywuCRE',
    appId: '1:949332317190:android:f729fb77c3fe3f8279df87',
    messagingSenderId: '949332317190',
    projectId: 'afrilove-world',
    storageBucket: 'afrilove-world.firebasestorage.app',
    iosBundleId: 'com.afriloveworld.app',
  );
}
