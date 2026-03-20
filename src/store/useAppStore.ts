import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { generateId } from '@/utils';
import type {
  User,
  CompanyProfile,
} from '@/types';

// Interface du store principal (simplifié - données gérées par React Query)
interface AppState {
  // État utilisateur (géré par Supabase Auth)
  user: User | null;
  isAuthenticated: boolean;
  /** true une fois que onAuthStateChange a émis INITIAL_SESSION (ou SIGNED_IN) */
  authReady: boolean;
  /** true une fois que le profil métier a été résolu (chargé ou considéré indisponible) */
  profileReady: boolean;

  // Fonctionnalités expérimentales
  experimentalFeatures: {
    checkIn: boolean;
    focus: boolean;
    canvas: boolean;
  };

  // État UI uniquement
  isLoading: boolean;
  error: string | null;
  notifications: Notification[];

  // Actions utilisateur
  setSessionUser: (user: User) => void;
  setUser: (user: User) => void;
  setAuthReady: () => void;
  setProfileReady: () => void;
  updateCompanyProfile: (companyProfile: CompanyProfile) => void;
  logout: () => void;

  // Actions fonctionnalités expérimentales
  toggleExperimentalFeature: (feature: 'checkIn' | 'focus' | 'canvas') => void;

  // Actions UI
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
}

// Store principal - en mémoire uniquement (pas de persist)
// L'état d'authentification est géré exclusivement par Supabase Auth
export const useAppStore = create<AppState>()(
  devtools(
    (set, get) => ({
      // État initial
      user: null,
      isAuthenticated: false,
      authReady: false,
      profileReady: false,
      experimentalFeatures: {
        checkIn: false,
        focus: false,
        canvas: false,
      },
      isLoading: false,
      error: null,
      notifications: [],

      // Actions utilisateur
      setSessionUser: (user) => {
        set({ user, isAuthenticated: true, authReady: true, profileReady: false });
      },

      setUser: (user) => {
        set({ user, isAuthenticated: true, authReady: true, profileReady: true });
      },

      setAuthReady: () => {
        set({ authReady: true });
      },

      setProfileReady: () => {
        set({ profileReady: true, authReady: true });
      },

      updateCompanyProfile: (companyProfile) => {
        const currentUser = get().user;
        if (currentUser) {
          const updatedUser = { ...currentUser, companyProfile };
          set({ user: updatedUser });
        }
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          authReady: true,
          profileReady: false,
        });
      },

      toggleExperimentalFeature: (feature) => {
        set((state) => ({
          experimentalFeatures: {
            ...state.experimentalFeatures,
            [feature]: !state.experimentalFeatures[feature],
          },
        }));
      },

      // Actions UI
      setLoading: (isLoading) => {
        set({ isLoading });
      },

      setError: (error) => {
        set({ error });
      },

      addNotification: (notification) => {
        const newNotification: Notification = {
          ...notification,
          id: generateId(),
        };
        set({ notifications: [...get().notifications, newNotification] });
      },

      removeNotification: (id) => {
        set({ notifications: get().notifications.filter(n => n.id !== id) });
      },

      clearNotifications: () => {
        set({ notifications: [] });
      },
    }),
    { name: 'OKaRina Store' }
  )
);
