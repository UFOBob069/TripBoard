import { useState } from 'react';
import { Plus, Filter, SortAsc } from 'lucide-react';
import type { CanvasType, Idea, User } from '../../types';
import { CANVAS_CONFIG } from '../../types';
import { useTripStore } from '../../store/tripStore';
import { IdeaCard } from './IdeaCard';
import { AddIdeaModal } from './AddIdeaModal';
import { IdeaDetailModal } from './IdeaDetailModal';

interface CanvasProps {
  tripId: string;
  canvasType: CanvasType;
  users: Record<string, User>;
}

type SortOption = 'votes' | 'newest' | 'oldest';

export function Canvas({ tripId, canvasType, users }: CanvasProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('votes');
  const [showFinalized, setShowFinalized] = useState(true);

  const { trips, getIdeasSortedByVotes } = useTripStore();
  const trip = trips[tripId];
  const config = CANVAS_CONFIG[canvasType];

  if (!trip) return null;

  const canvas = trip.canvases[canvasType];
  let ideas = [...canvas.ideas];

  // Filter
  if (!showFinalized) {
    ideas = ideas.filter((i) => !i.is_finalized);
  }

  // Sort
  switch (sortBy) {
    case 'votes':
      ideas = getIdeasSortedByVotes(tripId, canvasType);
      break;
    case 'newest':
      ideas.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      break;
    case 'oldest':
      ideas.sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      break;
  }

  const finalizedIdea = canvas.finalized_idea_id
    ? ideas.find((i) => i.id === canvas.finalized_idea_id)
    : null;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{config.label}</h2>
          <p className="text-gray-500">{config.description}</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Sort dropdown */}
          <div className="flex items-center gap-2">
            <SortAsc size={16} className="text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="votes">Top Voted</option>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </select>
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFinalized(!showFinalized)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
              showFinalized
                ? 'bg-gray-100 text-gray-700'
                : 'bg-primary-100 text-primary-700'
            }`}
          >
            <Filter size={16} />
            {showFinalized ? 'Show All' : 'Hide Finalized'}
          </button>

          {/* Add button */}
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={18} />
            Add Idea
          </button>
        </div>
      </div>

      {/* Finalized selection banner */}
      {finalizedIdea && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="badge-finalized">Selected</span>
            <h3 className="font-semibold text-green-800">{finalizedIdea.title}</h3>
          </div>
          {finalizedIdea.description && (
            <p className="text-sm text-green-700">{finalizedIdea.description}</p>
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
          <p className="text-sm">Be the first to add an idea!</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-4 btn-primary"
          >
            Add First Idea
          </button>
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
