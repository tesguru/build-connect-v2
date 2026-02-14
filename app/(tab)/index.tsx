import { useAuthStore } from '@/store/Authstore';
import  BuilderHome from '../(builders)/home/home';
import ClientHome from '../(clients)/home/home';
import React from 'react';

export default function HomeTab() {
  const { user } = useAuthStore();
  const isClient = user?.role === "client";

  return isClient ? <ClientHome /> : <BuilderHome />;
}