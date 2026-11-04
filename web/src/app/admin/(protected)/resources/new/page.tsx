'use client';

import React from 'react';
import { ResourceEditor } from '@/components/admin/ResourceEditor';

export default function NewResourcePage() {
  return <ResourceEditor isNew={true} />;
}
