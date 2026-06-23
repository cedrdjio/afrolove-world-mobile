import 'package:camera/camera.dart';
import 'package:afrilove_world/Logic/cubits/Home_cubit/home_cubit.dart';
import 'package:afrilove_world/Logic/cubits/auth_cubit/auth_cubit.dart';
import 'package:afrilove_world/Logic/cubits/editProfile_cubit/editprofile_cubit.dart';
import 'package:afrilove_world/Logic/cubits/language_cubit/language_bloc.dart';
import 'package:afrilove_world/Logic/cubits/match_cubit/match_cubit.dart';
import 'package:afrilove_world/Logic/cubits/onBording_cubit/onbording_cubit.dart';
import 'package:afrilove_world/Logic/cubits/litedark/lite_dark_cubit.dart';
import 'package:afrilove_world/core/routes.dart';
import 'package:afrilove_world/firebase_options.dart';
import 'package:afrilove_world/language/localization/app_localization_setup.dart';
import 'package:afrilove_world/presentation/firebase/auth_firebase.dart';
import 'package:afrilove_world/presentation/firebase/chat_service.dart';
import 'package:afrilove_world/presentation/firebase/chatting_provider.dart';
import 'package:afrilove_world/presentation/screens/BottomNavBar/chats.dart';
import 'package:afrilove_world/presentation/screens/BottomNavBar/homeProvider/homeprovier.dart';
import 'package:afrilove_world/presentation/screens/BottomNavBar/match/matchprovider.dart';
import 'package:afrilove_world/presentation/screens/other/editProfile/editprofile_provider.dart';
import 'package:afrilove_world/presentation/screens/other/likeMatch/likematch_provider.dart';
import 'package:afrilove_world/presentation/screens/other/premium/premium_provider.dart';
import 'package:afrilove_world/presentation/screens/other/profileAbout/detailprovider.dart';
import 'package:afrilove_world/presentation/screens/other/profileScreen/profile_page.dart';
import 'package:afrilove_world/presentation/screens/other/profileScreen/profile_provider.dart';
import 'package:afrilove_world/presentation/screens/splash_bording/onBordingProvider/onbording_provider.dart';
import 'package:afrilove_world/presentation/screens/splash_bording/splash_screen.dart';
import 'package:afrilove_world/wallete_code/wallet_provider.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:google_mobile_ads/google_mobile_ads.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'Logic/cubits/litedark/lite_dark_state.dart';
import 'Logic/cubits/premium_cubit/premium_bloc.dart';
import '../by_coin_screen/coin_provider.dart';


Future<void> main() async {

  WidgetsFlutterBinding.ensureInitialized();
  cameras = await availableCameras();
  MobileAds.instance.initialize();
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );
  FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);
  runApp(MyApp());
  initializeNotifications();
  listenFCM();
  loadFCM();
  SharedPreferences prefs = await SharedPreferences.getInstance();
  prefs.setDouble("rediuse", 0);
}

final GlobalKey<NavigatorState> navigatorKey = GlobalKey<NavigatorState>();

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [
        BlocProvider(create: (context) => ThemeBloc()),
        BlocProvider(create: (context) => AuthCubit()),
        BlocProvider(create: (context) => OnbordingCubit()),
        BlocProvider(create: (context) => HomePageCubit()),
        BlocProvider(create: (context) => EditProfileCubit()),
        BlocProvider(create: (context) => MatchCubit()),
        BlocProvider(create: (context) => LanguageCubit()),
        BlocProvider(create: (context) => PremiumBloc()),
      ],
      child: BlocBuilder<ThemeBloc, ThemeState>(
        builder: (context, theme) {
          return BlocBuilder<LanguageCubit,LanguageState>(
            buildWhen: (previous, current) => previous != current, builder: (context, languageState){
              return MultiProvider(
                providers: [
                  ChangeNotifierProvider(create: (context) => OnBordingProvider()),
                  ChangeNotifierProvider(create: (context) => DetailProvider()),
                  ChangeNotifierProvider(create: (context) => HomeProvider()),
                  ChangeNotifierProvider(create: (context) => ProfileProvider()),
                  ChangeNotifierProvider(create: (context) => EditProfileProvider()),
                  ChangeNotifierProvider(create: (context) => MatchProvider()),
                  ChangeNotifierProvider(create: (context) => LikeMatchProvider()),
                  ChangeNotifierProvider(create: (context) => FirebaseAuthService()),
                  ChangeNotifierProvider(create: (context) => ChattingProvider()),
                  ChangeNotifierProvider(create: (context) => PremiumProvider()),
                  ChangeNotifierProvider(create: (context) => WalleteProvider()),
                  ChangeNotifierProvider(create: (context) => ByCoinProvider()),
                  ChangeNotifierProvider(create: (context) => ChatServices()),
                ],
                child: MaterialApp(
                  builder: (context, child) {
                    return SafeArea(
                      top: false,
                      child: child!,
                    );
                  },
                  debugShowCheckedModeBanner: false,
                  initialRoute: SplashScreen.splashScreenRoute,
                  // home: VideoCallPage(),
                  theme: theme.themeData,
                  navigatorKey: navigatorKey,
                  onGenerateRoute: Routes.onGenerateRoute,
                  supportedLocales: AppLocalizationSetup.supportedLanguage,
                  localizationsDelegates: AppLocalizationSetup.localizationsDelegates,
                  localeResolutionCallback: AppLocalizationSetup.localeResolutionCallback,
                  locale: languageState.locale,
                ),
              );
            }
          );
        },
      ),
    );
  }
}

Future<void>  _firebaseMessagingBackgroundHandler(RemoteMessage message) async {/* 11,015*/}

 
