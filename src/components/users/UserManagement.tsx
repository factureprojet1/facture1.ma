import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useUserManagement } from '../../contexts/UserManagementContext';
import { 
  Users, 
  Crown, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Key, 
  Shield,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  UserPlus,
  Settings
} from 'lucide-react';
import AddUserModal from './AddUserModal';
import EditUserModal from './EditUserModal';
import ResetPasswordModal from './ResetPasswordModal';

export default function UserManagement() {
  const { user } = useAuth();
  const { users, deleteUser, canCreateUser, maxUsers, isLoading } = useUserManagement();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [resetPasswordUser, setResetPasswordUser] = useState<string | null>(null);

  // Vérifier l'accès PRO
  const isProActive = user?.company.subscription === 'pro' && user?.company.expiryDate && 
    new Date(user.company.expiryDate) > new Date();

  if (!isProActive) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Crown className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            🔒 Fonctionnalité PRO
          </h2>
          <p className="text-gray-600 mb-6">
            La gestion multi-utilisateurs est réservée aux abonnés PRO. 
            Passez à la version PRO pour débloquer cette option.
          </p>
          <button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200">
            <span className="flex items-center justify-center space-x-2">
              <Crown className="w-5 h-5" />
              <span>Passer à PRO - 299 MAD/mois</span>
            </span>
          </button>
        </div>
      </div>
    );
  }

  const filteredUsers = users.filter(appUser =>
    appUser.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appUser.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPermissionsBadges = (permissions: any) => {
    const sections = [
      { key: 'invoices', label: 'Factures', color: 'bg-blue-100 text-blue-800' },
      { key: 'quotes', label: 'Devis', color: 'bg-purple-100 text-purple-800' },
      { key: 'clients', label: 'Clients', color: 'bg-green-100 text-green-800' },
      { key: 'products', label: 'Produits', color: 'bg-yellow-100 text-yellow-800' },
      { key: 'stockManagement', label: 'Stock', color: 'bg-orange-100 text-orange-800' },
      { key: 'reports', label: 'Rapports', color: 'bg-red-100 text-red-800' },
      { key: 'hrManagement', label: 'RH', color: 'bg-pink-100 text-pink-800' },
      { key: 'settings', label: 'Paramètres', color: 'bg-gray-100 text-gray-800' }
    ];

    return sections
      .filter(section => permissions[section.key])
      .map(section => (
        <span key={section.key} className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${section.color}`}>
          {section.label}
        </span>
      ));
  };

  const getStatusBadge = (status: string) => {
    return status === 'active' ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <CheckCircle className="w-3 h-3 mr-1" />
        Actif
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        <XCircle className="w-3 h-3 mr-1" />
        Inactif
      </span>
    );
  };

  const handleDeleteUser = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.')) {
      deleteUser(id);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des utilisateurs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <Users className="w-8 h-8 text-indigo-600" />
            <span>Gestion des Utilisateurs</span>
            <Crown className="w-6 h-6 text-yellow-500" />
          </h1>
          <p className="text-gray-600 mt-2">
            Gérez les accès de votre équipe avec des permissions personnalisées. 
            Fonctionnalité réservée aux abonnés PRO (max 3 utilisateurs).
          </p>
        </div>
        
        <button
          onClick={() => setIsAddModalOpen(true)}
          disabled={!canCreateUser}
          className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
            canCreateUser
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          <span>Nouvel Utilisateur</span>
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              <p className="text-sm text-gray-600">Utilisateurs créés</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.status === 'active').length}
              </p>
              <p className="text-sm text-gray-600">Utilisateurs actifs</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{maxUsers - users.length}</p>
              <p className="text-sm text-gray-600">Places restantes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Limite atteinte */}
      {!canCreateUser && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-amber-600" />
            <p className="text-amber-800 font-medium">
              Limite atteinte : Vous avez créé le maximum d'utilisateurs autorisés ({maxUsers}) pour l'abonnement PRO.
            </p>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Rechercher par nom ou email..."
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Liste des Utilisateurs ({users.length}/{maxUsers})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilisateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Permissions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dernière connexion
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((appUser) => (
                <tr key={appUser.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{appUser.name}</div>
                        <div className="text-xs text-gray-500">{appUser.email}</div>
                        <div className="text-xs text-gray-400">
                          Créé le {new Date(appUser.createdAt).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {getPermissionsBadges(appUser.permissions)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(appUser.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {appUser.lastLogin ? (
                      <div>
                        <div>{new Date(appUser.lastLogin).toLocaleDateString('fr-FR')}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(appUser.lastLogin).toLocaleTimeString('fr-FR')}
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400">Jamais connecté</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => setEditingUser(appUser.id)}
                        className="text-amber-600 hover:text-amber-700 transition-colors"
                        title="Modifier"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setResetPasswordUser(appUser.id)}
                        className="text-blue-600 hover:text-blue-700 transition-colors"
                        title="Réinitialiser mot de passe"
                      >
                        <Key className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(appUser.id)}
                        className="text-red-600 hover:text-red-700 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              {users.length === 0 ? 'Aucun utilisateur créé' : 'Aucun utilisateur trouvé'}
            </p>
            {users.length === 0 && canCreateUser && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="mt-4 inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Créer le premier utilisateur</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Guide d'utilisation */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Guide de la Gestion Multi-Utilisateurs</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-indigo-900 mb-2">🎯 Avantages</h4>
            <ul className="text-sm text-indigo-800 space-y-1">
              <li>• Déléguer la saisie des factures à votre équipe</li>
              <li>• Contrôler l'accès aux sections sensibles</li>
              <li>• Traçabilité des actions par utilisateur</li>
              <li>• Sécurité renforcée avec permissions granulaires</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-indigo-900 mb-2">⚙️ Fonctionnement</h4>
            <ul className="text-sm text-indigo-800 space-y-1">
              <li>• Maximum 3 utilisateurs par compte PRO</li>
              <li>• Chaque utilisateur a son login personnel</li>
              <li>• L'admin contrôle toutes les permissions</li>
              <li>• Seul l'admin accède aux paramètres</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddUserModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />

      {editingUser && (
        <EditUserModal
          isOpen={!!editingUser}
          onClose={() => setEditingUser(null)}
          user={users.find(u => u.id === editingUser)!}
        />
      )}

      {resetPasswordUser && (
        <ResetPasswordModal
          isOpen={!!resetPasswordUser}
          onClose={() => setResetPasswordUser(null)}
          user={users.find(u => u.id === resetPasswordUser)!}
        />
      )}
    </div>
  );
}