import React, { useCallback, useEffect, useState } from 'react';
import Head from 'next/head';
import { Sidebar, type SidebarSection, type SidebarNavItem } from './Sidebar';
import { Topbar } from './Topbar';
import { APP_CONFIG } from '@/constants';

const STORAGE_KEY = 'oskar.sidebar.collapsed';

interface AppShellProps {
  children: React.ReactNode;
  /** Titre HTML (préfixe ajouté automatiquement avec le nom de l'app) */
  title?: string;
  description?: string;
  /** Contenu du titre topbar (texte ou node) */
  topbarTitle?: React.ReactNode;
  topbarSubtitle?: React.ReactNode;
  topbarActions?: React.ReactNode;
  /** Sections de navigation custom (sinon utilise les sections par défaut) */
  sections?: SidebarSection[];
  footerItem?: SidebarNavItem;
  /** Largeur max du contenu (défaut: 1200px / max-w-content) */
  contentMaxWidth?: string;
  /** Padding du conteneur principal (défaut: p-8) */
  contentPadding?: string;
}

export const AppShell: React.FC<AppShellProps> = ({
  children,
  title,
  description,
  topbarTitle,
  topbarSubtitle,
  topbarActions,
  sections,
  footerItem,
  contentMaxWidth = 'max-w-content',
  contentPadding = 'p-8',
}) => {
  const [collapsed, setCollapsed] = useState<boolean>(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored !== null) {
        setCollapsed(stored === '1');
      } else if (window.matchMedia('(max-width: 900px)').matches) {
        setCollapsed(true);
      } else {
        setCollapsed(false);
      }
    } catch {
      /* localStorage indisponible : on garde la valeur par défaut */
    }
  }, []);

  const handleToggle = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(STORAGE_KEY, next ? '1' : '0');
      } catch {
        /* silent */
      }
      return next;
    });
  }, []);

  const pageTitle = title ? `${title} — ${APP_CONFIG.name}` : APP_CONFIG.name;
  // Pendant le SSR/avant montage on rend la sidebar pliée (cohérent avec valeur initiale)
  const sidebarCollapsed = mounted ? collapsed : true;
  const mainOffset = sidebarCollapsed ? 'ml-16' : 'ml-60';

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        {description && <meta name="description" content={description} />}
      </Head>
      <div className="min-h-screen bg-surface text-ink font-sans">
        <Sidebar collapsed={sidebarCollapsed} onToggle={handleToggle} sections={sections} footerItem={footerItem} />
        <div className={`flex flex-col min-h-screen transition-[margin] duration-250 ${mainOffset}`}>
          <Topbar title={topbarTitle} subtitle={topbarSubtitle} actions={topbarActions} />
          <main className={`flex-1 w-full ${contentMaxWidth} ${contentPadding}`}>{children}</main>
          <footer className={`w-full ${contentMaxWidth} px-8 py-5 mt-auto text-[12px] text-muted border-t border-line`}>
            © {new Date().getFullYear()} {APP_CONFIG.name} · v{APP_CONFIG.version}
          </footer>
        </div>
      </div>
    </>
  );
};

export default AppShell;
