import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where,
  onSnapshot
} from 'firebase/firestore';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updatePassword,
  deleteUser as deleteFirebaseUser
} from 'firebase/auth';
import { db, auth } from '../config/firebase';
import { useAuth } from './AuthContext';

export interface UserPermissions {
  invoices: boolean;
  quotes: boolean;
  clients: boolean;
  products: boolean;
  stockManagement: boolean;
  reports: boolean;
  hrManagement: boolean;
  settings: boolean; // Réservé à l'admin uniquement
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  permissions: UserPermissions;
  status: 'active' | 'inactive';
  role: 'admin' | 'user';
  createdAt: string;
  entrepriseId: string;
  lastLogin?: string;
}

interface UserManagementContextType {
  users: AppUser[];
  addUser: (userData: Omit<AppUser, 'id' | 'createdAt' | 'entrepriseId' | 'role'>, password: string) => Promise<void>;
  updateUser: (id: string, userData: Partial<AppUser>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  resetUserPassword: (id: string, newPassword: string) => Promise<void>;
  canCreateUser: boolean;
  maxUsers: number;
  isLoading: boolean;
}

const UserManagementContext = createContext<UserManagementContextType | undefined>(undefined);

export function UserManagementProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const maxUsers = 3; // Limite PRO
  const canCreateUser = users.length < maxUsers;

  // Écouter les changements des utilisateurs
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    setIsLoading(true);
    const entrepriseId = user.id;

    const usersQuery = query(
      collection(db, 'users'),
      where('entrepriseId', '==', entrepriseId)
    );

    const unsubscribe = onSnapshot(usersQuery, (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as AppUser)).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      setUsers(usersData);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [isAuthenticated, user]);

  const addUser = async (userData: Omit<AppUser, 'id' | 'createdAt' | 'entrepriseId' | 'role'>, password: string) => {
    if (!user || !canCreateUser) return;
    
    try {
      // Créer l'utilisateur dans Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, userData.email, password);
      const firebaseUserId = userCredential.user.uid;

      // Ajouter les données utilisateur dans Firestore
      await addDoc(collection(db, 'users'), {
        ...userData,
        role: 'user',
        entrepriseId: user.id,
        firebaseUserId,
        createdAt: new Date().toISOString()
      });

    } catch (error) {
      console.error('Erreur lors de la création de l\'utilisateur:', error);
      throw error;
    }
  };

  const updateUser = async (id: string, userData: Partial<AppUser>) => {
    try {
      await updateDoc(doc(db, 'users', id), {
        ...userData,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
      throw error;
    }
  };

  const deleteUser = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'users', id));
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'utilisateur:', error);
      throw error;
    }
  };

  const resetUserPassword = async (id: string, newPassword: string) => {
    try {
      // Note: La réinitialisation du mot de passe nécessiterait une fonction cloud
      // Pour l'instant, on met à jour juste les métadonnées
      await updateDoc(doc(db, 'users', id), {
        passwordResetAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erreur lors de la réinitialisation du mot de passe:', error);
      throw error;
    }
  };

  const value = {
    users,
    addUser,
    updateUser,
    deleteUser,
    resetUserPassword,
    canCreateUser,
    maxUsers,
    isLoading
  };

  return (
    <UserManagementContext.Provider value={value}>
      {children}
    </UserManagementContext.Provider>
  );
}

export function useUserManagement() {
  const context = useContext(UserManagementContext);
  if (context === undefined) {
    throw new Error('useUserManagement must be used within a UserManagementProvider');
  }
  return context;
}