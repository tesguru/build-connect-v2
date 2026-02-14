import { useAuthStore } from '@/store/Authstore';
import BuilderSettings from '../(builders)/settings/settings';
import ClientSupport from '../(clients)/support/support';
import React from 'react';

export default function SettingsTab() {
  const { user } = useAuthStore();
  const isClient = user?.role === "client";

  return isClient ? <ClientSupport /> : <BuilderSettings />;
}