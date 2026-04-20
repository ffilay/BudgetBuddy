/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#000000',
    background: '#ffffff',
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#E0E1E6',
    textSecondary: '#60646C',
  },
  dark: {
    text: '#ffffff',
    background: '#000000',
    backgroundElement: '#212225',
    backgroundSelected: '#2E3135',
    textSecondary: '#B0B4BA',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;

export const Brand = {
  background: '#e5dece',
  primaryDark: '#333f34',
  sage: '#708666',
  gold: '#ffc039',
  progressBg: '#f3f4f6',
  inputBg: '#f8faf7',
  cardBorder: '#f3f4f6',
  warning: '#ef4444',
  inactive: '#c5c5c5',
  separator: '#e5e7eb',
} as const;

export const CategoryColors: Record<string, string> = {
  Food: '#fef9c3',
  Fun: '#ede9fe',
  Transport: '#dbeafe',
  Housing: '#dcfce7',
  Education: '#fce7f3',
  Health: '#d1fae5',
  Shopping: '#fff7ed',
  Other: '#f3f4f6',
};

export const CategoryEmojis: Record<string, string> = {
  Food: '🍔',
  Fun: '🎮',
  Transport: '🚗',
  Housing: '🏠',
  Education: '📚',
  Health: '💊',
  Shopping: '👕',
  Other: '💡',
};
