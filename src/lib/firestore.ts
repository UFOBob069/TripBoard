import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  onSnapshot,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import type {
  Trip,
  Idea,
  Comment,
  Vote,
  CanvasType,
  TripStatus,
  CardStatus,
  Activity,
  ActivityType,
  TripMember,
  BoardSettings,
} from '../types';
import { CANVAS_CONFIG } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Collections
const TRIPS_COLLECTION = 'trips';

// Helper to create default board settings
const createDefaultBoardSettings = (canvasType: CanvasType): BoardSettings => ({
  votes_per_user: CANVAS_CONFIG[canvasType].defaultVotesPerUser,
  is_locked: false,
});

// Helper to create empty canvases
const createEmptyCanvases = (tripId: string) => ({
  dates: { type: 'dates' as CanvasType, trip_id: tripId, ideas: [], settings: createDefaultBoardSettings('dates') },
  location: { type: 'location' as CanvasType, trip_id: tripId, ideas: [], settings: createDefaultBoardSettings('location') },
  accommodation: { type: 'accommodation' as CanvasType, trip_id: tripId, ideas: [], settings: createDefaultBoardSettings('accommodation') },
  activities: { type: 'activities' as CanvasType, trip_id: tripId, ideas: [], settings: createDefaultBoardSettings('activities') },
  food: { type: 'food' as CanvasType, trip_id: tripId, ideas: [], settings: createDefaultBoardSettings('food') },
  transportation: { type: 'transportation' as CanvasType, trip_id: tripId, ideas: [], settings: createDefaultBoardSettings('transportation') },
});

// ============ TRIP OPERATIONS ============

// Create a new trip
export const createTrip = async (
  name: string,
  description: string,
  ownerId: string,
  ownerName: string,
  coverImage?: string
): Promise<Trip> => {
  const tripId = uuidv4();
  const inviteCode = uuidv4().slice(0, 8).toUpperCase();

  const activity: Activity = {
    id: uuidv4(),
    trip_id: tripId,
    type: 'trip_created',
    user_id: ownerId,
    message: `${ownerName} created the trip "${name}"`,
    timestamp: new Date(),
  };

  const trip: Trip = {
    id: tripId,
    name,
    description,
    cover_image: coverImage,
    owner_id: ownerId,
    created_at: new Date(),
    members: [{
      user_id: ownerId,
      role: 'owner',
      joined_at: new Date(),
    }],
    canvases: createEmptyCanvases(tripId),
    status: 'ideation',
    invite_code: inviteCode,
    activities: [activity],
  };

  await setDoc(doc(db, TRIPS_COLLECTION, tripId), trip);
  return trip;
};

// Get trip by ID
export const getTrip = async (tripId: string): Promise<Trip | null> => {
  const tripDoc = await getDoc(doc(db, TRIPS_COLLECTION, tripId));
  if (tripDoc.exists()) {
    return tripDoc.data() as Trip;
  }
  return null;
};

// Get trip by invite code
export const getTripByInviteCode = async (inviteCode: string): Promise<Trip | null> => {
  const q = query(
    collection(db, TRIPS_COLLECTION),
    where('invite_code', '==', inviteCode.toUpperCase())
  );
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    return querySnapshot.docs[0].data() as Trip;
  }
  return null;
};

// Get all trips for a user
export const getUserTrips = async (userId: string): Promise<Trip[]> => {
  // Firebase doesn't support array-contains on objects well, so we get all and filter
  const allTripsSnapshot = await getDocs(collection(db, TRIPS_COLLECTION));
  const trips: Trip[] = [];

  allTripsSnapshot.forEach((docSnap) => {
    const trip = docSnap.data() as Trip;
    if (trip.members.some((m) => m.user_id === userId)) {
      trips.push(trip);
    }
  });

  return trips;
};

