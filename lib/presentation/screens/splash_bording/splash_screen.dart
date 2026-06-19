import 'package:dating/core/ui.dart';
import 'package:dating/presentation/screens/splash_bording/onBordingProvider/onbording_provider.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../Logic/cubits/onBording_cubit/onbording_cubit.dart';


// 4321098767 :- abcdef
// 9909909901 :- 123


String android_bannerid = "";
String android_in_id = "";

String ios_bannerid = "";
String ios_in_id = "";
String agoraVcKey = "";

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});
  static const String splashScreenRoute = "/";
  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {

  @override
  void initState() {
    super.initState();
    BlocProvider.of<OnbordingCubit>(context).smstypeapi(context).then((value) {

      fun();
      android_bannerid = value["banner_id"];
      android_in_id = value["in_id"];
      ios_bannerid = value["ios_banner_id"];
      ios_in_id = value["ios_in_id"];
      agoraVcKey = value["agora_app_id"];
      // agoraVcKey = "3b2d066ea4da4c84ad4492ea72780653";
      print("agoraVcKey:- $agoraVcKey");

    },);
    Provider.of<OnBordingProvider>(context, listen: false).getCurrentLatAndLong(context);

  }
  
  
  fun() async{
    SharedPreferences prefs = await SharedPreferences.getInstance();
    prefs.setString("maintainanceenabled", onbordingCubit.smaTypeApiModel!.maintainanceEnabled);
    prefs.setString("otpauth", onbordingCubit.smaTypeApiModel!.otpAuth);
  }

  late OnbordingCubit onbordingCubit;

  @override
  Widget build(BuildContext context) {
    onbordingCubit = Provider.of<OnbordingCubit>(context);
    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Spacer(flex: 5),
            SvgPicture.asset("assets/Image/appLogo.svg", height: 96, width: 96),
            const SizedBox(height: 28),
            Text(
              "AFRILOVE",
              style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                    letterSpacing: 4,
                    color: AppColors.textPrimary,
                  ),
            ),
            const SizedBox(height: 6),
            Text(
              "W O R L D",
              style: TextStyles.overline.copyWith(
                letterSpacing: 6,
                fontSize: 12,
                color: AppColors.secondaryDeep,
              ),
            ),
            const Spacer(flex: 6),
            SizedBox(
              height: 28,
              width: 28,
              child: CircularProgressIndicator(
                strokeWidth: 2.4,
                valueColor: AlwaysStoppedAnimation(AppColors.secondary),
              ),
            ),
            const SizedBox(height: 48),
          ],
        ),
      ),
    );
  }
}
