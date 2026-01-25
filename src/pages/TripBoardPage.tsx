import { useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Home,
  Compass,
  Utensils,
  Plane,
  CheckCircle,
  Lock,
  Share2,
  Copy,
  Check,
  Crown,
  Activity,
  X,
} from 'lucide-react';
import { useTripStore } from '../store/tripStore';
import { Header } from '../components/layout/Header';
import { Canvas } from '../components/canvas/Canvas';
import { FinalPlan } from '../components/trip/FinalPlan';
import { ActivityFeed } from '../components/trip/ActivityFeed';
import { Modal } from '../components/common/Modal';
import type { CanvasType, TripStatus } from '../types';
import { CANVAS_CONFIG, TRIP_STATUS_CONFIG } from '../types';

const ICON_MAP = {
  Calendar,
  MapPin,
  Home,
  Compass,
  Utensils,
  Plane,
};

const canvasTypes: CanvasType[] = [
  'dates',
  'location',
  'accommodation',
  'activities',
  'food',
  'transportation',
];

export function TripBoardPage() {
  const [showFinalPlan, setShowFinalPlan] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showActivityPanel, setShowActivityPanel] = useState(true); // Default open
  const [copiedLink, setCopiedLink] = useState(false);

  const {
    trips,
    activeTripId,
    activeCanvas,
    setActiveTrip,
    setActiveCanvas,
    users,
    isOwner,
    updateTripStatus,
  } = useTripStore();

  const trip = activeTripId ? trips[activeTripId] : null;
  const isOwnerUser = activeTripId ? isOwner(activeTripId) : false;

  if (!trip) {
    return null;
  }

  const handleBack = () => {
    setActiveTrip(null);
  };

  const handleNavigateToBoard = (canvas: CanvasType) => {
    setActiveCanvas(canvas);
    setShowFinalPlan(false);
  };

  const getCanvasStatus = (canvas: CanvasType) => {
    const canvasData = trip.canvases[canvas];
    return {
      count: canvasData.ideas.length,
      selected: canvasData.ideas.filter((i) => i.status === 'selected').length > 0,
      locked: canvasData.settings.is_locked,
    };
  };

  const allSelected = canvasTypes.every((c) => getCanvasStatus(c).selected);

  const getInviteLink = () => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/join/${trip.invite_code}`;
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText(getInviteLink());
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const shareInvite = async () => {
    const inviteLink = getInviteLink();
    const shareData = {
      title: `Join ${trip.name} on TripBord`,
      text: `You're invited to plan a trip together!`,
      url: inviteLink,
    };

    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch {
        copyInviteLink();
      }
    } else {
      copyInviteLink();
    }
  };

  const handleStatusChange = (status: TripStatus) => {
    if (!activeTripId || !isOwnerUser) return;
    updateTripStatus(activeTripId, status);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Header />

      {/* Trip header bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Left: Back button & trip info */}
          <div className="flex items-center gap-4 min-w-0">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors flex-shrink-0"
            >
              <ArrowLeft size={20} />
              <span className="hidden sm:inline font-medium">Back</span>
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-lg text-gray-800 truncate">{trip.name}</h1>
                {isOwnerUser && (
                  <span className="flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full flex-shrink-0">
                    <Crown size={12} />
                    Owner
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Status & Share */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Status indicator/selector */}
            {isOwnerUser ? (
              <div className="hidden sm:flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                {(['ideation', 'voting', 'finalized'] as TripStatus[]).map((status) => {
                  const config = TRIP_STATUS_CONFIG[status];
                  const isActive = trip.status === status;
                  return (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(status)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                        isActive
                          ? `${config.color} text-white`
                          : 'text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {config.label}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div
                className={`hidden sm:flex items-center gap-1 px-3 py-1.5 ${TRIP_STATUS_CONFIG[trip.status].color} text-white text-xs font-medium rounded-lg`}
              >
                {trip.status === 'finalized' && <CheckCircle size={12} />}
                {TRIP_STATUS_CONFIG[trip.status].label}
              </div>
            )}

            {/* Activity button - show on mobile always, show on desktop when panel is closed */}
            <button
              onClick={() => setShowActivityPanel(!showActivityPanel)}
              className={`p-2 rounded-lg transition-colors ${
                showActivityPanel ? 'bg-primary-100 text-primary-600 lg:hidden' : 'hover:bg-gray-100 text-gray-600'
              }`}
              title={showActivityPanel ? 'Hide Activity' : 'Show Activity'}
            >
              <Activity size={20} />
            </button>

            {/* Share button */}
            <button
              onClick={() => setShowShareModal(true)}
              className="btn-primary text-sm flex items-center gap-2"
            >
              <Share2 size={16} />
              <span className="hidden sm:inline">Invite</span>
            </button>
          </div>
        </div>
      </div>

      {/* Board tabs - horizontal */}
      <div className="bg-white border-b border-gray-200 overflow-x-auto">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-1 py-2">
            {canvasTypes.map((canvas) => {
              const config = CANVAS_CONFIG[canvas];
              const Icon = ICON_MAP[config.icon as keyof typeof ICON_MAP];
              const status = getCanvasStatus(canvas);
              const isActive = !showFinalPlan && activeCanvas === canvas;

              return (
                <button
                  key={canvas}
                  onClick={() => handleNavigateToBoard(canvas)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <div
                    className={`p-1.5 rounded-lg ${
                      isActive ? config.color : 'bg-gray-100'
                    }`}
                  >
                    <Icon
                      size={16}
                      className={isActive ? 'text-white' : 'text-gray-500'}
                    />
                  </div>
                  <span className="font-medium text-sm hidden sm:inline">{config.label}</span>
                  <div className="flex items-center gap-1">
                    {status.locked && (
                      <Lock size={12} className="text-gray-400" />
                    )}
                    {status.selected && (
                      <CheckCircle size={14} className="text-green-500" />
                    )}
                  </div>
                </button>
              );
            })}

            {/* Final Plan button */}
            <button
              onClick={() => setShowFinalPlan(!showFinalPlan)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ml-auto ${
                showFinalPlan
                  ? 'bg-accent-500 text-white'
                  : allSelected
                  ? 'bg-accent-100 text-accent-700 hover:bg-accent-200'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              <CheckCircle size={16} />
              <span className="hidden sm:inline">Final Plan</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Activity panel - LEFT SIDE, default open on desktop */}
        <div
          className={`hidden lg:flex flex-col w-72 bg-white border-r border-gray-200 transition-all ${
            showActivityPanel ? '' : 'lg:hidden'
          }`}
        >
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <Activity size={18} />
              Recent Activity
            </h3>
            <button
              onClick={() => setShowActivityPanel(false)}
              className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <ActivityFeed tripId={trip.id} limit={50} />
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-hidden p-4 sm:p-6">
          {showFinalPlan ? (
            <FinalPlan tripId={trip.id} users={users} onNavigateToBoard={handleNavigateToBoard} />
          ) : (
            <Canvas
              tripId={trip.id}
              canvasType={activeCanvas}
              users={users}
            />
          )}
        </main>

        {/* Mobile activity panel - slides in from right */}
        <div
          className={`fixed lg:hidden right-0 top-0 h-full w-80 bg-white border-l border-gray-200 shadow-lg transform transition-transform z-40 ${
            showActivityPanel ? 'translate-x-0' : 'translate-x-full'
          }`}
          style={{ top: '120px', height: 'calc(100vh - 120px)' }}
        >
          <div className="h-full flex flex-col">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">Recent Activity</h3>
              <button
                onClick={() => setShowActivityPanel(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <ActivityFeed tripId={trip.id} limit={30} />
            </div>
          </div>
        </div>

        {/* Overlay for mobile activity panel */}
        {showActivityPanel && (
          <div
            className="fixed inset-0 bg-black/30 z-30 lg:hidden"
            onClick={() => setShowActivityPanel(false)}
          />
        )}
      </div>

      {/* Share Modal - simplified */}
      <Modal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        title="Invite Friends"
      >
        <div className="space-y-4">
          <p className="text-gray-600 text-sm">
            Share this link with friends to invite them to the trip.
          </p>

          {/* Share link input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={getInviteLink()}
              readOnly
              className="input-field flex-1 text-sm font-mono bg-gray-50"
            />
            <button
              onClick={copyInviteLink}
              className="btn-secondary flex items-center gap-2 flex-shrink-0"
            >
              {copiedLink ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
              {copiedLink ? 'Copied!' : 'Copy'}
            </button>
          </div>

          {/* Share button for mobile */}
          <button
            onClick={shareInvite}
            className="w-full btn-primary flex items-center justify-center gap-2"
          >
            <Share2 size={18} />
            Share
          </button>
        </div>
      </Modal>
    </div>
  );
}
