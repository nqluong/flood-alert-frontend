import { Tabs } from 'expo-router';
import React from 'react';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useUnreadNotifications } from '../../hooks/useUnreadNotifications';

export default function TabLayout() {
  const { unreadCount } = useUnreadNotifications();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#00796b',
        tabBarInactiveTintColor: '#6b7280',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#e5e7eb',
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '400',
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Bản đồ',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="map" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Thông báo',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="notifications-outline" size={size} color={color} />
          ),
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: '#e53935',
            color: '#ffffff',
            fontSize: 10,
            fontWeight: '700',
            minWidth: 18,
            height: 18,
            borderRadius: 9,
            marginTop: 2,
          },
        }}
      />
      <Tabs.Screen
        name="report"
        options={{
          title: 'Báo cáo',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="flag-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Cài đặt',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}