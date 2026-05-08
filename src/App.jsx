import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Login from './pages/Login';
import { useState } from 'react';
import Stock from './pages/Stock';
import Accueil from './pages/Accueil';
import POS from './pages/Vente';
import Clients from './pages/Clients';
import Historique from './pages/Historique';
import { synchroniserDonnees } from './syncService';
//import Historique from './pages/Historique';

// Composants "fantômes" (Nous allons les coder juste après)
//const Accueil = () => <div className="p-4"><h2>📊 Tableau de bord (Statistiques)</h2></div>;
//const Stock  = () => <div className="p-4"><h2>📦 Gestion du Stock (CRUD Produits)</h2></div>;
//const POS = () => <div className="p-4"><h2>🛒 Point de Vente (Caisse)</h2></div>;
//const Clients = () => <div className="p-4"><h2>👥 Gestion des Clients & Dettes</h2></div>;

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [syncStatus, setSyncStatus] = useState(navigator.onLine ? 'En ligne' : 'Hors ligne');
  const [isSyncing, setIsSyncing] = useState(false);

  if (!isLoggedIn) {
    return <Login onLoginSuccess={() => setIsLoggedIn(true)} />;
  }

  // ... le useEffect chargerDonnees reste identique ...

  // Nouvelle fonction pour le bouton
  const handleManualSync = async () => {
    setIsSyncing(true);
    setSyncStatus('Synchronisation...');
    
    const resultat = await synchroniserDonnees();
    
    setIsSyncing(false);
    if (resultat.status === 'success') {
      setSyncStatus('À jour ✔️');
      // On rafraîchit la page après 2 secondes pour remettre 'En ligne'
      setTimeout(() => setSyncStatus('En ligne'), 2000); 
    } else {
      setSyncStatus(resultat.status === 'offline' ? 'Hors ligne' : 'Erreur serveur');
    }
  };

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-header-bg">
        <div className="dash-top-info">
          {/* ... info marque et logo ... */}
        </div> {/* NOUVEAU BADGE DE SYNCHRO */}
        <div className="sync-container">
          <div className={`offline-pill ${navigator.onLine ? 'online' : 'offline'}`}>
            {navigator.onLine ? '🟢 ' : '⚠️ '}{syncStatus}
          </div> 
          <button 
            className="btn-sync-manual" 
            onClick={handleManualSync} 
            disabled={isSyncing || !navigator.onLine}
          >
            {isSyncing ? '🔄...' : '🔄 Synchro'}
          </button>
        </div>
      </div>

      <Router>
        <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif' }}>
          {/* Barre de navigation latérale (Sidebar) */}
          <nav style={{ width: '250px', backgroundColor: '#2c3e50', color: 'white', padding: '20px' }}>
            <h2 style={{ borderBottom: '1px solid #34495e', paddingBottom: '10px', color:'white' }}>StockManager</h2>
            <ul style={{ listStyle: 'none', padding: 0, marginTop: '20px' }}>
              <li style={{ margin: '15px 0' }}><Link to="/" style={{ color: 'white', textDecoration: 'none' }}>📊Accueil</Link></li>
              <li style={{ margin: '15px 0' }}><Link to="/pos" style={{ color: 'white', textDecoration: 'none' }}>🛒 Caisse (Vente)</Link></li>
              <li style={{ margin: '15px 0' }}><Link to="/stock" style={{ color: 'white', textDecoration: 'none' }}>📦 Stock</Link></li>
              <li style={{ margin: '15px 0' }}><Link to="/clients" style={{ color: 'white', textDecoration: 'none' }}>👥 Clients & Dettes</Link></li>
              <li style={{ margin: '15px 0' }}><Link to="/historique" style={{ color: 'white', textDecoration: 'none' }}>Historique</Link></li>
            </ul>
          </nav>

          {/* Contenu principal (là où les pages s'affichent) */}
          <main style={{ flex: 1, backgroundColor: '#ecf0f1', padding: '20px' }}>
            <Routes>
              <Route path="/" element={<Accueil />} />
              <Route path="/pos" element={<POS />} />
              <Route path="/stock" element={<Stock />} />
              <Route path="/clients" element={<Clients />} />
              <Route path='/historique' element={<Historique />} />
            </Routes>
          </main>
        </div>
      </Router>
    </div>
  );
}

export default App;

