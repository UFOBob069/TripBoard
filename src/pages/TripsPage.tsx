import { useState } from 'react';
import {
  Map,
  Plus,
  UserPlus,
  Copy,
  Check,
  CheckCircle,
  Image,
  Crown,
} from 'lucide-react';
import { useTripStore } from '../store/tripStore';
import { Modal } from '../components/common/Modal';
import { AvatarGroup } from '../components/common/Avatar';
import { Header } from '../components/layout/Header';
import type { CanvasType } from '../types';
import { TRIP_STATUS_CONFIG } from '../types';

const COVER_IMAGES = [
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800',
  'https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=800',
  'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800',
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800',
  'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800',
  'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800',
];

export function TripsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [tripName, setTripName] = useState('');
  const [tripDescription, setTripDescription] = useState('');
  const [coverImage, setCoverImage] = useState(COVER_IMAGES[0]);
  const [inviteCode, setInviteCode] = useState('');
  const [joinError, setJoinError] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const {
    trips,
    users,
    currentUser,
    setActiveTrip,
    createTrip,
    joinTrip,
  } = useTripStore();

  const tripList = Object.values(trips).filter((trip) =>
    trip.members.some((m) => m.user_id === currentUser?.id)
  );

  const handleCreateTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tripName.trim()) return;
    await createTrip(tripName.trim(), tripDescription.trim(), coverImage);
    setTripName('');
    setTripDescription('');
    setCoverImage(COVER_IMAGES[0]);
    setShowCreateModal(false);
  };

  const handleJoinTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;
    const trip = await joinTrip(inviteCode.trim());
    if (trip) {
      setInviteCode('');
      setJoinError('');
      setShowJoinModal(false);
    } else {
      setJoinError('Invalid invite code. Please check and try again.');
    }
  };

  const copyInviteCode = (code: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getTripProgress = (tripId: string) => {
    const trip = trips[tripId];
    if (!trip) return 0;

    const canvasTypes: CanvasType[] = [
      'dates',
      'location',
      'accommodation',
      'activities',
      'food',
      'transportation',
    ];

    const selected = canvasTypes.filter(
      (c) => trip.canvases[c].selected_idea_id
    ).length;

    return Math.round((selected / 6) * 100);
  };

  const getTripStats = (tripId: string) => {
    const trip = trips[tripId];
    if (!trip) return { ideas: 0, selected: 0 };

    let ideas = 0;
    let selected = 0;

    Object.values(trip.canvases).forEach((canvas) => {
      ideas += canvas.ideas.length;
      if (canvas.selected_idea_id) selected++;
    });

    return { ideas, selected };
  };

  const getTripMembers = (tripId: string) => {
    const trip = trips[tripId];
    if (!trip) return [];
    return trip.members
      .map((m) => users[m.user_id])
      .filter(Boolean);
  };

  const isOwner = (tripId: string) => {
    const trip = trips[tripId];
    return trip?.owner_id === currentUser?.id;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Your Trips</h1>
            <p className="text-gray-500">
              Create a new trip or join one with an invite code
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowJoinModal(true)}
              className="btn-secondary flex items-center gap-2"
            >
              <UserPlus size={18} />
              Join Trip
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus size={18} />
              Create Trip
            </button>
          </div>
        </div>

        {/* Trips grid */}
        {tripList.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Map size={40} className="text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              No trips yet
            </h2>
            <p className="text-gray-500 mb-6">
              Create your first trip or join an existing one with an invite code
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setShowJoinModal(true)}
                className="btn-secondary flex items-center gap-2"
              >
                <UserPlus size={18} />
                Join Trip
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary flex items-center gap-2"
              >
                <Plus size={18} />
                Create Trip
              </button>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tripList.map((trip) => {
              const progress = getTripProgress(trip.id);
              const stats = getTripStats(trip.id);
              const members = getTripMembers(trip.id);
              const statusConfig = TRIP_STATUS_CONFIG[trip.status];

              return (
                <div
                  key={trip.id}
                  className="card overflow-hidden cursor-pointer hover:shadow-xl transition-all"
                  onClick={() => setActiveTrip(trip.id)}
                >
                  {/* Cover image */}
                  <div className="h-40 bg-gray-200 relative">
                    {trip.cover_image ? (
                      <img
                        src={trip.cover_image}
                        alt={trip.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Map size={40} className="text-gray-400" />
                      </div>
                    )}

                    {/* Status badge */}
                    <div
                      className={`absolute top-3 left-3 flex items-center gap-1 px-2 py-1 ${statusConfig.color} text-white text-xs font-medium rounded-full`}
                    >
                      {trip.status === 'finalized' && <CheckCircle size={12} />}
                      {statusConfig.label}
                    </div>

                    {/* Owner badge */}
                    {isOwner(trip.id) && (
                      <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-yellow-500 text-white text-xs font-medium rounded-full">
                        <Crown size={12} />
                        Owner
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">
                      {trip.name}
                    </h3>
                    {trip.description && (
                      <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                        {trip.description}
                      </p>
                    )}

                    {/* Members */}
                    <div className="flex items-center gap-3 mb-3">
                      <AvatarGroup users={members} max={4} size="sm" />
                      <span className="text-sm text-gray-500">
                        {members.length} member{members.length !== 1 ? 's' : ''}
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-500">Planning progress</span>
                        <span className="font-medium text-gray-700">
                          {progress}%
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            progress === 100 ? 'bg-green-500' : 'bg-primary-500'
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Stats & Invite Code */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <span className="text-sm text-gray-500">
                        {stats.ideas} ideas &middot; {stats.selected}/6 selected
                      </span>

                      <button
                        onClick={(e) => copyInviteCode(trip.invite_code, e)}
                        className="flex items-center gap-1 text-sm text-gray-400 hover:text-primary-600 transition-colors"
                        title="Copy invite code"
                      >
                        {copiedCode === trip.invite_code ? (
                          <>
                            <Check size={14} className="text-green-500" />
                            <span className="text-green-500">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy size={14} />
                            <span className="font-mono">{trip.invite_code}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Create Trip Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Trip"
        size="lg"
      >
        <form onSubmit={handleCreateTrip} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trip Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={tripName}
              onChange={(e) => setTripName(e.target.value)}
              className="input-field"
              placeholder="e.g., Summer in Barcelona"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={tripDescription}
              onChange={(e) => setTripDescription(e.target.value)}
              className="input-field min-h-[80px] resize-none"
              placeholder="What's the plan for this trip?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <span className="flex items-center gap-2">
                <Image size={16} />
                Cover Image
              </span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {COVER_IMAGES.map((url, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCoverImage(url)}
                  className={`h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    coverImage === url
                      ? 'border-primary-500 ring-2 ring-primary-200'
                      : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  <img
                    src={url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              After creating the trip, you'll get an invite code to share with your friends.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Create Trip
            </button>
          </div>
        </form>
      </Modal>

      {/* Join Trip Modal */}
      <Modal
        isOpen={showJoinModal}
        onClose={() => {
          setShowJoinModal(false);
          setJoinError('');
          setInviteCode('');
        }}
        title="Join a Trip"
      >
        <form onSubmit={handleJoinTrip} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Invite Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => {
                setInviteCode(e.target.value.toUpperCase());
                setJoinError('');
              }}
              className="input-field font-mono text-center text-lg tracking-wider"
              placeholder="ABCD1234"
              maxLength={8}
              required
            />
            {joinError && (
              <p className="text-sm text-red-500 mt-2">{joinError}</p>
            )}
          </div>

          <p className="text-sm text-gray-500">
            Ask the trip organizer for the 8-character invite code
          </p>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowJoinModal(false);
                setJoinError('');
                setInviteCode('');
              }}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Join Trip
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
