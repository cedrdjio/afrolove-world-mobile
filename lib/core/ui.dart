import 'package:flutter/material.dart';

/// ─────────────────────────────────────────────────────────────────────────
/// AFRILOVE WORLD — Design System tokens
///
/// Premium international dating identity (Bumble · Raya · Airbnb · Apple feel).
/// Warm editorial palette: Espresso + Camel Gold on warm Ivory.
///
/// NOTE: This is a purely visual layer. All original public symbols
/// (AppColors fields, TextStyles, Themes, FontFamilyy) are preserved so the
/// new identity propagates across the whole app without touching any feature,
/// API, business logic or navigation.
/// ─────────────────────────────────────────────────────────────────────────
class AppColors {
  // ── Brand core ──────────────────────────────────────────────────────────
  /// Primary brand color (Espresso). Used app-wide (~257 references).
  static Color appColor = const Color(0xff2C1B14);

  /// Secondary brand color (Camel Gold) — accents, focus, premium, links.
  static Color secondary = const Color(0xffD4A373);
  static Color secondaryDeep = const Color(0xffB07D4F);
  static Color goldLight = const Color(0xffE9C893);

  // ── Surfaces / backgrounds ───────────────────────────────────────────────
  /// Light scaffold background (warm ivory).
  static Color appBgColorlite = const Color(0xffF8F4EE);

  /// Dark scaffold background (deep espresso).
  static Color appBgColordart = const Color(0xff16100C);

  static Color bg = const Color(0xffF8F4EE);
  static Color card = const Color(0xffFFFFFF);

  // ── Text ─────────────────────────────────────────────────────────────────
  static Color textLight = const Color(0xff2C1B14);
  static Color text1Light = const Color(0xff8A7A6D);
  static Color textDark = const Color(0xffF8F4EE);
  static Color text1Dark = const Color(0xffD9CFC6);
  static Color textPrimary = const Color(0xff2C1B14);
  static Color textSecondary = const Color(0xff6B5D54);
  static Color textMuted = const Color(0xff9A8E84);

  // ── Greys / borders ───────────────────────────────────────────────────────
  static Color greyDark = const Color(0xff9A8E84);
  static Color greyLight = const Color(0xffECE5DD);
  static Color white = const Color(0xffffffff);

  /// Near-black brand ink (used as text/icon/indicator). On-brand espresso.
  static Color black = const Color(0xff2C1B14);

  static Color borderColor = const Color(0xffECE5DD);
  static Color darkBorderColor = const Color(0xff3A2E26);
  static Color darkBgColor = const Color(0xff16100C);
  static Color darkContainer = const Color(0xff221A15);

  // ── Semantic ──────────────────────────────────────────────────────────────
  static Color success = const Color(0xff2E9E6B);
  static Color error = const Color(0xffD0584E);
  static Color warning = const Color(0xffE0A042);
}

/// 8-pt soft spacing grid.
class AppSpacing {
  static const double xxs = 4;
  static const double xs = 8;
  static const double sm = 12;
  static const double md = 16;
  static const double lg = 20;
  static const double xl = 24;
  static const double xxl = 32;
  static const double xxxl = 40;
}

/// Corner radius tokens. Brand default for cards/sheets = xl (24).
class AppRadius {
  static const double sm = 12;
  static const double md = 16;
  static const double lg = 20;
  static const double xl = 24;
  static const double pill = 999;
}

/// Soft, brand-tinted, low-opacity elevations.
class AppShadows {
  static List<BoxShadow> soft = [
    BoxShadow(
      color: const Color(0xff2C1B14).withOpacity(0.06),
      blurRadius: 16,
      offset: const Offset(0, 6),
    ),
  ];

  static List<BoxShadow> card = [
    BoxShadow(
      color: const Color(0xff2C1B14).withOpacity(0.08),
      blurRadius: 24,
      offset: const Offset(0, 10),
    ),
  ];

  static List<BoxShadow> elevated = [
    BoxShadow(
      color: const Color(0xff2C1B14).withOpacity(0.12),
      blurRadius: 32,
      offset: const Offset(0, 16),
    ),
  ];
}

/// Brand gradients.
class AppGradients {
  /// Espresso overlay for hero photos (top → bottom).
  static LinearGradient overlay = LinearGradient(
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
    stops: const [0.1, 0.7, 1],
    colors: [
      Colors.transparent,
      AppColors.appColor.withOpacity(0.55),
      AppColors.appColor,
    ],
  );

