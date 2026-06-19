import 'package:dating/core/ui.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:loading_animation_widget/loading_animation_widget.dart';

class MainButton extends StatelessWidget {
  final void Function()? onTap;
  final Color? bgColor;
  final String title;
  final Color? titleColor;
  final String? iconpath;
  final double? radius;
  final bool? error;

  /// Optional premium gradient (e.g. [AppGradients.gold] for Gold CTAs).
  /// When set, the button background uses the gradient.
  final Gradient? gradient;
  const MainButton(
      {super.key,
      this.onTap,
      required this.title,
      this.bgColor,
      this.iconpath,
      this.titleColor, this.radius, this.error, this.gradient});

  @override
  Widget build(BuildContext context) {
    final double r = radius ?? AppRadius.md;
    final button = ElevatedButton(
        style: Theme.of(context).elevatedButtonTheme.style!.copyWith(
            backgroundColor: MaterialStatePropertyAll(
                gradient != null ? Colors.transparent : bgColor),
            shadowColor: const MaterialStatePropertyAll(Colors.transparent),
            shape: MaterialStatePropertyAll(RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(r)))),
        onPressed: onTap ?? () {},
        child: error != null && error! ?  LoadingAnimationWidget.staggeredDotsWave(
          size: 30,
          color: Colors.white,
        ) : Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            iconpath?.isEmpty ?? true
                ? const SizedBox()
                : SvgPicture.asset(
                    iconpath!,
                    height: 25,
                  ),
            iconpath?.isEmpty ?? true
                ? const SizedBox()
                : const SizedBox(
                    width: 8,
                  ),
            Flexible(
              child: Text(
                title,
                style: Theme.of(context)
                    .textTheme
                    .labelMedium
                    ?.copyWith(color: titleColor ?? AppColors.white),
                overflow: TextOverflow.ellipsis,
                maxLines: 1,
              ),
            ),
          ],
        ));

    if (gradient == null) return button;

    // Premium gradient wrapper (Gold CTAs etc.) — full width, soft shadow.
    return Container(
      decoration: BoxDecoration(
        gradient: gradient,
        borderRadius: BorderRadius.circular(r),
        boxShadow: AppShadows.soft,
      ),
      child: button,
    );
  }
}
