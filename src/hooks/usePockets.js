import { useState, useEffect } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { parseLocalDate } from "../utils/date";

export function usePockets() {
  const [pockets, setPockets] = useLocalStorage("pockets", []);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular carga de datos
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, []);

  // Añadir un nuevo bolsillo
  const addPocket = (pocketData) => {
    const newPocket = {
      ...pocketData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      savedAmount: 0,
      lastSavingDate: null,
      nextSavingDate: calculateNextSavingDate(pocketData.startDate, pocketData.frequency)
    };
    
    setPockets([...pockets, newPocket]);
    return newPocket;
  };

  // Actualizar un bolsillo existente
  const updatePocket = (pocketId, pocketData) => {
    const updatedPockets = pockets.map(pocket => {
      if (pocket.id === pocketId) {
        return {
          ...pocket,
          ...pocketData,
          updatedAt: new Date().toISOString(),
          nextSavingDate: calculateNextSavingDate(
            pocketData.startDate || pocket.startDate,
            pocketData.frequency || pocket.frequency
          )
        };
      }
      return pocket;
    });
    
    setPockets(updatedPockets);
  };

  // Eliminar un bolsillo
  const deletePocket = (pocketId) => {
    const updatedPockets = pockets.filter(pocket => pocket.id !== pocketId);
    setPockets(updatedPockets);
  };

  // Registrar un ahorro en un bolsillo
  const addSaving = (pocketId, amount, date = new Date().toISOString()) => {
    const updatedPockets = pockets.map(pocket => {
      if (pocket.id === pocketId) {
        const newSavedAmount = (pocket.savedAmount || 0) + parseFloat(amount);
        return {
          ...pocket,
          savedAmount: newSavedAmount,
          lastSavingDate: date,
          nextSavingDate: calculateNextSavingDate(date, pocket.frequency),
          updatedAt: new Date().toISOString()
        };
      }
      return pocket;
    });
    
    setPockets(updatedPockets);
  };

  // Calcular la próxima fecha de ahorro basada en la frecuencia
  const calculateNextSavingDate = (startDateStr, frequency) => {
    if (!startDateStr || !frequency) return null;
    
    const startDate = parseLocalDate(startDateStr);
    let nextDate = new Date(startDate);
    
    switch(frequency.toLowerCase()) {
      case "semanal":
        nextDate.setDate(startDate.getDate() + 7);
        break;
      case "quincenal":
        nextDate.setDate(startDate.getDate() + 15);
        break;
      case "mensual":
        nextDate.setMonth(startDate.getMonth() + 1);
        break;
      default:
        return null;
    }
    
    return nextDate.toISOString();
  };

  // Obtener un bolsillo específico por ID
  const getPocketById = (pocketId) => {
    return pockets.find(pocket => pocket.id === pocketId) || null;
  };

  return {
    pockets,
    loading,
    addPocket,
    updatePocket,
    deletePocket,
    addSaving,
    getPocketById
  };
}
