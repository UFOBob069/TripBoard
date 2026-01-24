import { useEffect } from 'react';
import { useTripStore } from './store/tripStore';
import { LoginPage } from './pages/LoginPage';
import { TripsPage } from './pages/TripsPage';
import { TripBoardPage } from './pages/TripBoardPage';
import { subscribeToAuthChanges } from './lib/auth';
import { Map } from 'lucide-react';

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 via-primary-500 to-accent-500 flex items-center justify-center">
      <div className="text-center text-white">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-white/20 backdrop-blur rounded-xl">
            <Map size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold">TripBoard</h1>
        </div>
        <div className="w-8 h-8 border-3 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
      </div>
    </div>
  );
}

function App() {
  const { currentUser, isAuthLoading, activeTripId, setCurrentUser, setAuthLoading } = useTripStore();

  useEffect(() => {
    // Subscribe to Firebase auth state changes
    const unsubscribe = subscribeToAuthChanges((user) => {
      setCurrentUser(user);
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, [setCurrentUser, setAuthLoading]);

  // Still checking auth state
  if (isAuthLoading) {
    return <LoadingScreen />;
  }

  // Not logged in - show login page
  if (!currentUser) {
    return <LoginPage />;
  }

  // Logged in, viewing a specific trip
  if (activeTripId) {
    return <TripBoardPage />;
  }

  // Logged in, viewing trips list
  return <TripsPage />;
}

export default App;
