import { useTripStore } from './store/tripStore';
import { LoginPage } from './pages/LoginPage';
import { GroupsPage } from './pages/GroupsPage';
import { TripsPage } from './pages/TripsPage';
import { TripBoardPage } from './pages/TripBoardPage';

function App() {
  const { currentUser, activeGroupId, activeTripId } = useTripStore();

  // Not logged in - show login page
  if (!currentUser) {
    return <LoginPage />;
  }

  // Logged in, viewing a specific trip
  if (activeTripId) {
    return <TripBoardPage />;
  }

  // Logged in, viewing a specific group's trips
  if (activeGroupId) {
    return <TripsPage />;
  }

  // Logged in, viewing all groups
  return <GroupsPage />;
}

export default App;
