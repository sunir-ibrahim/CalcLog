export interface ThemeColors {
  background: string;
  card: string;
  cardBorder: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  primary: string;
  primaryLight: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
  inputBg: string;
  inputBorder: string;

  // Metric specific accent colors
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
  steps: string;
  weight: string;

  tabBarBg: string;
  tabBarBorder: string;
  tabBarActive: string;
  tabBarInactive: string;
}

export const darkTheme: ThemeColors = {
  background: '#090D16',
  card: '#131A2A',
  cardBorder: '#1E293B',
  text: '#F8FAFC',
  textSecondary: '#CBD5E1',
  textMuted: '#64748B',
  primary: '#10B981', // Crisp Emerald
  primaryLight: '#064E3B',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',
  inputBg: '#1A2338',
  inputBorder: '#334155',

  calories: '#10B981', // Emerald
  protein: '#38BDF8',  // Sky Blue
  carbs: '#FBBF24',    // Amber
  fat: '#F43F5E',      // Rose
  steps: '#A855F7',    // Purple
  weight: '#06B6D4',   // Cyan

  tabBarBg: '#0F1626',
  tabBarBorder: '#1E293B',
  tabBarActive: '#10B981',
  tabBarInactive: '#64748B',
};

export const lightTheme: ThemeColors = {
  background: '#F1F5F9',
  card: '#FFFFFF',
  cardBorder: '#E2E8F0',
  text: '#0F172A',
  textSecondary: '#334155',
  textMuted: '#64748B',
  primary: '#059669', // Emerald
  primaryLight: '#D1FAE5',
  success: '#10B981',
  warning: '#D97706',
  danger: '#DC2626',
  info: '#2563EB',
  inputBg: '#F8FAFC',
  inputBorder: '#CBD5E1',

  calories: '#059669',
  protein: '#0284C7',
  carbs: '#D97706',
  fat: '#E11D48',
  steps: '#7C3AED',
  weight: '#0891B2',

  tabBarBg: '#FFFFFF',
  tabBarBorder: '#E2E8F0',
  tabBarActive: '#059669',
  tabBarInactive: '#94A3B8',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const RADII = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  full: 9999,
};
