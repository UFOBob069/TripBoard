import {
  Calendar,
  MapPin,
  Home,
  Compass,
  Utensils,
  Plane,
  CheckCircle,
  ArrowLeft,
} from 'lucide-react';
import type { CanvasType } from '../../types';
import { CANVAS_CONFIG } from '../../types';
import { useTripStore } from '../../store/tripStore';

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
}

export function Sidebar({ onShowFinalPlan, showingFinalPlan, onBack }: SidebarProps) {
  const { activeCanvas, setActiveCanvas, activeTripId, trips } = useTripStore();

  const trip = activeTripId ? trips[activeTripId] : null;

  const canvasTypes: CanvasType[] = [
    'dates',
    'location',
    'accommodation',
    'activities',
    'food',
    'transportation',
  ];

  const getCanvasStatus = (canvas: CanvasType) => {
    if (!trip) return { count: 0, finalized: false };
    const canvasData = trip.canvases[canvas];
    return {
      count: canvasData.ideas.length,
      finalized: !!canvasData.finalized_idea_id,
    };
  };

  const allFinalized = canvasTypes.every((c) => getCanvasStatus(c).finalized);

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
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
          <h2 className="font-bold text-lg text-gray-800 truncate">{trip.name}</h2>
          {trip.description && (
            <p className="text-sm text-gray-500 truncate">{trip.description}</p>
          )}
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
              {status.finalized && (
                <CheckCircle size={18} className="text-green-500" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Final plan button */}
      <div className="p-4 border-t border-gray-100">
        <button
          onClick={onShowFinalPlan}
          className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
            showingFinalPlan
              ? 'bg-accent-500 text-white shadow-lg'
              : allFinalized
              ? 'bg-accent-500 text-white hover:bg-accent-600'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <CheckCircle size={20} />
          <span>View Final Plan</span>
        </button>
        {!allFinalized && (
          <p className="text-xs text-center text-gray-400 mt-2">
            Finalize all boards to complete the plan
          </p>
        )}
      </div>
    </aside>
  );
}
