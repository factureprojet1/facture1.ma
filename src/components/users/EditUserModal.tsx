import React, { useState } from 'react';
import { useUserManagement, AppUser, UserPermissions } from '../../contexts/UserManagementContext';
import Modal from '../common/Modal';
import { Shield, Users, CheckCircle, XCircle } from 'lucide-react';

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: AppUser;
}

export default function EditUserModal({ isOpen, onClose, user }: EditUserModalProps) {
  const { updateUser } = useUserManagement();
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    status: user.status
  });
  const [permissions, setPermissions] = useState<UserPermissions>(user.permissions);
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
    
    if (!formData.name || !formData.email) {
      alert('Le nom et l\'email sont obligatoires');
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
      await updateUser(user.id, {
        name: formData.name,
        email: formData.email,
        permissions,
        status: formData.status
      });
      
      onClose();
      alert('Utilisateur modifié avec succès !');
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la modification de l\'utilisateur');
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
    <Modal isOpen={isOpen} onClose={onClose} title="Modifier l'Utilisateur" size="lg">
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
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Statut
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="active">Actif</option>
                <option value="inactive">Inactif</option>
              </select>
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

          {/* Paramètres - Toujours désactivé */}
          <div className="mt-3">
            <div className="flex items-start space-x-3 p-3 bg-gray-100 rounded-lg border border-gray-300 opacity-50">
              <input
                type="checkbox"
                checked={false}
                disabled
                className="mt-1 rounded border-gray-300"
              />
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">⚙️</span>
                  <span className="font-medium text-gray-500">Paramètres</span>
                  <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full font-bold">
                    ADMIN UNIQUEMENT
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Accès aux paramètres système (réservé à l'admin)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Résumé des permissions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">📋 Résumé des Accès</h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(permissions).map(([key, value]) => {
              if (!value || key === 'settings') return null;
              const section = permissionSections.find(s => s.key === key);
              return (
                <span key={key} className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  {section?.label}
                </span>
              );
            })}
            {Object.values(permissions).every(p => !p) && (
              <span className="inline-flex items-center px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                <XCircle className="w-3 h-3 mr-1" />
                Aucun accès accordé
              </span>
            )}
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
            {isSubmitting ? 'Modification...' : 'Modifier Utilisateur'}
          </button>
        </div>
      </form>
    </Modal>
  );
}