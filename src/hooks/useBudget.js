import { useEffect, useState } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import { useCurrentUser } from "./useCurrentUser";

export function useBudget() {
  const { user } = useCurrentUser();
  const [amount, setAmount] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setAmount(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const ref = doc(db, "users", user.uid, "meta", "budget");
    const unsubscribe = onSnapshot(ref, (snapshot) => {
      setAmount(snapshot.exists() ? snapshot.data().amount : null);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const setBudgetAmount = (newAmount) => {
    setAmount(newAmount);
    if (user) setDoc(doc(db, "users", user.uid, "meta", "budget"), { amount: newAmount });
  };

  return { amount, loading, setBudgetAmount };
}
