import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'oskar.sidebar.collapsed';

/**
 * État (persisté) de pliage de la sidebar OsKaR, partagé entre `AppShell` et les
 * pages outils (`ToolPageShell`) afin d'avoir UNE seule préférence cohérente.
 *
 * - Lecture initiale depuis localStorage ; à défaut, repli responsive (plié sous
 *   900 px, déplié au-delà).
 * - Pendant le SSR / avant montage, `collapsed` vaut toujours `true` (cohérent
 *   avec la valeur initiale, évite un saut de mise en page à l'hydratation).
 */
export function useSidebarCollapsed(): { collapsed: boolean; toggle: () => void } {
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

  const toggle = useCallback(() => {
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

  return { collapsed: mounted ? collapsed : true, toggle };
}

export default useSidebarCollapsed;
