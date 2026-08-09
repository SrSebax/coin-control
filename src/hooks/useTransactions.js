import { useEffect, useState } from "react";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  writeBatch,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../services/firebase";
import { useCurrentUser } from "./useCurrentUser";
import { parseLocalDate } from "../utils/date";

const BATCH_CHUNK_SIZE = 450; // Firestore permite hasta 500 escrituras por batch

const chunk = (list, size) => {
  const chunks = [];
  for (let i = 0; i < list.length; i += size) chunks.push(list.slice(i, i + size));
  return chunks;
};

// Hook específico para manejar transacciones financieras (Firestore: users/{uid}/transactions)
export function useTransactions() {
  const { user, authLoading } = useCurrentUser();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Todavía no sabemos si hay sesión o no: no tocar nada, dejar `loading`
    // en true. Si no, hay una ventana donde "user" es null (auth aún sin
    // resolver) y esto se lee como "no hay sesión", vaciando datos y
    // disparando redirects falsos en pantallas que esperan a `loading`.
    if (authLoading) return;

    if (!user) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const ref = collection(db, "users", user.uid, "transactions");
    const unsubscribe = onSnapshot(ref, (snapshot) => {
      setTransactions(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, authLoading]);

  // Calcular resumen basado en las transacciones
  const calculateSummary = (transactionsList) => {
    const summary = transactionsList.reduce((acc, transaction) => {
      if (transaction.type === "income") {
        acc.ingresos += transaction.amount;
      } else {
        acc.gastos += transaction.amount;
      }
      return acc;
    }, { ingresos: 0, gastos: 0 });

    return summary;
  };

  const summary = calculateSummary(transactions);

  // Agregar nueva transacción
  const addTransaction = async (transaction) => {
    const payload = { date: new Date().toISOString(), ...transaction };
    const ref = collection(db, "users", user.uid, "transactions");
    const docRef = await addDoc(ref, payload);
    return { id: docRef.id, ...payload };
  };

  // Eliminar transacción
  const deleteTransaction = async (transactionId) => {
    await deleteDoc(doc(db, "users", user.uid, "transactions", transactionId));
  };

  // Actualizar transacción existente
  const updateTransaction = async (transactionId, updatedData) => {
    await updateDoc(doc(db, "users", user.uid, "transactions", transactionId), updatedData);
    const current = transactions.find((t) => t.id === transactionId);
    return { ...current, ...updatedData };
  };

  // Usado por el motor de recurrencias: agrega las ocurrencias nuevas y
  // actualiza sólo las plantillas que cambiaron, en un solo batch. No
  // reescribe transacciones que no cambiaron (a diferencia de un "replace"
  // del array completo).
  const applyRecurrenceUpdates = async ({ additions = [], templateUpdates = [] }) => {
    if (additions.length === 0 && templateUpdates.length === 0) return;

    const batch = writeBatch(db);
    const transactionsRef = collection(db, "users", user.uid, "transactions");

    additions.forEach((addition) => {
      const { id: _id, ...data } = addition;
      batch.set(doc(transactionsRef), data);
    });

    templateUpdates.forEach((template) => {
      const { id, ...data } = template;
      batch.set(doc(db, "users", user.uid, "transactions", id), data, { merge: true });
    });

    await batch.commit();
  };

  // Usado por la restauración de backup: reemplaza toda la colección.
  const importTransactions = async (list) => {
    const transactionsRef = collection(db, "users", user.uid, "transactions");
    const existingSnapshot = await getDocs(transactionsRef);

    const deleteChunks = chunk(existingSnapshot.docs, BATCH_CHUNK_SIZE);
    for (const docs of deleteChunks) {
      const batch = writeBatch(db);
      docs.forEach((d) => batch.delete(d.ref));
      await batch.commit();
    }

    const addChunks = chunk(list, BATCH_CHUNK_SIZE);
    for (const items of addChunks) {
      const batch = writeBatch(db);
      items.forEach((item) => {
        const { id: _id, ...data } = item;
        batch.set(doc(transactionsRef), data);
      });
      await batch.commit();
    }
  };

  // Obtener transacciones por tipo
  const getTransactionsByType = (type) => {
    return transactions.filter((t) => t.type === type);
  };

  // Obtener transacciones por período (con rango de fechas)
  const getTransactionsByPeriod = (startDate = null, endDate = null) => {
    // Si no se proporcionan fechas, usar el mes actual
    if (!startDate || !endDate) {
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      return transactions.filter((t) => {
        const transactionDate = parseLocalDate(t.date);
        return transactionDate.getMonth() === currentMonth &&
               transactionDate.getFullYear() === currentYear;
      });
    }

    // Si se proporcionan fechas, filtrar por el rango
    const start = parseLocalDate(startDate);
    const end = parseLocalDate(endDate);

    // Ajustar end para incluir todo el día final
    end.setHours(23, 59, 59, 999);

    return transactions.filter((t) => {
      const transactionDate = parseLocalDate(t.date);
      return transactionDate >= start && transactionDate <= end;
    });
  };

  return {
    transactions,
    summary,
    loading,
    addTransaction,
    deleteTransaction,
    updateTransaction,
    applyRecurrenceUpdates,
    importTransactions,
    getTransactionsByType,
    getTransactionsByPeriod,
    calculateSummary,
  };
}
