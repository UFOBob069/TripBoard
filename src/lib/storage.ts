import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase';

// Upload a cover photo for a trip
export const uploadTripCoverPhoto = async (
  tripId: string,
  file: File
): Promise<string> => {
  // Create a unique filename
  const extension = file.name.split('.').pop() || 'jpg';
  const filename = `trips/${tripId}/cover.${extension}`;
  const storageRef = ref(storage, filename);

  // Upload the file
  await uploadBytes(storageRef, file);

  // Get the download URL
  const downloadURL = await getDownloadURL(storageRef);
  return downloadURL;
};

// Delete a trip's cover photo
export const deleteTripCoverPhoto = async (tripId: string): Promise<void> => {
  try {
    // Try common extensions
    const extensions = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
    for (const ext of extensions) {
      try {
        const storageRef = ref(storage, `trips/${tripId}/cover.${ext}`);
        await deleteObject(storageRef);
        return;
      } catch {
        // File with this extension doesn't exist, try next
      }
    }
  } catch (error) {
    console.error('Error deleting cover photo:', error);
  }
};

// Upload a general image (for ideas, etc.)
export const uploadImage = async (
  path: string,
  file: File
): Promise<string> => {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
};
