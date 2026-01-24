import { useState } from 'react';
import { Map, Users, LogOut, Settings, ChevronDown } from 'lucide-react';
import { useTripStore } from '../../store/tripStore';
import { Avatar } from '../common/Avatar';

export function Header() {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { currentUser, setCurrentUser, groups, activeGroupId } = useTripStore();

  const activeGroup = activeGroupId ? groups[activeGroupId] : null;

  const handleLogout = () => {
    setCurrentUser(null as any);
    setShowUserMenu(false);
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-500 rounded-xl">
            <Map size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">TripBoard</h1>
            <p className="text-xs text-gray-500">Plan together, travel together</p>
          </div>
        </div>

        {/* Active group indicator */}
        {activeGroup && (
          <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg">
            <Users size={18} className="text-gray-400" />
            <span className="font-medium text-gray-700">{activeGroup.name}</span>
            <span className="text-xs text-gray-400">
              {activeGroup.members.length} members
            </span>
          </div>
        )}

        {/* User menu */}
        {currentUser && (
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Avatar user={currentUser} size="md" />
              <span className="font-medium text-gray-700">{currentUser.name}</span>
              <ChevronDown
                size={16}
                className={`text-gray-400 transition-transform ${
                  showUserMenu ? 'rotate-180' : ''
                }`}
              />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                <button
                  className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50"
                  onClick={() => setShowUserMenu(false)}
                >
                  <Settings size={18} />
                  Settings
                </button>
                <hr className="my-2 border-gray-100" />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50"
                >
                  <LogOut size={18} />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
