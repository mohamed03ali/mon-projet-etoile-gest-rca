import  { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../db';
import logo from '../assets/logo.jpg';


const Accueil = () => {
  const [stats, setStats] = useState({ ventesJour: 0, beneficeJour: 0, articles: 0 });
  const [ventes, setVentes] = useState([]);

  useEffect(() => {
    const chargerDonnees = async () => {
      const allProducts = await db.products.toArray();
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const allSales = await db.sales.toArray();
      const ventesAujourdhui = allSales.filter(sale => new Date(sale.date) >= today);

      let totalVentes = 0;
      let totalBenefice = 0;

      ventesAujourdhui.forEach(sale => {
        totalVentes += sale.total_price;
        
        sale.items.forEach(item => {
          const beneficeItem = (item.sale_price - item.purchase_price) * item.quantity;
          totalBenefice += beneficeItem;
        });
      });

      setStats({
        ventesJour: totalVentes,
        beneficeJour: totalBenefice,
        articles: allProducts.length
      });

      setVentes(allSales.reverse().slice(0, 3));
    };

    chargerDonnees();
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
          <div className="offline-pill">⚠️ Mode Hors Ligne</div>
        </div>

        <div className="dash-stats-row">
          <div className="stat-box">
            <p className="stat-value">{stats.ventesJour.toLocaleString()} <span className="currency">FCFA</span></p>
            <p className="stat-label">VENTES DU JOUR</p>
          </div>
          <div className="stat-box highlight-box">
            <p className="stat-value">{stats.beneficeJour.toLocaleString()} <span className="currency">FCFA</span></p>
            <p className="stat-label">BÉNÉFICE DU JOUR</p>
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
            <small>Aller à la caisse</small>
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
              // Création d'une chaîne de texte avec les noms des produits
              const descriptionProduits = v.items 
                ? v.items.map(item => `${item.name} (${item.quantity})`).join(', ')
                : 'Produits';

              return (
                <div key={i} className="sale-item">
                  <div className="sale-icon">🛍️</div>
                  <div className="sale-details">
                    {/* Affichage des noms des produits au lieu de l'ID */}
                    <strong>{descriptionProduits}</strong>
                    <small>{new Date(v.date).toLocaleTimeString()}</small>
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


/*
const Accueil = () => {
  const [stats, setStats] = useState({ revenu: 0, benefice: 0, articles: 0 });
  const [ventes, setVentes] = useState([]); // Pour les futures ventes récentes

  useEffect(() => {
    const chargerDonnees = async () => {
      // 1. Calcul des statistiques du stock
      const allProducts = await db.products.toArray();
      let totalRevenu = 0;
      let totalBenefice = 0;

      allProducts.forEach(p => {
        const revenuProduit = p.stock_quantity * p.sale_price;
        const coutProduit = p.stock_quantity * p.purchase_price;
        totalRevenu += revenuProduit;
        totalBenefice += (revenuProduit - coutProduit);
      });

      setStats({
        revenu: totalRevenu,
        benefice: totalBenefice,
        articles: allProducts.length
      });

      // 2. Chargement des ventes récentes (sera utile après la création de la caisse)
      // const ventesRecentes = await db.sales.orderBy('id').reverse().limit(3).toArray();
      // setVentes(ventesRecentes);
    };

    chargerDonnees();
  }, []);

  return (
    <div className="dashboard-wrapper">
      {/* En-tête de l'accueil (Style moderne avec fond bleu) */
    /*  <div className="dashboard-header-bg">
        <div className="dash-top-info">
          <div className="brand-info">
            <img src={logo} alt="Logo" className="dash-logo" />
            <div>
              <p className="greeting">Bonjour, Admin 👋</p>
              <h1>Étoile de Centrafrique B</h1>
              <p className="sub-branding">Logiciel de gestion de stock et de ventes</p>
            </div>
          </div>
          <div className="offline-pill">⚠️ Mode Hors Ligne</div>
        </div>

        {/* Les 3 blocs de statistiques */
      /*  <div className="dash-stats-row">
          <div className="stat-box">
            <p className="stat-value">{stats.revenu.toLocaleString()} <span className="currency">FCFA</span></p>
            <p className="stat-label">REVENU POTENTIEL</p>
          </div>
          <div className="stat-box highlight-box">
            <p className="stat-value">{stats.benefice.toLocaleString()} <span className="currency">FCFA</span></p>
            <p className="stat-label">BÉNÉFICE ESTIMÉ</p>
          </div>
          <div className="stat-box">
            <p className="stat-value">{stats.articles}</p>
            <p className="stat-label">PRODUITS EN STOCK</p>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Actions Rapides */
      /*  <div className="section-title">
          <h2>Actions Rapides</h2>
        </div>
        
        <div className="quick-actions-grid">
          <Link to="/pos" className="action-btn primary-action">
            <span className="action-icon">🛒</span>
            <strong>Nouvelle Vente</strong>
            <small>Aller à la caisse</small>
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
          
          <Link to="/rapports" className="action-btn">
            <span className="action-icon">📊</span>
            <strong>Rapports</strong>
            <small>Voir les bilans</small>
          </Link>
        </div>

        {/* Ventes Récentes (Prêt pour la suite) */
      /*  <div className="section-title" style={{ marginTop: '40px' }}>
          <h2>Ventes Récentes</h2>
        </div>
        
        <div className="recent-sales-list">
          {ventes.length > 0 ? (
            ventes.map((v, i) => (
              <div key={i} className="sale-item">
                <div className="sale-icon">🛍️</div>
                <div className="sale-details">
                  <strong>Vente #{v.id}</strong>
                  <small>Il y a quelques instants</small>
                </div>
                <div className="sale-amount">+{v.total_price} FCFA</div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <p>Aucune vente enregistrée pour le moment.</p>
              <Link to="/pos" className="btn-text">Commencer à vendre →</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Accueil;*/
