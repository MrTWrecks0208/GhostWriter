import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export function useUserCredits(userId: string | undefined) {
  const [credits, setCredits] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!userId) {
      setCredits(null);
      setLoading(false);
      return;
    }

    const unsubsribe = onSnapshot(doc(db, 'users', userId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setCredits(data.credits !== undefined ? data.credits : 0);
      } else {
        setCredits(null);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching user credits:", error);
      setLoading(false);
    });

    return () => unsubsribe();
  }, [userId]);

  return { credits, loading };
}
