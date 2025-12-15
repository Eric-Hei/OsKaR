import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  BarChart3,
  Calendar,
  FileText,
  Settings,
  User,
  LogOut,
  Menu,
  X,
  Building2,
  ChevronDown,
  FolderKanban,
  AlarmClock,
  FileUp,
  History,
  CheckSquare,
  Users,
  Crown,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAppStore } from '@/store/useAppStore';
import { AuthService } from '@/services/auth';
import { isSupabaseConfigured } from '@/lib/supabaseClient';
import { cn } from '@/utils';
import { useSubscription } from '@/hooks/useSubscription';

interface HeaderProps {
  onMenuToggle?: () => void;
  isMobileMenuOpen?: boolean;
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle, isMobileMenuOpen }) => {
  const router = useRouter();
  const { user, logout, experimentalFeatures } = useAppStore();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { data: subscription } = useSubscription(user?.id);

  // Navigation complète avec features expérimentales
  const allNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
    { name: 'Check-in', href: '/check-in', icon: AlarmClock, experimental: true, featureKey: 'checkIn' },
    { name: 'Focus', href: '/focus', icon: AlarmClock, experimental: true, featureKey: 'focus' },
    { name: 'Canvas', href: '/canvas', icon: FileText, experimental: true, featureKey: 'canvas' },
    { name: 'Gestion', href: '/management', icon: FolderKanban },
    { name: 'Actions', href: '/actions', icon: CheckSquare },
    { name: 'Suivi', href: '/progress', icon: Calendar },
  ];

  // Filtrer selon activation des features expérimentales
  const authenticatedNavigation = allNavigation.filter(item => {
    // Si c'est une feature expérimentale, vérifier qu'elle est activée
    if (item.experimental && item.featureKey) {
      return experimentalFeatures[item.featureKey as keyof typeof experimentalFeatures];
    }
    // Sinon, toujours afficher
    return true;
  });

  // Navigation pour utilisateurs non connectés
  const publicNavigation: typeof authenticatedNavigation = [
    // Tarifs masqués pour l'instant
    // { name: 'Tarifs', href: '/pricing', icon: Crown },
  ];

  const navigation = user ? authenticatedNavigation : publicNavigation;

  const handleLogout = async () => {
    console.log('🔴 Déconnexion en cours...');
    try {
      // Déconnexion Supabase si configuré
      if (isSupabaseConfigured()) {
        console.log('🔴 Déconnexion Supabase...');
        await AuthService.signOut();
        console.log('✅ Déconnexion Supabase réussie');
      }
      // Déconnexion locale (Zustand + localStorage)
      console.log('🔴 Déconnexion locale...');
      logout();
      console.log('✅ Déconnexion locale réussie');
      console.log('🔴 Redirection vers /...');
      router.push('/');
    } catch (error) {
      console.error('❌ Erreur lors de la déconnexion:', error);
      // Déconnexion locale même en cas d'erreur
      logout();
      router.push('/');
    }
  };

  // Fermer le menu utilisateur quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo et navigation principale */}
          <div className="flex items-center">
            <Link href={user ? "/dashboard" : "/"} className="flex items-center">
              <img
                src="/images/Oskar-logo.png"
                alt="OsKaR"
                className="h-16 w-auto object-contain"
              />
            </Link>

            {/* Navigation desktop */}
            <nav className="hidden md:ml-8 md:flex md:space-x-8">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = router.pathname === item.href;

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 transition-colors',
                      isActive
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    )}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Actions utilisateur */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                {/* Menu utilisateur avec dropdown */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="hidden sm:flex sm:items-center sm:space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <User className="h-5 w-5 text-gray-400" />
                    <span className="text-sm text-gray-700">{user.name}</span>
                    <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''
                      }`} />
                  </button>

                  {/* Menu déroulant */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      {/* Informations utilisateur */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{user.name}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                            {subscription && (
                              <div className="mt-1">
                                <Badge
                                  variant={
                                    subscription.planType === 'unlimited' ? 'warning' :
                                      subscription.planType === 'team' ? 'info' :
                                        subscription.planType === 'pro' ? 'success' :
                                          'secondary'
                                  }
                                  size="sm"
                                  className="inline-flex items-center"
                                >
                                  {subscription.planType === 'unlimited' && <Crown className="h-3 w-3 mr-1" />}
                                  {subscription.planType === 'pro' && <Zap className="h-3 w-3 mr-1" />}
                                  {subscription.planType === 'free' ? 'Free' :
                                    subscription.planType === 'pro' ? 'Pro' :
                                      subscription.planType === 'team' ? 'Team' :
                                        'Unlimited'}
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Options du menu */}
                      <div className="py-1">
                        <button
                          onClick={() => {
                            router.push('/reports');
                            setIsUserMenuOpen(false);
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <FileText className="h-4 w-4 mr-3 text-gray-400" />
                          Rapports
                        </button>

                        <button
                          onClick={() => {
                            router.push('/retrospective');
                            setIsUserMenuOpen(false);
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <History className="h-4 w-4 mr-3 text-gray-400" />
                          Rétrospective
                        </button>

                        <button
                          onClick={() => {
                            router.push('/company-profile');
                            setIsUserMenuOpen(false);
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <Building2 className="h-4 w-4 mr-3 text-gray-400" />
                          Profil d'entreprise
                        </button>

                        <button
                          onClick={() => {
                            router.push('/teams');
                            setIsUserMenuOpen(false);
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <Users className="h-4 w-4 mr-3 text-gray-400" />
                          Mon Équipe
                        </button>

                        <button
                          onClick={() => {
                            router.push('/import');
                            setIsUserMenuOpen(false);
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <FileUp className="h-4 w-4 mr-3 text-gray-400" />
                          Import CSV
                        </button>

                        <button
                          onClick={() => {
                            router.push('/settings');
                            setIsUserMenuOpen(false);
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <Settings className="h-4 w-4 mr-3 text-gray-400" />
                          Paramètres
                        </button>
                      </div>

                      {/* Séparateur */}
                      <div className="border-t border-gray-100 my-1"></div>

                      {/* Déconnexion */}
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsUserMenuOpen(false);
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        Déconnexion
                      </button>
                    </div>
                  )}
                </div>

                {/* Bouton menu mobile */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onMenuToggle}
                  className="md:hidden"
                >
                  {isMobileMenuOpen ? (
                    <X className="h-5 w-5" />
                  ) : (
                    <Menu className="h-5 w-5" />
                  )}
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/auth/login')}
                >
                  Connexion
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => router.push('/auth/register')}
                >
                  Inscription
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Menu mobile */}
      {isMobileMenuOpen && user && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-50 border-t border-gray-200">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = router.pathname === item.href;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors',
                    isActive
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  )}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}

            <div className="border-t border-gray-200 pt-4 pb-3">
              <div className="flex items-center px-3">
                <User className="h-6 w-6 text-gray-400" />
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">{user.name}</div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                </div>
              </div>
              <div className="mt-3 px-2 space-y-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/settings')}
                  leftIcon={<Settings className="h-4 w-4" />}
                  className="w-full justify-start"
                >
                  Paramètres
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  leftIcon={<LogOut className="h-4 w-4" />}
                  className="w-full justify-start"
                >
                  Déconnexion
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export { Header };
