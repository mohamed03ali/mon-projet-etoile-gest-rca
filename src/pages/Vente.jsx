import  { useState, useEffect } from 'react';
import { db } from '../db';
import { synchroniserDonnees } from '../syncService'; // IMPORT DE LA SYNCHRO

const POS = () => {
  const [products, setProducts] = useState([]);
  const [clients, setClients] = useState([]); // Liste des clients pour suggestions
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);
  
  // NOUVEAU : Formulaire Client & Paiement
  const [clientNom, setClientNom] = useState('Comptant');
  const [typePaiement, setTypePaiement] = useState('complet'); // 'complet' ou 'credit'

  const [saleSuccess, setSaleSuccess] = useState(null); 
  const [syncStatus, setSyncStatus] = useState('En attente');

  const loadProducts = async () => setProducts(await db.products.toArray());
  const loadClients = async () => setClients(await db.clients.toArray());

  useEffect(() => { 
    (async () => {
      setProducts(await db.products.toArray());
      setClients(await db.clients.toArray());
    })();
  }, []);

  useEffect(() => {
    setTotal(cart.reduce((acc, item) => acc + (item.sale_price * item.quantity), 0));
  }, [cart]);

  const updateQuantity = (id, delta) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQuantity = item.quantity + delta;
        if (newQuantity <= 0) return { ...item, quantity: 0 }; 
        if (delta > 0 && newQuantity > item.stock_quantity) return item;
        return { ...item, quantity: newQuantity };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const addToCart = (product) => {
    if (product.stock_quantity <= 0) return;
    const existing = cart.find(item => item.id === product.id);
    if (existing) updateQuantity(product.id, 1);
    else setCart([...cart, { ...product, quantity: 1 }]);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    try {
      // 1. Gérer le Client (Création si nouveau et mise à jour de dette si crédit)
      let finalClientName = clientNom.trim() || 'Comptant';
      let clientDb = await db.clients.where('nom').equalsIgnoreCase(finalClientName).first();
      
      if (!clientDb && finalClientName !== 'Comptant') {
        // Créer le client s'il n'existe pas
        const newClientId = await db.clients.add({ nom: finalClientName, telephone: '', dette: 0 });
        clientDb = await db.clients.get(newClientId);
      }

      if (clientDb && typePaiement === 'credit') {
        await db.clients.update(clientDb.id, { dette: clientDb.dette + total });
      }

      // 2. Enregistrer la Vente
      const saleData = {
        date: new Date(),
        items: cart,
        total_price: total,
        client: finalClientName,
        status: typePaiement === 'credit' ? 'Dette' : 'Payé',
        synced: 0
      };
      const localSaleId = await db.sales.add(saleData);

      // 3. Mettre à jour le stock
      for (const item of cart) {
        const product = await db.products.get(item.id);
        await db.products.update(item.id, { stock_quantity: product.stock_quantity - item.quantity });
      }

      // 4. Afficher l'écran de succès
      setSaleSuccess({
        id: localSaleId,
        total: total,
        client: finalClientName,
        status: saleData.status,
        itemsCount: cart.length
      });
      setCart([]);
      setClientNom('Comptant');
      setTypePaiement('complet');
      loadProducts();

      // 5. Tentative de Synchro Automatique
      setSyncStatus('En cours...');
      const syncResult = await synchroniserDonnees(); // Utilisation du service centralisé !
      setSyncStatus(syncResult.status === 'success' ? 'Succès' : 'En attente (Hors ligne)');

    } catch (err) { alert("Erreur : " + err.message); }
  };

  const resetPOS = () => { setSaleSuccess(null); setSyncStatus('En attente'); };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  // ================= ECRAN SUCCÈS =================
  if (saleSuccess) {
    return (
      <div className="success-screen">
        <div className="success-content">
          <div className="confetti-icon"><div className="check-circle">✓</div></div>
          <h1 className="success-title">Vente {saleSuccess.status === 'Dette' ? 'à Crédit' : 'Validée'} !</h1>
          <div className="success-amount">{saleSuccess.total.toLocaleString()} <span>FCFA</span></div>

          <div className="success-client-card">
            <small>CLIENT</small>
            <h2>{saleSuccess.client}</h2>
            <p>N° TXN-{saleSuccess.id} • {saleSuccess.itemsCount} articles</p>
            {saleSuccess.status === 'Dette' && <p style={{color:'#ffc107', marginTop:'5px'}}>⚠️ Ajouté à la dette</p>}
          </div>

          <div className={`sync-badge ${syncStatus === 'Succès' ? 'synced' : 'pending'}`}>
            💾 Synchronisation : {syncStatus}
          </div>

          <button className="btn-new-sale" onClick={resetPOS}>🛒 Nouvelle vente</button>
        </div>
      </div>
    );
  }

  // ================= CAISSE NORMALE =================
  return (
    <div className="pos-container">
      <div className="pos-products">
        <input type="text" className="pos-search-input" placeholder="Rechercher un produit..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <div className="products-grid">
          {filteredProducts.map(p => (
            <div key={p.id} className="product-card-pos" onClick={() => addToCart(p)}>
              <div className="p-info"><strong>{p.name}</strong><p>{p.sale_price.toLocaleString()} FCFA</p></div>
              <div className={`p-stock ${p.stock_quantity < 5 ? 'low' : ''}`}>Stock: {p.stock_quantity}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="pos-cart">
        <div className="cart-header">
          <h2>Panier</h2>
          {/* NOUVEAU : Sélection du Client */}
          <div className="client-selector">
            <input 
              type="text" 
              list="clients-list" 
              placeholder="Nom du client (ou Comptant)" 
              value={clientNom} 
              onChange={e => setClientNom(e.target.value)}
              className="client-input"
            />
            <datalist id="clients-list">
              <option value="Comptant" />
              {clients.map(c => <option key={c.id} value={c.nom} />)}
            </datalist>
          </div>
        </div>

        <div className="cart-items">
          {cart.length === 0 ? <p className="empty-msg">Panier vide</p> : cart.map(item => (
            <div key={item.id} className="cart-item-ui">
              <div className="item-ui-left">
                <div className="item-ui-details"><strong>{item.name}</strong><small>Qté: {item.quantity}</small></div>
              </div>
              <div className="item-ui-right">
                <span className="item-ui-total">{(item.sale_price * item.quantity).toLocaleString()}</span>
                <div className="qty-controls">
                  <button onClick={() => updateQuantity(item.id, -1)}>-</button><span>{item.quantity}</span><button onClick={() => updateQuantity(item.id, 1)}>+</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="cart-footer-ui">
          {/* NOUVEAU : Toggle Paiement */}
          <div className="payment-toggle">
            <label><input type="radio" name="pay" checked={typePaiement === 'complet'} onChange={() => setTypePaiement('complet')} /> Payé (Comptant)</label>
            <label><input type="radio" name="pay" checked={typePaiement === 'credit'} onChange={() => setTypePaiement('credit')} /> À Crédit (Dette)</label>
          </div>

          <div className="total-row-ui">
            <span>TOTAL</span>
            <span className="total-amount-ui">{total.toLocaleString()} <small>FCFA</small></span>
          </div>
          <div className="cart-action-buttons">
            <button className="btn-ui-cancel" onClick={() => setCart([])}>✕<br/>Annuler</button>
            <button className="btn-ui-checkout" disabled={cart.length === 0} onClick={handleCheckout}>✓ Valider la vente</button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default POS;


