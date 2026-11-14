'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { getTheme } from '@/config/theme';
import { SEED_KARYAKARS_BAL, SEED_KARYAKARS_BALIKA } from '@/config/seedKaryakars';
import { getWriterBadge } from '@/lib/utils';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const wing = process.env.NEXT_PUBLIC_APP_WING || 'bal';
  const targetGunas = parseInt(process.env.NEXT_PUBLIC_TARGET_GUNAS || '200', 10);
  const theme = useMemo(() => getTheme(wing), [wing]);

  // Master State
  const [currentUser, setCurrentUser] = useState(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [karyakars, setKaryakars] = useState([]);
  const [gunas, setGunas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Global Drawers & Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [preselectedRecipientId, setPreselectedRecipientId] = useState(null);
  const [onlyUnwrittenFilter, setOnlyUnwrittenFilter] = useState(false);
  const [editingGuna, setEditingGuna] = useState(null);

  // 1. Initial LocalStorage Hydration
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

  // 2. Fetch Data from Supabase / Seed Fallback
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setIsLoading(true);
      try {
        if (isSupabaseConfigured) {
          const { data: kData, error: kError } = await supabase
            .from('karyakars')
            .select('*')
            .eq('wing', wing);

          if (!kError && kData && kData.length > 0) {
            const seed = wing === 'balika' ? SEED_KARYAKARS_BALIKA : SEED_KARYAKARS_BAL;
            const merged = [...kData];
            seed.forEach((s) => {
              const match = merged.find(
                (m) =>
                  m.name === s.name ||
                  m.id === s.id ||
                  (m.name && s.name && (m.name.includes(s.name.split(' ')[0]) || s.name.includes(m.name.split(' ')[0])))
              );
              if (match) {
                if (!match.karyakar_number && s.karyakar_number) {
                  match.karyakar_number = s.karyakar_number;
                }
                if (!match.role && s.role) match.role = s.role;
                if (!match.sabha && s.sabha) match.sabha = s.sabha;
              } else {
                merged.push(s);
              }
            });
            if (isMounted) setKaryakars(merged);
          } else {
            const seed = wing === 'balika' ? SEED_KARYAKARS_BALIKA : SEED_KARYAKARS_BAL;
            if (isMounted) setKaryakars(seed);
          }

          const { data: gData, error: gError } = await supabase
            .from('gunas')
            .select('*')
            .eq('wing', wing)
            .order('created_at', { ascending: false });

          if (!gError && gData) {
            if (isMounted) setGunas(gData);
          }
        } else {
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

    // 3. Supabase Realtime Subscription
    if (isSupabaseConfigured) {
      const channel = supabase
        .channel(`gunagrahan-live-global-${wing}`)
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

  // Alphabetical Karyakars
  const sortedKaryakars = useMemo(() => {
    return [...karyakars].sort((a, b) => a.name.localeCompare(b.name, 'gu'));
  }, [karyakars]);

  // Login handler
  const loginUser = useCallback((user) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('gunagrahan_user_v1', JSON.stringify(user));
    } catch (e) {}

    setKaryakars((prev) => {
      if (prev.some((k) => k.id === user.id || k.name === user.name)) return prev;
      return [...prev, user];
    });
  }, []);

  // Logout handler
  const logoutUser = useCallback(() => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('gunagrahan_user_v1');
    } catch (e) {}
  }, []);

  // Guna Submitted Handler
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

  // Guna Edited Handler
  const handleSaveEditedGuna = useCallback(
    async (updatedGuna) => {
      setGunas((prev) =>
        prev.map((g) => (g.id === updatedGuna.id ? { ...g, content: updatedGuna.content } : g))
      );

      try {
        if (isSupabaseConfigured) {
          const { error } = await supabase
            .from('gunas')
            .update({ content: updatedGuna.content })
            .eq('id', updatedGuna.id);

          if (error) console.error('Failed to update guna in Supabase:', error);
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

  // Rajipo Increment Handler
  const handleRajipoIncrement = useCallback((gunaId) => {
    setGunas((prev) =>
      prev.map((g) => (g.id === gunaId ? { ...g, rajipo_count: (g.rajipo_count || 0) + 1 } : g))
    );
  }, []);

  // Derived Analytics
  const totalWrittenCount = gunas.length;

  const myWrittenCount = useMemo(() => {
    if (!currentUser) return 0;
    return gunas.filter((g) => g.author_id === currentUser.id).length;
  }, [gunas, currentUser]);

  const myWriterBadge = useMemo(() => {
    return getWriterBadge(myWrittenCount);
  }, [myWrittenCount]);

  // Strict Writer-First Leaderboard
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

  // Personal Coverage Stats (20/20 Checklist)
  const myCoverageStats = useMemo(() => {
    if (!currentUser) {
      return { coveredCount: 0, totalOthers: 0, unwrittenKaryakars: [], writtenMap: {} };
    }

    const otherKaryakars = sortedKaryakars.filter((k) => k.id !== currentUser.id);
    const myGunas = gunas.filter((g) => g.author_id === currentUser.id);

    // Map recipient_id -> array of gunas written by me
    const writtenMap = {};
    myGunas.forEach((g) => {
      if (!writtenMap[g.recipient_id]) writtenMap[g.recipient_id] = [];
      writtenMap[g.recipient_id].push(g);
    });

    const coveredKaryakars = otherKaryakars.filter((k) => Boolean(writtenMap[k.id]));
    const unwrittenKaryakars = otherKaryakars.filter((k) => !writtenMap[k.id]);

    return {
      coveredCount: coveredKaryakars.length,
      totalOthers: otherKaryakars.length,
      coveredKaryakars,
      unwrittenKaryakars,
      writtenMap,
    };
  }, [sortedKaryakars, gunas, currentUser]);

  // Smart Nudge Suggestions
  const smartNudgeKaryakars = useMemo(() => {
    if (!currentUser) return [];

    const otherKaryakars = sortedKaryakars.filter((k) => k.id !== currentUser.id);
    const writtenByMeSet = new Set(
      gunas.filter((g) => g.author_id === currentUser.id).map((g) => g.recipient_id)
    );

    const receivedCounts = {};
    gunas.forEach((g) => {
      receivedCounts[g.recipient_id] = (receivedCounts[g.recipient_id] || 0) + 1;
    });

    const candidates = otherKaryakars.map((k) => ({
      ...k,
      writtenByMe: writtenByMeSet.has(k.id),
      totalReceived: receivedCounts[k.id] || 0,
    }));

    candidates.sort((a, b) => {
      if (!a.writtenByMe && b.writtenByMe) return -1;
      if (a.writtenByMe && !b.writtenByMe) return 1;
      return a.totalReceived - b.totalReceived;
    });

    return candidates.slice(0, 3);
  }, [sortedKaryakars, gunas, currentUser]);

  // Modal Openers
  const openAddModal = (recipientId = null) => {
    setPreselectedRecipientId(recipientId);
    setOnlyUnwrittenFilter(false);
    setIsAddModalOpen(true);
  };

  const openCoverageAddModal = (recipientId = null) => {
    setPreselectedRecipientId(recipientId);
    setOnlyUnwrittenFilter(true);
    setIsAddModalOpen(true);
  };

  const value = {
    wing,
    theme,
    targetGunas,
    currentUser,
    isHydrated,
    loginUser,
    logoutUser,
    karyakars: sortedKaryakars,
    gunas,
    isLoading,
    totalWrittenCount,
    myWrittenCount,
    myWriterBadge,
    writerLeaderboard,
    myCoverageStats,
    smartNudgeKaryakars,
    // Modals & Drawers
    isAddModalOpen,
    setIsAddModalOpen,
    preselectedRecipientId,
    onlyUnwrittenFilter,
    editingGuna,
    setEditingGuna,
    openAddModal,
    openCoverageAddModal,
    handleGunaSubmitted,
    handleSaveEditedGuna,
    handleRajipoIncrement,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
