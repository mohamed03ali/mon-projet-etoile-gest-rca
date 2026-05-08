// src/syncService.js
import { db } from './db';

const API_URL = 'http://localhost:3000/api';

export const synchroniserDonnees = async () => {
  if (!navigator.onLine) {
    return { status: 'offline', message: "Pas de connexion internet" };
  }

  try {
    // 1. Synchronisation des Ventes
    const ventesNonSync = await db.sales.where('synced').equals(0).toArray();
    if (ventesNonSync.length > 0) {
      const resSales = await fetch(`${API_URL}/sync-sales`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ventesNonSync)
      });
      
      if (resSales.ok) {
        // Si le serveur a bien reçu, on marque les ventes comme synchronisées localement
        const ids = ventesNonSync.map(s => s.id);
        await db.sales.where('id').anyOf(ids).modify({ synced: 1 });
      }
    }

    // 2. Synchronisation des Clients (Optionnel mais recommandé)
    const clients = await db.clients.toArray();
    if (clients.length > 0) {
      await fetch(`${API_URL}/sync-clients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clients)
      });
    }

    return { status: 'success', message: "Synchronisation terminée avec succès" };

  } catch (error) {
    console.error("Erreur de synchro :", error);
    return { status: 'error', message: "Le serveur est inaccessible" };
  }
};
