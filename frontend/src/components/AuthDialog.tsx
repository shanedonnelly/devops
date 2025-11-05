import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

type AuthDialogProps = {
  open: boolean;
  mode: 'login' | 'signup';
  onClose: () => void;
  onLogin: (email: string, password: string) => void;
  onSignup: (email: string, password: string, name: string) => void;
  onModeChange: (mode: 'login' | 'signup') => void;
};

export function AuthDialog({ 
  open, 
  mode, 
  onClose, 
  onLogin, 
  onSignup,
  onModeChange 
}: AuthDialogProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'login') {
      onLogin(email, password);
    } else {
      onSignup(email, password, name);
    }
    onClose();
    setEmail('');
    setPassword('');
    setName('');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === 'login' ? 'Se connecter' : 'Créer un compte'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'login' 
              ? 'Connectez-vous à votre compte Shanify'
              : 'Créez votre compte pour commencer à construire votre site'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div className="space-y-2">
              <Label htmlFor="name">Nom</Label>
              <Input
                id="name"
                type="text"
                placeholder="Votre nom"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="vous@exemple.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {mode === 'login' ? 'Se connecter' : 'Créer un compte'}
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => onModeChange(mode === 'login' ? 'signup' : 'login')}
              className="text-blue-600 hover:underline"
            >
              {mode === 'login' 
                ? "Pas encore de compte ? S'inscrire"
                : 'Déjà un compte ? Se connecter'
              }
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
