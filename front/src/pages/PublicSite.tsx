import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { sitesApi } from '../services/api';
import type { SiteConfig } from '../types';
import { SiteTheme, THEME_STYLES } from '../types/themes';
import CatalogueManager from '../components/CatalogueManager';
import './PublicSite.css';

function PublicSite() {
  const { stringId } = useParams<{ stringId: string }>();
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSiteConfig();
  }, [stringId]);

  const loadSiteConfig = async () => {
    if (!stringId) {
      setError('ID du site manquant');
      setLoading(false);
      return;
    }

    try {
      const configData = await sitesApi.getConfig(stringId);
      setConfig(configData);
      
      // Inject theme CSS into the document
      injectThemeStyles(configData.css_template);
    } catch (err: any) {
      console.error('Error loading site config:', err);
      setError('Site non trouvé ou erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const injectThemeStyles = (theme: string) => {
    // Remove existing theme style if any
    const existingStyle = document.getElementById('theme-styles');
    if (existingStyle) {
      existingStyle.remove();
    }

    // Create and inject new theme styles
    const styleElement = document.createElement('style');
    styleElement.id = 'theme-styles';
    styleElement.textContent = THEME_STYLES[theme as SiteTheme] || THEME_STYLES[SiteTheme.MODERN];
    document.head.appendChild(styleElement);
  };

  useEffect(() => {
    // Cleanup: remove theme styles when component unmounts
    return () => {
      const existingStyle = document.getElementById('theme-styles');
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="public-loading">
        <div className="loading-spinner"></div>
        <p>Chargement du site...</p>
      </div>
    );
  }

  if (error || !config) {
    return (
      <div className="public-error">
        <h1>😕 Oups !</h1>
        <p>{error || 'Site non trouvé'}</p>
        <a href="/devops/shanify" className="back-home">Retour à l'accueil</a>
      </div>
    );
  }

  return (
    <div className="site-container">
      <header className="site-header">
        <h1 className="site-title">{config.title || 'Sans titre'}</h1>
        <p className="site-description">{config.description || 'Aucune description'}</p>
      </header>

      <section className="site-content">
        <div className="content-section">
          <h2>Contact</h2>
          <p>{config.contact_text || 'Aucune information de contact'}</p>
        </div>
      </section>

      <section className="catalogue-section-public">
        {stringId && <CatalogueManager siteStringId={stringId} editable={false} />}
      </section>

      <footer className="site-footer">
        <p className="powered-by">Propulsé par Shanify</p>
      </footer>
    </div>
  );
}

export default PublicSite;