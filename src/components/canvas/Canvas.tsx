import { useState } from 'react';
import { Plus, Lock } from 'lucide-react';
import type { CanvasType, Idea, User } from '../../types';
import { CANVAS_CONFIG } from '../../types';
import { useTripStore } from '../../store/tripStore';
import { IdeaCard } from './IdeaCard';
import { AddIdeaModal } from './AddIdeaModal';
import { IdeaDetailModal } from './IdeaDetailModal';
import { toDate } from '../../lib/dateUtils';

interface CanvasProps {
  tripId: string;
  canvasType: CanvasType;
  users: Record<string, User>;
}

type SortOption = 'votes' | 'newest' | 'oldest';
type FilterOption = 'all' | 'open' | 'shortlisted' | 'selected';

export function Canvas({ tripId, canvasType, users }: CanvasProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('votes');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');

  const { trips, getIdeasSortedByVotes, canEdit, getUserVotesRemaining } = useTripStore();
  const trip = trips[tripId];
  const config = CANVAS_CONFIG[canvasType];

  if (!trip) return null;

  const canvas = trip.canvases[canvasType];
  const isLocked = canvas.settings.is_locked;
  const canAddIdea = canEdit(tripId, canvasType);
  const votesRemaining = getUserVotesRemaining(tripId, canvasType);
  let ideas = [...canvas.ideas];

  // Filter
  if (filterBy !== 'all') {
    ideas = ideas.filter((i) => i.status === filterBy);
  }

  // Sort
  switch (sortBy) {
    case 'votes':
      ideas = getIdeasSortedByVotes(tripId, canvasType);
      if (filterBy !== 'all') {
        ideas = ideas.filter((i) => i.status === filterBy);
      }
      break;
    case 'newest':
      ideas.sort(
        (a, b) => toDate(b.created_at).getTime() - toDate(a.created_at).getTime()
      );
      break;
    case 'oldest':
      ideas.sort(
        (a, b) => toDate(a.created_at).getTime() - toDate(b.created_at).getTime()
      );
      break;
  }

  const selectedIdeaItem = canvas.selected_idea_id
    ? canvas.ideas.find((i) => i.id === canvas.selected_idea_id)
    : null;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">{config.label}</h2>
            {isLocked && (
              <span className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                <Lock size={12} />
                Locked
              </span>
            )}
          </div>
          <p className="text-sm sm:text-base text-gray-500">{config.description}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Votes remaining indicator */}
          <div className="text-sm text-gray-500">
            <span className="font-medium text-primary-600">{votesRemaining}</span> votes left
          </div>

          {/* Sort dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="text-sm border border-gray-200 rounded-lg px-2 sm:px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="votes">Top Voted</option>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>

          {/* Filter dropdown */}
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value as FilterOption)}
            className="text-sm border border-gray-200 rounded-lg px-2 sm:px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All</option>
            <option value="open">Open</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="selected">Selected</option>
          </select>

          {/* Add button */}
          {canAddIdea && (
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary flex items-center gap-2 text-sm sm:text-base"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Add Idea</span>
              <span className="sm:hidden">Add</span>
            </button>
          )}
        </div>
      </div>

      {/* Selected idea banner */}
      {selectedIdeaItem && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="badge-finalized">Selected</span>
            <h3 className="font-semibold text-green-800">{selectedIdeaItem.title}</h3>
          </div>
          {selectedIdeaItem.description && (
            <p className="text-sm text-green-700">{selectedIdeaItem.description}</p>
          )}
        </div>
      )}

      {/* Ideas grid */}
      {ideas.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
          <div className={`p-4 rounded-full ${config.color} bg-opacity-10 mb-4`}>
            <Plus size={32} className="text-gray-400" />
          </div>
          <p className="text-lg font-medium">No ideas yet</p>
          <p className="text-sm">
            {isLocked ? 'This board is locked' : 'Be the first to add an idea!'}
          </p>
          {canAddIdea && (
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 btn-primary"
            >
              Add First Idea
            </button>
          )}
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="masonry-grid">
            {ideas.map((idea) => (
              <IdeaCard
                key={idea.id}
                idea={idea}
                users={users}
                onOpenDetail={setSelectedIdea}
              />
            ))}
          </div>
        </div>
      )}

      {/* Add idea modal */}
      <AddIdeaModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        tripId={tripId}
        canvasType={canvasType}
      />

      {/* Idea detail modal */}
      <IdeaDetailModal
        idea={selectedIdea}
        users={users}
        onClose={() => setSelectedIdea(null)}
      />
    </div>
  );
}
