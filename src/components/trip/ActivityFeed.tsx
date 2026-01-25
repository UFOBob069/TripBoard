import { formatDistanceToNow } from 'date-fns';
import {
  Plus,
  ThumbsUp,
  MessageCircle,
  Star,
  CheckCircle,
  Lock,
  UserPlus,
  Sparkles,
  Settings,
} from 'lucide-react';
import { useTripStore } from '../../store/tripStore';
import { Avatar } from '../common/Avatar';
import type { ActivityType } from '../../types';
import { toDate } from '../../lib/dateUtils';

const ACTIVITY_ICONS: Record<ActivityType, typeof Plus> = {
  trip_created: Sparkles,
  member_joined: UserPlus,
  idea_added: Plus,
  idea_voted: ThumbsUp,
  idea_commented: MessageCircle,
  idea_shortlisted: Star,
  idea_selected: CheckCircle,
  board_locked: Lock,
  status_changed: Settings,
};

const ACTIVITY_COLORS: Record<ActivityType, string> = {
  trip_created: 'bg-purple-100 text-purple-600',
  member_joined: 'bg-blue-100 text-blue-600',
  idea_added: 'bg-green-100 text-green-600',
  idea_voted: 'bg-yellow-100 text-yellow-600',
  idea_commented: 'bg-gray-100 text-gray-600',
  idea_shortlisted: 'bg-orange-100 text-orange-600',
  idea_selected: 'bg-green-100 text-green-600',
  board_locked: 'bg-red-100 text-red-600',
  status_changed: 'bg-blue-100 text-blue-600',
};

interface ActivityFeedProps {
  tripId: string;
  limit?: number;
  compact?: boolean;
}

export function ActivityFeed({ tripId, limit = 20, compact = false }: ActivityFeedProps) {
  const { getTripActivities, users } = useTripStore();
  const activities = getTripActivities(tripId, limit);

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <Sparkles size={32} className="mx-auto mb-2 opacity-50" />
        <p className="text-sm">No activity yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((activity) => {
        const user = users[activity.user_id];
        const Icon = ACTIVITY_ICONS[activity.type];
        const colorClass = ACTIVITY_COLORS[activity.type];

        if (compact) {
          return (
            <div key={activity.id} className="flex items-start gap-2 text-sm">
              <div className={`p-1 rounded ${colorClass}`}>
                <Icon size={12} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-gray-600 truncate">{activity.message}</p>
                <p className="text-xs text-gray-400">
                  {formatDistanceToNow(toDate(activity.timestamp), { addSuffix: true })}
                </p>
              </div>
            </div>
          );
        }

        return (
          <div
            key={activity.id}
            className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-100"
          >
            <div className={`p-2 rounded-lg ${colorClass}`}>
              <Icon size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {user && <Avatar user={user} size="sm" />}
                <span className="text-sm font-medium text-gray-700">
                  {user?.name || 'Unknown'}
                </span>
              </div>
              <p className="text-sm text-gray-600">{activity.message}</p>
              <p className="text-xs text-gray-400 mt-1">
                {formatDistanceToNow(toDate(activity.timestamp), { addSuffix: true })}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
