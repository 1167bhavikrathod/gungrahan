'use client';

import React from 'react';
import { useAppContext } from '@/context/AppContext';
import PublicGunaFeed from '@/components/PublicGunaFeed';

export default function FeedPage() {
  const {
    gunas,
    karyakars,
    currentUser,
    theme,
    projectStatus,
    handleRajipoIncrement,
    setEditingGuna,
  } = useAppContext();

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
      <PublicGunaFeed
        gunas={gunas}
        karyakars={karyakars}
        currentUserId={currentUser?.id}
        theme={theme}
        onRajipoIncrement={handleRajipoIncrement}
        onEdit={projectStatus?.isSubmissionClosed ? null : (guna) => setEditingGuna(guna)}
      />
    </div>
  );
}
