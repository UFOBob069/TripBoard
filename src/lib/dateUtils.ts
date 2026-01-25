import { Timestamp } from 'firebase/firestore';

/**
 * Converts a Firestore Timestamp or Date-like object to a JavaScript Date.
 * Firestore stores dates as Timestamp objects which need special handling.
 */
export function toDate(value: Date | Timestamp | { seconds: number; nanoseconds: number } | string | number): Date {
  if (!value) {
    return new Date();
  }

  // Already a Date
  if (value instanceof Date) {
    return value;
  }

  // Firestore Timestamp
  if (value instanceof Timestamp) {
    return value.toDate();
  }

  // Firestore Timestamp-like object (when data is serialized/deserialized)
  if (typeof value === 'object' && 'seconds' in value && 'nanoseconds' in value) {
    return new Date(value.seconds * 1000 + value.nanoseconds / 1000000);
  }

  // String or number
  return new Date(value);
}

/**
 * Formats a date for display, handling Firestore Timestamps.
 */
export function formatDate(value: Date | Timestamp | { seconds: number; nanoseconds: number } | string | number): string {
  const date = toDate(value);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
