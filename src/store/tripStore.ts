import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type {
  User,
  Trip,
  Idea,
  Comment,
  Vote,
  CanvasType,
  Canvas,
  TripStatus,
  CardStatus,
  Activity,
  ActivityType,
  TripMember,
  BoardSettings,
} from '../types';
import { CANVAS_CONFIG } from '../types';

// Helper to generate avatar colors
const AVATAR_COLORS = [
  '#f87171', '#fb923c', '#fbbf24', '#a3e635', '#4ade80',
  '#2dd4bf', '#38bdf8', '#818cf8', '#c084fc', '#f472b6',
];

const getRandomColor = () => AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];

// Default board settings
const createDefaultBoardSettings = (canvasType: CanvasType): BoardSettings => ({
  votes_per_user: CANVAS_CONFIG[canvasType].defaultVotesPerUser,
  is_locked: false,
});

// Initial canvas state
const createEmptyCanvases = (tripId: string): Record<CanvasType, Canvas> => ({
  dates: { type: 'dates', trip_id: tripId, ideas: [], settings: createDefaultBoardSettings('dates') },
  location: { type: 'location', trip_id: tripId, ideas: [], settings: createDefaultBoardSettings('location') },
  accommodation: { type: 'accommodation', trip_id: tripId, ideas: [], settings: createDefaultBoardSettings('accommodation') },
  activities: { type: 'activities', trip_id: tripId, ideas: [], settings: createDefaultBoardSettings('activities') },
  food: { type: 'food', trip_id: tripId, ideas: [], settings: createDefaultBoardSettings('food') },
  transportation: { type: 'transportation', trip_id: tripId, ideas: [], settings: createDefaultBoardSettings('transportation') },
});

interface TripState {
  // Current user
  currentUser: User | null;

  // Data
  users: Record<string, User>;
  trips: Record<string, Trip>;

  // UI State
  activeTripId: string | null;
  activeCanvas: CanvasType;

  // User actions
  setCurrentUser: (user: User) => void;
  createUser: (name: string, email: string) => User;

  // Trip actions
  createTrip: (name: string, description: string, coverImage?: string) => Trip;
  joinTrip: (inviteCode: string) => Trip | null;
  setActiveTrip: (tripId: string | null) => void;
  setActiveCanvas: (canvas: CanvasType) => void;
  updateTripStatus: (tripId: string, status: TripStatus) => void;

  // Permission helpers
  isOwner: (tripId: string) => boolean;
  canEdit: (tripId: string, canvas: CanvasType) => boolean;
  canVote: (tripId: string) => boolean;

  // Idea actions
  addIdea: (tripId: string, canvas: CanvasType, idea: Omit<Idea, 'id' | 'trip_id' | 'canvas_type' | 'created_at' | 'votes' | 'comments' | 'status'>) => Idea | null;
  deleteIdea: (tripId: string, canvas: CanvasType, ideaId: string) => void;
  updateIdeaStatus: (tripId: string, canvas: CanvasType, ideaId: string, status: CardStatus) => void;

  // Voting actions
  voteOnIdea: (tripId: string, canvas: CanvasType, ideaId: string, value: 1 | -1) => boolean;
  removeVote: (tripId: string, canvas: CanvasType, ideaId: string) => void;
  getUserVotesRemaining: (tripId: string, canvas: CanvasType) => number;

  // Comment actions
  addComment: (tripId: string, canvas: CanvasType, ideaId: string, content: string) => Comment | null;
  deleteComment: (tripId: string, canvas: CanvasType, ideaId: string, commentId: string) => void;

  // Board actions
  lockBoard: (tripId: string, canvas: CanvasType) => void;
  unlockBoard: (tripId: string, canvas: CanvasType) => void;
  selectIdea: (tripId: string, canvas: CanvasType, ideaId: string) => void;
  unselectIdea: (tripId: string, canvas: CanvasType) => void;

  // Activity actions
  addActivity: (tripId: string, type: ActivityType, message: string, targetId?: string, targetType?: string) => void;

