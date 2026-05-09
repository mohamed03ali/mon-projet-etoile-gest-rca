import  { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../db';
import { synchroniserDonnees } from '../syncService';

const Panier = ({ cart, setCart }) => {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [clientNom, setClientNom] = useState('Comptant');
  const [telephone, setTelephone] = useState(''); // Numéro de téléphone du client
  const [typePaiement, setTypePaiement] = useState('complet');
  const [saleSuccess, setSaleSuccess] = useState(null);

  useEffect(() => {
    const loadClients = async () => setClients(await db.clients.toArray());
    loadClients();
  }, []);

  const total = cart.reduce((acc, item) => acc + (item.sale_price * item.quantity), 0);

  const updateQuantity = (id, delta) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }).filter(item => item.quantity > 0 && (item.id !== id || item.quantity + delta > 0)));
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    try {
      let finalName = clientNom.trim() || 'Comptant';
      let clientDb = await db.clients.where('nom').equalsIgnoreCase(finalName).first();
      
      const finalPhone = telephone.trim();
      if (!clientDb && finalName !== 'Comptant') {
        const newId = await db.clients.add({ nom: finalName, telephone: finalPhone, dette: 0 });
        clientDb = await db.clients.get(newId);
      }

      if (clientDb) {
        if (finalName !== 'Comptant' && finalPhone) {
          await db.clients.update(clientDb.id, { telephone: finalPhone });
          clientDb = await db.clients.get(clientDb.id);
        }

        if (typePaiement === 'credit') {
          await db.clients.update(clientDb.id, { dette: clientDb.dette + total });
        }
      }

      const saleData = {
        date: new Date(),
        items: cart,
        total_price: total,
        client: finalName,
        telephone: finalPhone,
        status: typePaiement === 'credit' ? 'Dette' : 'Payé',
        synced: 0
      };
      
      const localSaleId = await db.sales.add(saleData);

      for (const item of cart) {
        const p = await db.products.get(item.id);
        await db.products.update(item.id, { stock_quantity: p.stock_quantity - item.quantity });
      }

      setSaleSuccess({ id: localSaleId, total, client: finalName, telephone: finalPhone, status: saleData.status });
      setCart([]); setClientNom('Comptant'); setTelephone(''); setTypePaiement('complet');
      synchroniserDonnees(); // Tente de synchroniser en arrière-plan

    } catch (err) { alert("Erreur : " + err.message); }
  };

  if (saleSuccess) {
    return (
      <div className="success-screen">
        <div className="success-content">
          <div className="confetti-icon">✓</div>
          <h1>Vente Validée !</h1>
          <div className="success-amount">{saleSuccess.total.toLocaleString()} FCFA</div>
          <div className="success-client-card">
            <small>CLIENT</small>
            <h2>{saleSuccess.client}</h2>
            <small>{saleSuccess.telephone ? `📞 ${saleSuccess.telephone}` : 'Pas de téléphone'}</small>
            {saleSuccess.status === 'Dette' && <p style={{color:'#ffc107'}}>⚠️ Ajouté à la dette</p>}
          </div>
          <button className="btn-new-sale" onClick={() => { setSaleSuccess(null); navigate('/pos'); }}>
            🛒 Nouvelle vente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container cart-page">
      <div className="section-header"><h1>Panier</h1></div>
      
      <div className="cart-items">
        {cart.length === 0 ? <p>Le panier est vide.</p> : cart.map(item => (
          <div key={item.id} className="cart-item-ui">
            <div className="item-ui-details"><strong>{item.name}</strong><p>{item.sale_price.toLocaleString()} x {item.quantity}</p></div>
            <div className="qty-controls">
              <button onClick={() => updateQuantity(item.id, -1)}>-</button>
              <span>{item.quantity}</span>
              <button onClick={() => updateQuantity(item.id, 1)}>+</button>
            </div>
          </div>
        ))}
      </div>

      {cart.length > 0 && (
        <div className="checkout-form">
          <h3>Informations Client</h3>
          <input type="text" list="clients-list" placeholder="Nom du client" value={clientNom} onChange={e => setClientNom(e.target.value)} className="client-input" />
          <datalist id="clients-list"><option value="Comptant" />{clients.map(c => <option key={c.id} value={c.nom} />)}</datalist>
          
          <input type="tel" placeholder="Téléphone du client" value={telephone} onChange={e => setTelephone(e.target.value)} className="client-input" style={{marginTop: '10px'}} inputMode="tel" maxLength="15" />

          <div className="payment-toggle" style={{marginTop: '15px'}}>
            <label><input type="radio" checked={typePaiement === 'complet'} onChange={() => setTypePaiement('complet')} /> Payé</label>
            <label><input type="radio" checked={typePaiement === 'credit'} onChange={() => setTypePaiement('credit')} /> À Crédit</label>
          </div>

          <div className="client-summary" style={{marginTop: '15px', padding: '10px', border: '1px solid #ddd', borderRadius: '8px', background: '#fafafa'}}>
            <small>Client actuel</small>
            <p style={{margin: '6px 0 0', fontWeight: 600}}>{clientNom || 'Comptant'}{telephone ? ` • ${telephone}` : ''}</p>
          </div>
          <div className="total-row-ui"><span>TOTAL</span><span className="total-amount-ui">{total.toLocaleString()} FCFA</span></div>
          <button className="btn-ui-checkout" onClick={handleCheckout}>✓ Valider la vente</button>
        </div>
      )}
    </div>
  );
};
export default Panier;
