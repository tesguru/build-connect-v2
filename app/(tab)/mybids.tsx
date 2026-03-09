import { useAuthStore } from '@/store/Authstore';
import React from 'react';
import MyBids from '../(builders)/mybids/mybids';
import ClientProjects from '../(clients)/projects/projects';

export default function ProjectsTab() {
  const { user } = useAuthStore();
  const isClient = user?.role === "client";

  return isClient ? <ClientProjects /> : <MyBids/>;
}