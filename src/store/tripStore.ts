import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type {
  User,
  Trip,
  Idea,
  Comment,
  Vote,
  Group,
  CanvasType,
  Canvas,
} from '../types';

// Helper to generate avatar colors
const AVATAR_COLORS = [
  '#f87171', '#fb923c', '#fbbf24', '#a3e635', '#4ade80',
  '#2dd4bf', '#38bdf8', '#818cf8', '#c084fc', '#f472b6',
];

const getRandomColor = () => AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];

// Initial canvas state
const createEmptyCanvases = (tripId: string): Record<CanvasType, Canvas> => ({
  dates: { type: 'dates', trip_id: tripId, ideas: [] },
  location: { type: 'location', trip_id: tripId, ideas: [] },
  accommodation: { type: 'accommodation', trip_id: tripId, ideas: [] },
  activities: { type: 'activities', trip_id: tripId, ideas: [] },
  food: { type: 'food', trip_id: tripId, ideas: [] },
  transportation: { type: 'transportation', trip_id: tripId, ideas: [] },
});

interface TripState {
  // Current user
  currentUser: User | null;

  // Data
  users: Record<string, User>;
  groups: Record<string, Group>;
  trips: Record<string, Trip>;

  // UI State
  activeGroupId: string | null;
  activeTripId: string | null;
  activeCanvas: CanvasType;

  // User actions
  setCurrentUser: (user: User) => void;
  createUser: (name: string, email: string) => User;

  // Group actions
  createGroup: (name: string, description: string) => Group;
  joinGroup: (inviteCode: string) => Group | null;
  setActiveGroup: (groupId: string | null) => void;

  // Trip actions
  createTrip: (groupId: string, name: string, description: string, coverImage?: string) => Trip;
  setActiveTrip: (tripId: string | null) => void;
  setActiveCanvas: (canvas: CanvasType) => void;

  // Idea actions
  addIdea: (tripId: string, canvas: CanvasType, idea: Omit<Idea, 'id' | 'trip_id' | 'canvas_type' | 'created_at' | 'votes' | 'comments' | 'is_finalized'>) => Idea;
  deleteIdea: (tripId: string, canvas: CanvasType, ideaId: string) => void;

  // Voting actions
  voteOnIdea: (tripId: string, canvas: CanvasType, ideaId: string, value: 1 | -1) => void;
  removeVote: (tripId: string, canvas: CanvasType, ideaId: string) => void;

  // Comment actions
  addComment: (tripId: string, canvas: CanvasType, ideaId: string, content: string) => Comment;
  deleteComment: (tripId: string, canvas: CanvasType, ideaId: string, commentId: string) => void;

  // Finalization actions
  finalizeIdea: (tripId: string, canvas: CanvasType, ideaId: string) => void;
  unfinalizeIdea: (tripId: string, canvas: CanvasType) => void;
  finalizeTrip: (tripId: string) => void;

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
}

