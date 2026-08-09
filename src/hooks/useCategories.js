import { useEffect, useSyncExternalStore } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import { useCurrentUser } from "./useCurrentUser";
import { defaultCategories } from "../data/data";

const EMPTY_CATEGORIES = { expense: [], income: [] };

// Mismo store compartido a nivel de módulo que useTransactions: un solo
// listener de Firestore para toda la app, así no hay flash de "cargando" al
// volver a una pantalla ya visitada.
let cachedCategories = EMPTY_CATEGORIES;
let cachedLoading = true;
let unsubscribeFn = null;
let subscribedUid = undefined;
let currentUid = null; // uid activo, para poder persistir sin depender de "user" del componente
const listeners = new Set();

function emitChange() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getCategoriesSnapshot() {
  return cachedCategories;
}

function getLoadingSnapshot() {
  return cachedLoading;
}

function ensureSubscription(uid) {
  currentUid = uid;
  if (subscribedUid === uid) return;
  subscribedUid = uid;

  if (unsubscribeFn) {
    unsubscribeFn();
    unsubscribeFn = null;
  }

  if (!uid) {
    cachedCategories = EMPTY_CATEGORIES;
    cachedLoading = false;
    emitChange();
    return;
  }

  cachedLoading = true;
  emitChange();

  const ref = doc(db, "users", uid, "meta", "categories");
  unsubscribeFn = onSnapshot(ref, (snapshot) => {
    if (snapshot.exists()) {
      cachedCategories = snapshot.data();
    } else {
      // Usuario nuevo: sembrar categorías por defecto. El propio onSnapshot
      // recibirá el cambio y actualizará el estado.
      setDoc(ref, defaultCategories);
    }
    cachedLoading = false;
    emitChange();
  });
}

function persist(newCategories) {
  cachedCategories = newCategories;
  emitChange();
  if (currentUid) setDoc(doc(db, "users", currentUid, "meta", "categories"), newCategories, { merge: true });
}

export function useCategories() {
  const { user, authLoading } = useCurrentUser();

  useEffect(() => {
    if (authLoading) return;
    ensureSubscription(user?.uid || null);
  }, [user, authLoading]);

  const categories = useSyncExternalStore(subscribe, getCategoriesSnapshot);
  const storeLoading = useSyncExternalStore(subscribe, getLoadingSnapshot);
  const loading = authLoading || storeLoading;

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

    persist({
      ...categories,
      [typeKey]: [...categories[typeKey], newCategory],
    });
    return newCategory;
  };

  // Eliminar categoría
  const deleteCategory = (categoryId, type) => {
    const typeKey = type === "expense" ? "expense" : "income";

    persist({
      ...categories,
      [typeKey]: categories[typeKey].filter((c) => c.id !== categoryId),
    });
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
    cachedCategories = categoriesObj;
    emitChange();
    if (currentUid) await setDoc(doc(db, "users", currentUid, "meta", "categories"), categoriesObj);
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
