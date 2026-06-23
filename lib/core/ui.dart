import 'package:flutter/material.dart';

/// Clean global page transition: a soft fade with a subtle upward slide.
/// Applied to every route via the app theme for a smooth, premium feel.
class AppPageTransitionsBuilder extends PageTransitionsBuilder {
  const AppPageTransitionsBuilder();

  @override
  Widget buildTransitions<T>(
    PageRoute<T> route,
    BuildContext context,
    Animation<double> animation,
    Animation<double> secondaryAnimation,
    Widget child,
  ) {
    final curved = CurvedAnimation(parent: animation, curve: Curves.easeOutCubic);
    return FadeTransition(
      opacity: curved,
      child: SlideTransition(
        position: Tween<Offset>(begin: const Offset(0, 0.035), end: Offset.zero).animate(curved),
        child: child,
      ),
    );
  }
}

const _appPageTransitions = PageTransitionsTheme(builders: {
  TargetPlatform.android: AppPageTransitionsBuilder(),
  TargetPlatform.iOS: AppPageTransitionsBuilder(),
});

class AppColors {
  // AfriLove World palette — warm espresso + camel gold on ivory.
  static Color appColor = const Color(0xff2C1B14); // espresso (primary)
  static Color secondary = const Color(0xffD4A373); // camel gold (accent)
  static Color goldLight = const Color(0xffE9C893);
  static Color appBgColorlite = const Color(0xffF8F4EE); // warm ivory
  static Color appBgColordart = const Color(0xff16100C);
  static Color textLight = const Color(0xff2C1B14);
  static Color text1Light = const Color(0xff6B5D54);
  static Color textDark = const Color(0xffF8F4EE);
  static Color text1Dark = const Color(0xffD9CFC6);
  static Color greyDark = const Color(0xff9A8E84);
  static Color greyLight = const Color(0xffECE5DD);
  static Color white = const Color(0xffffffff);
  static Color black = const Color(0xff2C1B14);
  static Color borderColor = const Color(0xffECE5DD);
  static Color darkBorderColor = const Color(0xff3A2E26);
  static Color darkBgColor = const Color(0xff16100C);
  static Color darkContainer = const Color(0xff221A15);
}

class Themes {
  static ThemeData defaultTheme = ThemeData(
    splashColor: Colors.transparent,
    highlightColor: Colors.transparent,
    hoverColor: Colors.transparent,
    dividerColor: Colors.transparent,
    brightness: Brightness.light,
    fontFamily: FontFamilyy.regular,
    pageTransitionsTheme: _appPageTransitions,
    bottomSheetTheme: const BottomSheetThemeData(backgroundColor: Colors.white),
    outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          backgroundColor: Colors.transparent,
      shape: RoundedRectangleBorder(
          side: BorderSide(color: AppColors.borderColor),
          borderRadius: BorderRadius.circular(12)),
      fixedSize: const Size.fromHeight(50),
    )),
   cardColor: AppColors.white,
    dividerTheme: DividerThemeData(color: AppColors.borderColor),
    elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
            shadowColor: Colors.transparent,
            elevation: 0,
            backgroundColor: AppColors.appColor,
            fixedSize: const Size.fromHeight(50),
            shape: RoundedRectangleBorder(
              // side: BorderSide(color: AppColors.greyLight),
              borderRadius: BorderRadius.circular(12),
            )

        )),
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
    appBarTheme: AppBarTheme(
      elevation: 0,
      backgroundColor: AppColors.appBgColordart,
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
    pageTransitionsTheme: _appPageTransitions,
    bottomSheetTheme: BottomSheetThemeData(backgroundColor: AppColors.darkBgColor),
    cardColor: AppColors.darkContainer,
    dividerTheme: DividerThemeData(color: AppColors.darkBorderColor),
    outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
      shape: RoundedRectangleBorder(
          side: BorderSide(color: AppColors.borderColor),
          borderRadius: BorderRadius.circular(12)),
      fixedSize: const Size.fromHeight(48),
    )),

    elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
            elevation: 0,
            backgroundColor: AppColors.appColor,
            fixedSize: const Size.fromHeight(48),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
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
    appBarTheme: AppBarTheme(
      elevation: 0,
      backgroundColor: AppColors.appBgColordart,
      iconTheme: IconThemeData(color: AppColors.textLight),
    ),
  );
}

class TextStyles {
  static TextStyle heading1 = TextStyle(
      fontWeight: FontWeight.bold,
      color: AppColors.textLight,
      fontSize: 70,
      fontFamily: FontFamilyy.bold);

  static TextStyle heading2 = TextStyle(
      fontWeight: FontWeight.bold,
      color: AppColors.textLight,
      fontSize: 32,
      fontFamily: FontFamilyy.bold);

  static TextStyle heading3 = TextStyle(
      fontWeight: FontWeight.bold,
      fontSize: 24,
      color: AppColors.textLight,
      fontFamily: FontFamilyy.bold);

  static TextStyle body1 = TextStyle(
      fontWeight: FontWeight.normal,
      fontSize: 18,
      color: AppColors.textLight,
      fontFamily: FontFamilyy.medium);

  static TextStyle body2 = TextStyle(
      fontWeight: FontWeight.normal,
      fontSize: 16,
      color: AppColors.textLight,
      fontFamily: FontFamilyy.medium);

  static TextStyle body3 = TextStyle(
      fontWeight: FontWeight.w500,
      fontSize: 14,
      color: AppColors.textLight,
      fontFamily: FontFamilyy.medium);

  static TextStyle title1 = TextStyle(
      fontWeight: FontWeight.w300,
      fontSize: 12,
      color: AppColors.borderColor,
      fontFamily: FontFamilyy.regular);

  static TextStyle title2 = TextStyle(
      fontWeight: FontWeight.w300,
      fontSize: 10,
      color: AppColors.borderColor,
      fontFamily: FontFamilyy.regular);

  static TextStyle buttonTextStyle = TextStyle(
      fontWeight: FontWeight.w700,
      fontSize: 16,
      color: AppColors.textLight,
      fontFamily: FontFamilyy.medium
  );
}

class FontFamilyy {
  static const String regular = "Satoshi-Regular";
  static const String bold = "Satoshi-Bold";
  static const String medium = "Satoshi-Medium";
  static const String black = "Satoshi-Black";
}
