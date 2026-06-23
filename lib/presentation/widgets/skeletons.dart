import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';
import 'package:afrilove_world/core/ui.dart';

Color _base(BuildContext c) =>
    Theme.of(c).brightness == Brightness.dark ? AppColors.darkContainer : AppColors.greyLight;
Color _hi(BuildContext c) =>
    Theme.of(c).brightness == Brightness.dark ? AppColors.darkBorderColor : Colors.white;

Widget _box(double w, double h, {double r = 8}) => Container(
      width: w,
      height: h,
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(r)),
    );

/// A shimmering list-tile placeholder (avatar + two text lines).
class TileSkeleton extends StatelessWidget {
  const TileSkeleton({super.key});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 10),
      child: Row(
        children: [
          _box(56, 56, r: 28),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _box(140, 13),
                const SizedBox(height: 9),
                _box(220, 11),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

/// A clean shimmering skeleton for list screens while data loads.
class SkeletonList extends StatelessWidget {
  final int items;
  final EdgeInsetsGeometry padding;
  const SkeletonList({super.key, this.items = 7, this.padding = const EdgeInsets.symmetric(horizontal: 20)});

  @override
  Widget build(BuildContext context) {
    return Shimmer.fromColors(
      baseColor: _base(context),
      highlightColor: _hi(context),
      period: const Duration(milliseconds: 1200),
      child: ListView.builder(
        padding: padding,
        physics: const NeverScrollableScrollPhysics(),
        itemCount: items,
        itemBuilder: (_, __) => const TileSkeleton(),
      ),
    );
  }
}

/// A shimmering grid skeleton (e.g. likes / discovery cards).
class SkeletonGrid extends StatelessWidget {
  final int items;
  const SkeletonGrid({super.key, this.items = 6});

  @override
  Widget build(BuildContext context) {
    return Shimmer.fromColors(
      baseColor: _base(context),
      highlightColor: _hi(context),
      period: const Duration(milliseconds: 1200),
      child: GridView.builder(
        padding: const EdgeInsets.all(20),
        physics: const NeverScrollableScrollPhysics(),
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          crossAxisSpacing: 14,
          mainAxisSpacing: 14,
          childAspectRatio: 0.74,
        ),
        itemCount: items,
        itemBuilder: (_, __) => _box(double.infinity, double.infinity, r: 18),
      ),
    );
  }
}
