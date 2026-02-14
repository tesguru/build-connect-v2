import { useAuthStore } from '@/store/Authstore';
import BuilderProjects from '../(builders)/myprojects/myprojects';
import ClientProjects from '../(clients)/projects/projects';
import React from 'react';

export default function ProjectsTab() {
  const { user } = useAuthStore();
  const isClient = user?.role === "client";

  return isClient ? <ClientProjects /> : <BuilderProjects />;
}