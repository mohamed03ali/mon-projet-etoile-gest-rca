import { useState, useEffect } from 'react';
import { db } from '../db';dd

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [filtre, setFiltre] = useState('tous'); // tous, paye, dette
  
  const loadClients = async () => setClients(await db.clients.toArray());

  useEffect(() => { loadClients(); }, []);

  const clientsFiltres = clients.filter(c => {
    if (filtre === 'dette') return c.dette > 0;
    if (filtre === 'paye') return c.dette === 0;
    return true; // 'tous'
  });

  return (
    <div className="page-container">
      <div className="section-header">
        <h1>Clients & Dettes</h1>
        <div className="filter-buttons">
          <button className={filtre === 'tous' ? 'active' : ''} onClick={() => setFiltre('tous')}>Tous</button>
          <button className={filtre === 'paye' ? 'active' : ''} onClick={() => setFiltre('paye')}>À Jour</button>
          <button className={filtre === 'dette' ? 'active' : ''} onClick={() => setFiltre('dette')}>En Dette</button>
        </div>
      </div>

      <div className="clients-list">
        {clientsFiltres.length === 0 ? <p>Aucun client dans cette catégorie.</p> : null}
        {clientsFiltres.map(c => (
          <div key={c.id} className="client-card card">
            <div className="client-info">
              <strong>{c.nom}</strong>
              <small>{c.telephone || 'Pas de téléphone'}</small>
            </div>
            <div className={`client-debt ${c.dette > 0 ? 'has-debt' : 'paid'}`}>
              <small>{c.dette > 0 ? 'DETTE' : 'SITUATION'}</small>
              <p>{c.dette > 0 ? `${c.dette.toLocaleString()} FCFA` : 'À Jour ✔️'}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default Clients;

