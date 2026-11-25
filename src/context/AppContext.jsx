'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { getTheme } from '@/config/theme';
import { SEED_KARYAKARS_BAL, SEED_KARYAKARS_BALIKA } from '@/config/seedKaryakars';
import { getWriterBadge } from '@/lib/utils';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';

import {
  isAdmin,
  isSessionAdmin,
  unlockAdminSession,
  lockAdminSession,
  BHAVIK_ADMIN_INFO,
} from '@/config/adminConfig';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const wing = process.env.NEXT_PUBLIC_APP_WING || 'bal';
  const theme = useMemo(() => getTheme(wing), [wing]);

  // Master State
  const [currentUser, setCurrentUser] = useState(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [karyakars, setKaryakars] = useState([]);
  const [gunas, setGunas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Dynamic Target Gunas State
  const [targetGunas, setTargetGunas] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(`gunagrahan_target_gunas_${wing}`);
        if (saved) {
          const parsed = parseInt(saved, 10);
          if (!isNaN(parsed) && parsed > 0) return parsed;
        }
      } catch (e) {}
    }
    return parseInt(process.env.NEXT_PUBLIC_TARGET_GUNAS || '200', 10);
  });

  // Admin Session Unlocked State
  const [adminSessionUnlocked, setAdminSessionUnlocked] = useState(false);

  // Global Drawers & Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [preselectedRecipientId, setPreselectedRecipientId] = useState(null);
  const [onlyUnwrittenFilter, setOnlyUnwrittenFilter] = useState(false);
  const [editingGuna, setEditingGuna] = useState(null);
  const [isEditNameModalOpen, setIsEditNameModalOpen] = useState(false);

  // 1. Initial LocalStorage Hydration
  useEffect(() => {
    try {
      const stored = localStorage.getItem('gunagrahan_user_v1');
      if (stored) {
        setCurrentUser(JSON.parse(stored));
      }
      setAdminSessionUnlocked(isSessionAdmin());
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
          const localCustomKaryakars = JSON.parse(
            localStorage.getItem(`gunagrahan_karyakars_custom_${wing}`) || 'null'
          );
          const localGunas = JSON.parse(localStorage.getItem(`gunagrahan_gunas_${wing}`) || '[]');
          if (isMounted) {
            setKaryakars(localCustomKaryakars || seed);
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
          { event: 'DELETE', schema: 'public', table: 'gunas' },
          (payload) => {
            setGunas((prev) => prev.filter((g) => g.id !== payload.old.id));
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
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'karyakars', filter: `wing=eq.${wing}` },
          (payload) => {
            setKaryakars((prev) =>
              prev.map((k) => (k.id === payload.new.id ? { ...k, ...payload.new } : k))
            );
          }
        )
        .on(
          'postgres_changes',
          { event: 'DELETE', schema: 'public', table: 'karyakars' },
          (payload) => {
            setKaryakars((prev) => prev.filter((k) => k.id !== payload.old.id));
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

  // Update Current User Name Handler
  const updateUserName = useCallback(
    async (newName) => {
      const trimmed = newName.trim();
      if (!trimmed || !currentUser) return false;
      if (trimmed === currentUser.name) return true;

      const oldName = currentUser.name;
      const updatedUser = { ...currentUser, name: trimmed };

      // 1. Update currentUser in state & localStorage
      setCurrentUser(updatedUser);
      try {
        localStorage.setItem('gunagrahan_user_v1', JSON.stringify(updatedUser));
      } catch (e) {}

      // 2. Update karyakars list in state
      setKaryakars((prev) =>
        prev.map((k) =>
          k.id === currentUser.id || k.name === oldName
            ? { ...k, name: trimmed }
            : k
        )
      );

      // 3. Update existing gunas in state & localStorage
      setGunas((prev) => {
        const updatedGunas = prev.map((g) => {
          let modified = false;
          let updated = { ...g };
          if (g.author_id === currentUser.id || g.author_name === oldName) {
            updated.author_name = trimmed;
            modified = true;
          }
          if (g.recipient_id === currentUser.id || g.recipient_name === oldName) {
            updated.recipient_name = trimmed;
            modified = true;
          }
          return modified ? updated : g;
        });

        if (!isSupabaseConfigured) {
          try {
            localStorage.setItem(`gunagrahan_gunas_${wing}`, JSON.stringify(updatedGunas));
          } catch (e) {}
        }
        return updatedGunas;
      });

      // 4. Update Supabase if configured
      if (isSupabaseConfigured) {
        try {
          if (currentUser.id) {
            await supabase
              .from('karyakars')
              .update({ name: trimmed })
              .eq('id', currentUser.id);

            await supabase
              .from('gunas')
              .update({ author_name: trimmed })
              .eq('author_id', currentUser.id);

            await supabase
              .from('gunas')
              .update({ recipient_name: trimmed })
              .eq('recipient_id', currentUser.id);
          } else {
            await supabase
              .from('karyakars')
              .update({ name: trimmed })
              .eq('name', oldName);

            await supabase
              .from('gunas')
              .update({ author_name: trimmed })
              .eq('author_name', oldName);

            await supabase
              .from('gunas')
              .update({ recipient_name: trimmed })
              .eq('recipient_name', oldName);
          }
        } catch (err) {
          console.error('Failed to sync updated name to Supabase:', err);
        }
      }

      return true;
    },
    [currentUser, wing]
  );

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

  // Target Count Updater
  const updateTargetCount = useCallback((newTarget) => {
    const count = parseInt(newTarget, 10);
    if (isNaN(count) || count <= 0) return;
    setTargetGunas(count);
    try {
      localStorage.setItem(`gunagrahan_target_gunas_${wing}`, String(count));
    } catch (e) {}
  }, [wing]);

  // Admin Session Helpers
  const unlockAdmin = useCallback(() => {
    unlockAdminSession();
    setAdminSessionUnlocked(true);
  }, []);

  const lockAdmin = useCallback(() => {
    lockAdminSession();
    setAdminSessionUnlocked(false);
  }, []);

  const loginAsBhavikAdmin = useCallback(() => {
    loginUser(BHAVIK_ADMIN_INFO);
    unlockAdminSession();
    setAdminSessionUnlocked(true);
  }, [loginUser]);

  // Delete Guna Handler (Admin & Author)
  const deleteGuna = useCallback(
    async (gunaId) => {
      if (!gunaId) return false;
      setGunas((prev) => {
        const updated = prev.filter((g) => g.id !== gunaId);
        if (!isSupabaseConfigured) {
          try {
            localStorage.setItem(`gunagrahan_gunas_${wing}`, JSON.stringify(updated));
          } catch (e) {}
        }
        return updated;
      });

      if (isSupabaseConfigured) {
        try {
          const { error } = await supabase.from('gunas').delete().eq('id', gunaId);
          if (error) console.error('Failed to delete guna from Supabase:', error);
        } catch (err) {
          console.error('Error deleting guna:', err);
        }
      }
      return true;
    },
    [wing]
  );

  // Admin Edit Guna Handler
  const adminEditGuna = useCallback(
    async (gunaId, updates) => {
      if (!gunaId || !updates) return false;
      setGunas((prev) => {
        const updated = prev.map((g) => (g.id === gunaId ? { ...g, ...updates } : g));
        if (!isSupabaseConfigured) {
          try {
            localStorage.setItem(`gunagrahan_gunas_${wing}`, JSON.stringify(updated));
          } catch (e) {}
        }
        return updated;
      });

      if (isSupabaseConfigured) {
        try {
          const { error } = await supabase.from('gunas').update(updates).eq('id', gunaId);
          if (error) console.error('Failed to update guna in Supabase:', error);
        } catch (err) {
          console.error('Error updating guna in Supabase:', err);
        }
      }
      return true;
    },
    [wing]
  );

  // Admin Add Karyakar Handler
  const adminAddKaryakar = useCallback(
    async (newKaryakar) => {
      const cleanName = (newKaryakar.name || '').trim();
      const cleanNumber = (newKaryakar.karyakar_number || '').trim();
      if (!cleanName) return { success: false, error: 'નામ દાખલ કરવું જરૂરી છે.' };

      const karyakarObj = {
        id:
          newKaryakar.id ||
          (typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID()
            : `karyakar-${Date.now()}`),
        name: cleanName,
        karyakar_number: cleanNumber,
        role: newKaryakar.role || 'સંચાલક',
        sabha: newKaryakar.sabha || 'શિવશક્તિ',
        wing: newKaryakar.wing || wing,
        is_pre_registered: false,
      };

      setKaryakars((prev) => {
        if (
          prev.some(
            (k) =>
              k.id === karyakarObj.id ||
              (cleanNumber && k.karyakar_number === cleanNumber)
          )
        ) {
          return prev;
        }
        const updated = [...prev, karyakarObj];
        try {
          localStorage.setItem(`gunagrahan_karyakars_custom_${wing}`, JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });

      if (isSupabaseConfigured) {
        try {
          const { error } = await supabase.from('karyakars').insert([karyakarObj]);
          if (error) console.error('Failed to insert karyakar in Supabase:', error);
        } catch (err) {
          console.error('Error inserting karyakar in Supabase:', err);
        }
      }

      return { success: true, karyakar: karyakarObj };
    },
    [wing]
  );

  // Admin Update Karyakar Handler
  const adminUpdateKaryakar = useCallback(
    async (karyakarId, updates) => {
      if (!karyakarId || !updates) return false;

      let oldName = '';
      setKaryakars((prev) => {
        const existing = prev.find((k) => k.id === karyakarId);
        if (existing) oldName = existing.name;

        const updated = prev.map((k) =>
          k.id === karyakarId ? { ...k, ...updates } : k
        );
        try {
          localStorage.setItem(`gunagrahan_karyakars_custom_${wing}`, JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });

      // If current user is this karyakar, update currentUser as well
      setCurrentUser((prevUser) => {
        if (prevUser && prevUser.id === karyakarId) {
          const updated = { ...prevUser, ...updates };
          try {
            localStorage.setItem('gunagrahan_user_v1', JSON.stringify(updated));
          } catch (e) {}
          return updated;
        }
        return prevUser;
      });

      // If name changed, propagate to gunas
      if (updates.name && oldName && updates.name !== oldName) {
        const newName = updates.name.trim();
        setGunas((prev) => {
          const updated = prev.map((g) => {
            let modified = false;
            let item = { ...g };
            if (g.author_id === karyakarId || g.author_name === oldName) {
              item.author_name = newName;
              modified = true;
            }
            if (g.recipient_id === karyakarId || g.recipient_name === oldName) {
              item.recipient_name = newName;
              modified = true;
            }
            return modified ? item : g;
          });
          if (!isSupabaseConfigured) {
            try {
              localStorage.setItem(`gunagrahan_gunas_${wing}`, JSON.stringify(updated));
            } catch (e) {}
          }
          return updated;
        });
      }

      if (isSupabaseConfigured) {
        try {
          const { error } = await supabase.from('karyakars').update(updates).eq('id', karyakarId);
          if (error) console.error('Failed to update karyakar in Supabase:', error);

          if (updates.name && oldName && updates.name !== oldName) {
            await supabase.from('gunas').update({ author_name: updates.name }).eq('author_id', karyakarId);
            await supabase.from('gunas').update({ recipient_name: updates.name }).eq('recipient_id', karyakarId);
          }
        } catch (err) {
          console.error('Error updating karyakar in Supabase:', err);
        }
      }

      return true;
    },
    [wing]
  );

  // Admin Delete Karyakar Handler
  const adminDeleteKaryakar = useCallback(
    async (karyakarId) => {
      if (!karyakarId) return false;

      setKaryakars((prev) => {
        const updated = prev.filter((k) => k.id !== karyakarId);
        try {
          localStorage.setItem(`gunagrahan_karyakars_custom_${wing}`, JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });

      if (isSupabaseConfigured) {
        try {
          const { error } = await supabase.from('karyakars').delete().eq('id', karyakarId);
          if (error) console.error('Failed to delete karyakar from Supabase:', error);
        } catch (err) {
          console.error('Error deleting karyakar from Supabase:', err);
        }
      }

      return true;
    },
    [wing]
  );

  // Computed isAdminUser
  const isAdminUser = useMemo(() => {
    return Boolean(isAdmin(currentUser) || adminSessionUnlocked);
  }, [currentUser, adminSessionUnlocked]);

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
  const openAddModal = useCallback((recipientId = null) => {
    setPreselectedRecipientId(recipientId);
    setOnlyUnwrittenFilter(false);
    setIsAddModalOpen(true);
  }, []);

  const openCoverageAddModal = useCallback((recipientId = null) => {
    setPreselectedRecipientId(recipientId);
    setOnlyUnwrittenFilter(true);
    setIsAddModalOpen(true);
  }, []);

  const openEditNameModal = useCallback(() => {
    setIsEditNameModalOpen(true);
  }, []);

  const value = useMemo(
    () => ({
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
      isEditNameModalOpen,
      setIsEditNameModalOpen,
      openEditNameModal,
      updateUserName,
      openAddModal,
      openCoverageAddModal,
      handleGunaSubmitted,
      handleSaveEditedGuna,
      handleRajipoIncrement,
      // Admin System Capabilities
      adminSessionUnlocked,
      isAdminUser,
      unlockAdmin,
      lockAdmin,
      loginAsBhavikAdmin,
      updateTargetCount,
      deleteGuna,
      adminEditGuna,
      adminAddKaryakar,
      adminUpdateKaryakar,
      adminDeleteKaryakar,
    }),
    [
      wing,
      theme,
      targetGunas,
      currentUser,
      isHydrated,
      loginUser,
      logoutUser,
      sortedKaryakars,
      gunas,
      isLoading,
      totalWrittenCount,
      myWrittenCount,
      myWriterBadge,
      writerLeaderboard,
      myCoverageStats,
      smartNudgeKaryakars,
      isAddModalOpen,
      preselectedRecipientId,
      onlyUnwrittenFilter,
      editingGuna,
      isEditNameModalOpen,
      openEditNameModal,
      updateUserName,
      openAddModal,
      openCoverageAddModal,
      handleGunaSubmitted,
      handleSaveEditedGuna,
      handleRajipoIncrement,
      adminSessionUnlocked,
      isAdminUser,
      unlockAdmin,
      lockAdmin,
      loginAsBhavikAdmin,
      updateTargetCount,
      deleteGuna,
      adminEditGuna,
      adminAddKaryakar,
      adminUpdateKaryakar,
      adminDeleteKaryakar,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
