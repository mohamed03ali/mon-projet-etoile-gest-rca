
import Dexie from 'dexie';

export const db = new Dexie('StockManagerDB');

db.version(1).stores({
    products: '++id, name, category_id, stock_quantity, sale_price, alert_threshold',
    clients: '++id, nom, telephone, dette',
    sales: '++local_id, product_id, client_id, quantity, total_price, status, synced',
    syncQueue: '++id, action, endpoint, payload' // Pour stocker les actions CRUD hors ligne
}); 


// --- Synchronisation avec le backend ---