'use client';

import React from 'react';
import { useAppContext } from '@/context/AppContext';
import AddGunaDrawer from '@/components/AddGunaDrawer';
import EditGunaModal from '@/components/EditGunaModal';
import EditNameModal from '@/components/EditNameModal';
import LoginGateModal from '@/components/LoginGateModal';

export default function GlobalModals() {
  const {
    isHydrated,
    currentUser,
    loginUser,
    karyakars,
    wing,
    theme,
    isAddModalOpen,
    setIsAddModalOpen,
    smartNudgeKaryakars,
    myCoverageStats,
    preselectedRecipientId,
    onlyUnwrittenFilter,
    handleGunaSubmitted,
    editingGuna,
    setEditingGuna,
    handleSaveEditedGuna,
    isEditNameModalOpen,
    setIsEditNameModalOpen,
    updateUserName,
    activeProject,
    projectStatus,
  } = useAppContext();

  return (
    <>
      {/* Login Gate Modal if user not yet chosen */}
      {isHydrated && !currentUser && (
        <LoginGateModal
          karyakars={karyakars}
          onSelectUser={loginUser}
          wing={wing}
          theme={theme}
        />
      )}

      {/* Slide-Up Add Guna Drawer */}
      <AddGunaDrawer
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        currentUser={currentUser}
        karyakars={karyakars}
        smartNudgeKaryakars={smartNudgeKaryakars}
        myCoverageStats={myCoverageStats}
        preselectedRecipientId={preselectedRecipientId}
        onlyUnwrittenInitial={onlyUnwrittenFilter}
        wing={wing}
        theme={theme}
        activeProject={activeProject}
        projectStatus={projectStatus}
        onGunaSubmitted={handleGunaSubmitted}
      />

      {/* Edit Guna Modal */}
      <EditGunaModal
        isOpen={Boolean(editingGuna)}
        guna={editingGuna}
        onClose={() => setEditingGuna(null)}
        onSave={handleSaveEditedGuna}
        theme={theme}
      />

      {/* Edit Name Modal */}
      <EditNameModal
        isOpen={isEditNameModalOpen}
        onClose={() => setIsEditNameModalOpen(false)}
        currentUser={currentUser}
        onSave={updateUserName}
        theme={theme}
      />
    </>
  );
}
