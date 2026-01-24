import { useState } from 'react';
import {
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Check,
  Trash2,
  ExternalLink,
  Crown,
} from 'lucide-react';
import type { Idea, User } from '../../types';
import { useTripStore } from '../../store/tripStore';
import { Avatar } from '../common/Avatar';
import { formatDistanceToNow } from 'date-fns';

interface IdeaCardProps {
  idea: Idea;
  users: Record<string, User>;
  onOpenDetail: (idea: Idea) => void;
}

export function IdeaCard({ idea, users, onOpenDetail }: IdeaCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');

  const {
    currentUser,
    voteOnIdea,
    removeVote,
    addComment,
    finalizeIdea,
    unfinalizeIdea,
    deleteIdea,
    getVoteScore,
    getUserVote,
  } = useTripStore();

  const author = users[idea.created_by];
  const voteScore = getVoteScore(idea);
  const userVote = currentUser ? getUserVote(idea, currentUser.id) : null;

  const handleVote = (value: 1 | -1) => {
    if (!currentUser) return;
    if (userVote === value) {
      removeVote(idea.trip_id, idea.canvas_type, idea.id);
    } else {
      voteOnIdea(idea.trip_id, idea.canvas_type, idea.id, value);
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    addComment(idea.trip_id, idea.canvas_type, idea.id, newComment.trim());
    setNewComment('');
  };

  const handleFinalize = () => {
    if (idea.is_finalized) {
      unfinalizeIdea(idea.trip_id, idea.canvas_type);
    } else {
      finalizeIdea(idea.trip_id, idea.canvas_type, idea.id);
    }
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this idea?')) {
      deleteIdea(idea.trip_id, idea.canvas_type, idea.id);
    }
  };

  return (
    <div
      className={`card-idea p-0 overflow-hidden ${
        idea.is_finalized ? 'ring-2 ring-green-500 border-green-500' : ''
      }`}
    >
      {/* Finalized banner */}
      {idea.is_finalized && (
        <div className="bg-green-500 text-white px-4 py-2 flex items-center gap-2">
          <Crown size={16} />
          <span className="text-sm font-medium">Selected Choice</span>
        </div>
      )}

      {/* Image */}
      {idea.image_url && (
        <div
          className="h-40 bg-gray-100 cursor-pointer"
          onClick={() => onOpenDetail(idea)}
        >
          <img
            src={idea.image_url}
            alt={idea.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3
            className="font-semibold text-gray-800 cursor-pointer hover:text-primary-600"
            onClick={() => onOpenDetail(idea)}
          >
            {idea.title}
          </h3>
          {idea.link_url && (
            <a
              href={idea.link_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-primary-500"
            >
              <ExternalLink size={16} />
            </a>
          )}
        </div>

        {/* Description */}
        {idea.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-3">{idea.description}</p>
        )}

        {/* Author */}
        <div className="flex items-center gap-2 mb-3">
          {author && <Avatar user={author} size="sm" />}
          <span className="text-xs text-gray-500">
            {author?.name} &middot;{' '}
            {formatDistanceToNow(new Date(idea.created_at), { addSuffix: true })}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            {/* Upvote */}
            <button
              onClick={() => handleVote(1)}
              className={userVote === 1 ? 'vote-up-active' : 'vote-up'}
            >
              <ThumbsUp size={14} />
              <span>{idea.votes.filter((v) => v.value === 1).length}</span>
            </button>

            {/* Downvote */}
            <button
              onClick={() => handleVote(-1)}
              className={userVote === -1 ? 'vote-down-active' : 'vote-down'}
            >
              <ThumbsDown size={14} />
              <span>{idea.votes.filter((v) => v.value === -1).length}</span>
            </button>

            {/* Comments */}
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200"
            >
              <MessageCircle size={14} />
              <span>{idea.comments.length}</span>
            </button>
          </div>

          <div className="flex items-center gap-1">
            {/* Score */}
            <span
              className={`text-sm font-bold px-2 py-1 rounded ${
                voteScore > 0
                  ? 'text-green-600'
                  : voteScore < 0
                  ? 'text-red-600'
                  : 'text-gray-500'
              }`}
            >
              {voteScore > 0 ? '+' : ''}
              {voteScore}
            </span>

            {/* Finalize button */}
            <button
              onClick={handleFinalize}
              className={`p-2 rounded-full transition-colors ${
                idea.is_finalized
                  ? 'bg-green-500 text-white'
                  : 'text-gray-400 hover:text-green-500 hover:bg-green-50'
              }`}
              title={idea.is_finalized ? 'Unselect' : 'Select this option'}
            >
              <Check size={16} />
            </button>

            {/* Delete button (only for author) */}
            {currentUser?.id === idea.created_by && (
              <button
                onClick={handleDelete}
                className="p-2 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                title="Delete idea"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Comments section */}
        {showComments && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="space-y-3 max-h-48 overflow-y-auto scrollbar-thin mb-3">
              {idea.comments.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-2">
                  No comments yet. Be the first!
                </p>
              ) : (
                idea.comments.map((comment) => {
                  const commentAuthor = users[comment.user_id];
                  return (
                    <div key={comment.id} className="flex gap-2">
                      {commentAuthor && <Avatar user={commentAuthor} size="sm" />}
                      <div className="flex-1 bg-gray-50 rounded-lg px-3 py-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-700">
                            {commentAuthor?.name}
                          </span>
                          <span className="text-xs text-gray-400">
                            {formatDistanceToNow(new Date(comment.timestamp), {
                              addSuffix: true,
                            })}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{comment.content}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Add comment form */}
            <form onSubmit={handleAddComment} className="flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-600 transition-colors"
              >
                Post
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
