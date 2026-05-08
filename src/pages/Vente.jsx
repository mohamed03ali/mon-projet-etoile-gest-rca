import  { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../db';

const POS = ({ cart, setCart }) => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const loadProducts = async () => setProducts(await db.products.toArray());
    loadProducts();
  }, []);

  const addToCart = (product) => {
    if (product.stock_quantity <= 0) return;
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  const cartTotal = cart.reduce((acc, item) => acc + (item.sale_price * item.quantity), 0);

  return (
    <div className="page-container pos-catalog">
      <div className="section-header">
        <h1>Catalogue</h1>
        <input 
          type="text" 
          className="pos-search-input" 
          placeholder="Rechercher un produit..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
        />
      </div>

      <div className="products-grid">
        {filteredProducts.map(p => (
          <div key={p.id} className="product-card-pos" onClick={() => addToCart(p)}>
            <div className="p-info">
              <strong>{p.name}</strong>
              <p>{p.sale_price.toLocaleString()} FCFA</p>
            </div>
            <div className={`p-stock ${p.stock_quantity < 5 ? 'low' : ''}`}>Stock: {p.stock_quantity}</div>
          </div>
        ))}
      </div>

      {cart.length > 0 && (
        <button className="floating-cart-btn" onClick={() => navigate('/panier')}>
          Aller au panier ({cartTotal.toLocaleString()} FCFA) →
        </button>
      )}
    </div>
  );
};
export default POS;
