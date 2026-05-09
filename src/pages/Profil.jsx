import  { useState, useEffect } from 'react';
import { synchroniserDonnees } from '../syncService';


const Profil = ({onLogout, installButtonVisible, installMessage, handleInstallClick}) => {
  const [syncStatus, setSyncStatus] = useState('À jour');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => { window.removeEventListener('online', handleOnline); window.removeEventListener('offline', handleOffline); };
  }, []);

  const handleSync = async () => {
    setIsSyncing(true); setSyncStatus('En cours...');
    const res = await synchroniserDonnees();
    setIsSyncing(false);
    setSyncStatus(res.status === 'success' ? 'À jour ✔️' : 'Erreur');
    setTimeout(() => setSyncStatus('À jour'), 3000);
  };

  return (
    <div className="page-container profile-page">
      <div className="profile-header">
        <div className="profile-avatar">👨🏽💼</div>
        <div className="profile-info">
          <h2>Admin</h2>
          <p>Propriétaire • Étoile de Centrafrique</p>
        </div>
        <div className={`status-dot ${isOnline ? 'online' : 'offline'}`}>
          {isOnline ? '🟢 En Ligne' : '🔴 Hors Ligne'}
        </div>
      </div>

      <div className="menu-list">
        {/* CARTE SYNCHRONISATION */}
        <div className="menu-item sync-card" onClick={handleSync}>
          <div className="menu-item-left">
            <span className="menu-icon">🔄</span>
            <div>
              <strong>Synchronisation</strong>
              <small>{isOnline ? 'Appuyez pour forcer' : 'Connexion requise'}</small>
            </div>
          </div>
          <div className="menu-item-right">
            <span className={`sync-badge ${isSyncing ? 'syncing' : ''}`}>{syncStatus}</span>
          </div>
        </div>

        {/* MODE HORS LIGNE (Visuel) */}
        <div className="menu-item">
          <div className="menu-item-left">
            <span className="menu-icon">📴</span>
            <strong>Mode hors-ligne</strong>
          </div>
          <div className="toggle-switch active"></div>
        </div>

        {/* LANGUE */}
        <div className="menu-item">
          <div className="menu-item-left">
            <span className="menu-icon">🌐</span>
            <div>
              <strong>Langue</strong>
              <small>Français actif</small>
            </div>
          </div>
          <span className="arrow">›</span>
        </div>

        {/* INSTALLATION PWA */}
        {installButtonVisible && (
          <div className="menu-item install-item" onClick={handleInstallClick} style={{ border: '1px solid #007bff' }}>
            <div className="menu-item-left">
              <span className="menu-icon" style={{ background: '#e7f3ff' }}>📱</span>
              <div>
                <strong>Installer l'application</strong>
                <small>Disponible sur ce navigateur</small>
              </div>
            </div>
            <span className="arrow">›</span>
          </div>
        )}

        {/* MESSAGE INSTALLATION */}
        {installMessage && (
          <div className="menu-item" style={{ background: '#f0f9f0', border: '1px solid #1a7f1a', color: '#1a7f1a' }}>
            <div className="menu-item-left">
              <span className="menu-icon" style={{ background: '#e8f5e8' }}>✅</span>
              <strong>{installMessage}</strong>
            </div>
          </div>
        )}

        {/* BOUTON DECONNEXION */}
        <div className="menu-item logout-item" onClick={onLogout} style={{ border: '1px solid #ff4d4d' }}>
          <div className="menu-item-left">
            <span className="menu-icon" style={{ background: '#fff0f0' }}>🚪</span>
            <strong style={{ color: '#ff4d4d' }}>Se déconnecter</strong>
          </div>
          <span className="arrow">›</span>
        </div>

      </div>
    </div>
  );
};
export default Profil;




