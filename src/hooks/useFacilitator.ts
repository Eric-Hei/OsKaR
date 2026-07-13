import { useCallback, useState } from 'react';

/**
 * Mode animateur auto-promu, commun à tous les outils.
 * N'importe qui peut débloquer localement les contrôles (calqué sur la
 * Boîte à idées). Par défaut on suit l'hôte (créateur de la session).
 */
export function useFacilitator(isHost: boolean) {
  const [override, setOverride] = useState<boolean | null>(null);
  const isFacilitator = override ?? isHost;
  const toggleFacilitator = useCallback(() => {
    setOverride((prev) => !(prev ?? isHost));
  }, [isHost]);
  return { isFacilitator, toggleFacilitator };
}

export default useFacilitator;
