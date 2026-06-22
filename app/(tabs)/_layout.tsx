import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { Colors, Shadows } from '@/theme/theme';
import { useTheme } from '@/theme/ThemeContext';
import { usePresenceHeartbeat } from '@/hooks/usePresenceHeartbeat';

export default function TabsLayout() {
  const { c, isDark } = useTheme();
  usePresenceHeartbeat();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        // In dark mode espresso is invisible on the dark bar → use camel gold.
        tabBarActiveTintColor: isDark ? Colors.secondary : Colors.primary,
        tabBarInactiveTintColor: c.textMuted,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: c.card,
          borderTopColor: c.border,
          height: Platform.OS === 'ios' ? 86 : 64,
          paddingTop: 8,
          ...Shadows.soft,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ tabBarIcon: ({ color, size }) => <Ionicons name="flame" size={size + 2} color={color} /> }}
      />
      <Tabs.Screen
        name="likes"
        options={{ tabBarIcon: ({ color, size }) => <Ionicons name="heart" size={size + 2} color={color} /> }}
      />
      <Tabs.Screen
        name="matches"
        options={{ tabBarIcon: ({ color, size }) => <Ionicons name="sparkles" size={size + 2} color={color} /> }}
      />
      <Tabs.Screen
        name="chats"
        options={{ tabBarIcon: ({ color, size }) => <Ionicons name="chatbubble" size={size} color={color} /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} /> }}
      />
    </Tabs>
  );
}
