import {
  Calendar,
  MapPin,
  Home,
  Compass,
  Utensils,
  Plane,
  CheckCircle,
  AlertCircle,
  Share2,
  Printer,
} from 'lucide-react';
import { useTripStore } from '../../store/tripStore';
import type { CanvasType, Idea, User } from '../../types';
import { CANVAS_CONFIG } from '../../types';
import { Avatar } from '../common/Avatar';

const ICON_MAP = {
  Calendar,
  MapPin,
  Home,
  Compass,
  Utensils,
  Plane,
};

interface FinalPlanProps {
  tripId: string;
  users: Record<string, User>;
}

interface PlanSectionProps {
  canvasType: CanvasType;
  idea?: Idea;
  ideas?: Idea[];
  users: Record<string, User>;
  onNavigate: () => void;
}

function PlanSection({
  canvasType,
  idea,
  ideas,
  users,
  onNavigate,
}: PlanSectionProps) {
  const config = CANVAS_CONFIG[canvasType];
  const Icon = ICON_MAP[config.icon as keyof typeof ICON_MAP];
  const hasSelection = idea || (ideas && ideas.length > 0);
  const displayIdeas = ideas || (idea ? [idea] : []);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div
        className={`flex items-center gap-3 px-4 py-3 ${config.color} bg-opacity-10`}
      >
        <div className={`p-2 rounded-lg ${config.color}`}>
          <Icon size={18} className="text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-800">{config.label}</h3>
          <p className="text-xs text-gray-500">{config.description}</p>
        </div>
        {hasSelection ? (
          <CheckCircle className="text-green-500" size={20} />
        ) : (
          <AlertCircle className="text-yellow-500" size={20} />
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {!hasSelection ? (
          <div className="text-center py-4">
            <p className="text-gray-400 mb-2">No selection made yet</p>
            <button
              onClick={onNavigate}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              Go to {config.label} board
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {displayIdeas.map((item) => {
              const author = users[item.created_by];
              return (
                <div
                  key={item.id}
                  className="flex gap-4 p-3 bg-gray-50 rounded-lg"
                >
                  {item.image_url && (
                    <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-800 truncate">
                      {item.title}
                    </h4>
                    {item.description && (
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {item.description}
                      </p>
                    )}
                    {author && (
                      <div className="flex items-center gap-2 mt-2">
                        <Avatar user={author} size="sm" />
                        <span className="text-xs text-gray-400">
                          Added by {author.name}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export function FinalPlan({ tripId, users }: FinalPlanProps) {
  const { getFinalPlan, trips, setActiveCanvas } = useTripStore();
  const trip = trips[tripId];
  const plan = getFinalPlan(tripId);

  if (!trip || !plan) return null;

  const completionCount = [
    plan.dates,
    plan.location,
    plan.accommodation,
    plan.activities.length > 0,
    plan.food.length > 0,
    plan.transportation,
  ].filter(Boolean).length;

  const isComplete = completionCount === 6;

  const handleShare = async () => {
    const text = `Check out our trip plan for ${trip.name}!`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${trip.name} - TripBoard`,
          text,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(text);
      alert('Link copied to clipboard!');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="h-full overflow-y-auto scrollbar-thin">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{trip.name}</h1>
          {trip.description && (
            <p className="text-gray-500 mb-4">{trip.description}</p>
          )}

          {/* Progress */}
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="flex-1 max-w-xs h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  isComplete ? 'bg-green-500' : 'bg-primary-500'
                }`}
                style={{ width: `${(completionCount / 6) * 100}%` }}
              />
            </div>
            <span className="text-sm font-medium text-gray-600">
              {completionCount}/6 complete
            </span>
          </div>

          {isComplete && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full mb-4">
              <CheckCircle size={18} />
              <span className="font-medium">Your trip plan is complete!</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Share2 size={18} />
              Share
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Printer size={18} />
              Print
            </button>
          </div>
        </div>

        {/* Plan sections */}
        <div className="grid gap-4">
          <PlanSection
            canvasType="dates"
            idea={plan.dates}
            users={users}
            onNavigate={() => setActiveCanvas('dates')}
          />
          <PlanSection
            canvasType="location"
            idea={plan.location}
            users={users}
            onNavigate={() => setActiveCanvas('location')}
          />
          <PlanSection
            canvasType="accommodation"
            idea={plan.accommodation}
            users={users}
            onNavigate={() => setActiveCanvas('accommodation')}
          />
          <PlanSection
            canvasType="activities"
            ideas={plan.activities}
            users={users}
            onNavigate={() => setActiveCanvas('activities')}
          />
          <PlanSection
            canvasType="food"
            ideas={plan.food}
            users={users}
            onNavigate={() => setActiveCanvas('food')}
          />
          <PlanSection
            canvasType="transportation"
            idea={plan.transportation}
            users={users}
            onNavigate={() => setActiveCanvas('transportation')}
          />
        </div>

        {/* Trip members */}
        <div className="mt-8 p-4 bg-white rounded-xl border border-gray-200">
          <h3 className="font-semibold text-gray-800 mb-4">Trip Members</h3>
          <div className="flex flex-wrap gap-3">
            {trip.members.map((memberId) => {
              const member = users[memberId];
              return member ? (
                <div
                  key={memberId}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg"
                >
                  <Avatar user={member} size="sm" />
                  <span className="text-sm font-medium text-gray-700">
                    {member.name}
                  </span>
                </div>
              ) : null;
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
