# AfriLove World — ProGuard / R8 keep rules for the release build.
# Keep rules for reflection-heavy plugins so minification doesn't break them.

# ── General attributes ────────────────────────────────────────────────────
-keepattributes Signature, *Annotation*, EnclosingMethod, InnerClasses, Exceptions
-dontwarn javax.annotation.**

# ── Flutter ───────────────────────────────────────────────────────────────
-keep class io.flutter.** { *; }
-keep class io.flutter.plugins.** { *; }
-dontwarn io.flutter.embedding.**

# ── Razorpay (payments) — required, breaks without keep ───────────────────
-keep class com.razorpay.** { *; }
-keep interface com.razorpay.** { *; }
-dontwarn com.razorpay.**
-optimizations !method/inlining/*
-keepclasseswithmembers class * {
    public void onPayment*(...);
}

# ── Agora (audio/video calls) ─────────────────────────────────────────────
-keep class io.agora.** { *; }
-dontwarn io.agora.**

# ── OneSignal (push) ──────────────────────────────────────────────────────
-keep class com.onesignal.** { *; }
-dontwarn com.onesignal.**

# ── Firebase / Google ─────────────────────────────────────────────────────
-keep class com.google.firebase.** { *; }
-keep class com.google.android.gms.** { *; }
-dontwarn com.google.firebase.**
-dontwarn com.google.android.gms.**

# ── Google Mobile Ads ─────────────────────────────────────────────────────
-keep class com.google.android.gms.ads.** { *; }

# ── WebView JS interfaces ─────────────────────────────────────────────────
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# ── Keep annotated model fields (defensive) ───────────────────────────────
-keepclassmembers class * {
    @com.google.gson.annotations.SerializedName <fields>;
}
