import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../services/firebase";

import HomeView from "../pages/HomeView";
import NewEntryView from "../pages/entry/NewEntryView";
import EditEntryView from "../pages/entry/EditEntryView";
import SelectEntryView from "../pages/entry/SelectEntryView";
import RecurringMovementsView from "../pages/entry/RecurringMovementsView";
import NewRecurringEntryView from "../pages/entry/NewRecurringEntryView";
import NotFoundView from "../pages/NotFoundView";
import LoginView from "../pages/LoginView";
import CategoriesView from "../pages/categories/CategoriesView";
import NewCategoryView from "../pages/categories/NewCategoryView";
import EditCategoryView from "../pages/categories/EditCategoryView";
import SelectCategoryView from "../pages/categories/SelectCategoryView";
import ConfigurationView from "../pages/ConfigurationView";
import { useRecurrenceSync } from "../hooks/useRecurrenceSync";

export default function AppRoutes() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useRecurrenceSync(!!user);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Sin splash: mientras se resuelve la sesión (normalmente instantáneo,
  // Firebase Auth persiste localmente) no se muestra nada en vez de una
  // pantalla de carga.
  if (loading) return null;

  return (
    <Routes>
      {/* Rutas protegidas */}
      <Route
        path="/home"
        element={user ? <HomeView /> : <Navigate to="/" replace />}
      />
      <Route
        path="/new-entry"
        element={user ? <NewEntryView /> : <Navigate to="/" replace />}
      />
      <Route
        path="/categories"
        element={user ? <CategoriesView /> : <Navigate to="/" replace />}
      />
      <Route
        path="/new-category"
        element={user ? <NewCategoryView /> : <Navigate to="/" replace />}
      />
      <Route
        path="/select-category"
        element={user ? <SelectCategoryView /> : <Navigate to="/" replace />}
      />
      <Route
        path="/edit-category/:categoryId"
        element={user ? <EditCategoryView /> : <Navigate to="/" replace />}
      />
      <Route
        path="/select-entry"
        element={user ? <SelectEntryView /> : <Navigate to="/" replace />}
      />
      <Route
        path="/edit-entry/:entryId"
        element={user ? <EditEntryView /> : <Navigate to="/" replace />}
      />
      <Route
        path="/recurring-movements"
        element={user ? <RecurringMovementsView /> : <Navigate to="/" replace />}
      />
      <Route
        path="/new-recurring"
        element={user ? <NewRecurringEntryView /> : <Navigate to="/" replace />}
      />

      {/* Ruta de Configuración */}
      <Route
        path="/settings"
        element={user ? <ConfigurationView /> : <Navigate to="/" replace />}
      />
      
      {/* Login pública */}
      <Route
        path="/"
        element={user ? <Navigate to="/home" replace /> : <LoginView />}
      />

      {/* Ruta 404 */}
      <Route path="*" element={<NotFoundView />} />
    </Routes>
  );
}