  /// Premium / gold gradient for high-value CTAs and badges.
  static LinearGradient gold = const LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xffE9C893), Color(0xffD4A373), Color(0xffB07D4F)],
  );

  /// Rich brand gradient.
  static LinearGradient brand = const LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xff3A271D), Color(0xff2C1B14)],
  );
}

class Themes {
  static ThemeData defaultTheme = ThemeData(
    splashColor: Colors.transparent,
    highlightColor: Colors.transparent,
    hoverColor: Colors.transparent,
    dividerColor: Colors.transparent,
    brightness: Brightness.light,
    fontFamily: FontFamilyy.regular,
    bottomSheetTheme: BottomSheetThemeData(
      backgroundColor: AppColors.white,
      surfaceTintColor: Colors.transparent,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(AppRadius.xl)),
      ),
    ),
    outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
      foregroundColor: AppColors.textPrimary,
      backgroundColor: Colors.transparent,
      shape: RoundedRectangleBorder(
          side: BorderSide(color: AppColors.borderColor),
          borderRadius: BorderRadius.circular(AppRadius.md)),
      fixedSize: const Size.fromHeight(52),
    )),
    cardColor: AppColors.white,
    cardTheme: CardThemeData(
      color: AppColors.white,
      surfaceTintColor: Colors.transparent,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppRadius.xl),
        side: BorderSide(color: AppColors.borderColor),
      ),
    ),
    dividerTheme: DividerThemeData(color: AppColors.borderColor),
    elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
            shadowColor: Colors.transparent,
            elevation: 0,
            backgroundColor: AppColors.appColor,
            foregroundColor: AppColors.white,
            fixedSize: const Size.fromHeight(52),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(AppRadius.md),
            ))),
    textTheme: TextTheme(
        //this is headLine TextStyles for lite Mode
        headlineLarge: TextStyles.heading1,
        headlineMedium: TextStyles.heading2,
        headlineSmall: TextStyles.heading3,

        //this is Body TextStyles for lite Mode
        bodyLarge: TextStyles.body1,
        bodyMedium: TextStyles.body2,
        bodySmall: TextStyles.body3,

        //this is title TextStyles for lite Mode
        titleMedium: TextStyles.title1,
        titleSmall: TextStyles.title2,

        //this is Button TextStyles for lite Mode
        labelMedium: TextStyles.buttonTextStyle),
    scaffoldBackgroundColor: AppColors.appBgColorlite,
    indicatorColor: AppColors.black,
    colorScheme: ColorScheme.light(
      primary: AppColors.appColor,
      secondary: AppColors.secondary,
      surface: AppColors.white,
      error: AppColors.error,
    ),
    appBarTheme: AppBarTheme(
      elevation: 0,
      scrolledUnderElevation: 0,
      backgroundColor: AppColors.appBgColorlite,
      surfaceTintColor: Colors.transparent,
      iconTheme: IconThemeData(color: AppColors.textLight),
    ),
  );

  static ThemeData darkTheme = ThemeData(
    brightness: Brightness.dark,
    splashColor: Colors.transparent,
    highlightColor: Colors.transparent,
    hoverColor: Colors.transparent,
    dividerColor: Colors.transparent,
    fontFamily: FontFamilyy.regular,
    bottomSheetTheme: BottomSheetThemeData(
      backgroundColor: AppColors.darkContainer,
      surfaceTintColor: Colors.transparent,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(AppRadius.xl)),
      ),
    ),
    cardColor: AppColors.darkContainer,
    cardTheme: CardThemeData(
      color: AppColors.darkContainer,
      surfaceTintColor: Colors.transparent,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppRadius.xl),
        side: BorderSide(color: AppColors.darkBorderColor),
      ),
    ),
    dividerTheme: DividerThemeData(color: AppColors.darkBorderColor),
    outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
      foregroundColor: AppColors.textDark,
      shape: RoundedRectangleBorder(
          side: BorderSide(color: AppColors.darkBorderColor),
          borderRadius: BorderRadius.circular(AppRadius.md)),
      fixedSize: const Size.fromHeight(52),
    )),
    elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
            elevation: 0,
            shadowColor: Colors.transparent,
            // Gold reads as premium against the dark espresso background.
            backgroundColor: AppColors.secondary,
            foregroundColor: AppColors.appColor,
            fixedSize: const Size.fromHeight(52),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(AppRadius.md),
            ))),
    indicatorColor: AppColors.white,
    textTheme: TextTheme(
      //this is headLine TextStyles for Dark Mode
      headlineLarge: TextStyles.heading1.copyWith(color: AppColors.textDark),
      headlineMedium: TextStyles.heading2.copyWith(color: AppColors.textDark),
      headlineSmall: TextStyles.heading3.copyWith(color: AppColors.textDark),

      //this is Body TextStyles for Dark Mode
      bodyLarge: TextStyles.body1.copyWith(color: AppColors.text1Dark),
      bodyMedium: TextStyles.body2.copyWith(color: AppColors.text1Dark),
      bodySmall: TextStyles.body3.copyWith(color: AppColors.text1Dark),

      //this is title TextStyles for Dark Mode
      titleMedium: TextStyles.title1.copyWith(color: AppColors.textDark),
      titleSmall: TextStyles.title2.copyWith(color: AppColors.textDark),

      //this is Button TextStyles for Dark Mode
      labelMedium: TextStyles.buttonTextStyle,
    ),
    scaffoldBackgroundColor: AppColors.appBgColordart,
    colorScheme: ColorScheme.dark(
      primary: AppColors.secondary,
      secondary: AppColors.secondary,
      surface: AppColors.darkContainer,
      error: AppColors.error,
    ),
    appBarTheme: AppBarTheme(
      elevation: 0,
      scrolledUnderElevation: 0,
      backgroundColor: AppColors.appBgColordart,
      surfaceTintColor: Colors.transparent,
      iconTheme: IconThemeData(color: AppColors.textDark),
    ),
  );
}

