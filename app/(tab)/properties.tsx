import { useAuthStore } from '@/store/Authstore';

import ClientProperties from '../(clients)/properties/properties';
import BuilderProperties from '../(builders)/properties/properties';
import React from 'react';

export default function PropertiesTab() {
  const { user } = useAuthStore();
  const isClient = user?.role === "client";

  return isClient ? <ClientProperties /> : <BuilderProperties />;
}