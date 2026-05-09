import  { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Accueil from './pages/Accueil';
import POS from './pages/Vente';
import Panier from './pages/Panier';
import Stock from './pages/Stock';
import Clients from './pages/Clients';
import Historique from './pages/Historique';
import Profil from './pages/Profil';
import { synchroniserDonnees } from './syncService';
import './App.css';
import Login from './pages/Login';

// --- NAVIGATION DU BAS ---
const BottomNav = ({ cartCount }) => {
  const location = useLocation();
  return (
    <nav className="bottom-nav">
      <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
        <span className="icon">🏠</span><span>Accueil</span>
      </Link>
      <Link to="/stock" className={location.pathname === '/stock' ? 'active' : ''}>
        <span className="icon">📦</span><span>Stock</span>
      </Link>
      <Link to="/pos" className={location.pathname === '/pos' ? 'active' : ''}>
        <span className="icon">🛒</span><span>Vente</span>
      </Link>
      <Link to="/panier" className={`cart-link ${location.pathname === '/panier' ? 'active' : ''}`}>
        <div className="icon-cart-wrapper">
          <span className="icon">🛍️</span>
          {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
        </div>
        <span>Panier</span>
      </Link>
      <Link to="/profil" className={location.pathname === '/profil' ? 'active' : ''}>
        <span className="icon">⚙️</span><span>Menu</span>
      </Link>
    </nav>
  );
};

// --- COMPOSANT PRINCIPAL ---
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cart, setCart] = useState([]);
  const [installPromptEvent, setInstallPromptEvent] = useState(null);
  const [installButtonVisible, setInstallButtonVisible] = useState(false);
  const [installMessage, setInstallMessage] = useState('');

  useEffect(() => {
    // Synchronisation automatique quand internet revient
    const handleOnline = async () => {
      await synchroniserDonnees();
    };
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setInstallPromptEvent(e);
      setInstallButtonVisible(true);
      console.log('beforeinstallprompt capturé');
    };

    const handleAppInstalled = () => {
      setInstallMessage('Application installée ✅');
      setInstallButtonVisible(false);
      setInstallPromptEvent(null);
      console.log('application installée');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPromptEvent) return;

    installPromptEvent.prompt();
    const choiceResult = await installPromptEvent.userChoice;

    if (choiceResult.outcome === 'accepted') {
      setInstallButtonVisible(false);
      setInstallMessage('Installation acceptée ✅');
    } else {
      setInstallMessage('Installation refusée. Vous pouvez réessayer plus tard.');
    }
    setInstallPromptEvent(null);
  };

  // Fonction appelée quand le login réussit
  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  // Fonction appelée depuis le bouton "Déconnexion" du Profil
  const handleLogout = () => {
    localStorage.removeItem('token'); // Nettoie la session
    setIsLoggedIn(false); // Renvoie à la page Login
  };

  // Si l'utilisateur n'est pas connecté, on affiche UNIQUEMENT la page Login
  if (!isLoggedIn) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // Calcul du nombre d'articles dans le panier
  const cartItemsCount = cart.reduce((total, item) => total + item.quantity, 0);

  // Si l'utilisateur EST connecté, on affiche l'application
  return (
    <Router>
      <div className="app-layout">
        <div className="main-content">
        {installButtonVisible && (
          <div className="install-banner" style={{padding: '10px', background: '#eef7ff', borderRadius: '10px', marginBottom: '12px', textAlign: 'center'}}>
            <button className="btn-install" onClick={handleInstallClick} style={{padding: '10px 16px', fontSize: '0.95rem', borderRadius: '8px', border: 'none', cursor: 'pointer', background: '#007bff', color: '#fff'}}>
              Installer l'application
            </button>
          </div>
        )}
        {installMessage && (
          <div style={{padding: '8px 12px', background: '#f0f9f0', borderRadius: '8px', marginBottom: '12px', color: '#1a7f1a', fontSize: '0.95rem'}}>
            {installMessage}
          </div>
        )}
        <Routes>
            <Route path="/" element={<Accueil />} />
            <Route path="/pos" element={<POS cart={cart} setCart={setCart} />} />
            <Route path="/panier" element={<Panier cart={cart} setCart={setCart} />} />
            <Route path="/stock" element={<Stock />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/historique" element={<Historique />} />
            
            {/* On passe la fonction handleLogout au composant Profil */}
            <Route path="/profil" element={<Profil onLogout={handleLogout} />} />
          </Routes>
        </div>
        
        {/* La barre de navigation reste visible tout le temps */}
        <BottomNav cartCount={cartItemsCount} />
      </div>
    </Router>
  );
}

export default App;



