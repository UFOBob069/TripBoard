import { useState } from 'react';
import {
  User,
  Mail,
  MapPin,
  Heart,
  Compass,
  Edit2,
  Save,
  X,
  Map,
  Calendar,
  Users,
  CheckCircle,
} from 'lucide-react';
import { useTripStore } from '../store/tripStore';
import { Header } from '../components/layout/Header';
import { Avatar } from '../components/common/Avatar';
import { TRIP_STATUS_CONFIG } from '../types';

interface ProfilePageProps {
  onBack: () => void;
}

export function ProfilePage({ onBack }: ProfilePageProps) {
  const { currentUser, trips, users, setActiveTrip, updateUserProfile } = useTripStore();
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [location, setLocation] = useState(currentUser?.location || '');
  const [favoriteDestination, setFavoriteDestination] = useState(currentUser?.favoriteDestination || '');
  const [travelStyle, setTravelStyle] = useState(currentUser?.travelStyle || '');

  if (!currentUser) return null;

  // Get user's trips
  const userTrips = Object.values(trips).filter((trip) =>
    trip.members.some((m) => m.user_id === currentUser.id)
  );

  const completedTrips = userTrips.filter((trip) => trip.status === 'finalized');
  const activeTrips = userTrips.filter((trip) => trip.status !== 'finalized');

  const handleSave = async () => {
    if (updateUserProfile) {
      await updateUserProfile({
        bio,
        location,
        favoriteDestination,
        travelStyle,
      });
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setBio(currentUser?.bio || '');
    setLocation(currentUser?.location || '');
    setFavoriteDestination(currentUser?.favoriteDestination || '');
    setTravelStyle(currentUser?.travelStyle || '');
    setIsEditing(false);
  };

  const getTripMembers = (tripId: string) => {
    const trip = trips[tripId];
    if (!trip) return [];
    return trip.members
      .map((m) => users[m.user_id])
      .filter(Boolean);
  };

  const getTripProgress = (tripId: string) => {
    const trip = trips[tripId];
    if (!trip) return 0;
    const canvasTypes = ['dates', 'location', 'accommodation', 'activities', 'food', 'transportation'] as const;
    const selected = canvasTypes.filter((c) => trip.canvases[c].selected_idea_id).length;
    return Math.round((selected / 6) * 100);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Back button */}
        <button
          onClick={onBack}
          className="mb-6 text-gray-600 hover:text-gray-800 flex items-center gap-2"
        >
          <X size={20} />
          Back to Trips
        </button>

        {/* Profile Header */}
        <div className="card p-6 mb-6">
          <div className="flex items-start gap-6">
            <div className="relative">
              <div className="w-24 h-24">
                <Avatar user={currentUser} size="lg" />
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">{currentUser.name}</h1>
                  <p className="text-gray-500 flex items-center gap-1">
                    <Mail size={14} />
                    {currentUser.email}
                  </p>
                </div>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <Edit2 size={16} />
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleCancel}
                      className="btn-secondary flex items-center gap-2"
                    >
                      <X size={16} />
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      className="btn-primary flex items-center gap-2"
                    >
                      <Save size={16} />
                      Save
                    </button>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="flex gap-6 mt-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-800">{userTrips.length}</p>
                  <p className="text-sm text-gray-500">Total Trips</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{completedTrips.length}</p>
                  <p className="text-sm text-gray-500">Completed</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{activeTrips.length}</p>
                  <p className="text-sm text-gray-500">In Progress</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* About Me Section */}
        <div className="card p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <User size={20} />
            About Me
          </h2>

          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="input-field min-h-[80px] resize-none"
                  placeholder="Tell us about yourself..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <MapPin size={14} className="inline mr-1" />
                    Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="input-field"
                    placeholder="e.g., New York, USA"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Heart size={14} className="inline mr-1" />
                    Favorite Destination
                  </label>
                  <input
                    type="text"
                    value={favoriteDestination}
                    onChange={(e) => setFavoriteDestination(e.target.value)}
                    className="input-field"
                    placeholder="e.g., Paris, France"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Compass size={14} className="inline mr-1" />
                  Travel Style
                </label>
                <input
                  type="text"
                  value={travelStyle}
                  onChange={(e) => setTravelStyle(e.target.value)}
                  className="input-field"
                  placeholder="e.g., Adventure seeker, Beach lover, Culture enthusiast"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {bio ? (
                <p className="text-gray-600">{bio}</p>
              ) : (
                <p className="text-gray-400 italic">No bio added yet. Click Edit Profile to add one.</p>
              )}

              <div className="flex flex-wrap gap-4 mt-4">
                {location && (
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <MapPin size={16} className="text-gray-400" />
                    {location}
                  </div>
                )}
                {favoriteDestination && (
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Heart size={16} className="text-red-400" />
                    Loves {favoriteDestination}
                  </div>
                )}
                {travelStyle && (
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Compass size={16} className="text-blue-400" />
                    {travelStyle}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Trips Section */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Map size={20} />
            My Trips
          </h2>

          {userTrips.length === 0 ? (
            <div className="text-center py-8">
              <Map size={40} className="text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">No trips yet. Create your first trip!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Active Trips */}
              {activeTrips.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">In Progress</h3>
                  <div className="space-y-2">
                    {activeTrips.map((trip) => {
                      const members = getTripMembers(trip.id);
                      const progress = getTripProgress(trip.id);
                      const statusConfig = TRIP_STATUS_CONFIG[trip.status];

                      return (
                        <div
                          key={trip.id}
                          onClick={() => setActiveTrip(trip.id)}
                          className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                        >
                          {trip.cover_image ? (
                            <img
                              src={trip.cover_image}
                              alt={trip.name}
                              className="w-16 h-12 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-16 h-12 rounded-lg bg-gray-200 flex items-center justify-center">
                              <Map size={20} className="text-gray-400" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-800 truncate">{trip.name}</h4>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <span className={`px-2 py-0.5 ${statusConfig.color} text-white rounded-full`}>
                                {statusConfig.label}
                              </span>
                              <span className="flex items-center gap-1">
                                <Users size={12} />
                                {members.length}
                              </span>
                              <span>{progress}% complete</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Completed Trips */}
              {completedTrips.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-1">
                    <CheckCircle size={14} className="text-green-500" />
                    Completed
                  </h3>
                  <div className="space-y-2">
                    {completedTrips.map((trip) => {
                      const members = getTripMembers(trip.id);

                      return (
                        <div
                          key={trip.id}
                          onClick={() => setActiveTrip(trip.id)}
                          className="flex items-center gap-4 p-3 bg-green-50 rounded-lg hover:bg-green-100 cursor-pointer transition-colors"
                        >
                          {trip.cover_image ? (
                            <img
                              src={trip.cover_image}
                              alt={trip.name}
                              className="w-16 h-12 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-16 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                              <Map size={20} className="text-green-400" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-800 truncate flex items-center gap-2">
                              {trip.name}
                              <CheckCircle size={14} className="text-green-500" />
                            </h4>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Calendar size={12} />
                              <span>
                                {new Date(trip.created_at).toLocaleDateString('en-US', {
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </span>
                              <span className="flex items-center gap-1">
                                <Users size={12} />
                                {members.length} travelers
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