// Join a trip
export const joinTrip = async (
  tripId: string,
  userId: string,
  userName: string
): Promise<Trip | null> => {
  const tripRef = doc(db, TRIPS_COLLECTION, tripId);
  const tripDoc = await getDoc(tripRef);

  if (!tripDoc.exists()) return null;

  const trip = tripDoc.data() as Trip;

  // Check if already a member
  if (trip.members.some((m) => m.user_id === userId)) {
    return trip;
  }

  const newMember: TripMember = {
    user_id: userId,
    role: 'participant',
    joined_at: new Date(),
  };

  const activity: Activity = {
    id: uuidv4(),
    trip_id: tripId,
    type: 'member_joined',
    user_id: userId,
    message: `${userName} joined the trip`,
    timestamp: new Date(),
  };

  await updateDoc(tripRef, {
    members: [...trip.members, newMember],
    activities: [...trip.activities, activity],
  });

  return { ...trip, members: [...trip.members, newMember] };
};

// Update trip status
export const updateTripStatus = async (
  tripId: string,
  status: TripStatus,
  userId: string,
  userName: string
): Promise<void> => {
  const tripRef = doc(db, TRIPS_COLLECTION, tripId);
  const tripDoc = await getDoc(tripRef);

  if (!tripDoc.exists()) return;

  const trip = tripDoc.data() as Trip;

  const activity: Activity = {
    id: uuidv4(),
    trip_id: tripId,
    type: 'status_changed',
    user_id: userId,
    message: `${userName} changed trip status to ${status}`,
    timestamp: new Date(),
  };

  await updateDoc(tripRef, {
    status,
    activities: [...trip.activities, activity],
  });
};

// ============ IDEA OPERATIONS ============

// Add an idea
export const addIdea = async (
  tripId: string,
  canvasType: CanvasType,
  ideaData: Omit<Idea, 'id' | 'trip_id' | 'canvas_type' | 'created_at' | 'votes' | 'comments' | 'status'>,
  userName: string
): Promise<Idea | null> => {
  const tripRef = doc(db, TRIPS_COLLECTION, tripId);
  const tripDoc = await getDoc(tripRef);

  if (!tripDoc.exists()) return null;

  const trip = tripDoc.data() as Trip;

  // Check if board is locked or trip is finalized
  if (trip.canvases[canvasType].settings.is_locked || trip.status === 'finalized') {
    return null;
  }

  const idea: Idea = {
    ...ideaData,
    id: uuidv4(),
    trip_id: tripId,
    canvas_type: canvasType,
    created_at: new Date(),
    votes: [],
    comments: [],
    status: 'open',
  };

  const activity: Activity = {
    id: uuidv4(),
    trip_id: tripId,
    type: 'idea_added',
    user_id: ideaData.created_by,
    target_id: idea.id,
    target_type: canvasType,
    message: `${userName} added "${idea.title}" to ${CANVAS_CONFIG[canvasType].label}`,
    timestamp: new Date(),
  };

  const updatedCanvas = {
    ...trip.canvases[canvasType],
    ideas: [...trip.canvases[canvasType].ideas, idea],
  };

  await updateDoc(tripRef, {
    [`canvases.${canvasType}`]: updatedCanvas,
    activities: [...trip.activities, activity],
  });

  return idea;
};

// Delete an idea
export const deleteIdea = async (
  tripId: string,
  canvasType: CanvasType,
  ideaId: string
): Promise<void> => {
  const tripRef = doc(db, TRIPS_COLLECTION, tripId);
  const tripDoc = await getDoc(tripRef);

  if (!tripDoc.exists()) return;

  const trip = tripDoc.data() as Trip;
  const updatedIdeas = trip.canvases[canvasType].ideas.filter((i) => i.id !== ideaId);

  const updatedCanvas = {
    ...trip.canvases[canvasType],
    ideas: updatedIdeas,
    selected_idea_id:
      trip.canvases[canvasType].selected_idea_id === ideaId
        ? undefined
        : trip.canvases[canvasType].selected_idea_id,
  };

  await updateDoc(tripRef, {
    [`canvases.${canvasType}`]: updatedCanvas,
  });
};

