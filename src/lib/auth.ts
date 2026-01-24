import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  type User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from './firebase';
import type { User } from '../types';

// Avatar colors for new users
const AVATAR_COLORS = [
  '#f87171', '#fb923c', '#fbbf24', '#a3e635', '#4ade80',
  '#2dd4bf', '#38bdf8', '#818cf8', '#c084fc', '#f472b6',
];

const getRandomColor = () => AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];

// Convert Firebase user to our User type
export const firebaseUserToUser = (firebaseUser: FirebaseUser, additionalData?: Partial<User>): User => ({
  id: firebaseUser.uid,
  name: firebaseUser.displayName || 'Anonymous',
  email: firebaseUser.email || '',
  avatar: firebaseUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(firebaseUser.displayName || firebaseUser.uid)}`,
  color: additionalData?.color || getRandomColor(),
});

// Create or update user in Firestore
export const saveUserToFirestore = async (user: User): Promise<void> => {
  const userRef = doc(db, 'users', user.id);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    // New user - create document
    await setDoc(userRef, {
      ...user,
      createdAt: new Date(),
    });
  } else {
    // Existing user - update last login
    await setDoc(userRef, {
      ...user,
      lastLoginAt: new Date(),
    }, { merge: true });
  }
};

// Get user from Firestore
export const getUserFromFirestore = async (userId: string): Promise<User | null> => {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    const data = userSnap.data();
    return {
      id: userSnap.id,
      name: data.name,
      email: data.email,
      avatar: data.avatar,
      color: data.color,
    };
  }
  return null;
};

// Sign up with email/password
export const signUpWithEmail = async (email: string, password: string, name: string): Promise<User> => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);

  // Update display name
  await updateProfile(userCredential.user, { displayName: name });

  const user = firebaseUserToUser(userCredential.user, { name });
  await saveUserToFirestore(user);

  return user;
};

// Sign in with email/password
export const signInWithEmail = async (email: string, password: string): Promise<User> => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);

  let user = await getUserFromFirestore(userCredential.user.uid);
  if (!user) {
    user = firebaseUserToUser(userCredential.user);
    await saveUserToFirestore(user);
  }

  return user;
};

// Sign in with Google
export const signInWithGoogle = async (): Promise<User> => {
  const userCredential = await signInWithPopup(auth, googleProvider);

  let user = await getUserFromFirestore(userCredential.user.uid);
  if (!user) {
    user = firebaseUserToUser(userCredential.user);
    await saveUserToFirestore(user);
  }

  return user;
};

// Sign out
export const signOut = async (): Promise<void> => {
  await firebaseSignOut(auth);
};

// Subscribe to auth state changes
export const subscribeToAuthChanges = (callback: (user: User | null) => void): (() => void) => {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      let user = await getUserFromFirestore(firebaseUser.uid);
      if (!user) {
        user = firebaseUserToUser(firebaseUser);
        await saveUserToFirestore(user);
      }
      callback(user);
    } else {
      callback(null);
    }
  });
};
