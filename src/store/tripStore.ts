import { create } from 'zustand';
import type {
  User,
  Trip,
  Idea,
  Comment,
  CanvasType,
  TripStatus,
  CardStatus,
  Activity,
} from '../types';
import * as firestoreService from '../lib/firestore';
import { toDate } from '../lib/dateUtils';

interface TripState {
  // Current user
  currentUser: User | null;
  isAuthLoading: boolean;

  // Data
  users: Record<string, User>;
  trips: Record<string, Trip>;
  activeSubscriptions: Map<string, () => void>;

  // UI State
  activeTripId: string | null;
  activeCanvas: CanvasType;

  // User actions
  setCurrentUser: (user: User | null) => void;
  setAuthLoading: (loading: boolean) => void;
  addUser: (user: User) => void;
  updateUserProfile: (profile: Partial<Pick<User, 'bio' | 'location' | 'favoriteDestination' | 'travelStyle'>>) => Promise<void>;

  // Trip actions
  createTrip: (name: string, description: string, coverImage?: string, isPublic?: boolean) => Promise<Trip | null>;
  joinTrip: (inviteCode: string) => Promise<Trip | null>;
  deleteTrip: (tripId: string) => Promise<boolean>;
  setActiveTrip: (tripId: string | null) => void;
  setActiveCanvas: (canvas: CanvasType) => void;
  updateTripStatus: (tripId: string, status: TripStatus) => Promise<void>;
  updateTripPrivacy: (tripId: string, isPublic: boolean) => Promise<void>;
  subscribeToTrip: (tripId: string) => void;
  subscribeToUserTrips: () => void;
  unsubscribeFromTrip: (tripId: string) => void;
  unsubscribeFromAll: () => void;

  // Permission helpers
  isOwner: (tripId: string) => boolean;
  canEdit: (tripId: string, canvas: CanvasType) => boolean;
  canVote: (tripId: string) => boolean;

  // Idea actions
  addIdea: (tripId: string, canvas: CanvasType, idea: Omit<Idea, 'id' | 'trip_id' | 'canvas_type' | 'created_at' | 'votes' | 'comments' | 'status'>) => Promise<Idea | null>;
  deleteIdea: (tripId: string, canvas: CanvasType, ideaId: string) => Promise<void>;
  updateIdeaStatus: (tripId: string, canvas: CanvasType, ideaId: string, status: CardStatus) => Promise<void>;

  // Voting actions
  voteOnIdea: (tripId: string, canvas: CanvasType, ideaId: string, value: 1 | -1) => Promise<boolean>;
  removeVote: (tripId: string, canvas: CanvasType, ideaId: string) => Promise<void>;
  getUserVotesRemaining: (tripId: string, canvas: CanvasType) => number;

  // Comment actions
  addComment: (tripId: string, canvas: CanvasType, ideaId: string, content: string) => Promise<Comment | null>;
  deleteComment: (tripId: string, canvas: CanvasType, ideaId: string, commentId: string) => Promise<void>;

  // Board actions
  lockBoard: (tripId: string, canvas: CanvasType) => Promise<void>;
  unlockBoard: (tripId: string, canvas: CanvasType) => Promise<void>;
  selectIdea: (tripId: string, canvas: CanvasType, ideaId: string) => Promise<void>;
  unselectIdea: (tripId: string, canvas: CanvasType) => Promise<void>;

  // Helper functions
  getVoteScore: (idea: Idea) => number;
  getUserVote: (idea: Idea, userId: string) => 1 | -1 | null;
  getIdeasSortedByVotes: (tripId: string, canvas: CanvasType) => Idea[];
  getFinalPlan: (tripId: string) => {
    dates?: Idea;
    location?: Idea;
    accommodation: Idea[];
    activities: Idea[];
    food: Idea[];
    transportation: Idea[];
  } | null;
  getTripActivities: (tripId: string, limit?: number) => Activity[];
}

