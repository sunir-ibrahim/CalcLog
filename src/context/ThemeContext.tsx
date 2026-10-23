import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { ThemeColors, darkTheme, lightTheme } from '../constants/theme';
import { getSettings, updateSettings } from '../database/repositories/settingsRepo';

interface ThemeContextValue {
  colors: ThemeColors;
  isDark: boolean;
  themePreference: 'system' | 'light' | 'dark';
  setThemePreference: (theme: 'system' | 'light' | 'dark') => Promise<void>;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemScheme = useColorScheme();
  const [themePreference, setThemePrefState] = useState<'system' | 'light' | 'dark'>('system');

  useEffect(() => {
    getSettings()
      .then((s) => {
        if (s?.theme) setThemePrefState(s.theme);
      })
      .catch(() => {});
  }, []);

  const isDark =
    themePreference === 'system'
      ? systemScheme === 'dark'
      : themePreference === 'dark';

  const colors = isDark ? darkTheme : lightTheme;

  const setThemePreference = async (pref: 'system' | 'light' | 'dark') => {
    setThemePrefState(pref);
    try {
      await updateSettings({ theme: pref });
    } catch (err) {
      console.warn('Failed to persist theme preference:', err);
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        colors,
        isDark,
        themePreference,
        setThemePreference,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    return {
      colors: darkTheme,
      isDark: true,
      themePreference: 'system',
      setThemePreference: async () => {},
    };
  }
  return context;
}
