'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Crown,
  ShieldAlert,
  KeyRound,
  Users,
  MessageSquareQuote,
  FileSpreadsheet,
  Download,
  Edit3,
  Trash2,
  Plus,
  Search,
  Filter,
  Check,
  X,
  AlertTriangle,
  Heart,
  BarChart3,
  Target,
  TrendingUp,
  RefreshCw,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  UserCheck,
  CheckCircle2,
  ArrowLeft,
  ChevronRight,
  Sliders,
  Sparkles,
  CalendarClock,
  FolderKanban,
} from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import {
  isAdmin,
  verifyAdminPin,
} from '@/config/adminConfig';
import { formatRelativeTime, toDatetimeLocalValue } from '@/lib/utils';
import TilakChandlo from '@/components/TilakChandlo';

export default function AdminPage() {
  const {
    currentUser,
    loginUser,
    karyakars,
    gunas,
    wing,
    theme,
    targetGunas,
    projects,
    activeProject,
    projectStatus,
    hasProjectsTable,
    updateTargetCount,
    updateActiveProject,
    createNewProject,
    switchActiveProject,
    deleteGuna,
    adminEditGuna,
    adminAddKaryakar,
    adminUpdateKaryakar,
    adminDeleteKaryakar,
    adminSessionUnlocked,
    unlockAdmin,
    lockAdmin,
    openAddModal,
  } = useAppContext();

  // Active Tab: 'overview' | 'gunas' | 'karyakars' | 'export'
  const [activeTab, setActiveTab] = useState('overview');

  // PIN Gate State
  const [pinInput, setPinInput] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [pinError, setPinError] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // Target Gunas Adjuster State
  const [newTargetInput, setNewTargetInput] = useState(String(targetGunas));
  const [isEditingTarget, setIsEditingTarget] = useState(false);

  // Project & Deadline Management State
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [projectForm, setProjectForm] = useState({
    name: activeProject?.name || 'રમતોત્સવ ૨૦૨૬',
    subtitle: activeProject?.subtitle || '',
    deadlineLocal: toDatetimeLocalValue(activeProject?.deadline_at),
  });
  const [newProjectForm, setNewProjectForm] = useState({
    name: '',
    subtitle: '',
    target_gunas: '200',
    deadlineLocal: '',
  });

  // Gunas Tab Filters & State
  const [gunaSearchQuery, setGunaSearchQuery] = useState('');
  const [gunaSabhaFilter, setGunaSabhaFilter] = useState('all');
  const [gunaSortBy, setGunaSortBy] = useState('newest'); // 'newest' | 'oldest' | 'rajipo'
  const [editingGunaItem, setEditingGunaItem] = useState(null);
  const [gunaToDelete, setGunaToDelete] = useState(null);

  // Karyakars Tab Filters & State
  const [karyakarSearchQuery, setKaryakarSearchQuery] = useState('');
  const [karyakarSabhaFilter, setKaryakarSabhaFilter] = useState('all');
  const [karyakarRoleFilter, setKaryakarRoleFilter] = useState('all');
  const [isAddKaryakarOpen, setIsAddKaryakarOpen] = useState(false);
  const [editingKaryakarItem, setEditingKaryakarItem] = useState(null);
  const [karyakarToDelete, setKaryakarToDelete] = useState(null);

  // Add Karyakar Form State
  const [newKaryakarForm, setNewKaryakarForm] = useState({
    name: '',
    karyakar_number: '',
    role: 'સંચાલક',
    sabha: 'શિવશક્તિ',
    wing: wing,
  });

  // Edit Karyakar Form State
  const [editKaryakarForm, setEditKaryakarForm] = useState({
    name: '',
    karyakar_number: '',
    role: '',
    sabha: '',
  });

  // Edit Guna Form State
  const [editGunaForm, setEditGunaForm] = useState({
    content: '',
    recipient_id: '',
    recipient_name: '',
    rajipo_count: 0,
  });

  // Toast Helper
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 3500);
  };

  // Determine if Admin is Authenticated (must be logged in as Bhavik)
  const isBhavikAccount = isAdmin(currentUser);
  const isSuperAdmin = Boolean(isBhavikAccount && adminSessionUnlocked);

  // Sync newTargetInput when targetGunas changes
  useEffect(() => {
    setNewTargetInput(String(targetGunas));
  }, [targetGunas]);

  // Sync projectForm when activeProject changes
  useEffect(() => {
    if (activeProject && !isEditingProject) {
      setProjectForm({
        name: activeProject.name || '',
        subtitle: activeProject.subtitle || '',
        deadlineLocal: toDatetimeLocalValue(activeProject.deadline_at),
      });
    }
  }, [activeProject, isEditingProject]);

  // Save Project & Deadline
  const handleSaveProject = async (e) => {
    e?.preventDefault();
    const cleanName = projectForm.name.trim();
    if (!cleanName) return;

    const deadlineIso = projectForm.deadlineLocal
      ? new Date(projectForm.deadlineLocal).toISOString()
      : null;

    await updateActiveProject({
      name: cleanName,
      subtitle: projectForm.subtitle.trim(),
      deadline_at: deadlineIso,
    });
    setIsEditingProject(false);
    showToast('📅 પ્રોજેક્ટ અને ડેડલાઇન અપડેટ થઈ ગઈ!');
  };

  // Toggle Manual Project Close/Reopen
  const handleToggleProjectClosed = async () => {
    const nextClosed = !activeProject?.is_closed;
    await updateActiveProject({ is_closed: nextClosed });
    showToast(
      nextClosed
        ? '🔒 પ્રોજેક્ટ બંધ કરવામાં આવ્યો (હવે ફક્ત વાંચી શકાય).'
        : '🔓 પ્રોજેક્ટ ફરી ખુલ્લો મૂકવામાં આવ્યો!'
    );
  };

  // Create & Switch to a New Project
  const handleCreateNewProject = async (e) => {
    e?.preventDefault();
    const cleanName = newProjectForm.name.trim();
    if (!cleanName) return;

    const deadlineIso = newProjectForm.deadlineLocal
      ? new Date(newProjectForm.deadlineLocal).toISOString()
      : null;

    const res = await createNewProject({
      name: cleanName,
      subtitle: newProjectForm.subtitle.trim(),
      target_gunas: parseInt(newProjectForm.target_gunas, 10) || 200,
      deadline_at: deadlineIso,
    });

    if (res?.success) {
      setIsCreatingProject(false);
      setNewProjectForm({ name: '', subtitle: '', target_gunas: '200', deadlineLocal: '' });
      showToast(`🎉 નવો પ્રોજેક્ટ "${cleanName}" શરૂ થઈ ગયો!`);
    }
  };

  // Set quick deadline preset (+1, +2, +3 days at 11:59 PM)
  const applyDeadlinePreset = (daysToAdd, setter) => {
    const d = new Date();
    d.setDate(d.getDate() + daysToAdd);
    d.setHours(23, 59, 0, 0);
    const formatted = toDatetimeLocalValue(d);
    setter((prev) => ({ ...prev, deadlineLocal: formatted }));
  };

  // Handle PIN Submission
  const handleVerifyPin = (e) => {
    e?.preventDefault();
    setPinError('');
    const cleanPin = pinInput.trim();

    if (verifyAdminPin(cleanPin)) {
      unlockAdmin();
      showToast('👑 એડમિન સત્તા વેરિફાઈ થઈ ગઈ છે! સ્વાગત છે ભાવિકભાઈ.');
      setPinInput('');
    } else {
      setPinError('ખોટો એડમિન પિન! કૃપા કરીને સાચો પિન દાખલ કરો.');
    }
  };

  // Save Target Count
  const handleSaveTarget = (e) => {
    e.preventDefault();
    const count = parseInt(newTargetInput, 10);
    if (isNaN(count) || count <= 0) {
      showToast('કૃપા કરીને માન્ય સંખ્યા દાખલ કરો.');
      return;
    }
    updateTargetCount(count);
    setIsEditingTarget(false);
    showToast(`🎯 ગુણ લક્ષ્યાંક અપડેટ થઈને ${count} થયો!`);
  };

  // Sabha Options from existing karyakars
  const allSabhas = useMemo(() => {
    const set = new Set(karyakars.map((k) => k.sabha).filter(Boolean));
    return Array.from(set).sort();
  }, [karyakars]);

  // Role Options from existing karyakars
  const allRoles = useMemo(() => {
    const set = new Set(karyakars.map((k) => k.role).filter(Boolean));
    return Array.from(set).sort();
  }, [karyakars]);

  // Karyakars Stats Map (Written and Received counts)
  const karyakarStatsMap = useMemo(() => {
    const writtenMap = {};
    const receivedMap = {};

    gunas.forEach((g) => {
      if (g.author_id) {
        writtenMap[g.author_id] = (writtenMap[g.author_id] || 0) + 1;
      }
      if (g.recipient_id) {
        receivedMap[g.recipient_id] = (receivedMap[g.recipient_id] || 0) + 1;
      }
    });

    return { writtenMap, receivedMap };
  }, [gunas]);

  // Overall Coverage & KPI Metrics
  const metrics = useMemo(() => {
    const totalGunas = gunas.length;
    const totalKaryakars = karyakars.length;
    const distinctWriters = new Set(gunas.map((g) => g.author_id)).size;

    const coveredRecipients = karyakars.filter(
      (k) => (karyakarStatsMap.receivedMap[k.id] || 0) > 0
    );
    const coveredCount = coveredRecipients.length;
    const coveragePercentage = totalKaryakars > 0 ? Math.round((coveredCount / totalKaryakars) * 100) : 0;
    const targetPercentage = targetGunas > 0 ? Math.min(100, Math.round((totalGunas / targetGunas) * 100)) : 0;
    const totalRajipo = gunas.reduce((acc, g) => acc + (g.rajipo_count || 0), 0);

    const zeroGunaKaryakars = karyakars.filter(
      (k) => (karyakarStatsMap.receivedMap[k.id] || 0) === 0
    );

    return {
      totalGunas,
      totalKaryakars,
      distinctWriters,
      coveredCount,
      coveragePercentage,
      targetPercentage,
      totalRajipo,
      zeroGunaKaryakars,
    };
  }, [gunas, karyakars, karyakarStatsMap, targetGunas]);

  // Sabha Breakdown Stats
  const sabhaStats = useMemo(() => {
    const map = {};

    karyakars.forEach((k) => {
      const s = k.sabha || 'અન્ય';
      if (!map[s]) {
        map[s] = { sabha: s, karyakarsCount: 0, gunasWritten: 0, gunasReceived: 0 };
      }
      map[s].karyakarsCount += 1;
      map[s].gunasWritten += karyakarStatsMap.writtenMap[k.id] || 0;
      map[s].gunasReceived += karyakarStatsMap.receivedMap[k.id] || 0;
    });

    return Object.values(map).sort((a, b) => b.gunasWritten - a.gunasWritten);
  }, [karyakars, karyakarStatsMap]);

  // Filtered Gunas List
  const filteredGunas = useMemo(() => {
    let result = [...gunas];

    // Search query filter
    if (gunaSearchQuery.trim()) {
      const q = gunaSearchQuery.toLowerCase().trim();
      result = result.filter(
        (g) =>
          (g.content && g.content.toLowerCase().includes(q)) ||
          (g.author_name && g.author_name.toLowerCase().includes(q)) ||
          (g.recipient_name && g.recipient_name.toLowerCase().includes(q))
      );
    }

    // Sabha filter
    if (gunaSabhaFilter !== 'all') {
      const sabhaKaryakarIds = new Set(
        karyakars.filter((k) => k.sabha === gunaSabhaFilter).map((k) => k.id)
      );
      result = result.filter(
        (g) => sabhaKaryakarIds.has(g.author_id) || sabhaKaryakarIds.has(g.recipient_id)
      );
    }

    // Sort order
    if (gunaSortBy === 'newest') {
      result.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    } else if (gunaSortBy === 'oldest') {
      result.sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0));
    } else if (gunaSortBy === 'rajipo') {
      result.sort((a, b) => (b.rajipo_count || 0) - (a.rajipo_count || 0));
    }

    return result;
  }, [gunas, gunaSearchQuery, gunaSabhaFilter, gunaSortBy, karyakars]);

  // Filtered Karyakars List
  const filteredKaryakars = useMemo(() => {
    let result = [...karyakars];

    if (karyakarSearchQuery.trim()) {
      const q = karyakarSearchQuery.toLowerCase().trim();
      result = result.filter(
        (k) =>
          (k.name && k.name.toLowerCase().includes(q)) ||
          (k.karyakar_number && k.karyakar_number.includes(q)) ||
          (k.sabha && k.sabha.toLowerCase().includes(q)) ||
          (k.role && k.role.toLowerCase().includes(q))
      );
    }

    if (karyakarSabhaFilter !== 'all') {
      result = result.filter((k) => k.sabha === karyakarSabhaFilter);
    }

    if (karyakarRoleFilter !== 'all') {
      result = result.filter((k) => k.role === karyakarRoleFilter);
    }

    // Sort by name Gujarati alphabetical, but Bhavik always on top
    result.sort((a, b) => {
      if (a.karyakar_number === '13317') return -1;
      if (b.karyakar_number === '13317') return 1;
      return (a.name || '').localeCompare(b.name || '', 'gu');
    });

    return result;
  }, [karyakars, karyakarSearchQuery, karyakarSabhaFilter, karyakarRoleFilter]);

  // Handle Open Edit Guna Modal
  const handleOpenEditGuna = (guna) => {
    setEditingGunaItem(guna);
    setEditGunaForm({
      content: guna.content || '',
      recipient_id: guna.recipient_id || '',
      recipient_name: guna.recipient_name || '',
      rajipo_count: guna.rajipo_count || 0,
    });
  };

  // Handle Save Edit Guna
  const handleSaveGunaModal = async (e) => {
    e.preventDefault();
    if (!editingGunaItem) return;

    const updates = {
      content: editGunaForm.content.trim(),
      recipient_id: editGunaForm.recipient_id,
      recipient_name: editGunaForm.recipient_name,
      rajipo_count: parseInt(editGunaForm.rajipo_count, 10) || 0,
    };

    const res = await adminEditGuna(editingGunaItem.id, updates);
    if (res?.success) {
      setEditingGunaItem(null);
      showToast('✨ ગુણ સફળતાપૂર્વક અપડેટ થયો!');
    } else {
      showToast(`❌ ${res?.error || 'ગુણ અપડેટ કરવામાં ભૂલ આવી.'}`);
    }
  };

  // Handle Delete Guna
  const handleConfirmDeleteGuna = async () => {
    if (!gunaToDelete) return;
    const res = await deleteGuna(gunaToDelete.id);
    setGunaToDelete(null);
    if (res?.success) {
      showToast('🗑️ ગુણ સફળતાપૂર્વક ડિલીટ થયો.');
    } else {
      showToast(`❌ ${res?.error || 'ગુણ ડિલીટ કરવામાં ભૂલ આવી.'}`);
    }
  };

  // Handle Boost Rajipo
  const handleBoostRajipo = async (guna) => {
    const current = guna.rajipo_count || 0;
    const res = await adminEditGuna(guna.id, { rajipo_count: current + 1 });
    if (res?.success) {
      showToast(`❤️ રાજીપો વધાર્યો (+1)`);
    } else {
      showToast(`❌ ${res?.error || 'રાજીપો અપડેટ ન થયો.'}`);
    }
  };

  // Handle Add New Karyakar
  const handleCreateKaryakar = async (e) => {
    e.preventDefault();
    const cleanName = newKaryakarForm.name.trim();
    const cleanNumber = newKaryakarForm.karyakar_number.trim();

    if (!cleanName) {
      showToast('કૃપા કરીને કાર્યકરનું પૂરું નામ લખો.');
      return;
    }

    const res = await adminAddKaryakar(newKaryakarForm);
    if (res.success) {
      setIsAddKaryakarOpen(false);
      setNewKaryakarForm({
        name: '',
        karyakar_number: '',
        role: 'સંચાલક',
        sabha: 'શિવશક્તિ',
        wing: wing,
      });
      showToast(`✅ નવો કાર્યકર "${cleanName}" ઉમેરાઈ ગયો!`);
    } else {
      showToast(res.error || 'કાર્યકર ઉમેરવામાં સમસ્યા આવી.');
    }
  };

  // Handle Open Edit Karyakar
  const handleOpenEditKaryakar = (karyakar) => {
    setEditingKaryakarItem(karyakar);
    setEditKaryakarForm({
      name: karyakar.name || '',
      karyakar_number: karyakar.karyakar_number || '',
      role: karyakar.role || 'સંચાલક',
      sabha: karyakar.sabha || 'શિવશક્તિ',
    });
  };

  // Handle Save Edit Karyakar
  const handleSaveEditKaryakar = async (e) => {
    e.preventDefault();
    if (!editingKaryakarItem) return;

    const updates = {
      name: editKaryakarForm.name.trim(),
      karyakar_number: editKaryakarForm.karyakar_number.trim(),
      role: editKaryakarForm.role.trim(),
      sabha: editKaryakarForm.sabha.trim(),
    };

    const res = await adminUpdateKaryakar(editingKaryakarItem.id, updates);
    if (res?.success) {
      setEditingKaryakarItem(null);
      showToast(`✨ કાર્યકર વિગતો અપડેટ થઈ ગઈ!`);
    } else {
      showToast(`❌ ${res?.error || 'કાર્યકર અપડેટ કરવામાં ભૂલ આવી.'}`);
    }
  };

  // Handle Delete Karyakar
  const handleConfirmDeleteKaryakar = async () => {
    if (!karyakarToDelete) return;
    const res = await adminDeleteKaryakar(karyakarToDelete.id);
    setKaryakarToDelete(null);
    if (res?.success) {
      showToast(`🗑️ કાર્યકર યાદીમાંથી દૂર કરવામાં આવ્યા.`);
    } else {
      showToast(`❌ ${res?.error || 'કાર્યકર ડિલીટ કરવામાં ભૂલ આવી.'}`);
    }
  };

  // Fast Switch to User
  const handleSwitchUser = (karyakar) => {
    loginUser(karyakar);
    showToast(`👤 વપરાશકર્તા સ્વિચ થયો: ${karyakar.name}`);
  };

  // Export Gunas to CSV (with UTF-8 BOM)
  const exportGunasToCSV = () => {
    const headers = [
      'ક્રમ',
      'તારીખ અને સમય',
      'લેખકનું નામ',
      'લેખકનો નંબર',
      'પ્રાપ્તકર્તાનું નામ',
      'પ્રાપ્તકર્તાનો નંબર',
      'ગુણનું લખાણ',
      'રાજીપો કાઉન્ટ',
    ];

    const kMap = {};
    karyakars.forEach((k) => {
      kMap[k.id] = k;
    });

    const rows = gunas.map((g, idx) => {
      const author = kMap[g.author_id] || {};
      const recipient = kMap[g.recipient_id] || {};
      const dateStr = g.created_at ? new Date(g.created_at).toLocaleString('gu-IN') : '-';
      const cleanContent = (g.content || '').replace(/"/g, '""');

      return [
        idx + 1,
        `"${dateStr}"`,
        `"${g.author_name || author.name || ''}"`,
        `"${author.karyakar_number || ''}"`,
        `"${g.recipient_name || recipient.name || ''}"`,
        `"${recipient.karyakar_number || ''}"`,
        `"${cleanContent}"`,
        g.rajipo_count || 0,
      ].join(',');
    });

    // UTF-8 BOM (\uFEFF) ensures Gujarati text displays properly in Microsoft Excel
    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `baps_kshetra21_gunas_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('📥 ગુણોની CSV ફાઇલ ડાઉનલોડ થઈ ગઈ!');
  };

  // Export Karyakars to CSV (with UTF-8 BOM)
  const exportKaryakarsToCSV = () => {
    const headers = [
      'ક્રમ',
      'નામ',
      'સત્તાવાર કાર્યકર નંબર (પાસવર્ડ)',
      'ભૂમિકા (Role)',
      'સભા',
      'વિંગ',
      'લખેલા ગુણ',
      'મળેલા ગુણ',
    ];

    const rows = karyakars.map((k, idx) => {
      const written = karyakarStatsMap.writtenMap[k.id] || 0;
      const received = karyakarStatsMap.receivedMap[k.id] || 0;
      return [
        idx + 1,
        `"${k.name || ''}"`,
        `"${k.karyakar_number || ''}"`,
        `"${k.role || ''}"`,
        `"${k.sabha || ''}"`,
        `"${k.wing || wing}"`,
        written,
        received,
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `baps_kshetra21_karyakars_roster_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('📥 કાર્યકરો અને પાસવર્ડની CSV ફાઇલ ડાઉનલોડ થઈ ગઈ!');
  };

  // -------------------------------------------------------------
  // VIEW A: RESTRICTED ACCESS / ADMIN PIN GATE
  // -------------------------------------------------------------
  if (!isBhavikAccount) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-amber-900/15 overflow-hidden">
          <div className="bg-gradient-to-br from-stone-800 via-stone-900 to-amber-950 p-6 text-white text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-white/10 flex items-center justify-center mb-3 border border-white/20">
              <ShieldAlert className="w-8 h-8 text-amber-300" />
            </div>
            <h1 className="text-xl font-black tracking-tight font-gujarati">
              અધિકૃત પ્રવેશ નથી
            </h1>
            <p className="text-xs text-amber-100/80 mt-1 font-gujarati">
              એડમિન કંટ્રોલ પેનલ માત્ર મુખ્ય સંચાલક (ભાવિકભાઈ) માટે જ ઉપલબ્ધ છે.
            </p>
          </div>

          <div className="p-6 text-center space-y-4">
            <p className="text-xs sm:text-sm text-stone-600 font-gujarati leading-relaxed">
              જો આપ ભાવિકભાઈ છો, તો કૃપા કરીને તમારા સત્તાવાર કાર્યકર આઈડી અને પાસવર્ડથી લોગિન કરો.
            </p>

            <Link
              href="/"
              className="w-full py-2.5 px-4 rounded-xl bg-stone-900 hover:bg-black text-white font-gujarati font-bold text-sm shadow-md active:scale-95 transition flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>હોમ પેજ પર પાછા જાઓ</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!isSuperAdmin) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-amber-900/15 overflow-hidden">
          {/* Header Card */}
          <div className="bg-gradient-to-br from-amber-600 via-amber-700 to-amber-900 p-6 text-white text-center relative">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-white/15 flex items-center justify-center mb-3 border border-white/20 shadow-md">
              <Crown className="w-8 h-8 text-amber-200 fill-amber-300" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight font-gujarati">
              એડમિન કંટ્રોલ પેનલ
            </h1>
            <p className="text-xs text-amber-100/90 mt-1 font-gujarati">
              સર્વ નિયંત્રણ અને સત્તાવાર સંચાલન • ક્ષેત્ર ૨૧
            </p>
          </div>

          <div className="p-6 space-y-5">
            {/* Admin PIN Entry Form */}
            <form onSubmit={handleVerifyPin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 font-gujarati mb-1.5">
                  એડમિન પિન દાખલ કરો
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type={showPin ? 'text' : 'password'}
                    value={pinInput}
                    onChange={(e) => {
                      setPinInput(e.target.value);
                      if (pinError) setPinError('');
                    }}
                    placeholder="એડમિન પિન દાખલ કરો..."
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-amber-900/20 focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 text-stone-900 font-mono tracking-widest text-center text-base"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-700"
                  >
                    {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {pinError && (
                  <p className="text-xs text-rose-600 font-gujarati font-semibold mt-1.5 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>{pinError}</span>
                  </p>
                )}
              </div>

              {/* Number Buttons for fast mobile entry */}
              <div className="grid grid-cols-3 gap-1.5 pt-1">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((btn) => (
                  <button
                    key={btn}
                    type="button"
                    onClick={() => {
                      if (btn === 'C') {
                        setPinInput('');
                        setPinError('');
                      } else if (btn === '⌫') {
                        setPinInput((prev) => prev.slice(0, -1));
                      } else {
                        setPinInput((prev) => prev + btn);
                      }
                    }}
                    className="py-2 rounded-lg bg-stone-100 hover:bg-amber-100 text-stone-800 font-bold font-mono text-sm active:scale-95 transition"
                  >
                    {btn}
                  </button>
                ))}
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-stone-900 hover:bg-black text-white font-gujarati font-bold text-sm shadow-md active:scale-95 transition flex items-center justify-center gap-2"
              >
                <Unlock className="w-4 h-4 text-amber-400" />
                <span>વેરિફાઈ અને અનલોક કરો</span>
              </button>
            </form>

            <div className="text-center pt-2">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs font-gujarati font-bold text-stone-500 hover:text-stone-800 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>સામાન્ય હોમ પેજ પર પાછા જાઓ</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW B: FULL SUPER ADMIN CONTROL CENTER
  // -------------------------------------------------------------
  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-stone-900 text-white px-4 py-2.5 rounded-2xl shadow-2xl border border-amber-400/40 text-xs sm:text-sm font-gujarati font-bold flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Admin Top Master Header Bar */}
      <div className="bg-gradient-to-r from-amber-900 via-stone-900 to-amber-950 text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-amber-800/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center">
              <Crown className="w-5 h-5 text-amber-400 fill-amber-400" />
            </span>
            <div>
              <h1 className="text-lg sm:text-xl font-black font-gujarati flex items-center gap-2 tracking-tight">
                <span>એડમિન કંટ્રોલ પેનલ</span>
                <span className="text-[10px] bg-amber-500 text-stone-950 font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Super Admin
                </span>
              </h1>
              <p className="text-xs text-amber-200/80 font-gujarati">
                મુખ્ય સંચાલક: ભાવિક યોગેશભાઈ રાઠોડ (૧૩૩૧૭) • સર્વ નિયંત્રણ અને વ્યવસ્થાપન
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/"
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold font-gujarati transition active:scale-95 border border-white/10 flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>હોમ પર પાછા</span>
          </Link>

          <button
            onClick={() => {
              lockAdmin();
              showToast('🔒 એડમિન પેનલ લોક કરવામાં આવી.');
            }}
            className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 text-xs font-bold font-gujarati transition active:scale-95 border border-rose-500/30 flex items-center gap-1.5"
            title="એડમિન સત્ર લોક કરો"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>લોક કરો</span>
          </button>
        </div>
      </div>

      {/* Main Tab Navigation Buttons */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-amber-900/10 no-scrollbar">
        {[
          { id: 'overview', label: 'વિહંગાવલોકન', enLabel: 'Overview', icon: BarChart3, count: null },
          { id: 'gunas', label: 'ગુણ સંચાલન', enLabel: 'Gunas', icon: MessageSquareQuote, count: gunas.length },
          { id: 'karyakars', label: 'કાર્યકર્તા સંચાલન', enLabel: 'Karyakars', count: karyakars.length, icon: Users },
          { id: 'export', label: 'ડેટા એક્સપોર્ટ', enLabel: 'Export & Maint', icon: FileSpreadsheet, count: null },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-gujarati font-bold transition-all shrink-0 ${
                isActive
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/25 border border-amber-500'
                  : 'bg-white hover:bg-amber-50 text-stone-700 border border-amber-900/10'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-amber-700'}`} />
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
                    isActive ? 'bg-amber-700 text-white' : 'bg-stone-100 text-stone-700'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* -------------------------------------------------------- */}
      {/* TAB 1: OVERVIEW & ANALYTICS                             */}
      {/* -------------------------------------------------------- */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Current Project & Auto-Closing Deadline Control Card */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-amber-900/15 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                  <FolderKanban className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-bold text-amber-800 uppercase font-gujarati">
                      ચાલુ પ્રોજેક્ટ અને ડેડલાઇન
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold font-gujarati ${
                        projectStatus?.isSubmissionClosed
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {projectStatus?.isSubmissionClosed ? '🔒 બંધ (ફક્ત વાંચી શકાય)' : `🟢 ${projectStatus?.remainingText || 'ખુલ્લું છે'}`}
                    </span>
                  </div>
                  <h2 className="text-base sm:text-lg font-extrabold text-stone-900 font-gujarati mt-0.5">
                    {activeProject?.name || 'રમતોત્સવ ૨૦૨૬'}
                    {activeProject?.subtitle ? (
                      <span className="text-sm font-semibold text-stone-500"> • {activeProject.subtitle}</span>
                    ) : null}
                  </h2>
                  <p className="text-xs text-stone-500 font-gujarati flex items-center gap-1.5 mt-0.5">
                    <CalendarClock className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                    <span>
                      {projectStatus?.formattedDeadline
                        ? `અંતિમ તારીખ: ${projectStatus.formattedDeadline} (પછી આપમેળે બંધ થશે)`
                        : 'અંતિમ તારીખ સેટ કરેલ નથી (સતત ખુલ્લું)'}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  onClick={() => {
                    setIsEditingProject((v) => !v);
                    setIsCreatingProject(false);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold font-gujarati border border-amber-300 transition flex items-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>પ્રોજેક્ટ / ડેડલાઇન બદલો</span>
                </button>

                <button
                  onClick={handleToggleProjectClosed}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold font-gujarati border transition flex items-center gap-1.5 ${
                    activeProject?.is_closed
                      ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-rose-50 hover:bg-rose-100 text-rose-800 border-rose-200'
                  }`}
                >
                  {activeProject?.is_closed ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                  <span>{activeProject?.is_closed ? 'ફરી ચાલુ કરો' : 'હમણાં બંધ કરો'}</span>
                </button>

                <button
                  onClick={() => {
                    setIsCreatingProject((v) => !v);
                    setIsEditingProject(false);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-bold font-gujarati transition flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5 text-amber-300" />
                  <span>નવો પ્રોજેક્ટ</span>
                </button>
              </div>
            </div>

            {!hasProjectsTable && (
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 font-gujarati">
                નોંધ: Supabase માં `projects` ટેબલ બનાવ્યા પછી બધા યુઝર્સને ક્લાઉડ પર આ સેટિંગ લાઇવ દેખાશે (હમણાં બ્રાઉઝરમાં સેવ છે).
              </div>
            )}

            {/* Project Switcher (when multiple projects exist) */}
            {projects.length > 1 && (
              <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-stone-100 text-xs font-gujarati">
                <span className="font-bold text-stone-500">પ્રોજેક્ટ બદલો:</span>
                <select
                  value={activeProject?.id || ''}
                  onChange={(e) => switchActiveProject(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-800 font-bold"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} {p.subtitle ? `(${p.subtitle})` : ''} {p.is_active ? '• ચાલુ' : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Inline Edit Current Project & Deadline Form */}
            {isEditingProject && (
              <form onSubmit={handleSaveProject} className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 font-gujarati mb-1">
                      પ્રોજેક્ટનું નામ *
                    </label>
                    <input
                      type="text"
                      value={projectForm.name}
                      onChange={(e) => setProjectForm((p) => ({ ...p, name: e.target.value }))}
                      placeholder="દા.ત. ફનવર્સ"
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-sm font-gujarati"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 font-gujarati mb-1">
                      ઉત્સવ / વિગત (વૈકલ્પિક)
                    </label>
                    <input
                      type="text"
                      value={projectForm.subtitle}
                      onChange={(e) => setProjectForm((p) => ({ ...p, subtitle: e.target.value }))}
                      placeholder="દા.ત. દિવાળી ઉત્સવ ૨૦૨૬"
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-sm font-gujarati"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 font-gujarati mb-1">
                    ગુણ લખવાની અંતિમ તારીખ અને સમય (Deadline)
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="datetime-local"
                      value={projectForm.deadlineLocal}
                      onChange={(e) => setProjectForm((p) => ({ ...p, deadlineLocal: e.target.value }))}
                      className="px-3 py-2 rounded-xl border border-stone-300 bg-white text-sm font-mono flex-1"
                    />
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => applyDeadlinePreset(1, setProjectForm)}
                        className="px-2.5 py-1.5 rounded-lg bg-white border border-amber-300 text-xs font-bold font-gujarati text-amber-900 hover:bg-amber-100"
                      >
                        +૧ દિવસ
                      </button>
                      <button
                        type="button"
                        onClick={() => applyDeadlinePreset(2, setProjectForm)}
                        className="px-2.5 py-1.5 rounded-lg bg-white border border-amber-300 text-xs font-bold font-gujarati text-amber-900 hover:bg-amber-100"
                      >
                        +૨ દિવસ
                      </button>
                      <button
                        type="button"
                        onClick={() => applyDeadlinePreset(3, setProjectForm)}
                        className="px-2.5 py-1.5 rounded-lg bg-white border border-amber-300 text-xs font-bold font-gujarati text-amber-900 hover:bg-amber-100"
                      >
                        +૩ દિવસ
                      </button>
                      <button
                        type="button"
                        onClick={() => setProjectForm((p) => ({ ...p, deadlineLocal: '' }))}
                        className="px-2.5 py-1.5 rounded-lg bg-stone-100 border border-stone-300 text-xs font-bold font-gujarati text-stone-700 hover:bg-stone-200"
                      >
                        હટાવો
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsEditingProject(false)}
                    className="px-3 py-1.5 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-700 text-xs font-bold font-gujarati"
                  >
                    રદ કરો
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold font-gujarati shadow-xs"
                  >
                    સેવ કરો
                  </button>
                </div>
              </form>
            )}

            {/* Inline Create New Project Form */}
            {isCreatingProject && (
              <form onSubmit={handleCreateNewProject} className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                <h3 className="text-xs font-extrabold text-stone-900 font-gujarati">
                  ✨ નવો પ્રોજેક્ટ શરૂ કરો (જૂના પ્રોજેક્ટના ગુણ સુરક્ષિત રહેશે)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 font-gujarati mb-1">
                      નવા પ્રોજેક્ટનું નામ *
                    </label>
                    <input
                      type="text"
                      value={newProjectForm.name}
                      onChange={(e) => setNewProjectForm((p) => ({ ...p, name: e.target.value }))}
                      placeholder="દા.ત. ફનવર્સ"
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-sm font-gujarati"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 font-gujarati mb-1">
                      ઉત્સવ / વિગત
                    </label>
                    <input
                      type="text"
                      value={newProjectForm.subtitle}
                      onChange={(e) => setNewProjectForm((p) => ({ ...p, subtitle: e.target.value }))}
                      placeholder="દા.ત. દિવાળી ઉત્સવ ૨૦૨૬"
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-sm font-gujarati"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 font-gujarati mb-1">
                      ગુણ લક્ષ્યાંક
                    </label>
                    <input
                      type="number"
                      min="10"
                      max="5000"
                      value={newProjectForm.target_gunas}
                      onChange={(e) => setNewProjectForm((p) => ({ ...p, target_gunas: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-sm font-mono font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 font-gujarati mb-1">
                    ડેડલાઇન (વૈકલ્પિક)
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="datetime-local"
                      value={newProjectForm.deadlineLocal}
                      onChange={(e) => setNewProjectForm((p) => ({ ...p, deadlineLocal: e.target.value }))}
                      className="px-3 py-2 rounded-xl border border-stone-300 bg-white text-sm font-mono flex-1"
                    />
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => applyDeadlinePreset(2, setNewProjectForm)}
                        className="px-2.5 py-1.5 rounded-lg bg-white border border-stone-300 text-xs font-bold font-gujarati text-stone-800 hover:bg-stone-100"
                      >
                        +૨ દિવસ
                      </button>
                      <button
                        type="button"
                        onClick={() => applyDeadlinePreset(3, setNewProjectForm)}
                        className="px-2.5 py-1.5 rounded-lg bg-white border border-stone-300 text-xs font-bold font-gujarati text-stone-800 hover:bg-stone-100"
                      >
                        +૩ દિવસ
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsCreatingProject(false)}
                    className="px-3 py-1.5 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-700 text-xs font-bold font-gujarati"
                  >
                    રદ કરો
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-bold font-gujarati"
                  >
                    નવો પ્રોજેક્ટ શરૂ કરો
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Top Target Progress & Adjuster Banner */}
          <div className="bg-gradient-to-br from-amber-50 via-white to-orange-50/40 rounded-3xl p-5 border border-amber-900/15 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-amber-800 font-gujarati uppercase tracking-wider flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-amber-600" />
                  <span>ગુણગ્રહણ સંકલ્પ લક્ષ્યાંક ({activeProject?.name || 'રમતોત્સવ ૨૦૨૬'})</span>
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl sm:text-3xl font-black text-stone-900">
                    {metrics.totalGunas}
                  </span>
                  <span className="text-sm font-bold text-stone-500">
                    / {targetGunas} ગુણ ({metrics.targetPercentage}%)
                  </span>
                </div>
              </div>

              {/* Target Adjuster Toggle & Form */}
              <div className="flex items-center gap-2">
                {isEditingTarget ? (
                  <form onSubmit={handleSaveTarget} className="flex items-center gap-2">
                    <input
                      type="number"
                      value={newTargetInput}
                      onChange={(e) => setNewTargetInput(e.target.value)}
                      className="w-24 px-3 py-1.5 rounded-xl border border-amber-400 text-stone-900 font-bold text-sm text-center"
                      min="10"
                      max="5000"
                      autoFocus
                    />
                    <button
                      type="submit"
                      className="p-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white shadow-xs"
                      title="સેવ કરો"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingTarget(false)}
                      className="p-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-700"
                      title="રદ કરો"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </form>
                ) : (
                  <button
                    onClick={() => setIsEditingTarget(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-amber-100 text-amber-900 text-xs font-bold font-gujarati border border-amber-300 shadow-2xs transition"
                  >
                    <Sliders className="w-3.5 h-3.5 text-amber-700" />
                    <span>લક્ષ્યાંક બદલો</span>
                  </button>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-amber-100/80 rounded-full h-3.5 overflow-hidden p-0.5 border border-amber-200">
              <div
                className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 h-full rounded-full transition-all duration-700 shadow-inner"
                style={{ width: `${Math.min(100, metrics.targetPercentage)}%` }}
              />
            </div>
          </div>

          {/* Key KPI Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white p-4 rounded-3xl border border-amber-900/10 shadow-xs space-y-1">
              <span className="text-stone-500 text-xs font-gujarati font-semibold flex items-center gap-1.5">
                <MessageSquareQuote className="w-3.5 h-3.5 text-blue-600" />
                કુલ લખાયેલા ગુણ
              </span>
              <p className="text-2xl font-black text-stone-900">{metrics.totalGunas}</p>
              <p className="text-[11px] text-stone-400 font-gujarati">સંપૂર્ણ ક્ષેત્ર ૨૧</p>
            </div>

            <div className="bg-white p-4 rounded-3xl border border-amber-900/10 shadow-xs space-y-1">
              <span className="text-stone-500 text-xs font-gujarati font-semibold flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-emerald-600" />
                સક્રિય લેખકો
              </span>
              <p className="text-2xl font-black text-stone-900">
                {metrics.distinctWriters}{' '}
                <span className="text-xs font-bold text-stone-400">/ {metrics.totalKaryakars}</span>
              </p>
              <p className="text-[11px] text-stone-400 font-gujarati">ગુણ લખનાર કાર્યકરો</p>
            </div>

            <div className="bg-white p-4 rounded-3xl border border-amber-900/10 shadow-xs space-y-1">
              <span className="text-stone-500 text-xs font-gujarati font-semibold flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-indigo-600" />
                કુલ કવરેજ દર
              </span>
              <p className="text-2xl font-black text-stone-900">
                {metrics.coveragePercentage}%
              </p>
              <p className="text-[11px] text-stone-400 font-gujarati">
                {metrics.coveredCount} / {metrics.totalKaryakars} ને ગુણ મળ્યા
              </p>
            </div>

            <div className="bg-white p-4 rounded-3xl border border-amber-900/10 shadow-xs space-y-1">
              <span className="text-stone-500 text-xs font-gujarati font-semibold flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                કુલ રાજીપો
              </span>
              <p className="text-2xl font-black text-stone-900">{metrics.totalRajipo}</p>
              <p className="text-[11px] text-stone-400 font-gujarati">કાર્યકરોનો સ્નેહ ભાવ</p>
            </div>
          </div>

          {/* Sabha Breakdown Table */}
          <div className="bg-white rounded-3xl border border-amber-900/10 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-stone-900 font-gujarati flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-amber-600" />
                <span>સભા મુજબ ભાગીદારી અને વિશ્લેષણ</span>
              </h2>
              <span className="text-xs text-stone-400 font-gujarati">
                કુલ {sabhaStats.length} સભાઓ
              </span>
            </div>

            <div className="overflow-x-auto no-scrollbar rounded-xl border border-stone-200/80">
              <table className="w-full min-w-[360px] text-left text-xs sm:text-sm font-gujarati">
                <thead>
                  <tr className="border-b border-stone-200 text-stone-500 text-xs">
                    <th className="py-2.5 px-3">સભાનું નામ</th>
                    <th className="py-2.5 px-3 text-center">કાર્યકરો</th>
                    <th className="py-2.5 px-3 text-center">લખેલા ગુણ</th>
                    <th className="py-2.5 px-3 text-center">મળેલા ગુણ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {sabhaStats.map((s, idx) => (
                    <tr key={idx} className="hover:bg-amber-50/50 transition">
                      <td className="py-3 px-3 font-bold text-stone-800">
                        {s.sabha}
                        {s.sabha === 'શિવશક્તિ' && (
                          <span className="ml-2 text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full font-bold">
                            👑 ભાવિકભાઈ
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-stone-600">
                        {s.karyakarsCount}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 font-bold font-mono">
                          {s.gunasWritten}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold font-mono">
                          {s.gunasReceived}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Uncovered Karyakars (Zero Gunas Received) Alert Section */}
          {metrics.zeroGunaKaryakars.length > 0 && (
            <div className="bg-amber-50/70 border border-amber-200/90 rounded-3xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900 font-gujarati flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>જેમને હજી સુધી એક પણ ગુણ નથી મળ્યો ({metrics.zeroGunaKaryakars.length} કાર્યકરો)</span>
                </span>
                <span className="text-[11px] text-amber-800/80 font-gujarati">
                  ૧૦૦% કવરેજ માટે અગત્યનું
                </span>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {metrics.zeroGunaKaryakars.map((k) => (
                  <button
                    key={k.id}
                    onClick={() => openAddModal(k.id)}
                    disabled={projectStatus?.isSubmissionClosed}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-stone-800 text-xs font-bold font-gujarati border border-amber-300 shadow-2xs transition ${
                      projectStatus?.isSubmissionClosed
                        ? 'opacity-60 cursor-not-allowed'
                        : 'hover:bg-amber-100 active:scale-95'
                    }`}
                    title={
                      projectStatus?.isSubmissionClosed
                        ? 'પ્રોજેક્ટ બંધ છે'
                        : `${k.name} માટે ગુણ લખો`
                    }
                  >
                    <span>{k.name}</span>
                    <span className="text-[10px] text-stone-400">({k.sabha})</span>
                    {!projectStatus?.isSubmissionClosed && (
                      <Plus className="w-3.5 h-3.5 text-amber-600" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* -------------------------------------------------------- */}
      {/* TAB 2: GUNAS MANAGEMENT                                 */}
      {/* -------------------------------------------------------- */}
      {activeTab === 'gunas' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Controls Bar: Search, Sabha Filter, Sort, Add */}
          <div className="bg-white rounded-3xl p-4 border border-amber-900/10 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={gunaSearchQuery}
                onChange={(e) => setGunaSearchQuery(e.target.value)}
                placeholder="ગુણ, લેખક અથવા પ્રાપ્તકર્તાનું નામ શોધો..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-200 text-xs sm:text-sm font-gujarati focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Sabha Filter Dropdown */}
              <select
                value={gunaSabhaFilter}
                onChange={(e) => setGunaSabhaFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-stone-200 text-xs font-gujarati text-stone-700 bg-white"
              >
                <option value="all">તમામ સભાઓ</option>
                {allSabhas.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>

              {/* Sort Order Dropdown */}
              <select
                value={gunaSortBy}
                onChange={(e) => setGunaSortBy(e.target.value)}
                className="px-3 py-2 rounded-xl border border-stone-200 text-xs font-gujarati text-stone-700 bg-white"
              >
                <option value="newest">સૌથી નવા પ્રથમ</option>
                <option value="oldest">સૌથી જૂના પ્રથમ</option>
                <option value="rajipo">સૌથી વધુ રાજીપો</option>
              </select>

              {/* Write New Guna Button */}
              <button
                onClick={() => openAddModal(null)}
                className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-gujarati font-bold text-xs shadow-xs active:scale-95 transition flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>નવો ગુણ લખો</span>
              </button>
            </div>
          </div>

          {/* Results Summary Count */}
          <div className="flex items-center justify-between px-1 text-xs text-stone-500 font-gujarati">
            <span>કુલ <strong>{filteredGunas.length}</strong> ગુણ દર્શાવવામાં આવ્યા છે</span>
            {gunaSearchQuery && (
              <button
                onClick={() => setGunaSearchQuery('')}
                className="text-amber-700 font-bold hover:underline"
              >
                શોધ સાફ કરો
              </button>
            )}
          </div>

          {/* Gunas List Cards */}
          <div className="space-y-3">
            {filteredGunas.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-3xl border border-amber-900/10">
                <MessageSquareQuote className="w-10 h-10 text-stone-300 mx-auto mb-2" />
                <p className="text-sm font-bold text-stone-600 font-gujarati">કોઈ ગુણ મળ્યા નથી.</p>
              </div>
            ) : (
              filteredGunas.map((guna) => (
                <div
                  key={guna.id}
                  className="bg-white rounded-3xl p-4 sm:p-5 border border-amber-900/10 shadow-xs hover:shadow-sm transition space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                    <div className="flex items-center gap-2 flex-wrap text-xs font-gujarati">
                      <span className="font-extrabold text-stone-900 text-sm">
                        {guna.recipient_name}
                      </span>
                      <span className="text-stone-400">←</span>
                      <span className="font-bold text-amber-900">
                        {guna.author_name}
                      </span>
                      <span className="text-stone-400">•</span>
                      <span className="text-stone-400 text-[11px]">
                        {formatRelativeTime(guna.created_at)}
                      </span>
                    </div>

                    {/* Admin Action Buttons */}
                    <div className="flex items-center gap-1.5 self-end sm:self-auto">
                      <button
                        onClick={() => handleBoostRajipo(guna)}
                        className="px-2.5 py-1 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-bold font-gujarati flex items-center gap-1 transition active:scale-95"
                        title="રાજીપો વધારો"
                      >
                        <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                        <span>{guna.rajipo_count || 0}</span>
                      </button>

                      <button
                        onClick={() => handleOpenEditGuna(guna)}
                        className="p-1.5 rounded-xl bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200 transition active:scale-95"
                        title="આ ગુણ સુધારો"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-amber-700" />
                      </button>

                      <button
                        onClick={() => setGunaToDelete(guna)}
                        className="p-1.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition active:scale-95"
                        title="આ ગુણ ડિલીટ કરો"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                      </button>
                    </div>
                  </div>

                  {/* Content Paragraph */}
                  <p className="text-stone-800 text-sm sm:text-base font-gujarati leading-relaxed whitespace-pre-wrap">
                    "{guna.content}"
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* -------------------------------------------------------- */}
      {/* TAB 3: KARYAKARS / USERS ROSTER                         */}
      {/* -------------------------------------------------------- */}
      {activeTab === 'karyakars' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Controls Bar */}
          <div className="bg-white rounded-3xl p-4 border border-amber-900/10 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={karyakarSearchQuery}
                onChange={(e) => setKaryakarSearchQuery(e.target.value)}
                placeholder="નામ, કાર્યકર નંબર (પાસવર્ડ), અથવા સભા શોધો..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-200 text-xs sm:text-sm font-gujarati focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Sabha Filter */}
              <select
                value={karyakarSabhaFilter}
                onChange={(e) => setKaryakarSabhaFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-stone-200 text-xs font-gujarati text-stone-700 bg-white"
              >
                <option value="all">તમામ સભાઓ</option>
                {allSabhas.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>

              {/* Role Filter */}
              <select
                value={karyakarRoleFilter}
                onChange={(e) => setKaryakarRoleFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-stone-200 text-xs font-gujarati text-stone-700 bg-white"
              >
                <option value="all">તમામ ભૂમિકાઓ</option>
                {allRoles.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>

              {/* Add Karyakar Modal Opener */}
              <button
                onClick={() => setIsAddKaryakarOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-gujarati font-bold text-xs shadow-xs active:scale-95 transition flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>નવો કાર્યકર ઉમેરો</span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between px-1 text-xs text-stone-500 font-gujarati">
            <span>કુલ <strong>{filteredKaryakars.length}</strong> કાર્યકરો ઉપલબ્ધ છે</span>
          </div>

          {/* Karyakars Table Card */}
          <div className="bg-white rounded-3xl border border-amber-900/10 shadow-xs overflow-hidden">
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full min-w-[640px] text-left text-xs sm:text-sm font-gujarati">
                <thead className="bg-amber-50/60 border-b border-amber-900/10 text-stone-600 text-xs">
                  <tr>
                    <th className="py-3 px-4 font-bold">નામ</th>
                    <th className="py-3 px-3 font-bold font-mono">કાર્યકર નં. (પાસવર્ડ)</th>
                    <th className="py-3 px-3 font-bold">ભૂમિકા</th>
                    <th className="py-3 px-3 font-bold">સભા</th>
                    <th className="py-3 px-3 font-bold text-center">લખ્યા</th>
                    <th className="py-3 px-3 font-bold text-center">મળ્યા</th>
                    <th className="py-3 px-4 font-bold text-right">એડમિન ક્રિયાઓ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredKaryakars.map((k) => {
                    const isBhavik = k.karyakar_number === '13317';
                    const isCurrent = currentUser && currentUser.id === k.id;
                    const written = karyakarStatsMap.writtenMap[k.id] || 0;
                    const received = karyakarStatsMap.receivedMap[k.id] || 0;

                    return (
                      <tr key={k.id} className="hover:bg-amber-50/40 transition">
                        <td className="py-3 px-4 font-bold text-stone-900">
                          <div className="flex items-center gap-1.5">
                            {isBhavik && (
                              <Crown className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />
                            )}
                            <span>{k.name}</span>
                            {isCurrent && (
                              <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.2 rounded-md">
                                તમે
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-amber-900">
                          <span className="bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                            {k.karyakar_number || 'નથી'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-stone-600">{k.role || '-'}</td>
                        <td className="py-3 px-3 text-stone-600">{k.sabha || '-'}</td>
                        <td className="py-3 px-3 text-center font-mono font-bold text-blue-700">
                          {written}
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-bold text-emerald-700">
                          {received}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Switch to this user */}
                            {!isCurrent && (
                              <button
                                onClick={() => handleSwitchUser(k)}
                                className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition"
                                title="આ કાર્યકર તરીકે લોગિન કરો"
                              >
                                <UserCheck className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* Edit Karyakar */}
                            <button
                              onClick={() => handleOpenEditKaryakar(k)}
                              className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 transition"
                              title="કાર્યકર વિગત સુધારો"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete Karyakar (prevent deleting Bhavik) */}
                            {!isBhavik && (
                              <button
                                onClick={() => setKaryakarToDelete(k)}
                                className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition"
                                title="કાર્યકર ડિલીટ કરો"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------- */}
      {/* TAB 4: DATA EXPORT & MAINTENANCE                        */}
      {/* -------------------------------------------------------- */}
      {activeTab === 'export' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Export Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Export Gunas CSV */}
            <div className="bg-white rounded-3xl p-5 border border-amber-900/10 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200 shrink-0">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-stone-900 font-gujarati">
                    તમામ ગુણો CSV માં એક્સપોર્ટ કરો
                  </h3>
                  <p className="text-xs text-stone-500 font-gujarati">
                    ગુજરાતી ફોન્ટ સપોર્ટ (UTF-8 BOM) સાથે MS Excel માં સીધું ઓપન થશે.
                  </p>
                </div>
              </div>

              <div className="text-xs text-stone-600 font-gujarati space-y-1 bg-stone-50 p-3 rounded-2xl">
                <p>• કુલ ગુણો: <strong>{gunas.length}</strong></p>
                <p>• કૉલમ્સ: ક્રમ, તારીખ, લેખક, નંબર, પ્રાપ્તકર્તા, નંબર, ગુણ લખાણ, રાજીપો</p>
              </div>

              <button
                onClick={exportGunasToCSV}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-gujarati font-bold text-xs sm:text-sm shadow-md active:scale-95 transition flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>ગુણોની CSV ફાઇલ ડાઉનલોડ કરો</span>
              </button>
            </div>

            {/* Export Karyakars CSV */}
            <div className="bg-white rounded-3xl p-5 border border-amber-900/10 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200 shrink-0">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-stone-900 font-gujarati">
                    કાર્યકર રોસ્ટર અને પાસવર્ડ CSV
                  </h3>
                  <p className="text-xs text-stone-500 font-gujarati">
                    ૩૧+ કાર્યકરોની યાદી, સત્તાવાર નંબર (પાસવર્ડ) અને પ્રગતિ રિપોર્ટ.
                  </p>
                </div>
              </div>

              <div className="text-xs text-stone-600 font-gujarati space-y-1 bg-stone-50 p-3 rounded-2xl">
                <p>• કુલ કાર્યકરો: <strong>{karyakars.length}</strong></p>
                <p>• કૉલમ્સ: ક્રમ, નામ, કાર્યકર નંબર, ભૂમિકા, સભા, લખેલા ગુણ, મળેલા ગુણ</p>
              </div>

              <button
                onClick={exportKaryakarsToCSV}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-gujarati font-bold text-xs sm:text-sm shadow-md active:scale-95 transition flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>કાર્યકરોની CSV ફાઇલ ડાઉનલોડ કરો</span>
              </button>
            </div>
          </div>

          {/* Fast Switch & System Information Card */}
          <div className="bg-white rounded-3xl p-5 border border-amber-900/10 shadow-xs space-y-4">
            <h3 className="font-extrabold text-sm sm:text-base text-stone-900 font-gujarati flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>સિસ્ટમ અને એકાઉન્ટ માહિતી (System Controls)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-gujarati">
              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-1">
                <span className="text-stone-500">હાલનું લૉગિન આઈડી</span>
                <p className="font-bold text-stone-900">{currentUser?.name || 'કોઈ નહીં'}</p>
                <p className="text-[11px] text-amber-800 font-mono">
                  નંબર: {currentUser?.karyakar_number || 'નથી'}
                </p>
              </div>

              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-1">
                <span className="text-stone-500">સક્રિય મંડળ / વિંગ</span>
                <p className="font-bold text-stone-900">{theme.wingLabelGujarati}</p>
                <p className="text-[11px] text-stone-400 font-mono">wing={wing}</p>
              </div>

              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-1">
                <span className="text-stone-500">ક્લાઉડ ડેટાબેઝ સિંક</span>
                <p className="font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Supabase Live Sync On</span>
                </p>
                <p className="text-[11px] text-stone-400">રીયલટાઈમ પ્રસારણ સક્રિય</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: ADD NEW KARYAKAR MODAL                         */}
      {/* ======================================================== */}
      {isAddKaryakarOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-amber-900/15 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-gradient-to-r from-amber-600 to-amber-700 p-4 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-200" />
                <h3 className="font-extrabold text-base font-gujarati">નવો કાર્યકર ઉમેરો</h3>
              </div>
              <button
                onClick={() => setIsAddKaryakarOpen(false)}
                className="p-1 rounded-lg hover:bg-white/20 text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateKaryakar} className="p-4 sm:p-5 space-y-3.5 flex-1 overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-stone-700 font-gujarati mb-1">
                  પૂરું નામ (ગુજરાતીમાં) *
                </label>
                <input
                  type="text"
                  value={newKaryakarForm.name}
                  onChange={(e) =>
                    setNewKaryakarForm({ ...newKaryakarForm, name: e.target.value })
                  }
                  placeholder="દા.ત. અક્ષર પ્રકાશભાઈ પટેલ"
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm font-gujarati focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 font-gujarati mb-1">
                  સત્તાવાર કાર્યકર નંબર (લોગિન પાસવર્ડ)
                </label>
                <input
                  type="text"
                  value={newKaryakarForm.karyakar_number}
                  onChange={(e) =>
                    setNewKaryakarForm({ ...newKaryakarForm, karyakar_number: e.target.value })
                  }
                  placeholder="દા.ત. 19842"
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm font-mono focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-stone-700 font-gujarati mb-1">
                    ભૂમિકા (Role)
                  </label>
                  <select
                    value={newKaryakarForm.role}
                    onChange={(e) =>
                      setNewKaryakarForm({ ...newKaryakarForm, role: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-gujarati bg-white"
                  >
                    <option value="સંચાલક">સંચાલક</option>
                    <option value="સહસંચાલક">સહસંચાલક</option>
                    <option value="નિરીક્ષક">નિરીક્ષક</option>
                    <option value="નિર્દેશક">નિર્દેશક</option>
                    <option value="BSS બાળક">BSS બાળક</option>
                    <option value="કાર્યકર">કાર્યકર</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 font-gujarati mb-1">
                    સભા
                  </label>
                  <input
                    type="text"
                    value={newKaryakarForm.sabha}
                    onChange={(e) =>
                      setNewKaryakarForm({ ...newKaryakarForm, sabha: e.target.value })
                    }
                    placeholder="દા.ત. શિવશક્તિ"
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-gujarati"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddKaryakarOpen(false)}
                  className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-gujarati text-xs font-bold"
                >
                  રદ કરો
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-gujarati text-xs font-bold shadow-xs"
                >
                  કાર્યકર ઉમેરો
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: EDIT KARYAKAR MODAL                            */}
      {/* ======================================================== */}
      {editingKaryakarItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-amber-900/15 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-gradient-to-r from-amber-600 to-amber-700 p-4 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-200" />
                <h3 className="font-extrabold text-base font-gujarati">કાર્યકર વિગત સુધારો</h3>
              </div>
              <button
                onClick={() => setEditingKaryakarItem(null)}
                className="p-1 rounded-lg hover:bg-white/20 text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditKaryakar} className="p-4 sm:p-5 space-y-3.5 flex-1 overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-stone-700 font-gujarati mb-1">
                  નામ
                </label>
                <input
                  type="text"
                  value={editKaryakarForm.name}
                  onChange={(e) =>
                    setEditKaryakarForm({ ...editKaryakarForm, name: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm font-gujarati focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 font-gujarati mb-1">
                  સત્તાવાર કાર્યકર નંબર (લોગિન પાસવર્ડ)
                </label>
                <input
                  type="text"
                  value={editKaryakarForm.karyakar_number}
                  onChange={(e) =>
                    setEditKaryakarForm({
                      ...editKaryakarForm,
                      karyakar_number: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm font-mono focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-stone-700 font-gujarati mb-1">
                    ભૂમિકા (Role)
                  </label>
                  <input
                    type="text"
                    value={editKaryakarForm.role}
                    onChange={(e) =>
                      setEditKaryakarForm({ ...editKaryakarForm, role: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-gujarati"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 font-gujarati mb-1">
                    સભા
                  </label>
                  <input
                    type="text"
                    value={editKaryakarForm.sabha}
                    onChange={(e) =>
                      setEditKaryakarForm({ ...editKaryakarForm, sabha: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-gujarati"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingKaryakarItem(null)}
                  className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-gujarati text-xs font-bold"
                >
                  રદ કરો
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-gujarati text-xs font-bold shadow-xs"
                >
                  અપડેટ સેવ કરો
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: DELETE KARYAKAR CONFIRMATION                    */}
      {/* ======================================================== */}
      {karyakarToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60">
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-amber-900/15 p-5 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-stone-900 font-gujarati">
                કાર્યકર ડિલીટ કરવો છે?
              </h3>
              <p className="text-xs text-stone-600 font-gujarati mt-1">
                શું આપ ખરેખર <strong>"{karyakarToDelete.name}"</strong> ને રોસ્ટરમાંથી દૂર કરવા માંગો છો?
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setKaryakarToDelete(null)}
                className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-gujarati text-xs font-bold"
              >
                ના, રહેવા દો
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteKaryakar}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-gujarati text-xs font-bold shadow-xs"
              >
                હા, ડિલીટ કરો
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: EDIT GUNA MODAL                                */}
      {/* ======================================================== */}
      {editingGunaItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-amber-900/15 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-gradient-to-r from-amber-600 to-amber-700 p-4 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-200" />
                <h3 className="font-extrabold text-base font-gujarati">ગુણ સંપાદન (Admin Edit)</h3>
              </div>
              <button
                onClick={() => setEditingGunaItem(null)}
                className="p-1 rounded-lg hover:bg-white/20 text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGunaModal} className="p-4 sm:p-5 space-y-3.5 flex-1 overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-stone-700 font-gujarati mb-1">
                  પ્રાપ્તકર્તા કાર્યકર (Recipient)
                </label>
                <select
                  value={editGunaForm.recipient_id}
                  onChange={(e) => {
                    const sel = karyakars.find((k) => k.id === e.target.value);
                    setEditGunaForm({
                      ...editGunaForm,
                      recipient_id: e.target.value,
                      recipient_name: sel ? sel.name : editGunaForm.recipient_name,
                    });
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs sm:text-sm font-gujarati bg-white"
                >
                  {karyakars.map((k) => (
                    <option key={k.id} value={k.id}>
                      {k.name} ({k.sabha})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 font-gujarati mb-1">
                  ગુણનું લખાણ (Content)
                </label>
                <textarea
                  value={editGunaForm.content}
                  onChange={(e) =>
                    setEditGunaForm({ ...editGunaForm, content: e.target.value })
                  }
                  rows={4}
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm font-gujarati leading-relaxed focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 font-gujarati mb-1">
                  રાજીપો કાઉન્ટ (Rajipo Count)
                </label>
                <input
                  type="number"
                  value={editGunaForm.rajipo_count}
                  onChange={(e) =>
                    setEditGunaForm({
                      ...editGunaForm,
                      rajipo_count: parseInt(e.target.value, 10) || 0,
                    })
                  }
                  min="0"
                  max="9999"
                  className="w-28 px-3 py-1.5 rounded-xl border border-stone-200 text-sm font-mono"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingGunaItem(null)}
                  className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-gujarati text-xs font-bold"
                >
                  રદ કરો
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-gujarati text-xs font-bold shadow-xs"
                >
                  ગુણ સેવ કરો
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 5: DELETE GUNA CONFIRMATION                        */}
      {/* ======================================================== */}
      {gunaToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60">
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-amber-900/15 p-5 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-stone-900 font-gujarati">
                ગુણ કાયમ માટે ડિલીટ કરવો છે?
              </h3>
              <p className="text-xs text-stone-600 font-gujarati mt-1">
                આ ગુણ સિસ્ટમ અને ક્લાઉડમાંથી સંપૂર્ણપણે હટાવી દેવામાં આવશે.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setGunaToDelete(null)}
                className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-gujarati text-xs font-bold"
              >
                ના, રહેવા દો
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteGuna}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-gujarati text-xs font-bold shadow-xs"
              >
                હા, ડિલીટ કરો
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
