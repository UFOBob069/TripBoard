import { useTripStore } from './store/tripStore';
import { LoginPage } from './pages/LoginPage';
import { TripsPage } from './pages/TripsPage';
import { TripBoardPage } from './pages/TripBoardPage';

function App() {
  const { currentUser, activeTripId } = useTripStore();

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
