import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../services/firebase";

export function useCurrentUser() {
  const [user, setUser] = useState(null);
  // true hasta que Firebase entrega el primer callback de auth. Sin esto,
  // "user === null" es ambiguo entre "todavía no sabemos" y "no hay sesión".
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const displayName = user?.displayName || user?.email?.split("@")[0] || "";

  return { user, authLoading, displayName };
}
