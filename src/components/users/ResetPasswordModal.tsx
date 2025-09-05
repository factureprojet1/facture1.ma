import React, { useState } from 'react';
import { useUserManagement, AppUser } from '../../contexts/UserManagementContext';
import Modal from '../common/Modal';
import { Key, Eye, EyeOff, AlertTriangle } from 'lucide-react';

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: AppUser;
}

export default function ResetPasswordModal({ isOpen, onClose, user }: ResetPasswordModalProps) {
  const { resetUserPassword } = useUserManagement();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(password);
    setConfirmPassword(password);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPassword || !confirmPassword) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    if (newPassword !== confirmPassword) {
      alert('Les mots de passe ne correspondent pas');
      return;
    }

    if (newPassword.length < 6) {
      alert('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await resetUserPassword(user.id, newPassword);
      
      onClose();
      alert(`Mot de passe réinitialisé avec succès pour ${user.name} !\n\nNouveau mot de passe : ${newPassword}\n\nVeuillez communiquer ce mot de passe à l'utilisateur de manière sécurisée.`);
      
      // Reset form
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la réinitialisation du mot de passe');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Réinitialiser le Mot de Passe" size="md">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations utilisateur */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-medium text-blue-900">{user.name}</h4>
              <p className="text-sm text-blue-700">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Avertissement de sécurité */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-amber-900 mb-1">⚠️ Avertissement de Sécurité</h4>
              <ul className="text-sm text-amber-800 space-y-1">
                <li>• Le nouveau mot de passe sera affiché en clair après la réinitialisation</li>
                <li>• Communiquez-le à l'utilisateur de manière sécurisée</li>
                <li>• Demandez à l'utilisateur de le changer lors de sa prochaine connexion</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Nouveau mot de passe */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nouveau mot de passe *
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4 text-gray-400" />
                ) : (
                  <Eye className="w-4 h-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirmer le mot de passe *
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>

          {/* Générateur de mot de passe */}
          <div className="flex justify-center">
            <button
              type="button"
              onClick={generateRandomPassword}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm transition-colors"
            >
              <Key className="w-4 h-4" />
              <span>Générer un mot de passe aléatoire</span>
            </button>
          </div>
        </div>

        {/* Validation du mot de passe */}
        {newPassword && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-800">
                Mot de passe valide ({newPassword.length} caractères)
              </span>
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white rounded-lg transition-all duration-200 disabled:opacity-50"
          >
            {isSubmitting ? 'Réinitialisation...' : 'Réinitialiser le Mot de Passe'}
          </button>
        </div>
      </form>
    </Modal>
  );
}