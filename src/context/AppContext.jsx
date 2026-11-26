'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { getTheme } from '@/config/theme';
import { SEED_KARYAKARS_BAL, SEED_KARYAKARS_BALIKA } from '@/config/seedKaryakars';
import { getWriterBadge, getProjectStatus, isUuid } from '@/lib/utils';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';

import {
  isAdmin,
  isSessionAdmin,
  unlockAdminSession,
  lockAdminSession,
  BHAVIK_ADMIN_INFO,
} from '@/config/adminConfig';

const AppContext = createContext(null);

function createDefaultProject(wing, defaultTarget = 200) {
  return {
    id: `default-project-${wing}`,
    name: 'રમતોત્સવ ૨૦૨૬',
    subtitle: 'ગુણગ્રહણ મહોત્સવ',
    wing,
    target_gunas: defaultTarget,
    deadline_at: null,
    is_active: true,
    is_closed: false,
    created_at: new Date().toISOString(),
  };
}

export function AppProvider({ children }) {
  const wing = process.env.NEXT_PUBLIC_APP_WING || 'bal';
  const theme = useMemo(() => getTheme(wing), [wing]);
  const defaultTarget = parseInt(process.env.NEXT_PUBLIC_TARGET_GUNAS || '200', 10);

  // Master State
  const [currentUser, setCurrentUser] = useState(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [karyakars, setKaryakars] = useState([]);
  const [gunas, setGunas] = useState([]);
  const [projects, setProjects] = useState(() => [createDefaultProject(wing, defaultTarget)]);
  const [hasProjectsTable, setHasProjectsTable] = useState(false);
  const [nowTick, setNowTick] = useState(() => Date.now());
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
    return defaultTarget;
  });

  // Admin Session Unlocked State
  const [adminSessionUnlocked, setAdminSessionUnlocked] = useState(false);

  // Global Drawers & Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [preselectedRecipientId, setPreselectedRecipientId] = useState(null);
  const [onlyUnwrittenFilter, setOnlyUnwrittenFilter] = useState(false);
  const [editingGuna, setEditingGuna] = useState(null);
  const [isEditNameModalOpen, setIsEditNameModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);

  // 1. Initial LocalStorage Hydration
  useEffect(() => {
    try {
      const stored = localStorage.getItem('gunagrahan_user_v1');
      if (stored) {
        const parsedUser = JSON.parse(stored);
        setCurrentUser(parsedUser);
        if (isAdmin(parsedUser) && isSessionAdmin()) {
          setAdminSessionUnlocked(true);
        } else {
          lockAdminSession();
          setAdminSessionUnlocked(false);
        }
      } else {
        lockAdminSession();
        setAdminSessionUnlocked(false);
      }
    } catch (e) {
      console.warn('Failed to parse stored user:', e);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Periodic tick (every 30s) so open tabs auto-lock when deadline passes
  useEffect(() => {
    const timer = setInterval(() => {
      setNowTick(Date.now());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  // 2. Fetch Data from Supabase / Seed Fallback
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setIsLoading(true);
      try {
        if (isSupabaseConfigured) {
          const [kRes, gRes, pRes] = await Promise.all([
            supabase.from('karyakars').select('*').eq('wing', wing),
            supabase.from('gunas').select('*').eq('wing', wing).order('created_at', { ascending: false }),
            supabase.from('projects').select('*').eq('wing', wing).order('created_at', { ascending: false }),
          ]);

          const { data: kData, error: kError } = kRes;
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

          const { data: gData, error: gError } = gRes;
          if (!gError && gData) {
            if (isMounted) setGunas(gData);
          }

          const { data: pData, error: pError } = pRes;
          if (!pError && Array.isArray(pData)) {
            if (isMounted) {
              setHasProjectsTable(true);
              if (pData.length > 0) {
                setProjects(pData);
              } else {
                const storedProj = JSON.parse(localStorage.getItem(`gunagrahan_projects_${wing}`) || 'null');
                if (storedProj && storedProj.length > 0) setProjects(storedProj);
              }
            }
          } else {
            if (isMounted) {
              setHasProjectsTable(false);
              try {
                const storedProj = JSON.parse(localStorage.getItem(`gunagrahan_projects_${wing}`) || 'null');
                if (storedProj && storedProj.length > 0) setProjects(storedProj);
              } catch (e) {}
            }
          }
        } else {
          const seed = wing === 'balika' ? SEED_KARYAKARS_BALIKA : SEED_KARYAKARS_BAL;
          const localCustomKaryakars = JSON.parse(
            localStorage.getItem(`gunagrahan_karyakars_custom_${wing}`) || 'null'
          );
          const localGunas = JSON.parse(localStorage.getItem(`gunagrahan_gunas_${wing}`) || '[]');
          const localProjects = JSON.parse(localStorage.getItem(`gunagrahan_projects_${wing}`) || 'null');
          if (isMounted) {
            setKaryakars(localCustomKaryakars || seed);
            setGunas(localGunas);
            if (localProjects && localProjects.length > 0) setProjects(localProjects);
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
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'projects', filter: `wing=eq.${wing}` },
          (payload) => {
            setHasProjectsTable(true);
            setProjects((prev) => {
              const filtered = prev.filter((p) => isUuid(p.id) && p.id !== payload.new.id);
              return [payload.new, ...filtered];
            });
          }
        )
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'projects', filter: `wing=eq.${wing}` },
          (payload) => {
            setHasProjectsTable(true);
            setProjects((prev) =>
              prev.map((p) => (p.id === payload.new.id ? { ...p, ...payload.new } : p))
            );
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

    if (isAdmin(user)) {
      unlockAdminSession();
      setAdminSessionUnlocked(true);
    } else {
      lockAdminSession();
      setAdminSessionUnlocked(false);
    }

    setKaryakars((prev) => {
      if (prev.some((k) => k.id === user.id || k.name === user.name)) return prev;
      return [...prev, user];
    });
  }, []);

  // Logout handler
  const logoutUser = useCallback(() => {
    setCurrentUser(null);
    lockAdminSession();
    setAdminSessionUnlocked(false);
    try {
      localStorage.removeItem('gunagrahan_user_v1');
    } catch (e) {}
  }, []);

  // Update Current User Name Handler — verifies Supabase update and rolls back on failure
  const updateUserName = useCallback(
    async (newName) => {
      const trimmed = newName.trim();
      if (!trimmed || !currentUser) return false;
      if (trimmed === currentUser.name) return true;

      const prevUser = currentUser;
      const prevKaryakars = karyakars;
      const prevGunas = gunas;
      const oldName = currentUser.name;
      const updatedUser = { ...currentUser, name: trimmed };

      const rollbackLocal = () => {
        setCurrentUser(prevUser);
        try {
          localStorage.setItem('gunagrahan_user_v1', JSON.stringify(prevUser));
        } catch (e) {}
        setKaryakars(prevKaryakars);
        setGunas(prevGunas);
      };

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

      // 4. Update Supabase if configured and verify rows affected
      if (isSupabaseConfigured) {
        try {
          if (isUuid(currentUser.id)) {
            const { data, error } = await supabase
              .from('karyakars')
              .update({ name: trimmed })
              .eq('id', currentUser.id)
              .select('id');

            if (error || !data || data.length === 0) {
              console.error(
                'Failed to update user name in Supabase:',
                error?.message || 'No karyakar rows updated (check RLS UPDATE policy)'
              );
              rollbackLocal();
              return false;
            }

            await supabase
              .from('gunas')
              .update({ author_name: trimmed })
              .eq('author_id', currentUser.id);

            await supabase
              .from('gunas')
              .update({ recipient_name: trimmed })
              .eq('recipient_id', currentUser.id);
          } else if (oldName) {
            const { error } = await supabase
              .from('karyakars')
              .update({ name: trimmed })
              .eq('name', oldName);

            if (error) {
              console.error('Failed to update user name by name in Supabase:', error.message);
              rollbackLocal();
              return false;
            }

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
          rollbackLocal();
          return false;
        }
      }

      return true;
    },
    [currentUser, karyakars, gunas, wing]
  );

  // Update Current User Password Handler — verifies current password, updates Supabase, rolls back on failure
  const updateUserPassword = useCallback(
    async (currentPassword, newPassword) => {
      if (!currentUser) {
        return { success: false, error: 'કૃપા કરીને પહેલા લોગિન કરો.' };
      }

      const cleanNew = String(newPassword || '').trim();
      const cleanCurrent = String(currentPassword || '').trim();
      if (cleanNew.length < 3) {
        return { success: false, error: 'નવો પાસવર્ડ ઓછામાં ઓછા ૩ અક્ષર/અંકનો હોવો જોઈએ.' };
      }

      const liveRecord = karyakars.find((k) => k.id === currentUser.id) || currentUser;
      const expectedCurrent = String(liveRecord?.karyakar_number || '').trim();
      if (expectedCurrent && cleanCurrent !== expectedCurrent) {
        return { success: false, error: 'હાલનો પાસવર્ડ (કાર્યકર નંબર) ખોટો છે.' };
      }

      const prevUser = currentUser;
      const prevKaryakars = karyakars;
      const updatedUser = { ...currentUser, karyakar_number: cleanNew };

      const rollbackPassword = () => {
        setCurrentUser(prevUser);
        try {
          localStorage.setItem('gunagrahan_user_v1', JSON.stringify(prevUser));
        } catch (e) {}
        setKaryakars(prevKaryakars);
        if (!isSupabaseConfigured) {
          try {
            localStorage.setItem(`gunagrahan_karyakars_custom_${wing}`, JSON.stringify(prevKaryakars));
          } catch (e) {}
        }
      };

      setCurrentUser(updatedUser);
      try {
        localStorage.setItem('gunagrahan_user_v1', JSON.stringify(updatedUser));
      } catch (e) {}

      setKaryakars((prev) => {
        const next = prev.map((k) =>
          k.id === currentUser.id ? { ...k, karyakar_number: cleanNew } : k
        );
        if (!isSupabaseConfigured) {
          try {
            localStorage.setItem(`gunagrahan_karyakars_custom_${wing}`, JSON.stringify(next));
          } catch (e) {}
        }
        return next;
      });

      if (isSupabaseConfigured) {
        try {
          if (isUuid(currentUser.id)) {
            const { data, error } = await supabase
              .from('karyakars')
              .update({ karyakar_number: cleanNew })
              .eq('id', currentUser.id)
              .select('id, karyakar_number');

            if (error || !data || data.length === 0) {
              const errMsg =
                error?.message ||
                'ડેટાબેઝમાં પાસવર્ડ અપડેટ ન થયો (Supabase RLS UPDATE policy તપાસો).';
              console.error('Failed to update password in Supabase:', errMsg);
              rollbackPassword();
              return { success: false, error: errMsg };
            }
          } else if (currentUser.name) {
            const { error } = await supabase
              .from('karyakars')
              .update({ karyakar_number: cleanNew })
              .eq('name', currentUser.name);

            if (error) {
              console.error('Failed to update password by name in Supabase:', error.message);
              rollbackPassword();
              return { success: false, error: error.message };
            }
          }
        } catch (err) {
          console.error('Failed to update password:', err);
          rollbackPassword();
          return { success: false, error: err?.message || 'પાસવર્ડ બદલવામાં મુશ્કેલી થઈ.' };
        }
      }

      return { success: true };
    },
    [currentUser, karyakars, wing]
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

  // Guna Edited Handler — verifies Supabase update and rolls back on failure
  const handleSaveEditedGuna = useCallback(
    async (updatedGuna) => {
      if (!updatedGuna?.id) return { success: false, error: 'Invalid guna item' };

      const prevGuna = gunas.find((g) => g.id === updatedGuna.id);
      const nextContent = (updatedGuna.content || '').trim();
      if (nextContent.length < 3) {
        return { success: false, error: 'ગુણ ઓછામાં ઓછા ૩ અક્ષરનો હોવો જોઈએ.' };
      }

      setGunas((prev) =>
        prev.map((g) => (g.id === updatedGuna.id ? { ...g, content: nextContent } : g))
      );

      try {
        if (isSupabaseConfigured && isUuid(updatedGuna.id)) {
          const { data, error } = await supabase
            .from('gunas')
            .update({ content: nextContent })
            .eq('id', updatedGuna.id)
            .select('id');

          if (error || !data || data.length === 0) {
            const errMsg =
              error?.message ||
              'ડેટાબેઝમાં ગુણ અપડેટ ન થયો (Supabase RLS UPDATE policy તપાસો).';
            console.error('Failed to update guna in Supabase:', errMsg);
            if (prevGuna) {
              setGunas((prev) => prev.map((g) => (g.id === updatedGuna.id ? prevGuna : g)));
            }
            return { success: false, error: errMsg };
          }
        } else if (!isSupabaseConfigured) {
          const stored = JSON.parse(localStorage.getItem(`gunagrahan_gunas_${wing}`) || '[]');
          const updated = stored.map((g) =>
            g.id === updatedGuna.id ? { ...g, content: nextContent } : g
          );
          localStorage.setItem(`gunagrahan_gunas_${wing}`, JSON.stringify(updated));
        }
        return { success: true };
      } catch (err) {
        console.error('Error saving updated guna:', err);
        if (prevGuna) {
          setGunas((prev) => prev.map((g) => (g.id === updatedGuna.id ? prevGuna : g)));
        }
        return { success: false, error: err?.message || 'ગુણ અપડેટ કરવામાં મુશ્કેલી થઈ.' };
      }
    },
    [gunas, wing]
  );

  // Rajipo Increment Handler
  const handleRajipoIncrement = useCallback((gunaId) => {
    setGunas((prev) =>
      prev.map((g) => (g.id === gunaId ? { ...g, rajipo_count: (g.rajipo_count || 0) + 1 } : g))
    );
  }, []);

  // Active Project & Deadline Helpers
  const activeProject = useMemo(() => {
    return projects.find((p) => p.is_active) || projects[0] || createDefaultProject(wing, targetGunas);
  }, [projects, wing, targetGunas]);

  const effectiveTargetGunas = useMemo(() => {
    const t = parseInt(activeProject?.target_gunas, 10);
    return !isNaN(t) && t > 0 ? t : targetGunas;
  }, [activeProject, targetGunas]);

  const projectStatus = useMemo(() => {
    return getProjectStatus(activeProject, nowTick);
  }, [activeProject, nowTick]);

  const persistProjectsLocal = useCallback(
    (nextProjects) => {
      try {
        localStorage.setItem(`gunagrahan_projects_${wing}`, JSON.stringify(nextProjects));
      } catch (e) {}
    },
    [wing]
  );

  // Update Active Project (Name, Subtitle, Target, Deadline, Closed state)
  const updateActiveProject = useCallback(
    async (updates) => {
      if (!updates || !activeProject) return { success: false, error: 'Invalid project update' };

      const prevProjects = projects;
      const prevTargetGunas = targetGunas;

      if (updates.target_gunas) {
        const parsedTarget = parseInt(updates.target_gunas, 10);
        if (!isNaN(parsedTarget) && parsedTarget > 0) {
          setTargetGunas(parsedTarget);
          try {
            localStorage.setItem(`gunagrahan_target_gunas_${wing}`, String(parsedTarget));
          } catch (e) {}
        }
      }

      const mergedProject = { ...activeProject, ...updates };
      setProjects((prev) => {
        const exists = prev.some((p) => p.id === activeProject.id);
        const next = exists
          ? prev.map((p) => (p.id === activeProject.id ? mergedProject : p))
          : [mergedProject, ...prev];
        persistProjectsLocal(next);
        return next;
      });

      const rollbackProject = () => {
        setProjects(prevProjects);
        persistProjectsLocal(prevProjects);
        setTargetGunas(prevTargetGunas);
        try {
          localStorage.setItem(`gunagrahan_target_gunas_${wing}`, String(prevTargetGunas));
        } catch (e) {}
      };

      if (isSupabaseConfigured && hasProjectsTable) {
        try {
          if (isUuid(activeProject.id)) {
            const { data, error } = await supabase
              .from('projects')
              .update(updates)
              .eq('id', activeProject.id)
              .select('id');
            if (error || !data || data.length === 0) {
              const errMsg =
                error?.message ||
                'ડેટાબેઝમાં પ્રોજેક્ટ અપડેટ ન થયો (Supabase RLS UPDATE policy તપાસો).';
              console.error('Failed to update project in Supabase:', errMsg);
              rollbackProject();
              return { success: false, error: errMsg };
            }
          } else {
            const insertPayload = {
              name: mergedProject.name || 'રમતોત્સવ ૨૦૨૬',
              subtitle: mergedProject.subtitle || '',
              wing,
              target_gunas: Number(mergedProject.target_gunas) || 200,
              deadline_at: mergedProject.deadline_at || null,
              is_active: true,
              is_closed: Boolean(mergedProject.is_closed),
            };
            const { data, error } = await supabase
              .from('projects')
              .insert(insertPayload)
              .select()
              .single();
            if (error || !data) {
              const errMsg = error?.message || 'પ્રોજેક્ટ ડેટાબેઝમાં સાચવી શકાયો નહીં.';
              console.error('Failed to insert project in Supabase:', errMsg);
              rollbackProject();
              return { success: false, error: errMsg };
            }
            setProjects((prev) => {
              const next = prev.map((p) => (p.id === activeProject.id ? data : p));
              persistProjectsLocal(next);
              return next;
            });
          }
        } catch (err) {
          console.error('Error updating project in Supabase:', err);
          rollbackProject();
          return { success: false, error: err?.message || 'પ્રોજેક્ટ અપડેટ નિષ્ફળ ગયો.' };
        }
      }

      return { success: true };
    },
    [activeProject, projects, targetGunas, wing, hasProjectsTable, persistProjectsLocal]
  );

  // Create & Switch to a New Project (keeps previous project's gunas archived)
  const createNewProject = useCallback(
    async ({ name, subtitle = '', target_gunas = 200, deadline_at = null }) => {
      const cleanName = (name || '').trim();
      if (!cleanName) return { success: false, error: 'પ્રોજેક્ટનું નામ લખવું જરૂરી છે.' };

      const parsedTarget = Math.max(10, parseInt(target_gunas, 10) || 200);
      const localNewProject = {
        id:
          typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID()
            : `project-${Date.now()}`,
        name: cleanName,
        subtitle: (subtitle || '').trim(),
        wing,
        target_gunas: parsedTarget,
        deadline_at: deadline_at || null,
        is_active: true,
        is_closed: false,
        created_at: new Date().toISOString(),
      };

      setTargetGunas(parsedTarget);
      try {
        localStorage.setItem(`gunagrahan_target_gunas_${wing}`, String(parsedTarget));
      } catch (e) {}

      if (isSupabaseConfigured && hasProjectsTable) {
        try {
          await supabase.from('projects').update({ is_active: false }).eq('wing', wing);
          const { data, error } = await supabase
            .from('projects')
            .insert({
              name: localNewProject.name,
              subtitle: localNewProject.subtitle,
              wing,
              target_gunas: parsedTarget,
              deadline_at: localNewProject.deadline_at,
              is_active: true,
              is_closed: false,
            })
            .select()
            .single();

          if (!error && data) {
            setProjects((prev) => {
              const deactivated = prev
                .filter((p) => isUuid(p.id))
                .map((p) => ({ ...p, is_active: false }));
              const next = [data, ...deactivated];
              persistProjectsLocal(next);
              return next;
            });
            return { success: true, project: data };
          }
        } catch (err) {
          console.error('Error creating project in Supabase:', err);
        }
      }

      setProjects((prev) => {
        const deactivated = prev.map((p) => ({ ...p, is_active: false }));
        const next = [localNewProject, ...deactivated];
        persistProjectsLocal(next);
        return next;
      });
      return { success: true, project: localNewProject };
    },
    [wing, hasProjectsTable, persistProjectsLocal]
  );

  // Switch Active Project
  const switchActiveProject = useCallback(
    async (projectId) => {
      if (!projectId) return false;
      const target = projects.find((p) => p.id === projectId);
      if (!target) return false;

      if (target.target_gunas) {
        setTargetGunas(Number(target.target_gunas));
      }

      setProjects((prev) => {
        const next = prev.map((p) => ({ ...p, is_active: p.id === projectId }));
        persistProjectsLocal(next);
        return next;
      });

      if (isSupabaseConfigured && hasProjectsTable && isUuid(projectId)) {
        try {
          await supabase.from('projects').update({ is_active: false }).eq('wing', wing);
          await supabase.from('projects').update({ is_active: true }).eq('id', projectId);
        } catch (err) {
          console.error('Error switching active project:', err);
        }
      }

      return true;
    },
    [projects, wing, hasProjectsTable, persistProjectsLocal]
  );

  // Target Count Updater
  const updateTargetCount = useCallback(
    async (newTarget) => {
      const count = parseInt(newTarget, 10);
      if (isNaN(count) || count <= 0) return { success: false, error: 'માન્ય સંખ્યા દાખલ કરો.' };
      return await updateActiveProject({ target_gunas: count });
    },
    [updateActiveProject]
  );

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

  // Register newly created karyakar into state immediately (avoids Realtime race)
  const registerKaryakarInState = useCallback(
    (newKaryakar) => {
      if (!newKaryakar) return;
      setKaryakars((prev) => {
        if (prev.some((k) => k.id === newKaryakar.id)) return prev;
        const updated = [...prev, newKaryakar];
        try {
          localStorage.setItem(`gunagrahan_karyakars_custom_${wing}`, JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });
    },
    [wing]
  );

  // Delete Guna Handler (Admin & Author) — verifies Supabase delete and rolls back on failure
  const deleteGuna = useCallback(
    async (gunaId) => {
      if (!gunaId) return { success: false, error: 'Guna ID missing' };

      const targetGuna = gunas.find((g) => g.id === gunaId);

      setGunas((prev) => {
        const updated = prev.filter((g) => g.id !== gunaId);
        if (!isSupabaseConfigured) {
          try {
            localStorage.setItem(`gunagrahan_gunas_${wing}`, JSON.stringify(updated));
          } catch (e) {}
        }
        return updated;
      });

      if (isSupabaseConfigured && isUuid(gunaId)) {
        try {
          const { data, error } = await supabase
            .from('gunas')
            .delete()
            .eq('id', gunaId)
            .select('id');

          if (error || !data || data.length === 0) {
            const errMsg =
              error?.message ||
              'ડેટાબેઝમાંથી ગુણ ડિલીટ ન થયો (Supabase RLS DELETE policy તપાસો).';
            console.error('Failed to delete guna from Supabase:', errMsg);
            if (targetGuna) {
              setGunas((prev) => {
                if (prev.some((g) => g.id === targetGuna.id)) return prev;
                return [targetGuna, ...prev].sort(
                  (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
                );
              });
            }
            return { success: false, error: errMsg };
          }
        } catch (err) {
          console.error('Error deleting guna:', err);
          if (targetGuna) {
            setGunas((prev) => (prev.some((g) => g.id === targetGuna.id) ? prev : [targetGuna, ...prev]));
          }
          return { success: false, error: err?.message || 'Delete failed' };
        }
      }
      return { success: true };
    },
    [gunas, wing]
  );

  // Admin Edit Guna Handler — verifies Supabase update and rolls back on failure
  const adminEditGuna = useCallback(
    async (gunaId, updates) => {
      if (!gunaId || !updates) return { success: false, error: 'Invalid update' };

      const prevGuna = gunas.find((g) => g.id === gunaId);

      setGunas((prev) => {
        const updated = prev.map((g) => (g.id === gunaId ? { ...g, ...updates } : g));
        if (!isSupabaseConfigured) {
          try {
            localStorage.setItem(`gunagrahan_gunas_${wing}`, JSON.stringify(updated));
          } catch (e) {}
        }
        return updated;
      });

      if (isSupabaseConfigured && isUuid(gunaId)) {
        try {
          const { data, error } = await supabase
            .from('gunas')
            .update(updates)
            .eq('id', gunaId)
            .select('id');

          if (error || !data || data.length === 0) {
            const errMsg =
              error?.message ||
              'ડેટાબેઝમાં ગુણ અપડેટ ન થયો (Supabase RLS UPDATE policy તપાસો).';
            console.error('Failed to update guna in Supabase:', errMsg);
            if (prevGuna) {
              setGunas((prev) => prev.map((g) => (g.id === gunaId ? prevGuna : g)));
            }
            return { success: false, error: errMsg };
          }
        } catch (err) {
          console.error('Error updating guna in Supabase:', err);
          if (prevGuna) {
            setGunas((prev) => prev.map((g) => (g.id === gunaId ? prevGuna : g)));
          }
          return { success: false, error: err?.message || 'Update failed' };
        }
      }
      return { success: true };
    },
    [gunas, wing]
  );

  // Admin Add Karyakar Handler
  const adminAddKaryakar = useCallback(
    async (newKaryakar) => {
      const cleanName = (newKaryakar.name || '').trim();
      const cleanNumber = (newKaryakar.karyakar_number || '').trim();
      if (!cleanName) return { success: false, error: 'નામ દાખલ કરવું જરૂરી છે.' };

      const duplicate = karyakars.some(
        (k) =>
          (cleanNumber && String(k.karyakar_number || '').trim() === cleanNumber) ||
          k.name.trim().toLowerCase() === cleanName.toLowerCase()
      );
      if (duplicate) {
        return { success: false, error: 'આ નામ અથવા કાર્યકર નંબર પહેલેથી હાજર છે.' };
      }

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

      if (isSupabaseConfigured) {
        try {
          let { data, error } = await supabase
            .from('karyakars')
            .insert([karyakarObj])
            .select()
            .single();

          if (error && /(role|sabha)/i.test(error.message || '')) {
            const { role: _r, sabha: _s, ...minimalObj } = karyakarObj;
            const retryRes = await supabase
              .from('karyakars')
              .insert([minimalObj])
              .select()
              .single();
            data = retryRes.data ? { ...karyakarObj, ...retryRes.data } : null;
            error = retryRes.error;
          }

          if (error) {
            console.error('Failed to insert karyakar in Supabase:', error);
            return { success: false, error: error.message || 'કાર્યકર ઉમેરી શકાયો નહીં.' };
          }
          const saved = data || karyakarObj;
          registerKaryakarInState(saved);
          return { success: true, karyakar: saved };
        } catch (err) {
          console.error('Error inserting karyakar in Supabase:', err);
          return { success: false, error: err?.message || 'કાર્યકર ઉમેરી શકાયો નહીં.' };
        }
      }

      registerKaryakarInState(karyakarObj);
      return { success: true, karyakar: karyakarObj };
    },
    [karyakars, wing, registerKaryakarInState]
  );

  // Admin Update Karyakar Handler — verifies Supabase update and rolls back on failure
  const adminUpdateKaryakar = useCallback(
    async (karyakarId, updates) => {
      if (!karyakarId || !updates) return { success: false, error: 'Invalid update' };

      const prevKaryakar = karyakars.find((k) => k.id === karyakarId);
      const oldName = prevKaryakar?.name || '';

      if (isSupabaseConfigured && isUuid(karyakarId)) {
        try {
          let { data, error } = await supabase
            .from('karyakars')
            .update(updates)
            .eq('id', karyakarId)
            .select('id');

          if (error && /(role|sabha)/i.test(error.message || '')) {
            const { role: _r, sabha: _s, ...minimalUpdates } = updates;
            const retryRes = await supabase
              .from('karyakars')
              .update(minimalUpdates)
              .eq('id', karyakarId)
              .select('id');
            data = retryRes.data;
            error = retryRes.error;
          }

          if (error || !data || data.length === 0) {
            const errMsg =
              error?.message ||
              'ડેટાબેઝમાં કાર્યકર અપડેટ ન થયો (Supabase RLS UPDATE policy તપાસો).';
            console.error('Failed to update karyakar in Supabase:', errMsg);
            return { success: false, error: errMsg };
          }

          if (updates.name && oldName && updates.name !== oldName) {
            await supabase.from('gunas').update({ author_name: updates.name }).eq('author_id', karyakarId);
            await supabase.from('gunas').update({ recipient_name: updates.name }).eq('recipient_id', karyakarId);
          }
        } catch (err) {
          console.error('Error updating karyakar in Supabase:', err);
          return { success: false, error: err?.message || 'Update failed' };
        }
      }

      setKaryakars((prev) => {
        const updated = prev.map((k) =>
          k.id === karyakarId ? { ...k, ...updates } : k
        );
        try {
          localStorage.setItem(`gunagrahan_karyakars_custom_${wing}`, JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });

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

      return { success: true };
    },
    [karyakars, wing]
  );

  // Admin Delete Karyakar Handler — verifies Supabase delete and rolls back on failure
  const adminDeleteKaryakar = useCallback(
    async (karyakarId) => {
      if (!karyakarId) return { success: false, error: 'Karyakar ID missing' };

      const prevKaryakar = karyakars.find((k) => k.id === karyakarId);

      if (isSupabaseConfigured && isUuid(karyakarId)) {
        try {
          const { data, error } = await supabase
            .from('karyakars')
            .delete()
            .eq('id', karyakarId)
            .select('id');

          if (error || !data || data.length === 0) {
            const errMsg =
              error?.message ||
              'ડેટાબેઝમાંથી કાર્યકર ડિલીટ ન થયો (Supabase RLS DELETE policy તપાસો).';
            console.error('Failed to delete karyakar from Supabase:', errMsg);
            return { success: false, error: errMsg };
          }
        } catch (err) {
          console.error('Error deleting karyakar from Supabase:', err);
          return { success: false, error: err?.message || 'Delete failed' };
        }
      }

      setKaryakars((prev) => {
        const updated = prev.filter((k) => k.id !== karyakarId);
        try {
          localStorage.setItem(`gunagrahan_karyakars_custom_${wing}`, JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });

      // Remove cascaded gunas from local state as well
      setGunas((prev) => prev.filter((g) => g.author_id !== karyakarId && g.recipient_id !== karyakarId));

      return { success: true, deleted: prevKaryakar };
    },
    [karyakars, wing]
  );

  // Computed isAdminUser (strictly visible only when logged in as Bhavik)
  const isAdminUser = useMemo(() => {
    return Boolean(isAdmin(currentUser));
  }, [currentUser]);

  // Scope Gunas to Active Project (first/legacy project also includes unlinked rows)
  const earliestProjectId = useMemo(() => {
    const dbProjects = projects.filter((p) => isUuid(p.id));
    if (dbProjects.length === 0) return null;
    const sorted = [...dbProjects].sort(
      (a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
    );
    return sorted[0]?.id || null;
  }, [projects]);

  const scopedGunas = useMemo(() => {
    if (!activeProject || !isUuid(activeProject.id)) {
      return gunas;
    }
    const dbProjectsCount = projects.filter((p) => isUuid(p.id)).length;
    if (dbProjectsCount <= 1 || activeProject.id === earliestProjectId) {
      return gunas.filter((g) => !g.project_id || g.project_id === activeProject.id);
    }
    return gunas.filter((g) => g.project_id === activeProject.id);
  }, [gunas, projects, activeProject, earliestProjectId]);

  // Derived Analytics
  const totalWrittenCount = scopedGunas.length;

  const myWrittenCount = useMemo(() => {
    if (!currentUser) return 0;
    return scopedGunas.filter((g) => g.author_id === currentUser.id).length;
  }, [scopedGunas, currentUser]);

  const myWriterBadge = useMemo(() => {
    return getWriterBadge(myWrittenCount);
  }, [myWrittenCount]);

  // Strict Writer-First Leaderboard
  const writerLeaderboard = useMemo(() => {
    const counts = {};
    const names = {};

    scopedGunas.forEach((g) => {
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
  }, [scopedGunas]);

  // Personal Coverage Stats (20/20 Checklist)
  const myCoverageStats = useMemo(() => {
    if (!currentUser) {
      return { coveredCount: 0, totalOthers: 0, unwrittenKaryakars: [], writtenMap: {} };
    }

    const otherKaryakars = sortedKaryakars.filter((k) => k.id !== currentUser.id);
    const myGunas = scopedGunas.filter((g) => g.author_id === currentUser.id);

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
  }, [sortedKaryakars, scopedGunas, currentUser]);

  // Smart Nudge Suggestions
  const smartNudgeKaryakars = useMemo(() => {
    if (!currentUser) return [];

    const otherKaryakars = sortedKaryakars.filter((k) => k.id !== currentUser.id);
    const writtenByMeSet = new Set(
      scopedGunas.filter((g) => g.author_id === currentUser.id).map((g) => g.recipient_id)
    );

    const receivedCounts = {};
    scopedGunas.forEach((g) => {
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
  }, [sortedKaryakars, scopedGunas, currentUser]);

  // Modal Openers (locked automatically when project deadline has passed)
  const openAddModal = useCallback(
    (recipientId = null) => {
      if (projectStatus.isSubmissionClosed) return;
      setPreselectedRecipientId(recipientId);
      setOnlyUnwrittenFilter(false);
      setIsAddModalOpen(true);
    },
    [projectStatus.isSubmissionClosed]
  );

  const openCoverageAddModal = useCallback(
    (recipientId = null) => {
      if (projectStatus.isSubmissionClosed) return;
      setPreselectedRecipientId(recipientId);
      setOnlyUnwrittenFilter(true);
      setIsAddModalOpen(true);
    },
    [projectStatus.isSubmissionClosed]
  );

  const openEditNameModal = useCallback(() => {
    setIsEditNameModalOpen(true);
  }, []);

  const openChangePasswordModal = useCallback(() => {
    setIsChangePasswordModalOpen(true);
  }, []);

  const value = useMemo(
    () => ({
      wing,
      theme,
      targetGunas: effectiveTargetGunas,
      projects,
      activeProject,
      projectStatus,
      hasProjectsTable,
      currentUser,
      isHydrated,
      loginUser,
      logoutUser,
      karyakars: sortedKaryakars,
      gunas: scopedGunas,
      allGunas: gunas,
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
      isChangePasswordModalOpen,
      setIsChangePasswordModalOpen,
      openChangePasswordModal,
      updateUserPassword,
      openAddModal,
      openCoverageAddModal,
      handleGunaSubmitted,
      handleSaveEditedGuna,
      handleRajipoIncrement,
      registerKaryakarInState,
      // Admin System Capabilities
      adminSessionUnlocked,
      isAdminUser,
      unlockAdmin,
      lockAdmin,
      loginAsBhavikAdmin,
      updateTargetCount,
      updateActiveProject,
      createNewProject,
      switchActiveProject,
      deleteGuna,
      adminEditGuna,
      adminAddKaryakar,
      adminUpdateKaryakar,
      adminDeleteKaryakar,
    }),
    [
      wing,
      theme,
      effectiveTargetGunas,
      projects,
      activeProject,
      projectStatus,
      hasProjectsTable,
      currentUser,
      isHydrated,
      loginUser,
      logoutUser,
      sortedKaryakars,
      scopedGunas,
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
      isChangePasswordModalOpen,
      openChangePasswordModal,
      updateUserPassword,
      openAddModal,
      openCoverageAddModal,
      handleGunaSubmitted,
      handleSaveEditedGuna,
      handleRajipoIncrement,
      registerKaryakarInState,
      adminSessionUnlocked,
      isAdminUser,
      unlockAdmin,
      lockAdmin,
      loginAsBhavikAdmin,
      updateTargetCount,
      updateActiveProject,
      createNewProject,
      switchActiveProject,
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
