import { useState } from 'react';
import {
  Calendar,
  MapPin,
  Home,
  Compass,
  Utensils,
  Plane,
  CheckCircle,
  ArrowLeft,
  Lock,
  Crown,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Activity,
} from 'lucide-react';
import type { CanvasType, TripStatus } from '../../types';
import { CANVAS_CONFIG, TRIP_STATUS_CONFIG } from '../../types';
import { useTripStore } from '../../store/tripStore';
import { ActivityFeed } from '../trip/ActivityFeed';

const ICON_MAP = {
  Calendar,
  MapPin,
  Home,
  Compass,
  Utensils,
  Plane,
};

interface SidebarProps {
  onShowFinalPlan: () => void;
  showingFinalPlan: boolean;
  onBack: () => void;
  onCanvasSelect?: () => void;
}

export function Sidebar({ onShowFinalPlan, showingFinalPlan, onBack, onCanvasSelect }: SidebarProps) {
  const [showActivity, setShowActivity] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const {
    activeCanvas,
    setActiveCanvas,
    activeTripId,
    trips,
    isOwner,
    updateTripStatus,
  } = useTripStore();

  const trip = activeTripId ? trips[activeTripId] : null;
  const isOwnerUser = activeTripId ? isOwner(activeTripId) : false;

  const canvasTypes: CanvasType[] = [
    'dates',
    'location',
    'accommodation',
    'activities',
    'food',
    'transportation',
  ];

  const getCanvasStatus = (canvas: CanvasType) => {
    if (!trip) return { count: 0, selected: false, locked: false };
    const canvasData = trip.canvases[canvas];
    return {
      count: canvasData.ideas.length,
      selected: !!canvasData.selected_idea_id,
      locked: canvasData.settings.is_locked,
    };
  };

  const allSelected = canvasTypes.every((c) => getCanvasStatus(c).selected);

  const copyInviteCode = () => {
    if (!trip) return;
    navigator.clipboard.writeText(trip.invite_code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleStatusChange = (status: TripStatus) => {
    if (!activeTripId || !isOwnerUser) return;
    updateTripStatus(activeTripId, status);
  };

  return (
    <aside className="w-72 h-full bg-white border-r border-gray-200 flex flex-col overflow-hidden">
      {/* Back button */}
      <div className="p-4 border-b border-gray-100">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft size={18} />
          <span className="font-medium">Back to Trips</span>
        </button>
      </div>

      {/* Trip info */}
      {trip && (
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h2 className="font-bold text-lg text-gray-800 truncate">{trip.name}</h2>
            {isOwnerUser && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
                <Crown size={12} />
                Owner
              </span>
            )}
          </div>

          {/* Status selector (owner only) */}
          {isOwnerUser ? (
            <div className="flex gap-1 mb-3">
              {(['ideation', 'voting', 'finalized'] as TripStatus[]).map((status) => {
                const config = TRIP_STATUS_CONFIG[status];
                const isActive = trip.status === status;
                return (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    className={`flex-1 px-2 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                      isActive
                        ? `${config.color} text-white`
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {config.label}
                  </button>
                );
              })}
            </div>
          ) : (
            <div
              className={`inline-flex items-center gap-1 px-2 py-1 ${TRIP_STATUS_CONFIG[trip.status].color} text-white text-xs font-medium rounded-full mb-3`}
            >
              {trip.status === 'finalized' && <CheckCircle size={12} />}
              {TRIP_STATUS_CONFIG[trip.status].label}
            </div>
          )}

          {/* Invite code */}
          <button
            onClick={copyInviteCode}
            className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="text-left">
              <p className="text-xs text-gray-500">Invite Code</p>
              <p className="font-mono font-medium text-gray-700">{trip.invite_code}</p>
            </div>
            {copiedCode ? (
              <Check size={16} className="text-green-500" />
            ) : (
              <Copy size={16} className="text-gray-400" />
            )}
          </button>
        </div>
      )}

      {/* Canvas navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Planning Boards
        </p>

        {canvasTypes.map((canvas) => {
          const config = CANVAS_CONFIG[canvas];
          const Icon = ICON_MAP[config.icon as keyof typeof ICON_MAP];
          const status = getCanvasStatus(canvas);
          const isActive = !showingFinalPlan && activeCanvas === canvas;

          return (
            <button
              key={canvas}
              onClick={() => {
                setActiveCanvas(canvas);
                if (showingFinalPlan) {
                  onShowFinalPlan();
                }
                onCanvasSelect?.();
              }}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                isActive
                  ? 'bg-primary-50 text-primary-700 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div
                className={`p-2 rounded-lg ${
                  isActive ? config.color : 'bg-gray-100'
                }`}
              >
                <Icon
                  size={18}
                  className={isActive ? 'text-white' : 'text-gray-500'}
                />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium">{config.label}</p>
                <p className="text-xs text-gray-400">{status.count} ideas</p>
              </div>
              <div className="flex items-center gap-1">
                {status.locked && (
                  <Lock size={14} className="text-gray-400" />
                )}
                {status.selected && (
                  <CheckCircle size={18} className="text-green-500" />
                )}
              </div>
            </button>
          );
        })}
      </nav>

      {/* Activity Feed Toggle */}
      {trip && (
        <div className="border-t border-gray-100">
          <button
            onClick={() => setShowActivity(!showActivity)}
            className="w-full flex items-center justify-between px-4 py-3 text-gray-600 hover:bg-gray-50"
          >
            <span className="flex items-center gap-2 text-sm font-medium">
              <Activity size={16} />
              Recent Activity
            </span>
            {showActivity ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>

          {showActivity && (
            <div className="px-4 pb-4 max-h-64 overflow-y-auto">
              <ActivityFeed tripId={trip.id} limit={10} compact />
            </div>
          )}
        </div>
      )}

      {/* Final plan button */}
      <div className="p-4 border-t border-gray-100">
        <button
          onClick={onShowFinalPlan}
          className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
            showingFinalPlan
              ? 'bg-accent-500 text-white shadow-lg'
              : allSelected
              ? 'bg-accent-500 text-white hover:bg-accent-600'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <CheckCircle size={20} />
          <span>View Final Plan</span>
        </button>
        {!allSelected && (
          <p className="text-xs text-center text-gray-400 mt-2">
            Select choices for all boards to complete
          </p>
        )}
      </div>
    </aside>
  );
}
