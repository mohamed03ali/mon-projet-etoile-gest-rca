import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
// On autorise tout pour éviter le blocage "Same Origin" vu sur vos photos
app.use(cors({ origin: '*' })); 

// Connexion MySQL
const db = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '', 
    database: 'gestion_stock_db'
});

db.connect(err => {
    if (err) {
        console.error('Erreur de connexion MySQL:', err.message);
    } else {
        console.log('Connecté à la base de données Gestion Stock');
    }
});

// --- AUTO-CRÉATION DE L'ADMIN ---
db.query('SELECT * FROM users', async (err, results) => {
    if (results && results.length === 0) {
        // Si la table est vide, on crée l'utilisateur par défaut
        const hashedPassword = await bcrypt.hash('admin123', 10);
        db.query('INSERT INTO users (username, password) VALUES (?, ?)', ['admin', hashedPassword]);
        console.log('✅ Utilisateur par défaut créé ! Login: admin / Mot de passe: admin123');
    }
});



// --- AUTHENTIFICATION ---
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    const sql = 'SELECT * FROM users WHERE username = ?';
    
    db.query(sql, [username], async (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(401).json({ message: "Utilisateur non trouvé" });

        const user = results[0];
        const match = await bcrypt.compare(password, user.password);
        
        if (!match) return res.status(401).json({ message: "Mot de passe incorrect" });

        const token = jwt.sign({ id: user.id }, 'votre_cle_secrete_pwa', { expiresIn: '24h' });
        res.json({ token, username: user.username });
    });
});

// --- GESTION DES VENTES & STOCK ---
app.post('/api/sales', (req, res) => {
    const { product_id, client_id, quantity, total_price, status } = req.body;

    // 1. Enregistrer la vente
    const sqlSale = 'INSERT INTO sales (product_id, client_id, quantity, total_price, status) VALUES (?, ?, ?, ?, ?)';
    db.query(sqlSale, [product_id, client_id, quantity, total_price, status], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        // 2. Diminuer le stock automatiquement
        const sqlUpdateStock = 'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?';
        db.query(sqlUpdateStock, [quantity, product_id], (errStock) => {
            if (errStock) console.error("Erreur mise à jour stock:", errStock);

            // 3. Gestion de la dette si nécessaire
            if (status === 'debt' && client_id) {
                const sqlDebt = 'UPDATE clients SET total_debt = total_debt + ? WHERE id = ?';
                db.query(sqlDebt, [total_price, client_id]);
            }

            res.status(201).json({ success: true, message: "Vente validée et stock mis à jour" });
        });
    });
});

// --- CRUD PRODUITS (LISTER) ---
app.get('/api/products', (req, res) => {
    db.query('SELECT * FROM products', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// --- CRUD PRODUITS (AJOUTER) ---
app.post('/api/products', (req, res) => {
    const { name, purchase_price, sale_price, stock_quantity, alert_threshold } = req.body;
    
    // category_id est fixé à 1 pour l'instant (on pourra l'améliorer plus tard)
    const sql = 'INSERT INTO products (category_id, name, purchase_price, sale_price, stock_quantity, alert_threshold) VALUES (1, ?, ?, ?, ?, ?)';
    
    db.query(sql, [name, purchase_price, sale_price, stock_quantity, alert_threshold], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id: result.insertId, message: "Produit ajouté avec succès" });
    });
});



app.listen(PORT, () => {
    console.log(`Serveur prêt sur http://localhost:${PORT}`);
});

