import { useEffect, useState } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import { useCurrentUser } from "./useCurrentUser";
import { defaultCategories } from "../data/data";

const EMPTY_CATEGORIES = { expense: [], income: [] };

export function useCategories() {
  const { user } = useCurrentUser();
  const [categories, setCategories] = useState(EMPTY_CATEGORIES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setCategories(EMPTY_CATEGORIES);
      setLoading(false);
      return;
    }

    setLoading(true);
    const ref = doc(db, "users", user.uid, "meta", "categories");
    const unsubscribe = onSnapshot(ref, (snapshot) => {
      if (snapshot.exists()) {
        setCategories(snapshot.data());
      } else {
        // Usuario nuevo: sembrar categorías por defecto. El propio onSnapshot
        // recibirá el cambio y actualizará el estado.
        setDoc(ref, defaultCategories);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const persist = (newCategories) => {
    setCategories(newCategories);
    if (user) setDoc(doc(db, "users", user.uid, "meta", "categories"), newCategories, { merge: true });
  };

  // Agregar nueva categoría
  const addCategory = (category) => {
    const { type, name, color, icon } = category;

    const newCategory = {
      id: Date.now().toString(),
      name,
      color,
      icon,
    };

    const typeKey = type === "expense" ? "expense" : "income";

    const newCategories = {
      ...categories,
      [typeKey]: [...categories[typeKey], newCategory],
    };

    persist(newCategories);
    return newCategory;
  };

  // Eliminar categoría
  const deleteCategory = (categoryId, type) => {
    const typeKey = type === "expense" ? "expense" : "income";

    const newCategories = {
      ...categories,
      [typeKey]: categories[typeKey].filter((c) => c.id !== categoryId),
    };

    persist(newCategories);
  };

  // Actualizar categoría existente
  const updateCategory = (categoryId, type, updatedData) => {
    const typeKey = type === "expense" ? "expense" : "income";

    const newCategories = {
      ...categories,
      [typeKey]: categories[typeKey].map((c) =>
        c.id === categoryId ? { ...c, ...updatedData } : c
      ),
    };

    persist(newCategories);

    return newCategories[typeKey].find((c) => c.id === categoryId);
  };

  // Usado por la restauración de backup: reemplaza todo el documento.
  const importCategories = async (categoriesObj) => {
    setCategories(categoriesObj);
    if (user) await setDoc(doc(db, "users", user.uid, "meta", "categories"), categoriesObj);
  };

  // Obtener categorías por tipo
  const getCategoriesByType = (type) => {
    const typeKey = type === "expense" ? "expense" : "income";
    return categories[typeKey];
  };

  return {
    categories,
    loading,
    addCategory,
    deleteCategory,
    updateCategory,
    importCategories,
    getCategoriesByType,
  };
}