// Update idea status
export const updateIdeaStatus = async (
  tripId: string,
  canvasType: CanvasType,
  ideaId: string,
  status: CardStatus,
  userId: string,
  userName: string
): Promise<void> => {
  const tripRef = doc(db, TRIPS_COLLECTION, tripId);
  const tripDoc = await getDoc(tripRef);

  if (!tripDoc.exists()) return;

  const trip = tripDoc.data() as Trip;
  const ideaIndex = trip.canvases[canvasType].ideas.findIndex((i) => i.id === ideaId);

  if (ideaIndex === -1) return;

  const idea = trip.canvases[canvasType].ideas[ideaIndex];
  const updatedIdeas = [...trip.canvases[canvasType].ideas];
  updatedIdeas[ideaIndex] = { ...idea, status };

  const activityType: ActivityType = status === 'shortlisted' ? 'idea_shortlisted' : 'idea_selected';
  const activity: Activity = {
    id: uuidv4(),
    trip_id: tripId,
    type: activityType,
    user_id: userId,
    target_id: ideaId,
    target_type: canvasType,
    message: `${userName} ${status === 'shortlisted' ? 'shortlisted' : 'selected'} "${idea.title}"`,
    timestamp: new Date(),
  };

  await updateDoc(tripRef, {
    [`canvases.${canvasType}.ideas`]: updatedIdeas,
    activities: [...trip.activities, activity],
  });
};

// Select an idea (and unselect previous)
export const selectIdea = async (
  tripId: string,
  canvasType: CanvasType,
  ideaId: string,
  userId: string,
  userName: string
): Promise<void> => {
  const tripRef = doc(db, TRIPS_COLLECTION, tripId);
  const tripDoc = await getDoc(tripRef);

  if (!tripDoc.exists()) return;

  const trip = tripDoc.data() as Trip;

  // Reset previous selection
  const updatedIdeas = trip.canvases[canvasType].ideas.map((idea) => ({
    ...idea,
    status: idea.id === ideaId ? 'selected' as CardStatus : (idea.status === 'selected' ? 'open' as CardStatus : idea.status),
  }));

  const idea = updatedIdeas.find((i) => i.id === ideaId);

  const activity: Activity = {
    id: uuidv4(),
    trip_id: tripId,
    type: 'idea_selected',
    user_id: userId,
    target_id: ideaId,
    target_type: canvasType,
    message: `${userName} selected "${idea?.title}"`,
    timestamp: new Date(),
  };

  await updateDoc(tripRef, {
    [`canvases.${canvasType}.ideas`]: updatedIdeas,
    [`canvases.${canvasType}.selected_idea_id`]: ideaId,
    activities: [...trip.activities, activity],
  });
};

// Unselect an idea
export const unselectIdea = async (
  tripId: string,
  canvasType: CanvasType
): Promise<void> => {
  const tripRef = doc(db, TRIPS_COLLECTION, tripId);
  const tripDoc = await getDoc(tripRef);

  if (!tripDoc.exists()) return;

  const trip = tripDoc.data() as Trip;
  const selectedId = trip.canvases[canvasType].selected_idea_id;

  if (!selectedId) return;

  const updatedIdeas = trip.canvases[canvasType].ideas.map((idea) => ({
    ...idea,
    status: idea.id === selectedId ? 'open' as CardStatus : idea.status,
  }));

  await updateDoc(tripRef, {
    [`canvases.${canvasType}.ideas`]: updatedIdeas,
    [`canvases.${canvasType}.selected_idea_id`]: null,
  });
};

// ============ VOTING OPERATIONS ============

