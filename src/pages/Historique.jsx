
import  { useState, useEffect } from 'react';
import { db } from '../db';

const Historique = () => {
  const [ventes, setVentes] = useState([]);

  useEffect(() => {
    const load = async () => {
      const all = await db.sales.toArray();
      setVentes(all.reverse());
    };
    load();
  }, []);

  return (
    <div className="page-container">
      <div className="section-header">
        <h1>Historique des Ventes</h1>
      </div>

      <div className="history-list">
        {ventes.map(v => (
          <div key={v.id} className="history-item card">
            <div className="history-main">
              <div className="history-icon">🧾</div>
              <div className="history-details">
                <strong>{v.client}</strong> {/* Nom du client mis en avant */}
                <small>{v.items.map(i => `${i.name} (${i.quantity})`).join(', ')}</small>
                <small className="date-text">{new Date(v.date).toLocaleString()}</small>
              </div>
            </div>
            <div className="history-right">
              <span className="history-total">{v.total_price.toLocaleString()} FCFA</span>
              <span className={`status-badge ${v.status === 'Dette' ? 'badge-debt' : 'badge-paid'}`}>
                {v.status || 'Payé'}
              </span>
              <span className={`sync-pill ${v.synced ? 'done' : 'wait'}`}>
                {v.synced ? '☁️ Synchro' : '⏳ Attente'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default Historique;
