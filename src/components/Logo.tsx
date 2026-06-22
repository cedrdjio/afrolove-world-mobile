/**
 * AfriLove brand assets (real artwork supplied by the brand).
 * - Logo: the square heart mark, theme-aware (cream on light, espresso on dark);
 *   on the ivory app background the light variant blends seamlessly.
 * - Wordmark: the full horizontal "AFRILOVE WORLD" logo (transparent).
 */
import React from 'react';
import { Image } from 'expo-image';
import { useTheme } from '@/theme/ThemeContext';

const iconLight = require('../../assets/images/logo-icon-light.png');
const iconDark = require('../../assets/images/logo-icon-dark.png');
const wordmark = require('../../assets/images/logo-wordmark.png');

export default function Logo({ size = 96, variant }: { size?: number; variant?: 'light' | 'dark' }) {
  const { isDark } = useTheme();
  const useDark = variant ? variant === 'dark' : isDark;
  return (
    <Image
      source={useDark ? iconDark : iconLight}
      style={{ width: size, height: size, borderRadius: size * 0.22 }}
      contentFit="contain"
    />
  );
}

const WORDMARK_RATIO = 1024 / 1536; // height / width of the supplied artwork

export function Wordmark({ width = 220 }: { width?: number }) {
  return <Image source={wordmark} style={{ width, height: width * WORDMARK_RATIO }} contentFit="contain" />;
}
