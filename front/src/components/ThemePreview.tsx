import { SiteTheme, THEME_STYLES } from '../types/themes';
import './ThemePreview.css';

interface ThemePreviewProps {
  theme: SiteTheme;
}

function ThemePreview({ theme }: ThemePreviewProps) {
  return (
    <div className="theme-preview-container">
      <style>{THEME_STYLES[theme]}</style>
      <div className="theme-preview-content">
        <div className="site-container">
          <div className="site-header">
            <h1 className="site-title">Votre Titre</h1>
            <p className="site-description">Une description captivante de votre site</p>
          </div>
          
          <div className="site-content">
            <div className="content-section">
              <h2>Section Exemple</h2>
              <p>Ceci est un exemple de contenu qui montre le style de votre site.</p>
            </div>
          </div>
          
          <div className="site-footer">
            <button className="cta-button">Bouton d'Action</button>
            <p>Contactez-nous ici</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ThemePreview;