// Vote on an idea
export const voteOnIdea = async (
  tripId: string,
  canvasType: CanvasType,
  ideaId: string,
  userId: string,
  userName: string,
  value: 1 | -1
): Promise<boolean> => {
  const tripRef = doc(db, TRIPS_COLLECTION, tripId);
  const tripDoc = await getDoc(tripRef);

  if (!tripDoc.exists()) return false;

  const trip = tripDoc.data() as Trip;

  // Check if board is locked
  if (trip.canvases[canvasType].settings.is_locked) return false;

  const ideaIndex = trip.canvases[canvasType].ideas.findIndex((i) => i.id === ideaId);
  if (ideaIndex === -1) return false;

  const idea = trip.canvases[canvasType].ideas[ideaIndex];
  const existingVoteIndex = idea.votes.findIndex((v) => v.user_id === userId);
  const existingVote = existingVoteIndex !== -1 ? idea.votes[existingVoteIndex] : null;

  // Check vote limits for new upvotes
  if (value === 1 && (!existingVote || existingVote.value !== 1)) {
    const maxVotes = trip.canvases[canvasType].settings.votes_per_user;
    const usedVotes = trip.canvases[canvasType].ideas.reduce((count, i) => {
      const userVote = i.votes.find((v) => v.user_id === userId);
      return count + (userVote && userVote.value === 1 ? 1 : 0);
    }, 0);

    if (usedVotes >= maxVotes) return false;
  }

  let newVotes: Vote[];
  if (existingVoteIndex !== -1) {
    newVotes = idea.votes.map((v, idx) =>
      idx === existingVoteIndex ? { ...v, value, timestamp: new Date() } : v
    );
  } else {
    newVotes = [
      ...idea.votes,
      { idea_id: ideaId, user_id: userId, value, timestamp: new Date() },
    ];
  }

  const updatedIdeas = [...trip.canvases[canvasType].ideas];
  updatedIdeas[ideaIndex] = { ...idea, votes: newVotes };

  const activity: Activity = {
    id: uuidv4(),
    trip_id: tripId,
    type: 'idea_voted',
    user_id: userId,
    target_id: ideaId,
    target_type: canvasType,
    message: `${userName} ${value === 1 ? 'upvoted' : 'downvoted'} "${idea.title}"`,
    timestamp: new Date(),
  };

  await updateDoc(tripRef, {
    [`canvases.${canvasType}.ideas`]: updatedIdeas,
    activities: [...trip.activities, activity],
  });

  return true;
};

// Remove vote
export const removeVote = async (
  tripId: string,
  canvasType: CanvasType,
  ideaId: string,
  userId: string
): Promise<void> => {
  const tripRef = doc(db, TRIPS_COLLECTION, tripId);
  const tripDoc = await getDoc(tripRef);

  if (!tripDoc.exists()) return;

  const trip = tripDoc.data() as Trip;
  const ideaIndex = trip.canvases[canvasType].ideas.findIndex((i) => i.id === ideaId);

  if (ideaIndex === -1) return;

  const idea = trip.canvases[canvasType].ideas[ideaIndex];
  const newVotes = idea.votes.filter((v) => v.user_id !== userId);

  const updatedIdeas = [...trip.canvases[canvasType].ideas];
  updatedIdeas[ideaIndex] = { ...idea, votes: newVotes };

  await updateDoc(tripRef, {
    [`canvases.${canvasType}.ideas`]: updatedIdeas,
  });
};

// ============ COMMENT OPERATIONS ============

// Add comment
export const addComment = async (
  tripId: string,
  canvasType: CanvasType,
  ideaId: string,
  userId: string,
  userName: string,
  content: string
): Promise<Comment | null> => {
  const tripRef = doc(db, TRIPS_COLLECTION, tripId);
  const tripDoc = await getDoc(tripRef);

  if (!tripDoc.exists()) return null;

  const trip = tripDoc.data() as Trip;
  const ideaIndex = trip.canvases[canvasType].ideas.findIndex((i) => i.id === ideaId);

  if (ideaIndex === -1) return null;

  const comment: Comment = {
    id: uuidv4(),
    idea_id: ideaId,
    user_id: userId,
    content,
    timestamp: new Date(),
  };

  const idea = trip.canvases[canvasType].ideas[ideaIndex];
  const updatedIdeas = [...trip.canvases[canvasType].ideas];
  updatedIdeas[ideaIndex] = { ...idea, comments: [...idea.comments, comment] };

  const activity: Activity = {
    id: uuidv4(),
    trip_id: tripId,
    type: 'idea_commented',
    user_id: userId,
    target_id: ideaId,
    target_type: canvasType,
    message: `${userName} commented on "${idea.title}"`,
    timestamp: new Date(),
  };

  await updateDoc(tripRef, {
    [`canvases.${canvasType}.ideas`]: updatedIdeas,
    activities: [...trip.activities, activity],
  });

  return comment;
};

