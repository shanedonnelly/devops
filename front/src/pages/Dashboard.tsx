import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { sitesApi } from '../services/api';
import { removeToken } from '../utils/auth';
import type { Site } from '../types';
import './Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [siteName, setSiteName] = useState('');
  const [editingSite, setEditingSite] = useState<Site | null>(null);

  useEffect(() => {
    loadSites();
  }, []);

  const loadSites = async () => {
    try {
      const data = await sitesApi.getAll();
      setSites(data);
    } catch (err) {
      console.error('Error loading sites:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!siteName.trim()) return;
    
    try {
      await sitesApi.create({ site_name: siteName });
      setSiteName('');
      setShowModal(false);
      loadSites();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Erreur lors de la création');
    }
  };

  const handleUpdate = async () => {
    if (!editingSite || !siteName.trim()) return;
    
    try {
      await sitesApi.update(editingSite.id, { site_name: siteName });
      setSiteName('');
      setEditingSite(null);
      setShowModal(false);
      loadSites();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Erreur lors de la modification');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce site ?')) return;
    
    try {
      await sitesApi.delete(id);
      loadSites();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Erreur lors de la suppression');
    }
  };

  const openCreateModal = () => {
    setEditingSite(null);
    setSiteName('');
    setShowModal(true);
  };

  const openEditModal = (site: Site) => {
    setEditingSite(site);
    setSiteName(site.siteName);
    setShowModal(true);
  };

  const handleLogout = () => {
    removeToken();
    navigate('/');
  };

  if (loading) {
    return <div className="dashboard-loading">Chargement...</div>;
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Mes Sites</h1>
        <button onClick={handleLogout} className="btn-logout">
          Déconnexion
        </button>
      </header>

      <div className="sites-grid">
        <div className="site-card add-card" onClick={openCreateModal}>
          <div className="add-icon">+</div>
          <p>Créer un nouveau site</p>
        </div>

        {sites.map((site) => (
          <div key={site.id} className="site-card">
            <h3>{site.siteName}</h3>
            <p className="site-url">shanify.com/{site.stringId}</p>
            
            <div className="site-actions">
              <button
                onClick={() => navigate(`/builder/${site.id}`)}
                className="btn-action btn-build"
              >
                Ouvrir le Builder
              </button>
              <button
                onClick={() => window.open(`/public/${site.stringId}`, '_blank')}
                className="btn-action btn-visit"
              >
                Visiter
              </button>
              <button
                onClick={() => openEditModal(site)}
                className="btn-action btn-edit"
              >
                Modifier
              </button>
              <button
                onClick={() => handleDelete(site.id)}
                className="btn-action btn-delete"
              >
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingSite ? 'Modifier le site' : 'Créer un site'}</h2>
            
            <input
              type="text"
              placeholder="Nom du site"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              className="modal-input"
              autoFocus
            />
            
            <div className="modal-actions">
              <button onClick={() => setShowModal(false)} className="btn-cancel">
                Annuler
              </button>
              <button
                onClick={editingSite ? handleUpdate : handleCreate}
                className="btn-confirm"
              >
                {editingSite ? 'Modifier' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;