  // Helper functions
  getVoteScore: (idea: Idea) => number;
  getUserVote: (idea: Idea, userId: string) => 1 | -1 | null;
  getIdeasSortedByVotes: (tripId: string, canvas: CanvasType) => Idea[];
  getFinalPlan: (tripId: string) => {
    dates?: Idea;
    location?: Idea;
    accommodation?: Idea;
    activities: Idea[];
    food: Idea[];
    transportation?: Idea;
  } | null;
  getTripActivities: (tripId: string, limit?: number) => Activity[];
  getMemberInfo: (tripId: string, userId: string) => { user: User; member: TripMember } | null;
}

export const useTripStore = create<TripState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      users: {},
      trips: {},
      activeTripId: null,
      activeCanvas: 'dates',

      setCurrentUser: (user) => set({ currentUser: user }),

      createUser: (name, email) => {
        const user: User = {
          id: uuidv4(),
          name,
          email,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
          color: getRandomColor(),
        };
        set((state) => ({
          users: { ...state.users, [user.id]: user },
          currentUser: user,
        }));
        return user;
      },

      createTrip: (name, description, coverImage) => {
        const { currentUser } = get();
        if (!currentUser) throw new Error('Must be logged in to create a trip');

        const tripId = uuidv4();
        const trip: Trip = {
          id: tripId,
          name,
          description,
          cover_image: coverImage,
          owner_id: currentUser.id,
          created_at: new Date(),
          members: [{
            user_id: currentUser.id,
            role: 'owner',
            joined_at: new Date(),
          }],
          canvases: createEmptyCanvases(tripId),
          status: 'ideation',
          invite_code: uuidv4().slice(0, 8).toUpperCase(),
          activities: [],
        };

        // Add creation activity
        const activity: Activity = {
          id: uuidv4(),
          trip_id: tripId,
          type: 'trip_created',
          user_id: currentUser.id,
          message: `${currentUser.name} created the trip "${name}"`,
          timestamp: new Date(),
        };
        trip.activities.push(activity);

        set((state) => ({
          trips: { ...state.trips, [trip.id]: trip },
          activeTripId: trip.id,
        }));

        return trip;
      },

      joinTrip: (inviteCode) => {
        const { currentUser, trips } = get();
        if (!currentUser) return null;

        const trip = Object.values(trips).find(
          (t) => t.invite_code === inviteCode.toUpperCase()
        );

        if (!trip) return null;

        // Already a member
        if (trip.members.some((m) => m.user_id === currentUser.id)) {
          set({ activeTripId: trip.id });
          return trip;
        }

        const newMember: TripMember = {
          user_id: currentUser.id,
          role: 'participant',
          joined_at: new Date(),
        };

        const activity: Activity = {
          id: uuidv4(),
          trip_id: trip.id,
          type: 'member_joined',
          user_id: currentUser.id,
          message: `${currentUser.name} joined the trip`,
          timestamp: new Date(),
        };

        set((state) => ({
          trips: {
            ...state.trips,
            [trip.id]: {
              ...trip,
              members: [...trip.members, newMember],
              activities: [...trip.activities, activity],
            },
          },
          activeTripId: trip.id,
        }));

        return trip;
      },

      setActiveTrip: (tripId) => set({ activeTripId: tripId }),
      setActiveCanvas: (canvas) => set({ activeCanvas: canvas }),

      updateTripStatus: (tripId, status) => {
        const { trips, currentUser, isOwner } = get();
        const trip = trips[tripId];
        if (!trip || !currentUser) return;

        // Only owner can change status
        if (!isOwner(tripId)) return;

        const activity: Activity = {
          id: uuidv4(),
          trip_id: tripId,
          type: 'status_changed',
          user_id: currentUser.id,
          message: `${currentUser.name} changed trip status to ${status}`,
          timestamp: new Date(),
        };

        set((state) => ({
          trips: {
            ...state.trips,
            [tripId]: {
              ...trip,
              status,
              activities: [...trip.activities, activity],
            },
          },
        }));
      },

      isOwner: (tripId) => {
        const { currentUser, trips } = get();
        if (!currentUser) return false;
        const trip = trips[tripId];
        return trip?.owner_id === currentUser.id;
      },

      canEdit: (tripId, canvas) => {
        const { trips } = get();
        const trip = trips[tripId];
        if (!trip) return false;

        // Can't edit if board is locked
        if (trip.canvases[canvas].settings.is_locked) return false;

        // Can't add ideas in finalized state
        if (trip.status === 'finalized') return false;

        return true;
      },

      canVote: (tripId) => {
        const { trips } = get();
        const trip = trips[tripId];
        if (!trip) return false;

        // Can vote in ideation or voting phase
        return trip.status === 'ideation' || trip.status === 'voting';
      },

      addIdea: (tripId, canvas, ideaData) => {
        const { currentUser, trips, canEdit } = get();
        if (!currentUser) return null;

        const trip = trips[tripId];
        if (!trip) return null;

        // Check if can edit
        if (!canEdit(tripId, canvas)) return null;

        const idea: Idea = {
          ...ideaData,
          id: uuidv4(),
          trip_id: tripId,
          canvas_type: canvas,
          created_at: new Date(),
          votes: [],
          comments: [],
          status: 'open',
        };

        const activity: Activity = {
          id: uuidv4(),
          trip_id: tripId,
          type: 'idea_added',
          user_id: currentUser.id,
          target_id: idea.id,
          target_type: canvas,
          message: `${currentUser.name} added "${idea.title}" to ${CANVAS_CONFIG[canvas].label}`,
          timestamp: new Date(),
        };

        set((state) => ({
          trips: {
            ...state.trips,
            [tripId]: {
              ...trip,
              canvases: {
                ...trip.canvases,
                [canvas]: {
                  ...trip.canvases[canvas],
                  ideas: [...trip.canvases[canvas].ideas, idea],
                },
              },
              activities: [...trip.activities, activity],
            },
          },
        }));

        return idea;
      },

      deleteIdea: (tripId, canvas, ideaId) => {
        const { trips, currentUser, isOwner } = get();
        const trip = trips[tripId];
        if (!trip || !currentUser) return;

        const idea = trip.canvases[canvas].ideas.find((i) => i.id === ideaId);
        if (!idea) return;

        // Only owner or idea creator can delete
        if (!isOwner(tripId) && idea.created_by !== currentUser.id) return;

        set((state) => ({
          trips: {
            ...state.trips,
            [tripId]: {
              ...trip,
              canvases: {
                ...trip.canvases,
                [canvas]: {
                  ...trip.canvases[canvas],
                  ideas: trip.canvases[canvas].ideas.filter((i) => i.id !== ideaId),
                  selected_idea_id:
                    trip.canvases[canvas].selected_idea_id === ideaId
                      ? undefined
                      : trip.canvases[canvas].selected_idea_id,
                },
              },
            },
          },
        }));
      },

      updateIdeaStatus: (tripId, canvas, ideaId, status) => {
        const { trips, currentUser, isOwner } = get();
        const trip = trips[tripId];
        if (!trip || !currentUser) return;

        // Only owner can change idea status to shortlisted/selected
        if (status !== 'open' && !isOwner(tripId)) return;

        const ideaIndex = trip.canvases[canvas].ideas.findIndex((i) => i.id === ideaId);
        if (ideaIndex === -1) return;

        const idea = trip.canvases[canvas].ideas[ideaIndex];
        const newIdeas = [...trip.canvases[canvas].ideas];
        newIdeas[ideaIndex] = { ...idea, status };

        const activityType: ActivityType = status === 'shortlisted' ? 'idea_shortlisted' : 'idea_selected';
        const activity: Activity = {
          id: uuidv4(),
          trip_id: tripId,
          type: activityType,
          user_id: currentUser.id,
          target_id: ideaId,
          target_type: canvas,
          message: `${currentUser.name} ${status === 'shortlisted' ? 'shortlisted' : 'selected'} "${idea.title}"`,
          timestamp: new Date(),
        };

        set((state) => ({
          trips: {
            ...state.trips,
            [tripId]: {
              ...trip,
              canvases: {
                ...trip.canvases,
                [canvas]: {
                  ...trip.canvases[canvas],
                  ideas: newIdeas,
                },
              },
              activities: [...trip.activities, activity],
            },
          },
        }));
      },

      voteOnIdea: (tripId, canvas, ideaId, value) => {
        const { currentUser, trips, canVote, getUserVotesRemaining, getUserVote } = get();
        if (!currentUser || !canVote(tripId)) return false;

        const trip = trips[tripId];
        if (!trip) return false;

        // Check if board is locked
        if (trip.canvases[canvas].settings.is_locked) return false;

        const ideaIndex = trip.canvases[canvas].ideas.findIndex((i) => i.id === ideaId);
        if (ideaIndex === -1) return false;

        const idea = trip.canvases[canvas].ideas[ideaIndex];
        const existingVote = getUserVote(idea, currentUser.id);

        // If changing vote direction, allow it
        // If new upvote, check remaining votes
        if (value === 1 && existingVote !== 1) {
          const remaining = getUserVotesRemaining(tripId, canvas);
          if (remaining <= 0) return false;
        }

        const existingVoteIndex = idea.votes.findIndex((v) => v.user_id === currentUser.id);

        let newVotes: Vote[];
        if (existingVoteIndex !== -1) {
          // Update existing vote
          newVotes = idea.votes.map((v, idx) =>
            idx === existingVoteIndex ? { ...v, value, timestamp: new Date() } : v
          );
        } else {
          // Add new vote
          newVotes = [
            ...idea.votes,
            { idea_id: ideaId, user_id: currentUser.id, value, timestamp: new Date() },
          ];
        }

        const newIdeas = [...trip.canvases[canvas].ideas];
        newIdeas[ideaIndex] = { ...idea, votes: newVotes };

        const activity: Activity = {
          id: uuidv4(),
          trip_id: tripId,
          type: 'idea_voted',
          user_id: currentUser.id,
          target_id: ideaId,
          target_type: canvas,
          message: `${currentUser.name} ${value === 1 ? 'upvoted' : 'downvoted'} "${idea.title}"`,
          timestamp: new Date(),
        };

        set((state) => ({
          trips: {
            ...state.trips,
            [tripId]: {
              ...trip,
              canvases: {
                ...trip.canvases,
                [canvas]: {
                  ...trip.canvases[canvas],
                  ideas: newIdeas,
                },
              },
              activities: [...trip.activities, activity],
            },
          },
        }));

        return true;
      },

      removeVote: (tripId, canvas, ideaId) => {
        const { currentUser, trips } = get();
        if (!currentUser) return;

        const trip = trips[tripId];
        if (!trip) return;

        const ideaIndex = trip.canvases[canvas].ideas.findIndex((i) => i.id === ideaId);
        if (ideaIndex === -1) return;

        const idea = trip.canvases[canvas].ideas[ideaIndex];
        const newVotes = idea.votes.filter((v) => v.user_id !== currentUser.id);

        const newIdeas = [...trip.canvases[canvas].ideas];
        newIdeas[ideaIndex] = { ...idea, votes: newVotes };

        set((state) => ({
          trips: {
            ...state.trips,
            [tripId]: {
              ...trip,
              canvases: {
                ...trip.canvases,
                [canvas]: {
                  ...trip.canvases[canvas],
                  ideas: newIdeas,
                },
              },
            },
          },
        }));
      },

      getUserVotesRemaining: (tripId, canvas) => {
        const { currentUser, trips } = get();
        if (!currentUser) return 0;

        const trip = trips[tripId];
        if (!trip) return 0;

        const maxVotes = trip.canvases[canvas].settings.votes_per_user;
        const usedVotes = trip.canvases[canvas].ideas.reduce((count, idea) => {
          const userVote = idea.votes.find((v) => v.user_id === currentUser.id);
          return count + (userVote && userVote.value === 1 ? 1 : 0);
        }, 0);

        return maxVotes - usedVotes;
      },

      addComment: (tripId, canvas, ideaId, content) => {
        const { currentUser, trips } = get();
        if (!currentUser) return null;

        const trip = trips[tripId];
        if (!trip) return null;

        const ideaIndex = trip.canvases[canvas].ideas.findIndex((i) => i.id === ideaId);
        if (ideaIndex === -1) return null;

        const comment: Comment = {
          id: uuidv4(),
          idea_id: ideaId,
          user_id: currentUser.id,
          content,
          timestamp: new Date(),
        };

        const idea = trip.canvases[canvas].ideas[ideaIndex];
        const newIdeas = [...trip.canvases[canvas].ideas];
        newIdeas[ideaIndex] = { ...idea, comments: [...idea.comments, comment] };

        const activity: Activity = {
          id: uuidv4(),
          trip_id: tripId,
          type: 'idea_commented',
          user_id: currentUser.id,
          target_id: ideaId,
          target_type: canvas,
          message: `${currentUser.name} commented on "${idea.title}"`,
          timestamp: new Date(),
        };

        set((state) => ({
          trips: {
            ...state.trips,
            [tripId]: {
              ...trip,
              canvases: {
                ...trip.canvases,
                [canvas]: {
                  ...trip.canvases[canvas],
                  ideas: newIdeas,
                },
              },
              activities: [...trip.activities, activity],
            },
          },
        }));

        return comment;
      },

      deleteComment: (tripId, canvas, ideaId, commentId) => {
        const { trips, currentUser, isOwner } = get();
        const trip = trips[tripId];
        if (!trip || !currentUser) return;

        const ideaIndex = trip.canvases[canvas].ideas.findIndex((i) => i.id === ideaId);
        if (ideaIndex === -1) return;

        const idea = trip.canvases[canvas].ideas[ideaIndex];
        const comment = idea.comments.find((c) => c.id === commentId);

        // Only owner or comment author can delete
        if (!comment || (!isOwner(tripId) && comment.user_id !== currentUser.id)) return;

        const newIdeas = [...trip.canvases[canvas].ideas];
        newIdeas[ideaIndex] = {
          ...idea,
          comments: idea.comments.filter((c) => c.id !== commentId),
        };

        set((state) => ({
          trips: {
            ...state.trips,
            [tripId]: {
              ...trip,
              canvases: {
                ...trip.canvases,
                [canvas]: {
                  ...trip.canvases[canvas],
                  ideas: newIdeas,
                },
              },
            },
          },
        }));
      },

      lockBoard: (tripId, canvas) => {
        const { trips, currentUser, isOwner } = get();
        const trip = trips[tripId];
        if (!trip || !currentUser || !isOwner(tripId)) return;

        const activity: Activity = {
          id: uuidv4(),
          trip_id: tripId,
          type: 'board_locked',
          user_id: currentUser.id,
          target_type: canvas,
          message: `${currentUser.name} locked the ${CANVAS_CONFIG[canvas].label} board`,
          timestamp: new Date(),
        };

        set((state) => ({
          trips: {
            ...state.trips,
            [tripId]: {
              ...trip,
              canvases: {
                ...trip.canvases,
                [canvas]: {
                  ...trip.canvases[canvas],
                  settings: {
                    ...trip.canvases[canvas].settings,
                    is_locked: true,
                    locked_at: new Date(),
                    locked_by: currentUser.id,
                  },
                },
              },
              activities: [...trip.activities, activity],
            },
          },
        }));
      },

      unlockBoard: (tripId, canvas) => {
        const { trips, currentUser, isOwner } = get();
        const trip = trips[tripId];
        if (!trip || !currentUser || !isOwner(tripId)) return;

        set((state) => ({
          trips: {
            ...state.trips,
            [tripId]: {
              ...trip,
              canvases: {
                ...trip.canvases,
                [canvas]: {
                  ...trip.canvases[canvas],
                  settings: {
                    ...trip.canvases[canvas].settings,
                    is_locked: false,
                    locked_at: undefined,
                    locked_by: undefined,
                  },
                },
              },
            },
          },
        }));
      },

      selectIdea: (tripId, canvas, ideaId) => {
        const { trips, currentUser, isOwner, updateIdeaStatus } = get();
        const trip = trips[tripId];
        if (!trip || !currentUser || !isOwner(tripId)) return;

        // Unselect previous selection
        const previousSelectedId = trip.canvases[canvas].selected_idea_id;
        if (previousSelectedId) {
          const prevIdeaIndex = trip.canvases[canvas].ideas.findIndex((i) => i.id === previousSelectedId);
          if (prevIdeaIndex !== -1) {
            const newIdeas = [...trip.canvases[canvas].ideas];
            newIdeas[prevIdeaIndex] = { ...newIdeas[prevIdeaIndex], status: 'open' };

            set((state) => ({
              trips: {
                ...state.trips,
                [tripId]: {
                  ...state.trips[tripId],
                  canvases: {
                    ...state.trips[tripId].canvases,
                    [canvas]: {
                      ...state.trips[tripId].canvases[canvas],
                      ideas: newIdeas,
                    },
                  },
                },
              },
            }));
          }
        }

        // Select new idea
        updateIdeaStatus(tripId, canvas, ideaId, 'selected');

        const updatedTrip = get().trips[tripId];
        set((state) => ({
          trips: {
            ...state.trips,
            [tripId]: {
              ...updatedTrip,
              canvases: {
                ...updatedTrip.canvases,
                [canvas]: {
                  ...updatedTrip.canvases[canvas],
                  selected_idea_id: ideaId,
                },
              },
            },
          },
        }));
      },

      unselectIdea: (tripId, canvas) => {
        const { trips, currentUser, isOwner } = get();
        const trip = trips[tripId];
        if (!trip || !currentUser || !isOwner(tripId)) return;

        const selectedId = trip.canvases[canvas].selected_idea_id;
        if (!selectedId) return;

        const ideaIndex = trip.canvases[canvas].ideas.findIndex((i) => i.id === selectedId);
        if (ideaIndex === -1) return;

        const newIdeas = [...trip.canvases[canvas].ideas];
        newIdeas[ideaIndex] = { ...newIdeas[ideaIndex], status: 'open' };

        set((state) => ({
          trips: {
            ...state.trips,
            [tripId]: {
              ...trip,
              canvases: {
                ...trip.canvases,
                [canvas]: {
                  ...trip.canvases[canvas],
                  ideas: newIdeas,
                  selected_idea_id: undefined,
                },
              },
            },
          },
        }));
      },

      addActivity: (tripId, type, message, targetId, targetType) => {
        const { currentUser, trips } = get();
        if (!currentUser) return;

        const trip = trips[tripId];
        if (!trip) return;

        const activity: Activity = {
          id: uuidv4(),
          trip_id: tripId,
          type,
          user_id: currentUser.id,
          target_id: targetId,
          target_type: targetType,
          message,
          timestamp: new Date(),
        };

        set((state) => ({
          trips: {
            ...state.trips,
            [tripId]: {
              ...trip,
              activities: [...trip.activities, activity],
            },
          },
        }));
      },

      getVoteScore: (idea) => {
        return idea.votes.reduce((sum, vote) => sum + vote.value, 0);
      },

      getUserVote: (idea, userId) => {
        const vote = idea.votes.find((v) => v.user_id === userId);
        return vote ? vote.value : null;
      },

      getIdeasSortedByVotes: (tripId, canvas) => {
        const { trips, getVoteScore } = get();
        const trip = trips[tripId];
        if (!trip) return [];

        return [...trip.canvases[canvas].ideas].sort((a, b) => {
          // Selected first
          if (a.status === 'selected' && b.status !== 'selected') return -1;
          if (a.status !== 'selected' && b.status === 'selected') return 1;
          // Then shortlisted
          if (a.status === 'shortlisted' && b.status === 'open') return -1;
          if (a.status === 'open' && b.status === 'shortlisted') return 1;
          // Then by vote score
          return getVoteScore(b) - getVoteScore(a);
        });
      },

      getFinalPlan: (tripId) => {
        const { trips } = get();
        const trip = trips[tripId];
        if (!trip) return null;

        const getSelectedIdea = (canvas: CanvasType): Idea | undefined => {
          const selectedId = trip.canvases[canvas].selected_idea_id;
          return selectedId
            ? trip.canvases[canvas].ideas.find((i) => i.id === selectedId)
            : undefined;
        };

        const getSelectedIdeas = (canvas: CanvasType): Idea[] => {
          return trip.canvases[canvas].ideas.filter((i) => i.status === 'selected');
        };

        return {
          dates: getSelectedIdea('dates'),
          location: getSelectedIdea('location'),
          accommodation: getSelectedIdea('accommodation'),
          activities: getSelectedIdeas('activities'),
          food: getSelectedIdeas('food'),
          transportation: getSelectedIdea('transportation'),
        };
      },

      getTripActivities: (tripId, limit = 50) => {
        const { trips } = get();
        const trip = trips[tripId];
        if (!trip) return [];

        return [...trip.activities]
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, limit);
      },

      getMemberInfo: (tripId, userId) => {
        const { trips, users } = get();
        const trip = trips[tripId];
        if (!trip) return null;

        const member = trip.members.find((m) => m.user_id === userId);
        const user = users[userId];
        if (!member || !user) return null;

        return { user, member };
      },
    }),
    {
      name: 'tripboard-storage',
      partialize: (state) => ({
        currentUser: state.currentUser,
        users: state.users,
        trips: state.trips,
      }),
    }
  )
);