export const useTripStore = create<TripState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      users: {},
      groups: {},
      trips: {},
      activeGroupId: null,
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

      createGroup: (name, description) => {
        const { currentUser } = get();
        if (!currentUser) throw new Error('Must be logged in to create a group');

        const group: Group = {
          id: uuidv4(),
          name,
          description,
          members: [currentUser],
          trips: [],
          created_by: currentUser.id,
          created_at: new Date(),
          invite_code: uuidv4().slice(0, 8).toUpperCase(),
        };

        set((state) => ({
          groups: { ...state.groups, [group.id]: group },
          activeGroupId: group.id,
        }));

        return group;
      },

      joinGroup: (inviteCode) => {
        const { currentUser, groups } = get();
        if (!currentUser) return null;

        const group = Object.values(groups).find(
          (g) => g.invite_code === inviteCode.toUpperCase()
        );

        if (!group) return null;

        if (group.members.some((m) => m.id === currentUser.id)) {
          return group;
        }

        set((state) => ({
          groups: {
            ...state.groups,
            [group.id]: {
              ...group,
              members: [...group.members, currentUser],
            },
          },
          activeGroupId: group.id,
        }));

        return group;
      },

      setActiveGroup: (groupId) => set({ activeGroupId: groupId }),

      createTrip: (groupId, name, description, coverImage) => {
        const { currentUser, groups } = get();
        if (!currentUser) throw new Error('Must be logged in to create a trip');

        const group = groups[groupId];
        if (!group) throw new Error('Group not found');

        const tripId = uuidv4();
        const trip: Trip = {
          id: tripId,
          name,
          description,
          cover_image: coverImage,
          created_by: currentUser.id,
          created_at: new Date(),
          members: group.members.map((m) => m.id),
          canvases: createEmptyCanvases(tripId),
          is_finalized: false,
        };

        set((state) => ({
          trips: { ...state.trips, [trip.id]: trip },
          groups: {
            ...state.groups,
            [groupId]: {
              ...group,
              trips: [...group.trips, trip.id],
            },
          },
          activeTripId: trip.id,
        }));

        return trip;
      },

      setActiveTrip: (tripId) => set({ activeTripId: tripId }),
      setActiveCanvas: (canvas) => set({ activeCanvas: canvas }),

      addIdea: (tripId, canvas, ideaData) => {
        const { currentUser, trips } = get();
        if (!currentUser) throw new Error('Must be logged in');

        const trip = trips[tripId];
        if (!trip) throw new Error('Trip not found');

        const idea: Idea = {
          ...ideaData,
          id: uuidv4(),
          trip_id: tripId,
          canvas_type: canvas,
          created_at: new Date(),
          votes: [],
          comments: [],
          is_finalized: false,
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
            },
          },
        }));

        return idea;
      },

      deleteIdea: (tripId, canvas, ideaId) => {
        const { trips } = get();
        const trip = trips[tripId];
        if (!trip) return;

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
                  finalized_idea_id:
                    trip.canvases[canvas].finalized_idea_id === ideaId
                      ? undefined
                      : trip.canvases[canvas].finalized_idea_id,
                },
              },
            },
          },
        }));
      },

      voteOnIdea: (tripId, canvas, ideaId, value) => {
        const { currentUser, trips } = get();
        if (!currentUser) return;

        const trip = trips[tripId];
        if (!trip) return;

        const ideaIndex = trip.canvases[canvas].ideas.findIndex((i) => i.id === ideaId);
        if (ideaIndex === -1) return;

        const idea = trip.canvases[canvas].ideas[ideaIndex];
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
            { odea_id: ideaId, user_id: currentUser.id, value, timestamp: new Date() },
          ];
        }

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

      addComment: (tripId, canvas, ideaId, content) => {
        const { currentUser, trips } = get();
        if (!currentUser) throw new Error('Must be logged in');

        const trip = trips[tripId];
        if (!trip) throw new Error('Trip not found');

        const ideaIndex = trip.canvases[canvas].ideas.findIndex((i) => i.id === ideaId);
        if (ideaIndex === -1) throw new Error('Idea not found');

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

        return comment;
      },

      deleteComment: (tripId, canvas, ideaId, commentId) => {
        const { trips } = get();
        const trip = trips[tripId];
        if (!trip) return;

        const ideaIndex = trip.canvases[canvas].ideas.findIndex((i) => i.id === ideaId);
        if (ideaIndex === -1) return;

        const idea = trip.canvases[canvas].ideas[ideaIndex];
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

      finalizeIdea: (tripId, canvas, ideaId) => {
        const { trips } = get();
        const trip = trips[tripId];
        if (!trip) return;

        const ideaIndex = trip.canvases[canvas].ideas.findIndex((i) => i.id === ideaId);
        if (ideaIndex === -1) return;

        // Unfinalize all other ideas in this canvas
        const newIdeas = trip.canvases[canvas].ideas.map((idea) => ({
          ...idea,
          is_finalized: idea.id === ideaId,
        }));

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
                  finalized_idea_id: ideaId,
                },
              },
            },
          },
        }));
      },

      unfinalizeIdea: (tripId, canvas) => {
        const { trips } = get();
        const trip = trips[tripId];
        if (!trip) return;

        const newIdeas = trip.canvases[canvas].ideas.map((idea) => ({
          ...idea,
          is_finalized: false,
        }));

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
                  finalized_idea_id: undefined,
                },
              },
            },
          },
        }));
      },

      finalizeTrip: (tripId) => {
        const { trips } = get();
        const trip = trips[tripId];
        if (!trip) return;

        set((state) => ({
          trips: {
            ...state.trips,
            [tripId]: {
              ...trip,
              is_finalized: true,
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
          // Finalized ideas first
          if (a.is_finalized && !b.is_finalized) return -1;
          if (!a.is_finalized && b.is_finalized) return 1;
          // Then by vote score
          return getVoteScore(b) - getVoteScore(a);
        });
      },

      getFinalPlan: (tripId) => {
        const { trips } = get();
        const trip = trips[tripId];
        if (!trip) return null;

        const getFinalizedIdea = (canvas: CanvasType): Idea | undefined => {
          const finalizedId = trip.canvases[canvas].finalized_idea_id;
          return finalizedId
            ? trip.canvases[canvas].ideas.find((i) => i.id === finalizedId)
            : undefined;
        };

        const getFinalizedIdeas = (canvas: CanvasType): Idea[] => {
          return trip.canvases[canvas].ideas.filter((i) => i.is_finalized);
        };

        return {
          dates: getFinalizedIdea('dates'),
          location: getFinalizedIdea('location'),
          accommodation: getFinalizedIdea('accommodation'),
          activities: getFinalizedIdeas('activities'),
          food: getFinalizedIdeas('food'),
          transportation: getFinalizedIdea('transportation'),
        };
      },
    }),
    {
      name: 'tripboard-storage',
      partialize: (state) => ({
        currentUser: state.currentUser,
        users: state.users,
        groups: state.groups,
        trips: state.trips,
      }),
    }
  )
);
