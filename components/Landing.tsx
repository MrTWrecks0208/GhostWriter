import React, { useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup,
  signInAnonymously,
} from 'firebase/auth';
import { doc, setDoc, getDocFromServer } from 'firebase/firestore';
import { auth, googleProvider, db } from '../firebase';
import { SparkleIcon } from './icons/SparkleIcon';
import { UserIcon } from 'lucide-react';

interface LandingProps {
  onStart: () => void;
}

const Landing: React.FC<LandingProps> = ({ onStart }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    console.log(`Starting Email ${isSignUp ? 'Sign Up' : 'Sign In'}...`);
    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log('Email Sign Up success:', user.email);
        
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || '',
          photoURL: user.photoURL || '',
          role: 'user',
          createdAt: new Date().toISOString()
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        console.log('Email Sign In success');
      }
      // No need to call onStart() here as onAuthStateChanged in App.tsx will handle it
    } catch (err: any) {
      console.error('Email Auth error:', err);
      let message = err.message;
      if (err.code === 'auth/email-already-in-use') {
        message = 'This email is already in use. Try signing in instead.';
      } else if (err.code === 'auth/invalid-email') {
        message = 'Please enter a valid email address.';
      } else if (err.code === 'auth/weak-password') {
        message = 'Password should be at least 6 characters.';
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        message = 'Invalid email or password.';
      }
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError(null);
    setIsLoading(true);
    console.log('Starting Google Auth...');
    try {
      // In some iframe environments, signInWithPopup might be blocked or fail.
      // We try it first, but provide a clear error if it fails.
      const userCredential = await signInWithPopup(auth, googleProvider);
      const user = userCredential.user;
      console.log('Google Auth success:', user.email);
      
      const userDoc = await getDocFromServer(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || '',
          photoURL: user.photoURL || '',
          role: 'user',
          createdAt: new Date().toISOString()
        });
      }
    } catch (err: any) {
      console.error('Google Auth error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('The sign-in popup was closed. If you are using the preview, try opening the app in a new tab using the button in the top right.');
      } else if (err.code === 'auth/cancelled-popup-request') {
        setError('Sign-in was cancelled. Please try again.');
      } else {
        setError(err.message || 'An unexpected error occurred during Google sign-in.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setError(null);
    setIsLoading(true);
    console.log('Starting Guest Login...');
    try {
      const userCredential = await signInAnonymously(auth);
      const user = userCredential.user;
      console.log('Guest Login success:', user.uid);
      
      // Create a temporary profile for the guest
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: null,
        displayName: 'Guest Artist',
        photoURL: '',
        role: 'guest',
        createdAt: new Date().toISOString()
      });
    } catch (err: any) {
      console.error('Guest Login error:', err);
      if (err.code === 'auth/operation-not-allowed') {
        setError('Guest login (Anonymous Auth) is not enabled in Firebase. Please enable it in the Firebase Console.');
      } else {
        setError(err.message || 'An unexpected error occurred during guest login.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center bg-main relative overflow-hidden">
        {/* Atmospheric background elements */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-accent/10 blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-accent/10 blur-[120px] pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col items-center w-full mt-12">
            <h1 className="text-6xl md:text-7xl font-extrabold text-white mb-2 tracking-tighter">
                SongCraft
            </h1>
            <p className="text-xl text-accent-light/60 mb-12 font-medium">
                Your AI Songwriting Partner
            </p>

            <div className="w-full max-w-md relative overflow-hidden rounded-xl bg-white/30 shadow-md p-10 border border-white/20 backdrop-blur-md hover:bg-white/40">
                {/* Subtle inner glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none"></div>
                
                <div className="relative z-10">
                    <h2 className="text-2xl font-bold text-white mb-6">
                      {isSignUp ? 'Create an Account' : 'Welcome Back'}
                    </h2>

                    <form onSubmit={handleEmailAuth} className="space-y-4">
                      <input
                        type="email"
                        placeholder="Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                        required
                      />
                      <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                        required
                      />
                      
                      {error && (
                        <p className="text-red-400 text-sm bg-red-400/10 p-3 rounded-lg border border-red-400/20">
                          {error}
                        </p>
                      )}

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full p-4 bg-main-dark text-white rounded-xl font-bold shadow-lg shadow-accent/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
                      >
                        {isLoading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In')}
                      </button>
                    </form>

                    <div className="relative my-8">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-white/10"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-main/40 backdrop-blur-md text-gray-200 rounded-full border border-white/5">OR</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <button
                        onClick={handleGoogleAuth}
                        disabled={isLoading}
                        className="w-full p-4 bg-white text-main rounded-xl font-bold flex items-center justify-center gap-3 transition-all hover:bg-gray-100 active:scale-[0.98] disabled:opacity-50"
                      >
                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                        Continue with Google
                      </button>

                      <button
                        onClick={handleGuestLogin}
                        disabled={isLoading}
                        className="w-full p-4 bg-white/10 text-white rounded-xl font-bold flex items-center justify-center gap-3 transition-all hover:bg-white/20 active:scale-[0.98] disabled:opacity-50 border border-white/10"
                      >
                        <UserIcon className="w-5 h-5" />
                        Try as Guest
                      </button>
                    </div>

                    <p className="mt-8 text-gray-200 text-sm">
                      {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                      <button
                        onClick={() => setIsSignUp(!isSignUp)}
                        className="text-accent font-bold hover:underline"
                      >
                        {isSignUp ? 'Sign In' : 'Sign Up'}
                      </button>
                    </p>
                </div>
            </div>

            <p className="text-gray-400/40 mt-12 max-w-sm text-sm leading-relaxed">
                Collaborate with AI to write lyrics, find rhymes, and capture your next big hit.
            </p>
        </div>
    </div>
  );
};

export default Landing;
