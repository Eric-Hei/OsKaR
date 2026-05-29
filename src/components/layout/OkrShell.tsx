import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import {
  LayoutDashboard,
  FileText,
  FolderKanban,
  CheckSquare,
  Calendar,
  AlarmClock,
  ClipboardCheck,
  History,
  Building2,
  Settings,
  LogOut,
  User as UserIcon,
  ChevronDown,
  Loader2,
} from 'lucide-react';
import { AppShell } from './AppShell';
import { NotificationContainer } from '@/components/ui/Notification';
import type { SidebarSection, SidebarNavItem } from './Sidebar';
import { useAppStore } from '@/store/useAppStore';
import { AuthService } from '@/services/auth';
import { isSupabaseConfigured } from '@/lib/supabaseClient';

interface OkrShellProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  topbarTitle?: React.ReactNode;
  topbarSubtitle?: React.ReactNode;
  /** Actions de page additionnelles, rendues avant le menu utilisateur. */
  topbarActions?: React.ReactNode;
  contentMaxWidth?: string;
  contentPadding?: string;
}

/** Élément de sous-nav OKR avec clé de feature expérimentale optionnelle. */
type OkrNavItem = SidebarNavItem & { featureKey?: 'checkIn' | 'focus' | 'canvas' };

const OKR_NAV: { label: string; items: OkrNavItem[] }[] = [
  {
    label: 'Espace OKR',
    items: [
      { href: '/app/okr/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/app/okr/canvas', label: 'Canvas guidé', icon: FileText, featureKey: 'canvas' },
      { href: '/app/okr/management', label: 'Gestion', icon: FolderKanban },
      { href: '/app/okr/actions', label: 'Actions', icon: CheckSquare },
      { href: '/app/okr/progress', label: 'Suivi', icon: Calendar },
    ],
  },
  {
    label: 'Rituels',
    items: [
      { href: '/app/okr/focus', label: 'Focus', icon: AlarmClock, featureKey: 'focus' },
      { href: '/app/okr/check-in', label: 'Check-in', icon: ClipboardCheck, featureKey: 'checkIn' },
      { href: '/app/okr/retrospective', label: 'Rétrospective', icon: History },
    ],
  },
  { label: 'Analyses', items: [{ href: '/app/okr/reports', label: 'Rapports', icon: FileText }] },
];

export const OkrShell: React.FC<OkrShellProps> = ({
  children,
  title,
  description,
  topbarTitle,
  topbarSubtitle,
  topbarActions,
  contentMaxWidth,
  contentPadding,
}) => {
  const router = useRouter();
  const { user, authReady, isAuthenticated, profileReady, experimentalFeatures, logout } = useAppStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Gating auth + onboarding (aligné sur Layout)
  useEffect(() => {
    if (!authReady) return;
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    if (!user) return;
    if (profileReady && !user.companyProfile && router.pathname !== '/onboarding') {
      router.push('/onboarding');
    }
  }, [authReady, isAuthenticated, user, profileReady, router]);

  // Fermer le menu utilisateur au clic extérieur
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const sections: SidebarSection[] = useMemo(
    () =>
      OKR_NAV.map((s) => ({
        label: s.label,
        items: s.items.filter((it) => !it.featureKey || experimentalFeatures[it.featureKey]),
      })).filter((s) => s.items.length > 0),
    [experimentalFeatures]
  );

  const footerItem: SidebarNavItem = { href: '/', label: 'Retour à la plateforme', icon: LayoutDashboard };

  const handleLogout = async () => {
    try {
      if (isSupabaseConfigured()) await AuthService.signOut();
    } finally {
      logout();
      router.push('/');
    }
  };

  const userMenu = (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setMenuOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-navy hover:bg-surface transition-colors"
      >
        <span className="w-7 h-7 rounded-full bg-navy text-white flex items-center justify-center">
          <UserIcon className="h-4 w-4" aria-hidden />
        </span>
        <span className="hidden sm:inline max-w-[140px] truncate">{user?.name ?? 'Mon compte'}</span>
        <ChevronDown className={`h-4 w-4 text-muted transition-transform ${menuOpen ? 'rotate-180' : ''}`} aria-hidden />
      </button>
      {menuOpen && (
        <div role="menu" className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-card border border-line py-2 z-50">
          <div className="px-4 py-2 border-b border-line">
            <p className="text-sm font-semibold text-navy truncate">{user?.name ?? 'Mon compte'}</p>
            <p className="text-xs text-muted truncate">{user?.email ?? ''}</p>
          </div>
          <MenuLink icon={Building2} label="Profil d'entreprise" onClick={() => { setMenuOpen(false); router.push('/company-profile'); }} />
          <MenuLink icon={Settings} label="Paramètres" onClick={() => { setMenuOpen(false); router.push('/settings'); }} />
          <div className="border-t border-line my-1" />
          <MenuLink icon={LogOut} label="Déconnexion" danger onClick={() => { setMenuOpen(false); handleLogout(); }} />
        </div>
      )}
    </div>
  );

  return (
    <AppShell
      title={title}
      description={description}
      topbarTitle={topbarTitle}
      topbarSubtitle={topbarSubtitle}
      topbarActions={<>{topbarActions}{userMenu}</>}
      sections={sections}
      footerItem={footerItem}
      contentMaxWidth={contentMaxWidth}
      contentPadding={contentPadding}
    >
      {isAuthenticated && user ? (
        children
      ) : (
        <div className="flex flex-col items-center justify-center py-32 text-muted" aria-live="polite">
          <Loader2 className="h-8 w-8 animate-spin text-teal mb-4" aria-hidden />
          <p className="text-sm">Chargement de votre espace…</p>
        </div>
      )}
      <NotificationContainer />
    </AppShell>
  );
};

interface MenuLinkProps {
  icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;
  label: string;
  onClick: () => void;
  danger?: boolean;
}

const MenuLink: React.FC<MenuLinkProps> = ({ icon: Icon, label, onClick, danger }) => (
  <button
    type="button"
    role="menuitem"
    onClick={onClick}
    className={`flex items-center w-full gap-3 px-4 py-2 text-sm transition-colors ${
      danger ? 'text-red-600 hover:bg-red-50' : 'text-navy hover:bg-surface'
    }`}
  >
    <Icon className="h-4 w-4" aria-hidden />
    {label}
  </button>
);

export default OkrShell;
