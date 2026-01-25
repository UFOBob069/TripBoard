import { useState } from 'react';
import {
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Check,
  ExternalLink,
  Crown,
  Send,
  Star,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import type { Idea, User } from '../../types';
import { useTripStore } from '../../store/tripStore';
import { Avatar } from '../common/Avatar';
import { formatDistanceToNow } from 'date-fns';
import { toDate } from '../../lib/dateUtils';

interface IdeaDetailModalProps {
  idea: Idea | null;
  users: Record<string, User>;
  onClose: () => void;
}

export function IdeaDetailModal({ idea, users, onClose }: IdeaDetailModalProps) {
  const [newComment, setNewComment] = useState('');

  const {
    currentUser,
    voteOnIdea,
    removeVote,
    addComment,
    selectIdea,
    unselectIdea,
    updateIdeaStatus,
    getVoteScore,
    getUserVote,
    isOwner,
    getUserVotesRemaining,
  } = useTripStore();

  if (!idea) return null;

  const author = users[idea.created_by];
  const voteScore = getVoteScore(idea);
  const userVote = currentUser ? getUserVote(idea, currentUser.id) : null;
  const canManage = isOwner(idea.trip_id);
  const votesRemaining = getUserVotesRemaining(idea.trip_id, idea.canvas_type);

  const handleVote = (value: 1 | -1) => {
    if (!currentUser) return;
    if (userVote === value) {
      removeVote(idea.trip_id, idea.canvas_type, idea.id);
    } else {
      const success = voteOnIdea(idea.trip_id, idea.canvas_type, idea.id, value);
      if (!success && value === 1) {
        alert('No votes remaining on this board!');
      }
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    addComment(idea.trip_id, idea.canvas_type, idea.id, newComment.trim());
    setNewComment('');
  };

  const handleSelect = () => {
    if (idea.status === 'selected') {
      unselectIdea(idea.trip_id, idea.canvas_type);
    } else {
      selectIdea(idea.trip_id, idea.canvas_type, idea.id);
    }
  };

  const handleShortlist = () => {
    if (idea.status === 'shortlisted') {
      updateIdeaStatus(idea.trip_id, idea.canvas_type, idea.id, 'open');
    } else {
      updateIdeaStatus(idea.trip_id, idea.canvas_type, idea.id, 'shortlisted');
    }
  };

  return (
    <Modal isOpen={!!idea} onClose={onClose} title="" size="xl">
      <div className="space-y-4">
        {/* Status banner */}
        {idea.status === 'selected' && (
          <div className="flex items-center gap-2 p-3 bg-green-100 text-green-800 rounded-lg">
            <Crown size={20} />
            <span className="font-medium">This is the selected choice</span>
          </div>
        )}
        {idea.status === 'shortlisted' && (
          <div className="flex items-center gap-2 p-3 bg-yellow-100 text-yellow-800 rounded-lg">
            <Star size={20} />
            <span className="font-medium">Shortlisted option</span>
          </div>
        )}

        {/* Image */}
        {idea.image_url && (
          <div className="h-64 rounded-xl overflow-hidden">
            <img
              src={idea.image_url}
              alt={idea.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Title and link */}
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-2xl font-bold text-gray-800">{idea.title}</h2>
          {idea.link_url && (
            <a
              href={idea.link_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-primary-600 hover:text-primary-700"
            >
              <ExternalLink size={18} />
              <span className="text-sm">View Link</span>
            </a>
          )}
        </div>

        {/* Description */}
        {idea.description && (
          <p className="text-gray-600 leading-relaxed">{idea.description}</p>
        )}

        {/* Author info */}
        <div className="flex items-center gap-3 py-3 border-t border-b border-gray-100">
          {author && <Avatar user={author} size="md" showName />}
          <span className="text-sm text-gray-400">
            added {formatDistanceToNow(toDate(idea.created_at), { addSuffix: true })}
          </span>
        </div>

        {/* Voting section */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => handleVote(1)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                userVote === 1
                  ? 'bg-green-500 text-white'
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              <ThumbsUp size={18} />
              <span>Upvote ({idea.votes.filter((v) => v.value === 1).length})</span>
            </button>

            <button
              onClick={() => handleVote(-1)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                userVote === -1
                  ? 'bg-red-500 text-white'
                  : 'bg-red-100 text-red-700 hover:bg-red-200'
              }`}
            >
              <ThumbsDown size={18} />
              <span>Downvote ({idea.votes.filter((v) => v.value === -1).length})</span>
            </button>

            <div
              className={`text-xl font-bold px-4 py-2 rounded-lg ${
                voteScore > 0
                  ? 'bg-green-100 text-green-700'
                  : voteScore < 0
                  ? 'bg-red-100 text-red-700'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              Score: {voteScore > 0 ? '+' : ''}
              {voteScore}
            </div>

            <span className="text-sm text-gray-500">
              {votesRemaining} votes left
            </span>
          </div>

          {canManage && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleShortlist}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  idea.status === 'shortlisted'
                    ? 'bg-yellow-400 text-yellow-900'
                    : 'bg-gray-100 text-gray-700 hover:bg-yellow-100 hover:text-yellow-700'
                }`}
              >
                <Star size={18} />
                {idea.status === 'shortlisted' ? 'Shortlisted' : 'Shortlist'}
              </button>

              <button
                onClick={handleSelect}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  idea.status === 'selected'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-green-100 hover:text-green-700'
                }`}
              >
                <Check size={18} />
                {idea.status === 'selected' ? 'Selected' : 'Select This Option'}
              </button>
            </div>
          )}
        </div>

        {/* Comments section */}
        <div className="pt-4">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
            <MessageCircle size={20} />
            Comments ({idea.comments.length})
          </h3>

          <div className="space-y-4 max-h-64 overflow-y-auto scrollbar-thin mb-4">
            {idea.comments.length === 0 ? (
              <p className="text-center text-gray-400 py-4">
                No comments yet. Start the conversation!
              </p>
            ) : (
              idea.comments.map((comment) => {
                const commentAuthor = users[comment.user_id];
                return (
                  <div key={comment.id} className="flex gap-3">
                    {commentAuthor && <Avatar user={commentAuthor} size="md" />}
                    <div className="flex-1 bg-gray-50 rounded-xl px-4 py-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-800">
                          {commentAuthor?.name}
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatDistanceToNow(toDate(comment.timestamp), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                      <p className="text-gray-600">{comment.content}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Add comment form */}
          <form onSubmit={handleAddComment} className="flex gap-3">
            {currentUser && <Avatar user={currentUser} size="md" />}
            <div className="flex-1 relative">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-primary-500 hover:text-primary-600"
              >
                <Send size={20} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  );
}
