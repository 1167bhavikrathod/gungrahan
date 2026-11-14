'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { getTheme } from '@/config/theme';
import { SEED_KARYAKARS_BAL, SEED_KARYAKARS_BALIKA } from '@/config/seedKaryakars';
import { getWriterBadge } from '@/lib/utils';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';

import StickyHeader from '@/components/StickyHeader';
import HeroActionCard from '@/components/HeroActionCard';
import WriterLeaderboard from '@/components/WriterLeaderboard';
import PublicGunaFeed from '@/components/PublicGunaFeed';
import AddGunaDrawer from '@/components/AddGunaDrawer';
import EditGunaModal from '@/components/EditGunaModal';
import LoginGateModal from '@/components/LoginGateModal';

export default function HomePage() {
  const wing = process.env.NEXT_PUBLIC_APP_WING || 'bal';
  const targetGunas = parseInt(process.env.NEXT_PUBLIC_TARGET_GUNAS || '200', 10);
  const theme = useMemo(() => getTheme(wing), [wing]);

  // Master State
  const [currentUser, setCurrentUser] = useState(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [karyakars, setKaryakars] = useState([]);
  const [gunas, setGunas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal / Drawer state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingGuna, setEditingGuna] = useState(null);
  const [preselectedRecipientId, setPreselectedRecipientId] = useState(null);
  const [onlyUnwrittenFilter, setOnlyUnwrittenFilter] = useState(false);
  const [showFloatingFAB, setShowFloatingFAB] = useState(false);

  // 1. Initial LocalStorage Hydration for Current User
  useEffect(() => {
    try {
      const stored = localStorage.getItem('gunagrahan_user_v1');
      if (stored) {
        setCurrentUser(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Failed to parse stored user:', e);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // 2. Scroll listener for Floating Action Button (FAB)
  useEffect(() => {
    const handleScroll = () => {
      setShowFloatingFAB(window.scrollY > 280);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 3. Load initial data from Supabase or fallback seeds
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setIsLoading(true);
      try {
        if (isSupabaseConfigured) {
          // Fetch karyakars for current wing
          const { data: kData, error: kError } = await supabase
            .from('karyakars')
            .select('*')
            .eq('wing', wing);

          if (!kError && kData && kData.length > 0) {
            if (isMounted) setKaryakars(kData);
          } else {
            // Seed fallback
            const seed = wing === 'balika' ? SEED_KARYAKARS_BALIKA : SEED_KARYAKARS_BAL;
            if (isMounted) setKaryakars(seed);
          }

          // Fetch gunas for current wing
          const { data: gData, error: gError } = await supabase
            .from('gunas')
            .select('*')
            .eq('wing', wing)
            .order('created_at', { ascending: false });

          if (!gError && gData) {
            if (isMounted) setGunas(gData);
          }
        } else {
          // Offline / Local Mock Mode
          const seed = wing === 'balika' ? SEED_KARYAKARS_BALIKA : SEED_KARYAKARS_BAL;
          const localGunas = JSON.parse(localStorage.getItem(`gunagrahan_gunas_${wing}`) || '[]');
          if (isMounted) {
            setKaryakars(seed);
            setGunas(localGunas);
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        const seed = wing === 'balika' ? SEED_KARYAKARS_BALIKA : SEED_KARYAKARS_BAL;
        if (isMounted) setKaryakars(seed);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadData();

    // 4. Supabase Realtime Subscription
    if (isSupabaseConfigured) {
      const channel = supabase
        .channel(`gunagrahan-live-${wing}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'gunas', filter: `wing=eq.${wing}` },
          (payload) => {
            setGunas((prev) => {
              if (prev.some((g) => g.id === payload.new.id)) return prev;
              return [payload.new, ...prev];
            });
          }
        )
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'gunas', filter: `wing=eq.${wing}` },
          (payload) => {
            setGunas((prev) =>
              prev.map((g) => (g.id === payload.new.id ? { ...g, ...payload.new } : g))
            );
          }
        )
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'karyakars', filter: `wing=eq.${wing}` },
          (payload) => {
            setKaryakars((prev) => {
              if (prev.some((k) => k.id === payload.new.id)) return prev;
              return [...prev, payload.new];
            });
          }
        )
        .subscribe();

      return () => {
        isMounted = false;
        supabase.removeChannel(channel);
      };
    }

    return () => {
      isMounted = false;
    };
  }, [wing]);

  // Sort Karyakars alphabetically in Gujarati
  const sortedKaryakars = useMemo(() => {
    return [...karyakars].sort((a, b) => a.name.localeCompare(b.name, 'gu'));
  }, [karyakars]);

  // Handle Login User Selection
  const handleSelectUser = useCallback((user) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('gunagrahan_user_v1', JSON.stringify(user));
    } catch (e) {}

    // Ensure new user exists in karyakars list
    setKaryakars((prev) => {
      if (prev.some((k) => k.id === user.id || k.name === user.name)) return prev;
      return [...prev, user];
    });
  }, []);

  // Handle Logout
  const handleLogout = useCallback(() => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('gunagrahan_user_v1');
    } catch (e) {}
  }, []);

  // Handle New Guna Submitted locally/optimistically
  const handleGunaSubmitted = useCallback(
    (newGuna) => {
      setGunas((prev) => {
        if (prev.some((g) => g.id === newGuna.id)) return prev;
        const updated = [newGuna, ...prev];
        if (!isSupabaseConfigured) {
          try {
            localStorage.setItem(`gunagrahan_gunas_${wing}`, JSON.stringify(updated));
          } catch (e) {}
        }
        return updated;
      });
    },
    [wing]
  );

  // Handle Rajipo Count Increment
  const handleRajipoIncrement = useCallback((gunaId) => {
    setGunas((prev) =>
      prev.map((g) => (g.id === gunaId ? { ...g, rajipo_count: (g.rajipo_count || 0) + 1 } : g))
    );
  }, []);

  // Handle Editing an Existing Guna
  const handleSaveEditedGuna = useCallback(
    async (updatedGuna) => {
      // Optimistic state update
      setGunas((prev) =>
        prev.map((g) => (g.id === updatedGuna.id ? { ...g, content: updatedGuna.content } : g))
      );

      try {
        if (isSupabaseConfigured) {
          const { error } = await supabase
            .from('gunas')
            .update({ content: updatedGuna.content })
            .eq('id', updatedGuna.id);

          if (error) {
            console.error('Failed to update guna in Supabase:', error);
          }
        } else {
          const stored = JSON.parse(localStorage.getItem(`gunagrahan_gunas_${wing}`) || '[]');
          const updated = stored.map((g) =>
            g.id === updatedGuna.id ? { ...g, content: updatedGuna.content } : g
          );
          localStorage.setItem(`gunagrahan_gunas_${wing}`, JSON.stringify(updated));
        }
      } catch (err) {
        console.error('Error saving updated guna:', err);
      }
    },
    [wing]
  );

  // Computed Derived Analytics
  const totalWrittenCount = gunas.length;

  const myWrittenCount = useMemo(() => {
    if (!currentUser) return 0;
    return gunas.filter((g) => g.author_id === currentUser.id).length;
  }, [gunas, currentUser]);

  const myWriterBadge = useMemo(() => {
    return getWriterBadge(myWrittenCount);
  }, [myWrittenCount]);

  // STRICT RULE: Group strictly by author_id (the writer)
  const writerLeaderboard = useMemo(() => {
    const counts = {};
    const names = {};

    gunas.forEach((g) => {
      const aId = g.author_id;
      counts[aId] = (counts[aId] || 0) + 1;
      names[aId] = g.author_name || names[aId] || 'અજ્ઞાત લેખક';
    });

    const entries = Object.keys(counts).map((authorId) => ({
      authorId,
      authorName: names[authorId],
      count: counts[authorId],
      badge: getWriterBadge(counts[authorId]),
    }));

    return entries.sort((a, b) => b.count - a.count);
  }, [gunas]);

  // Personal Coverage Stats (20/20 Karyakar Checklist)
  const myCoverageStats = useMemo(() => {
    if (!currentUser) {
      return { coveredCount: 0, totalOthers: 0, unwrittenKaryakars: [] };
    }

    const otherKaryakars = sortedKaryakars.filter((k) => k.id !== currentUser.id);
    const writtenRecipientIds = new Set(
      gunas.filter((g) => g.author_id === currentUser.id).map((g) => g.recipient_id)
    );

    const unwrittenKaryakars = otherKaryakars.filter((k) => !writtenRecipientIds.has(k.id));

    return {
      coveredCount: writtenRecipientIds.size,
      totalOthers: otherKaryakars.length,
      unwrittenKaryakars,
    };
  }, [sortedKaryakars, gunas, currentUser]);

  // "કોનો ગુણ બાકી?" (Smart Unrecognized Karyakar Nudge)
  const smartNudgeKaryakars = useMemo(() => {
    if (!currentUser) return [];

    const otherKaryakars = sortedKaryakars.filter((k) => k.id !== currentUser.id);
    const writtenByMeSet = new Set(
      gunas.filter((g) => g.author_id === currentUser.id).map((g) => g.recipient_id)
    );

    // Count how many times each karyakar has received gunas overall
    const receivedCounts = {};
    gunas.forEach((g) => {
      receivedCounts[g.recipient_id] = (receivedCounts[g.recipient_id] || 0) + 1;
    });

    // Score karyakars: prioritize those whom currentUser hasn't written about yet,
    // and who have the lowest total received count
    const candidates = otherKaryakars.map((k) => ({
      ...k,
      writtenByMe: writtenByMeSet.has(k.id),
      totalReceived: receivedCounts[k.id] || 0,
    }));

    candidates.sort((a, b) => {
      // 1. Unwritten by me first
      if (!a.writtenByMe && b.writtenByMe) return -1;
      if (a.writtenByMe && !b.writtenByMe) return 1;
      // 2. Lowest total received count
      return a.totalReceived - b.totalReceived;
    });

    return candidates.slice(0, 3);
  }, [sortedKaryakars, gunas, currentUser]);

  // Open modal with preselected recipient or coverage filter
  const handleOpenAddModal = (recipientId = null) => {
    setPreselectedRecipientId(recipientId);
    setOnlyUnwrittenFilter(false);
    setIsAddModalOpen(true);
  };

  const handleOpenCoverageFilter = () => {
    setPreselectedRecipientId(null);
    setOnlyUnwrittenFilter(true);
    setIsAddModalOpen(true);
  };

  return (
    <div className={`min-h-screen ${theme.appBg} flex flex-col font-sans selection:bg-blue-100`}>
      {/* 1. Sticky Navigation Header */}
      <StickyHeader
        currentUser={currentUser}
        myWriterBadge={myWriterBadge}
        myWrittenCount={myWrittenCount}
        myCoverageStats={myCoverageStats}
        theme={theme}
        onLogout={handleLogout}
      />

      {/* Main Content Container */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* 2. Hero Action Card (+ Add ગુણ, સંપ વૃક્ષ, Coverage Ring) */}
        <HeroActionCard
          totalWrittenCount={totalWrittenCount}
          targetCount={targetGunas}
          myCoverageStats={myCoverageStats}
          theme={theme}
          onOpenAddModal={() => handleOpenAddModal(null)}
          onOpenCoverageFilter={handleOpenCoverageFilter}
        />

        {/* 3. Writer Leaderboard */}
        <WriterLeaderboard
          writerLeaderboard={writerLeaderboard}
          currentUserId={currentUser?.id}
          myWrittenCount={myWrittenCount}
          theme={theme}
        />

        {/* 4. Public Guna Feed */}
        <PublicGunaFeed
          gunas={gunas}
          karyakars={sortedKaryakars}
          currentUserId={currentUser?.id}
          theme={theme}
          onRajipoIncrement={handleRajipoIncrement}
          onEdit={(guna) => setEditingGuna(guna)}
        />
      </main>

      {/* Floating Action Button (FAB) on Mobile Scroll */}
      {showFloatingFAB && currentUser && (
        <button
          onClick={() => handleOpenAddModal(null)}
          className={`fixed bottom-6 right-6 z-30 p-4 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 transform active:scale-90 hover:scale-105 ${theme.primaryGradient}`}
          aria-label="Add new guna"
        >
          <Plus className="w-6 h-6 text-white" />
        </button>
      )}

      {/* Slide-Up Add Guna Drawer */}
      <AddGunaDrawer
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        currentUser={currentUser}
        karyakars={sortedKaryakars}
        smartNudgeKaryakars={smartNudgeKaryakars}
        myCoverageStats={myCoverageStats}
        preselectedRecipientId={preselectedRecipientId}
        onlyUnwrittenInitial={onlyUnwrittenFilter}
        wing={wing}
        theme={theme}
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

      {/* Login Gate Modal (Rendered whenever no user is selected) */}
      {isHydrated && !currentUser && (
        <LoginGateModal
          karyakars={sortedKaryakars}
          onSelectUser={handleSelectUser}
          wing={wing}
          theme={theme}
        />
      )}
    </div>
  );
}
