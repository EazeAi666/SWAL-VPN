import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Shield, Lock, Key, LogIn, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from '../lib/firebase';
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, updateDoc, setDoc, Timestamp } from 'firebase/firestore';
import { UserProfile } from '../types';

interface AuthScreenProps {
  onAuthSuccess: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkUserProfile = async (user: any) => {
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (!userDoc.exists()) {
      const isAdmin = user.email === 'isrealadesina3@gmail.com';
      const initialProfile: UserProfile = {
        uid: user.uid,
        email: user.email || '',
        tier: 'standard', // Everyone is standard/free now
        expiryDate: new Date(2099, 0, 1).toISOString(), // Permanent access for free model
        isAdmin: isAdmin
      };
      await setDoc(doc(db, 'users', user.uid), {
        ...initialProfile,
        expiryDate: Timestamp.fromDate(new Date(2099, 0, 1))
      });
    }
    onAuthSuccess();
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await checkUserProfile(result.user);
    } catch (err: any) {
      setError('Google login failed. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(37,99,235,0.1),transparent_50%)] pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-2xl shadow-blue-600/20">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">SWAL <span className="text-blue-500">VPN</span></h1>
          <p className="text-zinc-500 mt-2">Secure. Fast. Private.</p>
        </div>

        <Card className="bg-zinc-900/40 border-zinc-800 backdrop-blur-xl">
          <CardHeader>
            <CardTitle>Welcome to SWAL VPN</CardTitle>
            <CardDescription>
              Sign in with your Google account to start browsing securely and for free.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-500 text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <Button 
              onClick={handleGoogleLogin} 
              disabled={loading}
              className="w-full bg-white text-black hover:bg-zinc-200 h-12 font-semibold flex items-center justify-center gap-2"
            >
              <LogIn className="w-5 h-5" />
              {loading ? 'Signing in...' : 'Continue with Google'}
            </Button>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-xs text-zinc-600">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </motion.div>
    </div>
  );
};
