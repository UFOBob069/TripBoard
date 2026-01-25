import { useState } from 'react';
import { Map, LogOut, ChevronDown } from 'lucide-react';
import { useTripStore } from '../../store/tripStore';
import { Avatar } from '../common/Avatar';
import { signOut } from '../../lib/auth';

export function Header() {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { currentUser, setCurrentUser } = useTripStore();

  const handleLogout = async () => {
    try {
      await signOut();
      setCurrentUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
    setShowUserMenu(false);
  };

  return (
    <header className="bg-white border-b border-gray-200 px-3 sm:px-6 py-3 sm:py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Logo */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-1.5 sm:p-2 bg-primary-500 rounded-lg sm:rounded-xl">
            <Map size={20} className="text-white sm:w-6 sm:h-6" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-800">TripBoard</h1>
            <p className="text-xs text-gray-500 hidden sm:block">Plan together, travel together</p>
          </div>
        </div>

        {/* User menu */}
        {currentUser && (
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Avatar user={currentUser} size="md" />
              <span className="font-medium text-gray-700 hidden sm:block">{currentUser.name}</span>
              <ChevronDown
                size={16}
                className={`text-gray-400 transition-transform hidden sm:block ${
                  showUserMenu ? 'rotate-180' : ''
                }`}
              />
            </button>

            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-800">{currentUser.name}</p>
                    <p className="text-xs text-gray-500">{currentUser.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50"
                  >
                    <LogOut size={18} />
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
