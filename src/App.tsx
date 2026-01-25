import { useEffect, useState } from 'react';
import { useTripStore } from './store/tripStore';
import { LoginPage } from './pages/LoginPage';
import { TripsPage } from './pages/TripsPage';
import { TripBoardPage } from './pages/TripBoardPage';
import { subscribeToAuthChanges } from './lib/auth';
import { Map } from 'lucide-react';

// Parse invite code from URL path (e.g., /join/ABCD1234)
function getInviteCodeFromUrl(): string | null {
  const path = window.location.pathname;
  const match = path.match(/^\/join\/([A-Z0-9]{8})$/i);
  return match ? match[1].toUpperCase() : null;
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 via-primary-500 to-accent-500 flex items-center justify-center">
      <div className="text-center text-white">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-white/20 backdrop-blur rounded-xl">
            <Map size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold">TripBord</h1>
        </div>
        <div className="w-8 h-8 border-3 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
      </div>
    </div>
  );
}

function App() {
  const { currentUser, isAuthLoading, activeTripId, setCurrentUser, setAuthLoading, joinTrip } = useTripStore();
  const [pendingInviteCode, setPendingInviteCode] = useState<string | null>(null);
  const [joiningTrip, setJoiningTrip] = useState(false);

  useEffect(() => {
    // Check for invite code in URL on mount
    const inviteCode = getInviteCodeFromUrl();
    if (inviteCode) {
      setPendingInviteCode(inviteCode);
      // Clear the URL to prevent re-processing on refresh
      window.history.replaceState({}, '', '/');
    }
  }, []);

  useEffect(() => {
    // Subscribe to Firebase auth state changes
    const unsubscribe = subscribeToAuthChanges((user) => {
      setCurrentUser(user);
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, [setCurrentUser, setAuthLoading]);

  // Auto-join trip if there's a pending invite code and user is logged in
  useEffect(() => {
    if (pendingInviteCode && currentUser && !joiningTrip) {
      setJoiningTrip(true);
      joinTrip(pendingInviteCode).then((trip) => {
        setPendingInviteCode(null);
        setJoiningTrip(false);
        if (!trip) {
          alert('Invalid invite code or trip not found.');
        }
      });
    }
  }, [pendingInviteCode, currentUser, joiningTrip, joinTrip]);

  // Still checking auth state
  if (isAuthLoading) {
    return <LoadingScreen />;
  }

  // Not logged in - show login page (will auto-join after login if invite code is pending)
  if (!currentUser) {
    return <LoginPage inviteCode={pendingInviteCode} />;
  }

  // Joining trip from invite link
  if (joiningTrip) {
    return <LoadingScreen />;
  }

  // Logged in, viewing a specific trip
  if (activeTripId) {
    return <TripBoardPage />;
  }

  // Logged in, viewing trips list
  return <TripsPage />;
}

export default App;