class TextStyles {
  static TextStyle heading1 = TextStyle(
      fontWeight: FontWeight.bold,
      color: AppColors.textLight,
      fontSize: 34,
      letterSpacing: -0.4,
      height: 1.15,
      fontFamily: FontFamilyy.bold);

  static TextStyle heading2 = TextStyle(
      fontWeight: FontWeight.bold,
      color: AppColors.textLight,
      fontSize: 28,
      letterSpacing: -0.3,
      height: 1.18,
      fontFamily: FontFamilyy.bold);

  static TextStyle heading3 = TextStyle(
      fontWeight: FontWeight.bold,
      fontSize: 22,
      letterSpacing: -0.2,
      height: 1.2,
      color: AppColors.textLight,
      fontFamily: FontFamilyy.bold);

  static TextStyle body1 = TextStyle(
      fontWeight: FontWeight.normal,
      fontSize: 17,
      height: 1.45,
      color: AppColors.textLight,
      fontFamily: FontFamilyy.medium);

  static TextStyle body2 = TextStyle(
      fontWeight: FontWeight.normal,
      fontSize: 15,
      height: 1.45,
      color: AppColors.textLight,
      fontFamily: FontFamilyy.medium);

  static TextStyle body3 = TextStyle(
      fontWeight: FontWeight.w500,
      fontSize: 13,
      height: 1.4,
      letterSpacing: 0.1,
      color: AppColors.textSecondary,
      fontFamily: FontFamilyy.medium);

  static TextStyle title1 = TextStyle(
      fontWeight: FontWeight.w500,
      fontSize: 13,
      letterSpacing: 0.2,
      color: AppColors.textSecondary,
      fontFamily: FontFamilyy.medium);

  static TextStyle title2 = TextStyle(
      fontWeight: FontWeight.w400,
      fontSize: 11,
      letterSpacing: 0.3,
      color: AppColors.textMuted,
      fontFamily: FontFamilyy.regular);

  static TextStyle buttonTextStyle = TextStyle(
      fontWeight: FontWeight.w700,
      fontSize: 16,
      letterSpacing: 0.3,
      color: AppColors.white,
      fontFamily: FontFamilyy.bold);

  /// Uppercase eyebrow / premium tag.
  static TextStyle overline = TextStyle(
      fontWeight: FontWeight.w700,
      fontSize: 11,
      letterSpacing: 1.2,
      color: AppColors.secondaryDeep,
      fontFamily: FontFamilyy.bold);
}

/// Font families.
///
/// Brand font is Gotham, fallback Inter. The app currently ships with the
/// bundled Satoshi `.otf` files (clean geometric, premium). To switch to
/// Gotham/Inter: add the font files to `assets/fonts/`, register them in
/// `pubspec.yaml`, and repoint the constants below — every screen updates.
class FontFamilyy {
  static const String regular = "Satoshi-Regular";
  static const String bold = "Satoshi-Bold";
  static const String medium = "Satoshi-Medium";
  static const String black = "Satoshi-Black";
}
