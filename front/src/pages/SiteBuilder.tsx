import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { sitesApi } from '../services/api';
import type { SiteConfig, Site } from '../types';
import { SiteTheme, THEME_INFO } from '../types/themes';
import ThemePreview from '../components/ThemePreview';
import './SiteBuilder.css';

function SiteBuilder() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [site, setSite] = useState<Site | null>(null);
  const [config, setConfig] = useState<SiteConfig>({
    css_template: SiteTheme.MODERN,
    title: '',
    description: '',
    contact_text: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadSiteAndConfig();
  }, [id]);

  const loadSiteAndConfig = async () => {
    if (!id) return;
    
    try {
      const sites = await sitesApi.getAll();
      const currentSite = sites.find(s => s.id === parseInt(id));
      
      if (!currentSite) {
        alert('Site non trouvé');
        navigate('/dashboard');
        return;
      }
      
      setSite(currentSite);
      const configData = await sitesApi.getConfig(currentSite.stringId);
      setConfig(configData);
    } catch (err) {
      console.error('Error loading site config:', err);
      alert('Erreur lors du chargement de la configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    
    setSaving(true);
    setMessage('');
    
    try {
      await sitesApi.updateConfig(parseInt(id), config);
      setMessage('Configuration enregistrée avec succès !');
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setMessage(err.response?.data?.detail || 'Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="builder-loading">Chargement...</div>;
  }

  return (
    <div className="builder-container">
      <header className="builder-header">
        <button onClick={() => navigate('/dashboard')} className="btn-back">
          ← Retour
        </button>
        <h1>Site Builder - {site?.siteName}</h1>
      </header>

      <div className="builder-content">
        <form onSubmit={handleSubmit} className="config-form">
          <h2>Configuration du site</h2>

          {message && (
            <div className={`message ${message.includes('succès') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="title">Titre du site</label>
            <input
              type="text"
              id="title"
              value={config.title}
              onChange={(e) => setConfig({ ...config, title: e.target.value })}
              placeholder="Mon Super Site"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={config.description}
              onChange={(e) => setConfig({ ...config, description: e.target.value })}
              placeholder="Description de votre site..."
              rows={4}
            />
          </div>

          <div className="form-group">
            <label htmlFor="contact">Texte de contact</label>
            <textarea
              id="contact"
              value={config.contact_text}
              onChange={(e) => setConfig({ ...config, contact_text: e.target.value })}
              placeholder="Contactez-nous à..."
              rows={3}
            />
          </div>

          <div className="form-group">
            <label htmlFor="theme">Style du Site</label>
            <select
              id="theme"
              value={config.css_template}
              onChange={(e) => setConfig({ ...config, css_template: e.target.value })}
              className="theme-select"
            >
              {Object.values(SiteTheme).map((themeId) => {
                const themeInfo = THEME_INFO[themeId];
                return (
                  <option key={themeId} value={themeId}>
                    {themeInfo.name} - {themeInfo.description}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="theme-preview-wrapper">
            <h3>Aperçu du style</h3>
            <ThemePreview theme={config.css_template as SiteTheme} />
          </div>

          <button type="submit" className="btn-save" disabled={saving}>
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default SiteBuilder;