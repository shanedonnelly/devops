import { User } from '../App';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { AuthDialog } from './AuthDialog';
import { useState } from 'react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { User as UserIcon, LogOut, Settings, LayoutDashboard } from 'lucide-react';
import type { Page } from '../App';

type HeaderProps = {
  user: User | null;
  onNavigate: (page: Page) => void;
  onLogin: (email: string, password: string) => void;
  onSignup: (email: string, password: string, name: string) => void;
  onLogout: () => void;
};

export function Header({ user, onNavigate, onLogin, onSignup, onLogout }: HeaderProps) {
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  const handleAuthClick = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setShowAuthDialog(true);
  };

  return (
    <>
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button 
              onClick={() => onNavigate(user ? 'dashboard' : 'landing')}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white">S</span>
              </div>
              <span className="text-slate-900">Shanify</span>
            </button>

            <div className="flex items-center gap-4">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar>
                        <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                          {user.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="flex flex-col gap-1 p-2">
                      <p className="text-slate-900">{user.name}</p>
                      <p className="text-slate-500">{user.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onNavigate('dashboard')}>
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>Tableau de bord</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onNavigate('profile')}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Profil</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onLogout} className="text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Déconnexion</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Button 
                    variant="ghost" 
                    onClick={() => handleAuthClick('login')}
                  >
                    Se connecter
                  </Button>
                  <Button 
                    onClick={() => handleAuthClick('signup')}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    Créer un compte
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <AuthDialog 
        open={showAuthDialog}
        mode={authMode}
        onClose={() => setShowAuthDialog(false)}
        onLogin={onLogin}
        onSignup={onSignup}
        onModeChange={setAuthMode}
      />
    </>
  );
}
