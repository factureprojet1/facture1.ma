import React, { useState } from 'react';
import { useUserManagement, UserPermissions } from '../../contexts/UserManagementContext';
import Modal from '../common/Modal';
import { Eye, EyeOff, Shield, Users } from 'lucide-react';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddUserModal({ isOpen, onClose }: AddUserModalProps) {
  const { addUser } = useUserManagement();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    status: 'active' as const
  });
  const [permissions, setPermissions] = useState<UserPermissions>({
    invoices: false,
    quotes: false,
    clients: false,
    products: false,
    stockManagement: false,
    reports: false,
    hrManagement: false,
    settings: false // Toujours false pour les utilisateurs non-admin
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const permissionSections = [
    { key: 'invoices', label: 'Factures', description: 'Créer, modifier et consulter les factures', icon: '📄' },
    { key: 'quotes', label: 'Devis', description: 'Créer, modifier et consulter les devis', icon: '📑' },
    { key: 'clients', label: 'Clients', description: 'Gérer la base de données clients', icon: '👥' },
    { key: 'products', label: 'Produits', description: 'Gérer le catalogue produits', icon: '📦' },
    { key: 'stockManagement', label: 'Gestion de Stock', description: 'Accès aux rapports de stock avancés', icon: '📊' },
    { key: 'reports', label: 'Gestion Financière', description: 'Consulter les rapports financiers', icon: '💰' },
    { key: 'hrManagement', label: 'Gestion Humaine', description: 'Gérer les employés et congés', icon: '👤' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.password) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert('Les mots de passe ne correspondent pas');
      return;
    }

    if (formData.password.length < 6) {
      alert('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    // Vérifier qu'au moins une permission est accordée
    const hasPermissions = Object.values(permissions).some(permission => permission);
    if (!hasPermissions) {
      alert('Veuillez accorder au moins une permission à cet utilisateur');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await addUser({
        name: formData.name,
        email: formData.email,
        permissions,
        status: formData.status
      }, formData.password);
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        status: 'active'
      });
      setPermissions({
        invoices: false,
        quotes: false,
        clients: false,
        products: false,
        stockManagement: false,
        reports: false,
        hrManagement: false,
        settings: false
      });
      
      onClose();
      alert('Utilisateur créé avec succès !');
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la création de l\'utilisateur');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handlePermissionChange = (key: keyof UserPermissions, value: boolean) => {
    setPermissions({
      ...permissions,
      [key]: value
    });
  };

  const selectAllPermissions = () => {
    setPermissions({
      invoices: true,
      quotes: true,
      clients: true,
      products: true,
      stockManagement: true,
      reports: true,
      hrManagement: true,
      settings: false // Toujours false pour les non-admin
    });
  };

  const clearAllPermissions = () => {
    setPermissions({
      invoices: false,
      quotes: false,
      clients: false,
      products: false,
      stockManagement: false,
      reports: false,
      hrManagement: false,
      settings: false
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Créer un Nouvel Utilisateur" size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations de base */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-4 flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>Informations Utilisateur</span>
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom complet *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Nom et prénom"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email (identifiant) *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="utilisateur@entreprise.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
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
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>
          </div>
        </div>

        {/* Permissions */}
        <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-indigo-900 flex items-center space-x-2">
              <Shield className="w-4 h-4" />
              <span>Permissions d'Accès</span>
            </h4>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={selectAllPermissions}
                className="text-xs px-2 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
              >
                Tout sélectionner
              </button>
              <button
                type="button"
                onClick={clearAllPermissions}
                className="text-xs px-2 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
              >
                Tout désélectionner
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {permissionSections.map((section) => (
              <label
                key={section.key}
                className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-indigo-200 cursor-pointer hover:bg-indigo-50 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={permissions[section.key as keyof UserPermissions]}
                  onChange={(e) => handlePermissionChange(section.key as keyof UserPermissions, e.target.checked)}
                  className="mt-1 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{section.icon}</span>
                    <span className="font-medium text-gray-900">{section.label}</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{section.description}</p>
                </div>
              </label>
            ))}
          </div>

          {/* Note importante */}
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-xs text-amber-800">
              <Shield className="w-3 h-3 inline mr-1" />
              <strong>Note :</strong> L'accès aux Paramètres est réservé exclusivement à l'administrateur principal (vous).
            </p>
          </div>
        </div>

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
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg transition-all duration-200 disabled:opacity-50"
          >
            {isSubmitting ? 'Création...' : 'Créer Utilisateur'}
          </button>
        </div>
      </form>
    </Modal>
  );
}