export const useTripStore = create<TripState>()((set, get) => ({
  currentUser: null,
  isAuthLoading: true,
  users: {},
  trips: {},
  activeSubscriptions: new Map(),
  activeTripId: null,
  activeCanvas: 'dates',

  setCurrentUser: (user) => {
    set({ currentUser: user });
    if (user) {
      // Add user to local cache
      set((state) => ({
        users: { ...state.users, [user.id]: user },
      }));
      // Subscribe to user's trips
      get().subscribeToUserTrips();
    } else {
      // Unsubscribe from all when logging out
      get().unsubscribeFromAll();
      set({ trips: {}, activeTripId: null });
    }
  },

  setAuthLoading: (loading) => set({ isAuthLoading: loading }),

  addUser: (user) => {
    set((state) => ({
      users: { ...state.users, [user.id]: user },
    }));
  },

  updateUserProfile: async (profile) => {
    const { currentUser } = get();
    if (!currentUser) return;

    const updatedUser = {
      ...currentUser,
      ...profile,
    };

    // Update local state
    set((state) => ({
      currentUser: updatedUser,
      users: { ...state.users, [updatedUser.id]: updatedUser },
    }));

    // Note: In a real app, you'd also persist this to Firestore
    // For now, this is stored in local state only
  },

  createTrip: async (name, description, coverImage, isPublic = false) => {
    const { currentUser } = get();
    if (!currentUser) return null;

    try {
      const trip = await firestoreService.createTrip(
        name,
        description,
        currentUser.id,
        currentUser.name,
        coverImage,
        isPublic
      );

      set((state) => ({
        trips: { ...state.trips, [trip.id]: trip },
        activeTripId: trip.id,
      }));

      // Subscribe to real-time updates
      get().subscribeToTrip(trip.id);

      return trip;
    } catch (error) {
      console.error('Error creating trip:', error);
      return null;
    }
  },

  updateTripPrivacy: async (tripId, isPublic) => {
    try {
      await firestoreService.updateTripPrivacy(tripId, isPublic);
      set((state) => ({
        trips: {
          ...state.trips,
          [tripId]: { ...state.trips[tripId], isPublic },
        },
      }));
    } catch (error) {
      console.error('Error updating trip privacy:', error);
    }
  },

  joinTrip: async (inviteCode) => {
    const { currentUser } = get();
    if (!currentUser) return null;

    try {
      const trip = await firestoreService.getTripByInviteCode(inviteCode);
      if (!trip) return null;

      const updatedTrip = await firestoreService.joinTrip(
        trip.id,
        currentUser.id,
        currentUser.name
      );

      if (updatedTrip) {
        set((state) => ({
          trips: { ...state.trips, [updatedTrip.id]: updatedTrip },
          activeTripId: updatedTrip.id,
        }));

        // Subscribe to real-time updates
        get().subscribeToTrip(updatedTrip.id);
      }

      return updatedTrip;
    } catch (error) {
      console.error('Error joining trip:', error);
      return null;
    }
  },

  deleteTrip: async (tripId) => {
    const { currentUser, isOwner, unsubscribeFromTrip } = get();
    if (!currentUser || !isOwner(tripId)) return false;

    try {
      const success = await firestoreService.deleteTrip(tripId, currentUser.id);
      if (success) {
        unsubscribeFromTrip(tripId);
        set((state) => {
          const newTrips = { ...state.trips };
          delete newTrips[tripId];
          return {
            trips: newTrips,
            activeTripId: state.activeTripId === tripId ? null : state.activeTripId,
          };
        });
      }
      return success;
    } catch (error) {
      console.error('Error deleting trip:', error);
      return false;
    }
  },

  setActiveTrip: (tripId) => {
    set({ activeTripId: tripId });
    if (tripId) {
      get().subscribeToTrip(tripId);
    }
  },

  setActiveCanvas: (canvas) => set({ activeCanvas: canvas }),

  subscribeToTrip: (tripId) => {
    const { activeSubscriptions } = get();

    // Don't resubscribe if already subscribed
    if (activeSubscriptions.has(tripId)) return;

    const unsubscribe = firestoreService.subscribeToTrip(tripId, (trip) => {
      if (trip) {
        set((state) => ({
          trips: { ...state.trips, [tripId]: trip },
        }));
      }
    });

    set((state) => {
      const newSubscriptions = new Map(state.activeSubscriptions);
      newSubscriptions.set(tripId, unsubscribe);
      return { activeSubscriptions: newSubscriptions };
    });
  },

  subscribeToUserTrips: () => {
    const { currentUser, activeSubscriptions } = get();
    if (!currentUser) return;

    const subscriptionKey = `user_trips_${currentUser.id}`;
    if (activeSubscriptions.has(subscriptionKey)) return;

    const unsubscribe = firestoreService.subscribeToUserTrips(currentUser.id, (trips) => {
      const tripsMap: Record<string, Trip> = {};
      trips.forEach((trip) => {
        tripsMap[trip.id] = trip;
      });
      set({ trips: tripsMap });
    });

    set((state) => {
      const newSubscriptions = new Map(state.activeSubscriptions);
      newSubscriptions.set(subscriptionKey, unsubscribe);
      return { activeSubscriptions: newSubscriptions };
    });
  },

  unsubscribeFromTrip: (tripId) => {
    const { activeSubscriptions } = get();
    const unsubscribe = activeSubscriptions.get(tripId);
    if (unsubscribe) {
      unsubscribe();
      set((state) => {
        const newSubscriptions = new Map(state.activeSubscriptions);
        newSubscriptions.delete(tripId);
        return { activeSubscriptions: newSubscriptions };
      });
    }
  },

  unsubscribeFromAll: () => {
    const { activeSubscriptions } = get();
    activeSubscriptions.forEach((unsubscribe) => unsubscribe());
    set({ activeSubscriptions: new Map() });
  },

  updateTripStatus: async (tripId, status) => {
    const { currentUser, isOwner } = get();
    if (!currentUser || !isOwner(tripId)) return;

    try {
      await firestoreService.updateTripStatus(tripId, status, currentUser.id, currentUser.name);
    } catch (error) {
      console.error('Error updating trip status:', error);
    }
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
    if (trip.canvases[canvas].settings.is_locked) return false;
    if (trip.status === 'finalized') return false;
    return true;
  },

  canVote: (tripId) => {
    const { trips } = get();
    const trip = trips[tripId];
    if (!trip) return false;
    return trip.status === 'ideation' || trip.status === 'voting';
  },

  addIdea: async (tripId, canvas, ideaData) => {
    const { currentUser, canEdit } = get();
    if (!currentUser || !canEdit(tripId, canvas)) return null;

    try {
      return await firestoreService.addIdea(tripId, canvas, ideaData, currentUser.name);
    } catch (error) {
      console.error('Error adding idea:', error);
      return null;
    }
  },

  deleteIdea: async (tripId, canvas, ideaId) => {
    const { currentUser, trips, isOwner } = get();
    const trip = trips[tripId];
    if (!trip || !currentUser) return;

    const idea = trip.canvases[canvas].ideas.find((i) => i.id === ideaId);
    if (!idea) return;

    // Only owner or idea creator can delete
    if (!isOwner(tripId) && idea.created_by !== currentUser.id) return;

    try {
      await firestoreService.deleteIdea(tripId, canvas, ideaId);
    } catch (error) {
      console.error('Error deleting idea:', error);
    }
  },

  updateIdeaStatus: async (tripId, canvas, ideaId, status) => {
    const { currentUser, isOwner } = get();
    if (!currentUser) return;
    if (status !== 'open' && !isOwner(tripId)) return;

    try {
      await firestoreService.updateIdeaStatus(tripId, canvas, ideaId, status, currentUser.id, currentUser.name);
    } catch (error) {
      console.error('Error updating idea status:', error);
    }
  },

  voteOnIdea: async (tripId, canvas, ideaId, value) => {
    const { currentUser, canVote } = get();
    if (!currentUser || !canVote(tripId)) return false;

    try {
      return await firestoreService.voteOnIdea(tripId, canvas, ideaId, currentUser.id, currentUser.name, value);
    } catch (error) {
      console.error('Error voting:', error);
      return false;
    }
  },

  removeVote: async (tripId, canvas, ideaId) => {
    const { currentUser } = get();
    if (!currentUser) return;

    try {
      await firestoreService.removeVote(tripId, canvas, ideaId, currentUser.id);
    } catch (error) {
      console.error('Error removing vote:', error);
    }
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

  addComment: async (tripId, canvas, ideaId, content) => {
    const { currentUser } = get();
    if (!currentUser) return null;

    try {
      return await firestoreService.addComment(tripId, canvas, ideaId, currentUser.id, currentUser.name, content);
    } catch (error) {
      console.error('Error adding comment:', error);
      return null;
    }
  },

  deleteComment: async (tripId, canvas, ideaId, commentId) => {
    const { trips, currentUser, isOwner } = get();
    const trip = trips[tripId];
    if (!trip || !currentUser) return;

    const idea = trip.canvases[canvas].ideas.find((i) => i.id === ideaId);
    if (!idea) return;

    const comment = idea.comments.find((c) => c.id === commentId);
    if (!comment || (!isOwner(tripId) && comment.user_id !== currentUser.id)) return;

    try {
      await firestoreService.deleteComment(tripId, canvas, ideaId, commentId);
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  },

  lockBoard: async (tripId, canvas) => {
    const { currentUser, isOwner } = get();
    if (!currentUser || !isOwner(tripId)) return;

    try {
      await firestoreService.lockBoard(tripId, canvas, currentUser.id, currentUser.name);
    } catch (error) {
      console.error('Error locking board:', error);
    }
  },

  unlockBoard: async (tripId, canvas) => {
    const { isOwner } = get();
    if (!isOwner(tripId)) return;

    try {
      await firestoreService.unlockBoard(tripId, canvas);
    } catch (error) {
      console.error('Error unlocking board:', error);
    }
  },

  selectIdea: async (tripId, canvas, ideaId) => {
    const { currentUser, isOwner } = get();
    if (!currentUser || !isOwner(tripId)) return;

    try {
      await firestoreService.selectIdea(tripId, canvas, ideaId, currentUser.id, currentUser.name);
    } catch (error) {
      console.error('Error selecting idea:', error);
    }
  },

  unselectIdea: async (tripId, canvas) => {
    const { isOwner } = get();
    if (!isOwner(tripId)) return;

    try {
      await firestoreService.unselectIdea(tripId, canvas);
    } catch (error) {
      console.error('Error unselecting idea:', error);
    }
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
      if (a.status === 'selected' && b.status !== 'selected') return -1;
      if (a.status !== 'selected' && b.status === 'selected') return 1;
      if (a.status === 'shortlisted' && b.status === 'open') return -1;
      if (a.status === 'open' && b.status === 'shortlisted') return 1;
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
      accommodation: getSelectedIdeas('accommodation'),
      activities: getSelectedIdeas('activities'),
      food: getSelectedIdeas('food'),
      transportation: getSelectedIdeas('transportation'),
    };
  },

  getTripActivities: (tripId, limit = 50) => {
    const { trips } = get();
    const trip = trips[tripId];
    if (!trip) return [];

    return [...trip.activities]
      .sort((a, b) => toDate(b.timestamp).getTime() - toDate(a.timestamp).getTime())
      .slice(0, limit);
  },
}));
