/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import VpnDashboard from './components/VpnDashboard';
import { AuthScreen } from './components/AuthScreen';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { UserProfile } from './types';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'auth' | 'dashboard' | 'admin'>('auth');

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) {
        setProfile(null);
        setView('auth');
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) return;

    const unsubscribeProfile = onSnapshot(doc(db, 'users', user.uid), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        const userProfile: UserProfile = {
          uid: user.uid,
          email: data.email,
          tier: data.tier,
          expiryDate: data.expiryDate.toDate().toISOString(),
          isAdmin: data.isAdmin
        };
        setProfile(userProfile);
        
        // Check expiry
        const now = new Date();
        const expiry = data.expiryDate.toDate();
        
        if (expiry < now && !data.isAdmin) {
          setView('auth');
        } else if (view === 'auth') {
          setView('dashboard');
        }
      } else {
        setView('auth');
      }
      setLoading(false);
    });

    return () => unsubscribeProfile();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (view === 'dashboard' && profile) {
    return (
      <VpnDashboard 
        userProfile={profile} 
        onSignOut={() => auth.signOut()} 
      />
    );
  }

  return <AuthScreen onAuthSuccess={() => setView('dashboard')} />;
}

