import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:afrilove_world/core/ui.dart';

/// Clean, on-brand loading animation: the AfriLove heart gently pulses
/// (scale + opacity) with a soft camel-gold ring sweeping behind it.
/// Use [AppLoader()] anywhere a CircularProgressIndicator was used.
class AppLoader extends StatefulWidget {
  final double size;
  const AppLoader({super.key, this.size = 46});

  @override
  State<AppLoader> createState() => _AppLoaderState();
}

class _AppLoaderState extends State<AppLoader> with TickerProviderStateMixin {
  late final AnimationController _pulse;
  late final AnimationController _spin;

  @override
  void initState() {
    super.initState();
    _pulse = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 900),
    )..repeat(reverse: true);
    _spin = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1400),
    )..repeat();
  }

  @override
  void dispose() {
    _pulse.dispose();
    _spin.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final ring = widget.size * 1.5;
    return SizedBox(
      width: ring,
      height: ring,
      child: Center(
        child: Stack(
          alignment: Alignment.center,
          children: [
            // Sweeping gold arc
            RotationTransition(
              turns: _spin,
              child: SizedBox(
                width: ring,
                height: ring,
                child: CircularProgressIndicator(
                  strokeWidth: 2.4,
                  valueColor: AlwaysStoppedAnimation<Color>(AppColors.secondary),
                  backgroundColor: AppColors.secondary.withOpacity(0.12),
                ),
              ),
            ),
            // Pulsing brand mark
            ScaleTransition(
              scale: Tween<double>(begin: 0.82, end: 1.0).animate(
                CurvedAnimation(parent: _pulse, curve: Curves.easeInOut),
              ),
              child: FadeTransition(
                opacity: Tween<double>(begin: 0.65, end: 1.0).animate(_pulse),
                child: SvgPicture.asset(
                  'assets/Image/appLogo.svg',
                  height: widget.size,
                  width: widget.size,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Full-screen centered branded loader (e.g. initial page loads).
class AppLoaderScreen extends StatelessWidget {
  final String? message;
  const AppLoaderScreen({super.key, this.message});

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Theme.of(context).scaffoldBackgroundColor,
      alignment: Alignment.center,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const AppLoader(size: 56),
          if (message != null) ...[
            const SizedBox(height: 16),
            Text(message!, style: Theme.of(context).textTheme.bodyMedium),
          ],
        ],
      ),
    );
  }
}
