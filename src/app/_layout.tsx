import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import { AppDataProvider, useAppData } from '../context/AppDataContext';

function RootNavigationLayout() {
  const { colors, isDark } = useTheme();
  const { isInitialized, settings } = useAppData();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isInitialized) return;

    const inOnboarding = segments[0] === 'onboarding';

    if (!settings.onboardingCompleted && !inOnboarding) {
      router.replace('/onboarding');
    } else if (settings.onboardingCompleted && inOnboarding) {
      router.replace('/(tabs)');
    }
  }, [isInitialized, settings.onboardingCompleted, segments, router]);

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'fade_from_bottom',
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen
          name="food/search"
          options={{ presentation: 'modal', headerShown: false }}
        />
        <Stack.Screen
          name="food/details"
          options={{ presentation: 'modal', headerShown: false }}
        />
        <Stack.Screen
          name="food/custom"
          options={{ presentation: 'modal', headerShown: false }}
        />
        <Stack.Screen
          name="step-modal"
          options={{ presentation: 'modal', headerShown: false }}
        />
        <Stack.Screen
          name="weight-modal"
          options={{ presentation: 'modal', headerShown: false }}
        />
        <Stack.Screen
          name="data-management"
          options={{ headerShown: false }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppDataProvider>
          <RootNavigationLayout />
        </AppDataProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
