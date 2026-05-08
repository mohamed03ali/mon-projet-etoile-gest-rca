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

// Composant pour la barre de navigation du bas
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

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // Le panier est géré ici pour être partagé entre POS et Panier
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const handleOnline = async () => {
      console.log("Internet revenu ! Synchro auto...");
      await synchroniserDonnees();
    };
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  if (!isLoggedIn) {
    return (
      <div className="login-container">
        <button onClick={() => setIsLoggedIn(true)}>Se connecter</button>
      </div>
    );
  }

  const cartItemsCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <Router>
      <div className="app-layout">
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Accueil />} />
            <Route path="/pos" element={<POS cart={cart} setCart={setCart} />} />
            <Route path="/panier" element={<Panier cart={cart} setCart={setCart} />} />
            <Route path="/stock" element={<Stock />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/historique" element={<Historique />} />
            <Route path="/profil" element={<Profil />} />
          </Routes>
        </div>
        <BottomNav cartCount={cartItemsCount} />
      </div>
    </Router>
  );
}

export default App;

