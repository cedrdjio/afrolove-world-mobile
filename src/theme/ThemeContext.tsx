import React, { createContext, useContext, useState, useCallback } from 'react';
import { useColorScheme } from 'react-native';
import { Colors } from './theme';

type Mode = 'light' | 'dark';

interface ThemeValue {
  mode: Mode;
  isDark: boolean;
  toggle: () => void;
  setMode: (m: Mode) => void;
  c: {
    background: string;
    surface: string;
    card: string;
    border: string;
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    primary: string;
  };
}

const ThemeContext = createContext<ThemeValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme();
  const [mode, setMode] = useState<Mode>(system === 'dark' ? 'dark' : 'light');
  const isDark = mode === 'dark';

  const toggle = useCallback(() => setMode((m) => (m === 'dark' ? 'light' : 'dark')), []);

  const c = isDark
    ? {
        background: Colors.dark.background,
        surface: Colors.dark.surface,
        card: Colors.dark.card,
        border: Colors.dark.border,
        textPrimary: Colors.dark.textPrimary,
        textSecondary: Colors.dark.textSecondary,
        textMuted: Colors.greyDark,
        primary: Colors.dark.primaryAction,
      }
    : {
        background: Colors.background,
        surface: Colors.surface,
        card: Colors.card,
        border: Colors.border,
        textPrimary: Colors.textPrimary,
        textSecondary: Colors.textSecondary,
        textMuted: Colors.textMuted,
        primary: Colors.primary,
      };

  return (
    <ThemeContext.Provider value={{ mode, isDark, toggle, setMode, c }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
