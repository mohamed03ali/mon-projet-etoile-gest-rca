import  { useState } from 'react';
import '../App.css';
import logo from '../assets/logo.jpg'; 
import boissons from '../assets/juice.png'; 


const Login = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleConnect = async (e) => {
    e.preventDefault();
    
    // 1. VÉRIFICATION LOCALE (Fonctionne à 100% sans serveur)
    if (username === 'admin' && password === 'admin123') {
      onLoginSuccess();
      return;
    }

    // 2. VÉRIFICATION SERVEUR (Si les identifiants locaux ne correspondent pas)
    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('token', data.token);
        onLoginSuccess();
      } else {
        alert("Identifiants incorrects. Essayez admin / admin123");
      }
    } catch (error) {
      alert("Serveur injoignable. Utilisez les identifiants par défaut : admin / admin123",error);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        
        {/* Côté Gauche - Info & Images */}
        <div className="login-info-side">
          <div className="logo-white-bg">
            <img src={logo} alt="Logo" className="login-logo" />
          </div>
          <h1 className="brand-title">ÉTOILE <span className="gold-text">DE CENTRAFRIQUE </span></h1>
          <p className="brand-subtitle">LOGICIEL DE GESTION DE STOCK ET DE VENTES</p>
          
          <img src={boissons} alt="Produits" className="center-illustration" />
          
          <div className="offline-badge">
            <span className="icon-bg">📶</span> Fonctionne hors ligne
          </div>
        </div>

        {/* Côté Droit - Formulaire */}
        <div className="login-form-side">
          <div className="login-box">
            <h2>Connexion</h2>
            <p className="login-subtitle">Connectez-vous pour accéder à votre compte.</p>
            
            <form onSubmit={handleConnect}>
              <div className="input-group">
                <span className="input-icon"></span>
                <input 
                  type="text" 
                  placeholder="Nom d'utilisateur" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required 
                />
              </div>
              
              <div className="input-group">
                <span className="input-icon"></span>
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Mot de passe" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
                <button 
                  type="button" 
                  className="eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "👁️" : "🙈"}
                </button>
              </div>
              
              <button type="submit" className="btn-primary">Se connecter</button>
            </form>

            <div className="divider">ou</div>
            
            {/* BOUTON MODE HORS LIGNE (Connecte directement) */}
            <button type="button" className="btn-offline" onClick={onLoginSuccess}>
              ☁️ Mode hors ligne
            </button>

            <p className="copyright">
              © 2026 Étoile de Centrafrique B - Tous droits réservés
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;


/*import { useState } from 'react';
import '../App.css';
import logo from '../assets/logo.jpg'; // Votre logo téléchargé
import boissons from '../assets/juice.png'; // Votre image centrale

const Login = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleConnect = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);
        onLoginSuccess();
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert("Erreur serveur. Vérifiez que le backend est lancé.",error);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        
        {/* Côté Gauche - Info & Images */
      /*  <div className="login-info-side">
          <img src={logo} alt="Logo" className="login-logo" />
          <h1 className="brand-title">ÉTOILE <span> DE CENTRAFRIQUE </span></h1>
          <p className="brand-subtitle">LOGICIEL DE GESTION DE STOCK ET DE VENTES</p>
          
          {/* L'image au centre (Boissons/Colis) */
        /*  <img src={boissons} alt="Produits" className="center-illustration" />
          
          <div className="offline-badge">
            <span>📶</span> Fonctionne hors ligne
          </div>
        </div>

        {/* Côté Droit - Formulaire */
       /* <div className="login-form-side">
          <div className="login-box">
            <h2>Connexion</h2>
            <p className="login-subtitle">Connectez-vous pour accéder à votre compte.</p>
            
            <form onSubmit={handleConnect}>
              <div className="input-group">
                <input 
                  type="text" 
                  placeholder="👤 Nom d'utilisateur" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required 
                />
              </div>
              <div className="input-group">
                <input 
                  type="password" 
                  placeholder=" Mot de passe" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </div>
              
              <div className="remember-me">
                <input type="checkbox" id="remember" />
                <label htmlFor="remember">Se souvenir de moi</label>
              </div>

              <button type="submit" className="btn-primary">Se connecter</button>
            </form>

            <div className="divider">ou</div>
            
            <button className="btn-offline" onClick={onLoginSuccess}>
              ☁️ Mode hors ligne
            </button>

            <p className="copyright">
              © 2026 Étoile de Centrafrique B - Tous droits réservés
            </p>
            <p> © Copyright 2026 by:Manu and moustaphamohamedali60@gmail.com  </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
*/