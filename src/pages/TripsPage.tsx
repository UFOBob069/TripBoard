import { useState } from 'react';
import {
  Map,
  Plus,
  ArrowLeft,
  Users,
  CheckCircle,
  Image,
} from 'lucide-react';
import { useTripStore } from '../store/tripStore';
import { Modal } from '../components/common/Modal';
import { AvatarGroup } from '../components/common/Avatar';
import { Header } from '../components/layout/Header';
import type { CanvasType } from '../types';

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
  const [tripName, setTripName] = useState('');
  const [tripDescription, setTripDescription] = useState('');
  const [coverImage, setCoverImage] = useState(COVER_IMAGES[0]);

  const {
    groups,
    trips,
    activeGroupId,
    setActiveGroup,
    setActiveTrip,
    createTrip,
  } = useTripStore();

  const activeGroup = activeGroupId ? groups[activeGroupId] : null;

  if (!activeGroup) {
    return null;
  }

  const groupTrips = activeGroup.trips
    .map((tripId) => trips[tripId])
    .filter(Boolean);

  const handleCreateTrip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tripName.trim()) return;
    createTrip(activeGroup.id, tripName.trim(), tripDescription.trim(), coverImage);
    setTripName('');
    setTripDescription('');
    setCoverImage(COVER_IMAGES[0]);
    setShowCreateModal(false);
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

    const finalized = canvasTypes.filter(
      (c) => trip.canvases[c].finalized_idea_id
    ).length;

    return Math.round((finalized / 6) * 100);
  };

  const getTripStats = (tripId: string) => {
    const trip = trips[tripId];
    if (!trip) return { ideas: 0, finalized: 0 };

    let ideas = 0;
    let finalized = 0;

    Object.values(trip.canvases).forEach((canvas) => {
      ideas += canvas.ideas.length;
      if (canvas.finalized_idea_id) finalized++;
    });

    return { ideas, finalized };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Back button and header */}
        <div className="mb-8">
          <button
            onClick={() => setActiveGroup(null)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 transition-colors"
          >
            <ArrowLeft size={18} />
            <span>Back to Groups</span>
          </button>

          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <Users size={20} className="text-primary-600" />
                </div>
                <h2 className="text-lg font-medium text-gray-600">
                  {activeGroup.name}
                </h2>
              </div>
              <h1 className="text-3xl font-bold text-gray-800">Trips</h1>
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus size={18} />
              New Trip
            </button>
          </div>
        </div>

        {/* Members preview */}
        <div className="flex items-center gap-4 mb-8 p-4 bg-white rounded-xl border border-gray-200">
          <AvatarGroup users={activeGroup.members} max={6} />
          <div className="text-sm text-gray-500">
            {activeGroup.members.length} member
            {activeGroup.members.length !== 1 ? 's' : ''} in this group
          </div>
        </div>

        {/* Trips grid */}
        {groupTrips.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Map size={40} className="text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              No trips yet
            </h2>
            <p className="text-gray-500 mb-6">
              Create your first trip to start planning with your group
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary flex items-center gap-2 mx-auto"
            >
              <Plus size={18} />
              Create First Trip
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groupTrips.map((trip) => {
              const progress = getTripProgress(trip.id);
              const stats = getTripStats(trip.id);

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
                    {progress === 100 && (
                      <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-green-500 text-white text-xs font-medium rounded-full">
                        <CheckCircle size={12} />
                        Complete
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

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>{stats.ideas} ideas</span>
                      <span>{stats.finalized}/6 finalized</span>
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
    </div>
  );
}
