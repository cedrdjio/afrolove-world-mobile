/**
 * AfriLove brand mark — vector port of assets/Image/appLogo.svg.
 * A camel-gold gradient heart with a soft vertical seam.
 */
import React from 'react';
import Svg, { Defs, LinearGradient, Stop, Path } from 'react-native-svg';

export default function Logo({ size = 96 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120" fill="none">
      <Defs>
        <LinearGradient id="afriHeart" x1="18" y1="18" x2="102" y2="104" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#B0492E" />
          <Stop offset="0.5" stopColor="#D4A373" />
          <Stop offset="1" stopColor="#E9C893" />
        </LinearGradient>
      </Defs>
      <Path
        d="M60 104 C 60 104, 16 78, 16 46 C 16 30, 28 20, 41 20 C 51 20, 57 26, 60 32 C 63 26, 69 20, 79 20 C 92 20, 104 30, 104 46 C 104 78, 60 104, 60 104 Z"
        fill="none"
        stroke="url(#afriHeart)"
        strokeWidth={7}
        strokeLinejoin="round"
      />
      <Path
        d="M60 33 L60 95"
        stroke="url(#afriHeart)"
        strokeWidth={3.2}
        strokeLinecap="round"
        opacity={0.55}
      />
    </Svg>
  );
}
