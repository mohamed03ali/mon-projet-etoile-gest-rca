import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../db';  
import logo from '../assets/logo.jpg';

const Accueil = () => {
  // On change "beneficeJour" par "beneficeMois" dans le state
  const [stats, setStats] = useState({ ventesJour: 0, beneficeMois: 0, articles: 0 });
  const [ventes, setVentes] = useState([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const chargerDonnees = async () => {
      const allProducts = await db.products.toArray();
      const allSales = await db.sales.toArray();
      
      const now = new Date();
      
      // Début de la journée (ex: 8 Mai à 00:00:00)
      const debutJournee = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      // Début du mois (ex: 1er Mai à 00:00:00)
      const debutDuMois = new Date(now.getFullYear(), now.getMonth(), 1);

      let totalVentesJour = 0;
      let totalBeneficeMois = 0;

      allSales.forEach(sale => {
        const dateVente = new Date(sale.date);

        // 1. Calcul des VENTES DU JOUR
        if (dateVente >= debutJournee) {
          totalVentesJour += sale.total_price;
        }

        // 2. Calcul du BÉNÉFICE DU MOIS
        if (dateVente >= debutDuMois) {
          if (sale.items) {
            sale.items.forEach(item => {
              // Le bénéfice de chaque article (prix de vente - prix d'achat) * quantité
              const beneficeItem = (item.sale_price - item.purchase_price) * item.quantity;
              totalBeneficeMois += beneficeItem;
            });
          }
        }
      });

      setStats({
        ventesJour: totalVentesJour,
        beneficeMois: totalBeneficeMois,
        articles: allProducts.length
      });

      // On récupère les 3 dernières ventes pour l'affichage en bas
      setVentes(allSales.reverse().slice(0, 3));
    };

    chargerDonnees();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-header-bg">
        <div className="dash-top-info">
          
          <div className="brand-info">
            <img src={logo} alt="Logo" className="dash-logo" />
            <div>
              <p className="greeting">Bonjour, Admin 👋</p>
              <h1>Étoile de Centrafrique B</h1>
              <p className="sub-branding">Logiciel de gestion de stock et de ventes</p>
            </div>
          </div>

          <Link to="/profil" style={{ textDecoration: 'none' }}>
            <div className={`offline-pill ${isOnline ? 'online' : 'offline'}`}>
              {isOnline ? '🟢 En Ligne' : '⚠️ Hors Ligne'}
            </div>
          </Link>
          
        </div>

        <div className="dash-stats-row">
          <div className="stat-box">
            <p className="stat-value">{stats.ventesJour.toLocaleString()} <span className="currency">FCFA</span></p>
            <p className="stat-label">VENTES DU JOUR</p>
          </div>
          <div className="stat-box highlight-box">
            {/* Affichage du bénéfice mensuel */}
            <p className="stat-value">{stats.beneficeMois.toLocaleString()} <span className="currency">FCFA</span></p>
            <p className="stat-label">BÉNÉFICE DU MOIS</p>
          </div>
          <div className="stat-box">
            <p className="stat-value">{stats.articles}</p>
            <p className="stat-label">PRODUITS EN STOCK</p>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        
        <div className="section-title">
          <h2>Actions Rapides</h2>
        </div>
        <div className="quick-actions-grid">
          <Link to="/pos" className="action-btn primary-action">
            <span className="action-icon">🛒</span>
            <strong>Nouvelle Vente</strong>
            <small>Aller au catalogue</small>
          </Link>
          <Link to="/stock" className="action-btn">
            <span className="action-icon">📦</span>
            <strong>Stock</strong>
            <small>Gérer les produits</small>
          </Link>
          <Link to="/clients" className="action-btn">
            <span className="action-icon">👥</span>
            <strong>Clients</strong>
            <small>Gérer les dettes</small>
          </Link>
        </div>

        <div className="section-title" style={{ marginTop: '40px' }}>
          <h2>Ventes Récentes</h2>
        </div>
        <div className="recent-sales-list">
          {ventes.length > 0 ? (
            ventes.map((v, i) => {
              const descriptionProduits = v.items 
                ? v.items.map(item => `${item.name} (${item.quantity})`).join(', ')
                : 'Produits';

              return (
                <div key={i} className="sale-item">
                  <div className="sale-icon">🛍️</div>
                  <div className="sale-details">
                    <strong>{descriptionProduits}</strong>
                    <small>{new Date(v.date).toLocaleTimeString()} • Client: {v.client}</small>
                  </div>
                  <div className="sale-amount">+{v.total_price.toLocaleString()} FCFA</div>
                </div>
              );
            })
          ) : (
            <div className="empty-state">
              <p>Aucune vente enregistrée aujourd'hui.</p>
              <Link to="/pos" className="btn-text">Commencer à vendre →</Link>
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
};

export default Accueil;
