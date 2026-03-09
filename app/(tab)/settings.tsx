import { useAuthStore } from '@/store/Authstore';
import React from 'react';
import ClientSupport from '../(clients)/support/support';
import ProfileScreen from '../(profile)/profilescreen';

export default function SettingsTab() {
  const { user } = useAuthStore();
  const isClient = user?.role === "client";

  return isClient ? <ClientSupport /> : <ProfileScreen />;
}