import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

/**
 * Add upvote to a report
 */
export const upvoteReport = async (reportId: string, userId: string): Promise<boolean> => {
  try {
    const reportRef = doc(db, 'reports', reportId);
    
    // Check if user already upvoted
    const reportDoc = await getDoc(reportRef);
    if (!reportDoc.exists()) {
      throw new Error('Report not found');
    }

    const upvotes: string[] = reportDoc.data().upvotes || [];
    const alreadyUpvoted = upvotes.includes(userId);
    const nextUpvotes = alreadyUpvoted
      ? upvotes.filter((id) => id !== userId)
      : [...upvotes, userId];

    // Write the full array
    await updateDoc(reportRef, { upvotes: nextUpvotes });

    return !alreadyUpvoted; // true when added, false when removed
  } catch (error) {
    console.error('Error updating upvote:', error);
    throw error;
  }
};

/**
 * Get upvote count for a report
 */
export const getUpvoteCount = (report: any): number => {
  return report?.upvotes?.length || 0;
};

/**
 * Check if user has upvoted
 */
export const hasUserUpvoted = (report: any, userId: string): boolean => {
  return report?.upvotes?.includes(userId) || false;
};
