import React, { useState, useCallback, useEffect } from 'react';
import { onAuthStateChanged, User, signInAnonymously } from 'firebase/auth';
import { getDocFromServer, doc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import SignIn from './components/SignIn';
import Landing from './components/Landing';
import Workspace from './components/Workspace';
import ProjectList from './components/ProjectList';
import Pricing from './components/Pricing';
import Settings from './components/Settings';
import Sidebar from './components/Sidebar';

type View = 'landing' | 'signin' | 'projects' | 'workspace' | 'pricing' | 'settings';

function App() {
  const [view, setView] = useState<View>('landing');
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSignUp, setIsSignUp] = useState(false);

  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration. ");
        }
        // Skip logging for other errors, as this is simply a connection test.
      }
    }
    testConnection();

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsLoading(false);
      if (user) {
        setView('projects');
      } else {
        setView('landing');
      }
    });
    return () => unsubscribe();
  }, []);

  const handleStart = useCallback(() => {
    if (user) {
      setView('projects');
    } else {
      setView('landing');
    }
  }, [user]);

  const handleGoToSignIn = useCallback((signUp = false) => {
    setIsSignUp(signUp);
    setView('signin');
  }, []);

  const handleGuestLogin = useCallback(async () => {
    setIsLoading(true);
    try {
      const userCredential = await signInAnonymously(auth);
      const user = userCredential.user;
      
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: null,
        displayName: 'Guest Artist',
        photoURL: '',
        role: 'guest',
        createdAt: new Date().toISOString(),
        credits: 50
      });
    } catch (err: any) {
      console.error('Guest Login error:', err);
      setIsLoading(false);
    }
  }, []);
  
  const handleSelectProject = useCallback((projectId: string) => {
    setCurrentProjectId(projectId);
    setView('workspace');
  }, []);

  const handleBackToProjects = useCallback(() => {
    setCurrentProjectId(null);
    setView('projects');
  }, []);

  const handleGoToPricing = useCallback(() => {
    setView('pricing');
  }, []);

  const handleGoToSettings = useCallback(() => {
    setView('settings');
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-main">
        <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-main overflow-hidden text-white">
      {user && view !== 'landing' && view !== 'signin' && (
        <div className="hidden md:block">
          <Sidebar currentView={view} setView={(v) => {
            if (v === 'projects') setCurrentProjectId(null);
            setView(v as View);
          }} user={user} />
        </div>
      )}
      <div className="flex-1 overflow-auto bg-main relative">
        {(view === 'landing' || view === 'signin') && !user && (
          <div className="relative min-h-screen w-full">
            <Landing 
              onSignInClick={() => handleGoToSignIn(false)}
              onSignUpClick={() => handleGoToSignIn(true)}
              onGuestClick={handleGuestLogin}
            />
            {view === 'signin' && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                <SignIn 
                  onStart={handleStart} 
                  initialIsSignUp={isSignUp}
                  onBack={() => setView('landing')}
                  isModal={true}
                />
              </div>
            )}
          </div>
        )}
        {view === 'projects' && user && (
          <ProjectList onSelectProject={handleSelectProject} onGoToPricing={handleGoToPricing} onGoToSettings={handleGoToSettings} />
        )}
        {view === 'pricing' && user && <Pricing onBack={handleBackToProjects} />}
        {view === 'settings' && user && <Settings onBack={handleBackToProjects} onGoToPricing={handleGoToPricing} />}
        {view === 'workspace' && currentProjectId && user && (
          <Workspace projectId={currentProjectId} onBack={handleBackToProjects} onGoToPricing={handleGoToPricing} />
        )}
      </div>
    </div>
  );
}

export default App;