// Delete comment
export const deleteComment = async (
  tripId: string,
  canvasType: CanvasType,
  ideaId: string,
  commentId: string
): Promise<void> => {
  const tripRef = doc(db, TRIPS_COLLECTION, tripId);
  const tripDoc = await getDoc(tripRef);

  if (!tripDoc.exists()) return;

  const trip = tripDoc.data() as Trip;
  const ideaIndex = trip.canvases[canvasType].ideas.findIndex((i) => i.id === ideaId);

  if (ideaIndex === -1) return;

  const idea = trip.canvases[canvasType].ideas[ideaIndex];
  const newComments = idea.comments.filter((c) => c.id !== commentId);

  const updatedIdeas = [...trip.canvases[canvasType].ideas];
  updatedIdeas[ideaIndex] = { ...idea, comments: newComments };

  await updateDoc(tripRef, {
    [`canvases.${canvasType}.ideas`]: updatedIdeas,
  });
};

// ============ BOARD OPERATIONS ============

// Lock board
export const lockBoard = async (
  tripId: string,
  canvasType: CanvasType,
  userId: string,
  userName: string
): Promise<void> => {
  const tripRef = doc(db, TRIPS_COLLECTION, tripId);
  const tripDoc = await getDoc(tripRef);

  if (!tripDoc.exists()) return;

  const trip = tripDoc.data() as Trip;

  const activity: Activity = {
    id: uuidv4(),
    trip_id: tripId,
    type: 'board_locked',
    user_id: userId,
    target_type: canvasType,
    message: `${userName} locked the ${CANVAS_CONFIG[canvasType].label} board`,
    timestamp: new Date(),
  };

  await updateDoc(tripRef, {
    [`canvases.${canvasType}.settings.is_locked`]: true,
    [`canvases.${canvasType}.settings.locked_at`]: new Date(),
    [`canvases.${canvasType}.settings.locked_by`]: userId,
    activities: [...trip.activities, activity],
  });
};

// Unlock board
export const unlockBoard = async (
  tripId: string,
  canvasType: CanvasType
): Promise<void> => {
  const tripRef = doc(db, TRIPS_COLLECTION, tripId);

  await updateDoc(tripRef, {
    [`canvases.${canvasType}.settings.is_locked`]: false,
    [`canvases.${canvasType}.settings.locked_at`]: null,
    [`canvases.${canvasType}.settings.locked_by`]: null,
  });
};

// ============ REAL-TIME SUBSCRIPTIONS ============

// Subscribe to trip changes
export const subscribeToTrip = (
  tripId: string,
  callback: (trip: Trip | null) => void
): Unsubscribe => {
  const tripRef = doc(db, TRIPS_COLLECTION, tripId);

  return onSnapshot(tripRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data() as Trip);
    } else {
      callback(null);
    }
  });
};

// Subscribe to user's trips
export const subscribeToUserTrips = (
  userId: string,
  callback: (trips: Trip[]) => void
): Unsubscribe => {
  return onSnapshot(collection(db, TRIPS_COLLECTION), (snapshot) => {
    const trips: Trip[] = [];
    snapshot.forEach((doc) => {
      const trip = doc.data() as Trip;
      if (trip.members.some((m) => m.user_id === userId)) {
        trips.push(trip);
      }
    });
    callback(trips);
  });
};
