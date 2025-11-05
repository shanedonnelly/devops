import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ArrowLeft, Save, User as UserIcon } from 'lucide-react';
import { Avatar, AvatarFallback } from './ui/avatar';
import type { User } from '../App';

type UserProfileProps = {
  user: User;
  onUpdateUser: (updates: Partial<User>) => void;
  onBack: () => void;
};

export function UserProfile({ user, onUpdateUser, onBack }: UserProfileProps) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSaveProfile = () => {
    onUpdateUser({ name, email });
  };

  const handleChangePassword = () => {
    if (newPassword === confirmPassword && newPassword.length >= 6) {
      // Mock password change
      alert('Mot de passe modifié avec succès !');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      alert('Les mots de passe ne correspondent pas ou sont trop courts (min 6 caractères)');
    }
  };

  const profileChanged = name !== user.name || email !== user.email;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8 flex items-center gap-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>
        <div>
          <h1 className="text-slate-900">Profil utilisateur</h1>
          <p className="text-slate-600">
            Gérez vos informations personnelles et paramètres
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Profile Info */}
        <Card>
          <CardHeader>
            <CardTitle>Informations du profil</CardTitle>
            <CardDescription>
              Mettez à jour vos informations personnelles
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-6">
              <Avatar className="w-20 h-20">
                <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white text-2xl">
                  {user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-slate-900">{user.name}</h3>
                <p className="text-slate-600">{user.email}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={handleSaveProfile}
                  disabled={!profileChanged}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Enregistrer les modifications
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Password Change */}
        <Card>
          <CardHeader>
            <CardTitle>Changer le mot de passe</CardTitle>
            <CardDescription>
              Assurez-vous que votre compte est sécurisé
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Mot de passe actuel</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password">Nouveau mot de passe</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmer le nouveau mot de passe</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <div className="flex justify-end">
              <Button
                onClick={handleChangePassword}
                disabled={!currentPassword || !newPassword || !confirmPassword}
              >
                Changer le mot de passe
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Account Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Statistiques du compte</CardTitle>
            <CardDescription>
              Informations sur votre utilisation de Shanify
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-blue-600 mb-1">ID Utilisateur</div>
                <div className="text-slate-900">{user.id}</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-purple-600 mb-1">Membre depuis</div>
                <div className="text-slate-900">Novembre 2024</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-green-600 mb-1">Plan</div>
                <div className="text-slate-900">Gratuit</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
