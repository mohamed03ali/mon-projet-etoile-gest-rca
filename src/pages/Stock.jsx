import  { useState, useEffect } from 'react';
import { db } from '../db'; // Notre base de données locale (Dexie)
import entrepotIcon from '../assets/entrepot.png';
import '../App.css';

const Stock = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // États du formulaire
  const [name, setName] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');
  const [alertThreshold, setAlertThreshold] = useState('5');

  // Charger les produits depuis la base locale (Dexie)
  const loadProducts = async () => {
    const allProducts = await db.products.toArray();
    setProducts(allProducts);
  };

  useEffect(() => {
    loadProducts();
    // Plus tard, nous ajouterons ici la fonction pour récupérer depuis le serveur (MySQL)
  }, []);

  // Ajouter un produit (Hors ligne & En ligne)
  const handleAddProduct = async (e) => {
    e.preventDefault();
    
    const newProduct = {
      name,
      purchase_price: parseFloat(purchasePrice),
      sale_price: parseFloat(salePrice),
      stock_quantity: parseInt(stockQuantity),
      alert_threshold: parseInt(alertThreshold),
    };

    try {
      // 1. Sauvegarde locale immédiate (Hors ligne)
      await db.products.add(newProduct);
      
      // 2. Tentative d'envoi au serveur (En ligne)
      fetch('http://localhost:5000/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct)
      }).catch(err => console.log("Mode hors ligne activé : le produit sera synchronisé plus tard.",err));

      // 3. Réinitialiser le formulaire et recharger la liste
      setName(''); setPurchasePrice(''); setSalePrice('');
      setStockQuantity(''); setAlertThreshold('5');
      loadProducts();
      
    } catch (error) {
      alert("Erreur lors de l'ajout du produit.",error);
    }
  };

  // Supprimer un produit localement
  const handleDelete = async (id) => {
    if(window.confirm("Voulez-vous vraiment supprimer ce produit ?")) {
      await db.products.delete(id);
      loadProducts();
      // (Ici, on ajoutera la requête DELETE vers le serveur)
    }
  };

  // Filtrer les produits pour la recherche
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="stock-page">
      <div className="stock-header">
        <img src={entrepotIcon} alt="Entrepôt" className="page-icon" />
        <div>
          <h2>Gestion du Stock</h2>
          <p>Ajoutez, modifiez et suivez vos articles en temps réel.</p>
        </div>
      </div>

      <div className="stock-content">
        {/* Formulaire d'ajout rapide */}
        <div className="stock-card form-card">
          <h3>➕ Nouvel Article</h3>
          <form onSubmit={handleAddProduct} className="product-form">
            <input type="text" placeholder="Nom du produit" value={name} onChange={e => setName(e.target.value)} required />
            <div className="form-row">
              <input type="number" placeholder="Prix d'achat" value={purchasePrice} onChange={e => setPurchasePrice(e.target.value)} required />
              <input type="number" placeholder="Prix de vente" value={salePrice} onChange={e => setSalePrice(e.target.value)} required />
            </div>
            <div className="form-row">
              <input type="number" placeholder="Quantité en stock" value={stockQuantity} onChange={e => setStockQuantity(e.target.value)} required />
              <input type="number" placeholder="Alerte stock bas (ex: 5)" value={alertThreshold} onChange={e => setAlertThreshold(e.target.value)} required />
            </div>
            <button type="submit" className="btn-primary">Enregistrer le produit</button>
          </form>
        </div>

        {/* Liste des produits avec barre de recherche */}
        <div className="stock-card list-card">
          <div className="list-header">
            <h3>📦 Liste des Produits</h3>
            <input 
              type="text" 
              placeholder="🔍 Rechercher un produit..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="search-bar"
            />
          </div>

          <div className="table-responsive">
            <table className="stock-table">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Prix Achat</th>
                  <th>Prix Vente</th>
                  <th>Stock Actuel</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map(product => (
                  <tr key={product.id} className={product.stock_quantity <= product.alert_threshold ? 'stock-alert' : ''}>
                    <td>{product.name}</td>
                    <td>{product.purchase_price} FCFA</td>
                    <td>{product.sale_price} FCFA</td>
                    <td>
                      <span className={`badge ${product.stock_quantity <= product.alert_threshold ? 'badge-danger' : 'badge-success'}`}>
                        {product.stock_quantity}
                      </span>
                    </td>
                    <td>
                      <button className="btn-edit">✏️modifier</button>
                      <button className="btn-delete" onClick={() => handleDelete(product.id)}>🗑️supp</button>
                    </td>
                  </tr>
                ))}
                {filteredProducts.length === 0 && (
                  <tr><td colSpan="5" style={{textAlign: 'center'}}>Aucun produit trouvé.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stock;

