import { doc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';
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

    const upvotes = reportDoc.data().upvotes || [];
    
    if (upvotes.includes(userId)) {
      // Remove upvote
      await updateDoc(reportRef, {
        upvotes: arrayRemove(userId),
      });
      return false; // Removed
    } else {
      // Add upvote
      await updateDoc(reportRef, {
        upvotes: arrayUnion(userId),
      });
      return true; // Added
    }
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
