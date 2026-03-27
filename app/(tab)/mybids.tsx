import { useAuthStore } from '@/store/Authstore';
import React from 'react';

import BidsTab from '../(builders)/mybids/bids';
import ClientProjects from '../(clients)/projects/projects';

export default function ProjectsTab() {
  const { user } = useAuthStore();
  const isClient = user?.role === "client";

  return isClient ? <ClientProjects /> : <BidsTab/>;
}