import React, { useState } from 'react';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  User
} from '../lib/firebase';

interface AuthModalProps {
  isOpen: boolean;
  currentUser: User | null;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, currentUser, onClose }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setError('');
    setLoading(true);
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      onClose();
    } catch (err: any) {
      setError('Failed to sign out');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-[#1c2028] border border-[#21262d] rounded-2xl p-6 w-full max-w-sm shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center pb-2 border-b border-[#21262d]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#adc6ff]/20 text-[#adc6ff] flex items-center justify-center border border-[#adc6ff]/30">
              <span className="material-symbols-outlined text-[20px]">account_circle</span>
            </div>
            <div>
              <h2 className="text-base font-bold text-[#dfe2ee]">
                {currentUser ? 'Cloud Account' : isSignUp ? 'Create Cloud Account' : 'Sign In to LifeHub'}
              </h2>
              <p className="text-[10px] text-[#c2c6d6]">
                {currentUser ? 'Firebase Cloud Sync Active' : 'Sync data across all your devices'}
              </p>
            </div>
          </div>
          <button
            id="close-auth-modal-btn"
            onClick={onClose}
            className="text-[#8c909f] hover:text-white cursor-pointer"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {currentUser ? (
          /* Logged In State */
          <div className="space-y-4 text-center py-2">
            <div className="w-16 h-16 rounded-full bg-[#adc6ff]/10 border border-[#adc6ff]/40 mx-auto flex items-center justify-center overflow-hidden">
              {currentUser.photoURL ? (
                <img src={currentUser.photoURL} alt="User" className="w-full h-full object-cover" />
              ) : (
                <span className="material-symbols-outlined text-[36px] text-[#adc6ff]">person</span>
              )}
            </div>

            <div>
              <p className="text-sm font-bold text-[#dfe2ee]">
                {currentUser.displayName || currentUser.email?.split('@')[0] || 'LifeHub Member'}
              </p>
              <p className="text-xs text-[#8c909f] font-mono">{currentUser.email}</p>
            </div>

            <div className="bg-[#181c24] p-3 rounded-xl micro-border text-xs text-[#4edea3] flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-[16px]">cloud_done</span>
              <span>All tasks, budget & habits are auto-synced in Firebase</span>
            </div>

            <button
              id="auth-sign-out-btn"
              onClick={handleSignOut}
              disabled={loading}
              className="w-full py-2 bg-[#93000a]/30 hover:bg-[#93000a]/50 text-[#ffb4ab] border border-[#ffb4ab]/30 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        ) : (
          /* Logged Out / Form State */
          <div className="space-y-4">
            {error && (
              <div className="p-2.5 bg-[#93000a]/30 border border-[#ffb4ab]/40 rounded-lg text-xs text-[#ffb4ab]">
                {error}
              </div>
            )}

            <button
              id="auth-google-login-btn"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-2.5 bg-[#181c24] hover:bg-[#262a33] text-[#dfe2ee] border border-[#424754] rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all shadow-sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-[#31353e]"></div>
              <span className="flex-shrink mx-2 text-[10px] text-[#8c909f] uppercase font-bold">OR</span>
              <div className="flex-grow border-t border-[#31353e]"></div>
            </div>

            <form onSubmit={handleEmailAuth} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#c2c6d6] mb-1">
                  Email Address
                </label>
                <input
                  id="auth-email-input"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#0a0e16] border border-[#424754] rounded-xl px-3 py-2 text-xs text-[#dfe2ee] outline-none focus:border-[#adc6ff]"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#c2c6d6] mb-1">
                  Password
                </label>
                <input
                  id="auth-password-input"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#0a0e16] border border-[#424754] rounded-xl px-3 py-2 text-xs text-[#dfe2ee] outline-none focus:border-[#adc6ff]"
                  required
                />
              </div>

              <button
                id="auth-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-[#adc6ff] text-[#00285d] hover:bg-[#adc6ff]/90 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
              >
                {isSignUp ? 'Create Account' : 'Sign In'}
              </button>
            </form>

            <div className="flex justify-between items-center text-[11px] pt-1">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-[#adc6ff] hover:underline cursor-pointer"
              >
                {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
