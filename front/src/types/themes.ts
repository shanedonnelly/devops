// Énumération des thèmes disponibles
export const SiteTheme = {
  MODERN: 'modern',
  NATURE: 'nature',
  ARTISTIC: 'artistic',
  MINIMAL: 'minimal',
  VINTAGE: 'vintage',
  CYBERPUNK: 'cyberpunk',
  LUXURY: 'luxury',
  PASTEL: 'pastel',
  BRUTALIST: 'brutalist',
  GLASS: 'glass',
  RETROWAVE: 'retrowave',
  ACADEMIA: 'academia',
  NEUMORPHISM: 'neumorphism',
  COSMIC: 'cosmic',
  POPART: 'popart',
} as const;

export type SiteTheme = typeof SiteTheme[keyof typeof SiteTheme];

// Interface pour les métadonnées des thèmes
export interface ThemeInfo {
  id: SiteTheme;
  name: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
}

// Métadonnées de chaque thème
export const THEME_INFO: Record<SiteTheme, ThemeInfo> = {
  [SiteTheme.MODERN]: {
    id: SiteTheme.MODERN,
    name: 'Ultra Moderne',
    description: 'Design épuré et futuriste avec des dégradés vibrants',
    primaryColor: '#6366f1',
    secondaryColor: '#8b5cf6',
    fontFamily: 'Inter, sans-serif',
  },
  [SiteTheme.NATURE]: {
    id: SiteTheme.NATURE,
    name: 'Nature',
    description: 'Tons terreux et organiques inspirés de la nature',
    primaryColor: '#059669',
    secondaryColor: '#84cc16',
    fontFamily: 'Nunito, sans-serif',
  },
  [SiteTheme.ARTISTIC]: {
    id: SiteTheme.ARTISTIC,
    name: 'Artistique',
    description: 'Couleurs audacieuses et typographie créative',
    primaryColor: '#ec4899',
    secondaryColor: '#f59e0b',
    fontFamily: 'Playfair Display, serif',
  },
  [SiteTheme.MINIMAL]: {
    id: SiteTheme.MINIMAL,
    name: 'Minimaliste',
    description: 'Simplicité et élégance en noir et blanc',
    primaryColor: '#000000',
    secondaryColor: '#4b5563',
    fontFamily: 'Roboto, sans-serif',
  },
  [SiteTheme.VINTAGE]: {
    id: SiteTheme.VINTAGE,
    name: 'Vintage',
    description: 'Rétro et nostalgique avec des tons sépia',
    primaryColor: '#92400e',
    secondaryColor: '#b45309',
    fontFamily: 'Merriweather, serif',
  },
  [SiteTheme.CYBERPUNK]: {
    id: SiteTheme.CYBERPUNK,
    name: 'Cyberpunk 2077',
    description: 'Néons, glitchs, et esthétique high-tech sombre',
    primaryColor: '#fcee0a',
    secondaryColor: '#00f0ff',
    fontFamily: 'Orbitron, sans-serif',
  },
  [SiteTheme.LUXURY]: {
    id: SiteTheme.LUXURY,
    name: 'Luxe Doré',
    description: 'Élégance haut de gamme, noir profond et or',
    primaryColor: '#d4af37',
    secondaryColor: '#1a1a1a',
    fontFamily: 'Cinzel, serif',
  },
  [SiteTheme.PASTEL]: {
    id: SiteTheme.PASTEL,
    name: 'Rêve Pastel',
    description: 'Douceur, formes arrondies et couleurs bonbons',
    primaryColor: '#ffb7b2',
    secondaryColor: '#b5ead7',
    fontFamily: 'Quicksand, sans-serif',
  },
  [SiteTheme.BRUTALIST]: {
    id: SiteTheme.BRUTALIST,
    name: 'Néo-Brutalisme',
    description: 'Raw, contrasté, bordures épaisses et audace',
    primaryColor: '#ff4d4d',
    secondaryColor: '#000000',
    fontFamily: 'Space Mono, monospace',
  },
  [SiteTheme.GLASS]: {
    id: SiteTheme.GLASS,
    name: 'Glassmorphism',
    description: 'Transparence, flou et profondeur moderne',
    primaryColor: 'rgba(255, 255, 255, 0.2)',
    secondaryColor: '#3b82f6',
    fontFamily: 'Poppins, sans-serif',
  },
  [SiteTheme.RETROWAVE]: {
    id: SiteTheme.RETROWAVE,
    name: 'Retro Wave 80s',
    description: 'Synthwave, grille laser et coucher de soleil',
    primaryColor: '#ff00ff',
    secondaryColor: '#00ffff',
    fontFamily: 'Press Start 2P, cursive',
  },
  [SiteTheme.ACADEMIA]: {
    id: SiteTheme.ACADEMIA,
    name: 'Dark Academia',
    description: 'Littéraire, mystérieux, textures de vieux papier',
    primaryColor: '#3e2723',
    secondaryColor: '#5d4037',
    fontFamily: 'Crimson Text, serif',
  },
  [SiteTheme.NEUMORPHISM]: {
    id: SiteTheme.NEUMORPHISM,
    name: 'Soft UI',
    description: 'Reliefs doux et design tactile',
    primaryColor: '#e0e5ec',
    secondaryColor: '#a3b1c6',
    fontFamily: 'Nunito Sans, sans-serif',
  },
  [SiteTheme.COSMIC]: {
    id: SiteTheme.COSMIC,
    name: 'Odyssée Cosmique',
    description: 'Espace profond, étoiles et nébuleuses',
    primaryColor: '#4c1d95',
    secondaryColor: '#8b5cf6',
    fontFamily: 'Exo 2, sans-serif',
  },
  [SiteTheme.POPART]: {
    id: SiteTheme.POPART,
    name: 'Pop Art Comic',
    description: 'Style bande dessinée, trames et couleurs primaires',
    primaryColor: '#ef4444',
    secondaryColor: '#facc15',
    fontFamily: 'Bangers, cursive',
  },
};

// CSS complet pour chaque thème
export const THEME_STYLES: Record<SiteTheme, string> = {
  [SiteTheme.MODERN]: `
/* Thème Ultra Moderne */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap');

body {
  font-family: 'Inter', sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #1f2937;
  margin: 0;
  padding: 0;
  line-height: 1.6;
}

.site-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.site-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 2rem;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.site-title {
  font-size: 3rem;
  font-weight: 700;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
  letter-spacing: -0.02em;
}

.site-description {
  font-size: 1.2rem;
  color: #6b7280;
  margin-top: 1rem;
  font-weight: 300;
}

.site-content {
  background: white;
  padding: 3rem;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  margin-bottom: 2rem;
}

.content-section {
  margin-bottom: 2rem;
}

.content-section h2 {
  font-size: 2rem;
  color: #6366f1;
  margin-bottom: 1rem;
  font-weight: 600;
}

.content-section p {
  color: #4b5563;
  line-height: 1.8;
}

.site-footer {
  background: rgba(255, 255, 255, 0.9);
  padding: 2rem;
  border-radius: 20px;
  text-align: center;
  color: #6b7280;
}

.cta-button {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  padding: 1rem 2rem;
  border-radius: 12px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

.cta-button:hover {
  transform: translateY(-2px);
}
`,

  [SiteTheme.NATURE]: `
/* Thème Nature */
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;600;700&display=swap');

body {
  font-family: 'Nunito', sans-serif;
  background: linear-gradient(to bottom, #ecfccb 0%, #d9f99d 100%);
  color: #1c3d1a;
  margin: 0;
  padding: 0;
  line-height: 1.7;
}

.site-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.site-header {
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
  padding: 3rem;
  border-radius: 30px;
  box-shadow: 0 15px 35px rgba(5, 150, 105, 0.3);
  margin-bottom: 2rem;
  position: relative;
  overflow: hidden;
}

.site-header::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -10%;
  width: 200px;
  height: 200px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
}

.site-title {
  font-size: 3rem;
  font-weight: 700;
  color: white;
  margin: 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

.site-description {
  font-size: 1.3rem;
  color: #d1fae5;
  margin-top: 1rem;
  font-weight: 400;
}

.site-content {
  background: #ffffff;
  padding: 3rem;
  border-radius: 25px;
  border: 3px solid #84cc16;
  margin-bottom: 2rem;
  box-shadow: 0 5px 20px rgba(132, 204, 22, 0.15);
}

.content-section {
  margin-bottom: 2.5rem;
}

.content-section h2 {
  font-size: 2.2rem;
  color: #059669;
  margin-bottom: 1rem;
  font-weight: 700;
  border-left: 5px solid #84cc16;
  padding-left: 1rem;
}

.content-section p {
  color: #065f46;
  line-height: 1.9;
  font-size: 1.1rem;
}

.site-footer {
  background: linear-gradient(135deg, #84cc16 0%, #65a30d 100%);
  padding: 2.5rem;
  border-radius: 25px;
  text-align: center;
  color: white;
}

.cta-button {
  background: #059669;
  color: white;
  padding: 1.2rem 2.5rem;
  border-radius: 50px;
  border: 3px solid white;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 1.1rem;
}

.cta-button:hover {
  background: white;
  color: #059669;
  transform: scale(1.05);
}
`,

  [SiteTheme.ARTISTIC]: `
/* Thème Artistique */
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;900&display=swap');

body {
  font-family: 'Playfair Display', serif;
  background: radial-gradient(circle at top right, #fae8ff 0%, #ffe4e6 50%, #fef3c7 100%);
  color: #831843;
  margin: 0;
  padding: 0;
  line-height: 1.8;
}

.site-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.site-header {
  background: linear-gradient(45deg, #ec4899 0%, #f59e0b 100%);
  padding: 4rem 3rem;
  border-radius: 0;
  border-top: 8px solid #be185d;
  border-bottom: 8px solid #be185d;
  margin-bottom: 3rem;
  position: relative;
  transform: skewY(-2deg);
  box-shadow: 0 20px 40px rgba(236, 72, 153, 0.3);
}

.site-header > * {
  transform: skewY(2deg);
}

.site-title {
  font-size: 4rem;
  font-weight: 900;
  color: white;
  margin: 0;
  text-shadow: 4px 4px 0 rgba(0, 0, 0, 0.2);
  letter-spacing: -0.03em;
  font-style: italic;
}

.site-description {
  font-size: 1.5rem;
  color: #fdf2f8;
  margin-top: 1.5rem;
  font-weight: 400;
  font-style: italic;
}

.site-content {
  background: white;
  padding: 4rem;
  border-left: 15px solid #ec4899;
  border-right: 15px solid #f59e0b;
  margin-bottom: 3rem;
  box-shadow: 15px 15px 0 rgba(236, 72, 153, 0.2);
}

.content-section {
  margin-bottom: 3rem;
}

.content-section h2 {
  font-size: 2.5rem;
  background: linear-gradient(90deg, #ec4899 0%, #f59e0b 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 1.5rem;
  font-weight: 900;
  font-style: italic;
  letter-spacing: -0.02em;
}

.content-section p {
  color: #9f1239;
  line-height: 2;
  font-size: 1.15rem;
}

.site-footer {
  background: #831843;
  padding: 3rem;
  text-align: center;
  color: #fce7f3;
  border-top: 8px solid #f59e0b;
}

.cta-button {
  background: linear-gradient(135deg, #ec4899 0%, #f59e0b 100%);
  color: white;
  padding: 1.5rem 3rem;
  border-radius: 0;
  border: 4px solid white;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 1.2rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.cta-button:hover {
  transform: translate(-5px, -5px);
  box-shadow: 5px 5px 0 white;
}
`,

  [SiteTheme.MINIMAL]: `
/* Thème Minimaliste */
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap');

body {
  font-family: 'Roboto', sans-serif;
  background: #ffffff;
  color: #000000;
  margin: 0;
  padding: 0;
  line-height: 1.6;
}

.site-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 4rem 2rem;
}

.site-header {
  background: #000000;
  padding: 4rem 3rem;
  margin-bottom: 4rem;
  border: 1px solid #000000;
}

.site-title {
  font-size: 3.5rem;
  font-weight: 300;
  color: white;
  margin: 0;
  letter-spacing: -0.05em;
  text-transform: uppercase;
}

.site-description {
  font-size: 1.1rem;
  color: #e5e7eb;
  margin-top: 1.5rem;
  font-weight: 300;
  letter-spacing: 0.05em;
}

.site-content {
  background: white;
  padding: 0;
  margin-bottom: 4rem;
  border-top: 2px solid #000000;
  border-bottom: 2px solid #000000;
  padding: 3rem 0;
}

.content-section {
  margin-bottom: 3rem;
  padding-bottom: 3rem;
  border-bottom: 1px solid #e5e7eb;
}

.content-section:last-child {
  border-bottom: none;
}

.content-section h2 {
  font-size: 2rem;
  color: #000000;
  margin-bottom: 1.5rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.content-section p {
  color: #4b5563;
  line-height: 1.8;
  font-size: 1rem;
  font-weight: 300;
}

.site-footer {
  background: transparent;
  padding: 3rem 0;
  text-align: center;
  color: #6b7280;
  border-top: 1px solid #000000;
}

.cta-button {
  background: #000000;
  color: white;
  padding: 1rem 3rem;
  border-radius: 0;
  border: 2px solid #000000;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  font-size: 0.9rem;
}

.cta-button:hover {
  background: white;
  color: #000000;
}
`,

  [SiteTheme.VINTAGE]: `
/* Thème Vintage */
@import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@300;400;700;900&display=swap');

body {
  font-family: 'Merriweather', serif;
  background: linear-gradient(to bottom, #fef3c7 0%, #fde68a 100%);
  color: #78350f;
  margin: 0;
  padding: 0;
  line-height: 1.8;
}

.site-container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 3rem 2rem;
}

.site-header {
  background: linear-gradient(135deg, #92400e 0%, #b45309 100%);
  padding: 3.5rem;
  border-radius: 5px;
  border: 10px double #d97706;
  margin-bottom: 3rem;
  box-shadow: 0 15px 30px rgba(146, 64, 14, 0.4);
  position: relative;
}

.site-header::before {
  content: '';
  position: absolute;
  top: 10px;
  left: 10px;
  right: 10px;
  bottom: 10px;
  border: 2px solid rgba(253, 230, 138, 0.3);
  pointer-events: none;
}

.site-title {
  font-size: 3.5rem;
  font-weight: 900;
  color: #fef3c7;
  margin: 0;
  text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.5);
  letter-spacing: 0.05em;
  font-style: italic;
}

.site-description {
  font-size: 1.3rem;
  color: #fde68a;
  margin-top: 1.5rem;
  font-weight: 300;
  font-style: italic;
}

.site-content {
  background: #fffbeb;
  padding: 3.5rem;
  border: 5px solid #92400e;
  margin-bottom: 3rem;
  box-shadow: inset 0 0 20px rgba(146, 64, 14, 0.1);
  position: relative;
}

.site-content::after {
  content: '';
  position: absolute;
  top: 15px;
  left: 15px;
  right: 15px;
  bottom: 15px;
  border: 1px solid #d97706;
  pointer-events: none;
}

.content-section {
  margin-bottom: 2.5rem;
  position: relative;
  z-index: 1;
}

.content-section h2 {
  font-size: 2.3rem;
  color: #92400e;
  margin-bottom: 1.5rem;
  font-weight: 700;
  border-bottom: 3px double #d97706;
  padding-bottom: 0.5rem;
  font-style: italic;
}

.content-section p {
  color: #78350f;
  line-height: 2;
  font-size: 1.1rem;
  font-weight: 400;
  text-align: justify;
}

.site-footer {
  background: linear-gradient(135deg, #78350f 0%, #92400e 100%);
  padding: 3rem;
  border-radius: 5px;
  text-align: center;
  color: #fde68a;
  border: 5px solid #b45309;
}

.cta-button {
  background: #d97706;
  color: #fffbeb;
  padding: 1.3rem 2.8rem;
  border-radius: 3px;
  border: 3px solid #78350f;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 1.1rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  box-shadow: 5px 5px 0 rgba(0, 0, 0, 0.3);
}

.cta-button:hover {
  background: #fffbeb;
  color: #92400e;
  transform: translate(2px, 2px);
  box-shadow: 3px 3px 0 rgba(0, 0, 0, 0.3);
}
`,
[SiteTheme.CYBERPUNK]: `
    /* Thème Cyberpunk */
    @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;500;700&display=swap');

    body {
      font-family: 'Rajdhani', sans-serif;
      background-color: #050505;
      background-image: linear-gradient(0deg, transparent 24%, rgba(0, 255, 255, .05) 25%, rgba(0, 255, 255, .05) 26%, transparent 27%, transparent 74%, rgba(255, 0, 255, .05) 75%, rgba(255, 0, 255, .05) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(0, 255, 255, .05) 25%, rgba(0, 255, 255, .05) 26%, transparent 27%, transparent 74%, rgba(255, 0, 255, .05) 75%, rgba(255, 0, 255, .05) 76%, transparent 77%, transparent);
      background-size: 50px 50px;
      color: #dfdfdf;
      margin: 0; padding: 0;
    }
    .site-container { max-width: 1200px; margin: 0 auto; padding: 2rem; }
    .site-header {
      background: #111;
      border: 2px solid #fcee0a;
      padding: 3rem;
      position: relative;
      margin-bottom: 3rem;
      clip-path: polygon(0 0, 100% 0, 100% 85%, 95% 100%, 0 100%);
      box-shadow: -5px 5px 0px #00f0ff;
    }
    .site-title {
      font-family: 'Orbitron', sans-serif;
      font-size: 4rem;
      color: #fcee0a;
      text-transform: uppercase;
      text-shadow: 2px 2px #ff00ff, -2px -2px #00f0ff;
      letter-spacing: 2px;
    }
    .site-description { color: #00f0ff; font-size: 1.4rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-top: 1rem; }
    .site-content {
      background: rgba(20, 20, 20, 0.95);
      border-left: 5px solid #ff00ff;
      padding: 3rem;
      margin-bottom: 3rem;
    }
    .content-section h2 {
      font-family: 'Orbitron', sans-serif;
      color: #ff00ff;
      font-size: 2.5rem;
      border-bottom: 2px solid #00f0ff;
      display: inline-block;
      padding-bottom: 5px;
      margin-bottom: 1.5rem;
    }
    .content-section p { font-size: 1.2rem; line-height: 1.7; color: #b0b0b0; }
    .site-footer { background: #111; border-top: 2px solid #fcee0a; padding: 3rem; text-align: center; color: #fcee0a; font-family: 'Orbitron', sans-serif; }
    .cta-button {
      background: #fcee0a;
      color: #000;
      font-family: 'Orbitron', sans-serif;
      font-weight: 900;
      text-transform: uppercase;
      padding: 1.5rem 3rem;
      border: none;
      clip-path: polygon(10% 0, 100% 0, 100% 80%, 90% 100%, 0 100%, 0 20%);
      cursor: pointer;
      font-size: 1.2rem;
      transition: 0.2s;
    }
    .cta-button:hover { background: #00f0ff; color: #000; box-shadow: 0 0 20px #00f0ff; }
  `,

  [SiteTheme.LUXURY]: `
    /* Thème Luxe */
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Cormorant+Garamond:wght@300;500&display=swap');

    body {
      font-family: 'Cormorant Garamond', serif;
      background-color: #0a0a0a;
      color: #e5e5e5;
      margin: 0; padding: 0;
      line-height: 1.9;
    }
    .site-container { max-width: 1100px; margin: 0 auto; padding: 4rem 2rem; }
    .site-header {
      text-align: center;
      padding: 4rem 0;
      border-bottom: 1px solid #333;
      margin-bottom: 4rem;
    }
    .site-title {
      font-family: 'Cinzel', serif;
      font-size: 3.5rem;
      background: linear-gradient(to right, #bf953f, #fcf6ba, #b38728, #fbf5b7, #aa771c);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin: 0;
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }
    .site-description { font-size: 1.2rem; color: #888; margin-top: 1.5rem; letter-spacing: 0.05em; font-style: italic; }
    .site-content { background: #111; padding: 5rem 4rem; border: 1px solid #333; margin-bottom: 4rem; position: relative; }
    .site-content::before {
      content: ''; position: absolute; top: 10px; left: 10px; right: 10px; bottom: 10px; border: 1px solid #bf953f; opacity: 0.3; pointer-events: none;
    }
    .content-section h2 {
      font-family: 'Cinzel', serif;
      font-size: 2rem;
      color: #bf953f;
      margin-bottom: 2rem;
      text-align: center;
      letter-spacing: 0.05em;
    }
    .content-section p { color: #ccc; font-size: 1.3rem; text-align: justify; }
    .site-footer { border-top: 1px solid #333; padding: 4rem 0; text-align: center; color: #666; font-family: 'Cinzel', serif; }
    .cta-button {
      background: transparent;
      color: #bf953f;
      border: 1px solid #bf953f;
      padding: 1rem 3rem;
      font-family: 'Cinzel', serif;
      letter-spacing: 0.2em;
      cursor: pointer;
      transition: all 0.4s ease;
      font-size: 1rem;
    }
    .cta-button:hover { background: #bf953f; color: #000; box-shadow: 0 0 30px rgba(191, 149, 63, 0.4); }
  `,

  [SiteTheme.PASTEL]: `
    /* Thème Pastel */
    @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@400;600;700&display=swap');

    body {
      font-family: 'Quicksand', sans-serif;
      background: #fff0f5;
      color: #5d5d5d;
      margin: 0; padding: 0;
    }
    .site-container { max-width: 1000px; margin: 0 auto; padding: 2rem; }
    .site-header {
      background: #ffb7b2;
      padding: 3rem;
      border-radius: 50px;
      text-align: center;
      margin-bottom: 2rem;
      box-shadow: 10px 10px 0px #ffdac1;
    }
    .site-title {
      font-size: 3rem;
      color: white;
      font-weight: 700;
      text-shadow: 2px 2px 0px rgba(0,0,0,0.1);
    }
    .site-description { font-size: 1.2rem; color: #fff; font-weight: 600; margin-top: 0.5rem; }
    .site-content {
      background: white;
      padding: 3rem;
      border-radius: 40px;
      margin-bottom: 2rem;
      border: 4px solid #b5ead7;
    }
    .content-section h2 {
      font-size: 2rem;
      color: #ff9aa2;
      background: #fff5f5;
      display: inline-block;
      padding: 0.5rem 1.5rem;
      border-radius: 20px;
      margin-bottom: 1rem;
    }
    .content-section p { font-size: 1.1rem; line-height: 1.8; color: #7f7f7f; }
    .site-footer { background: #e2f0cb; padding: 2rem; border-radius: 30px; text-align: center; color: #7ba858; font-weight: 700; }
    .cta-button {
      background: #c7ceea;
      color: white;
      padding: 1rem 2.5rem;
      border-radius: 30px;
      border: none;
      font-weight: 700;
      font-size: 1.1rem;
      cursor: pointer;
      box-shadow: 0 5px 15px rgba(199, 206, 234, 0.6);
      transition: transform 0.2s;
    }
    .cta-button:hover { transform: translateY(-5px) rotate(2deg); background: #b5ead7; }
  `,

  [SiteTheme.BRUTALIST]: `
    /* Thème Brutaliste */
    @import url('https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap');

    body {
      font-family: 'Space Mono', monospace;
      background-color: #f0f0f0;
      color: #000;
      margin: 0; padding: 0;
    }
    .site-container { max-width: 1200px; margin: 0 auto; padding: 1rem; }
    .site-header {
      background: #ff4d4d;
      border: 4px solid #000;
      padding: 3rem;
      margin-bottom: 2rem;
      box-shadow: 10px 10px 0px #000;
    }
    .site-title { font-size: 4rem; font-weight: 700; text-transform: uppercase; margin: 0; line-height: 0.9; }
    .site-description { font-size: 1.5rem; font-weight: 700; margin-top: 1rem; background: #000; color: #fff; display: inline-block; padding: 0.5rem; }
    .site-content {
      background: #fff;
      border: 4px solid #000;
      padding: 2rem;
      margin-bottom: 2rem;
      box-shadow: 10px 10px 0px #000;
    }
    .content-section { border-bottom: 4px solid #000; padding-bottom: 2rem; margin-bottom: 2rem; }
    .content-section:last-child { border-bottom: none; }
    .content-section h2 {
      font-size: 2.5rem;
      text-transform: uppercase;
      background: #ffe600;
      border: 3px solid #000;
      display: inline-block;
      padding: 0.5rem 1rem;
      margin-bottom: 1.5rem;
      box-shadow: 5px 5px 0px #000;
    }
    .content-section p { font-size: 1.2rem; line-height: 1.5; font-weight: 400; }
    .site-footer { background: #000; color: #fff; padding: 3rem; text-align: center; border: 4px solid #000; font-weight: 700; }
    .cta-button {
      background: #fff;
      color: #000;
      font-family: 'Space Mono', monospace;
      font-weight: 700;
      font-size: 1.5rem;
      padding: 1.5rem 4rem;
      border: 4px solid #000;
      cursor: pointer;
      box-shadow: 8px 8px 0px #000;
      transition: all 0.1s;
    }
    .cta-button:hover { transform: translate(4px, 4px); box-shadow: 4px 4px 0px #000; background: #ffe600; }
  `,

  [SiteTheme.GLASS]: `
    /* Thème Glassmorphism */
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;500;700&display=swap');

    body {
      font-family: 'Poppins', sans-serif;
      background: url('https://images.unsplash.com/photo-1557683316-973673baf926?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80') no-repeat center center fixed;
      background-size: cover;
      color: #fff;
      margin: 0; padding: 0;
      min-height: 100vh;
    }
    .site-container { max-width: 1100px; margin: 0 auto; padding: 3rem 2rem; }
    .site-header {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(15px);
      -webkit-backdrop-filter: blur(15px);
      padding: 3rem;
      border-radius: 20px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      margin-bottom: 2rem;
      box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
    }
    .site-title { font-size: 3.5rem; font-weight: 700; margin: 0; text-shadow: 0 2px 10px rgba(0,0,0,0.2); }
    .site-description { font-size: 1.2rem; margin-top: 1rem; opacity: 0.9; font-weight: 300; }
    .site-content {
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      padding: 3rem;
      border-radius: 20px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      margin-bottom: 2rem;
      box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
    }
    .content-section h2 { font-size: 2.2rem; color: #fff; margin-bottom: 1.5rem; font-weight: 700; }
    .content-section p { font-size: 1.1rem; line-height: 1.8; opacity: 0.85; }
    .site-footer {
      background: rgba(0, 0, 0, 0.2);
      backdrop-filter: blur(10px);
      padding: 2rem;
      border-radius: 20px;
      text-align: center;
      color: rgba(255, 255, 255, 0.7);
    }
    .cta-button {
      background: rgba(255, 255, 255, 0.2);
      color: white;
      padding: 1rem 3rem;
      border-radius: 50px;
      border: 1px solid rgba(255, 255, 255, 0.4);
      font-weight: 600;
      font-size: 1rem;
      cursor: pointer;
      transition: background 0.3s;
      backdrop-filter: blur(5px);
    }
    .cta-button:hover { background: rgba(255, 255, 255, 0.4); }
  `,

  [SiteTheme.RETROWAVE]: `
    /* Thème Retro Wave */
    @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&display=swap');

    body {
      font-family: 'VT323', monospace;
      background-color: #2b003b;
      background-image: linear-gradient(0deg, transparent 24%, rgba(255, 0, 255, .3) 25%, rgba(255, 0, 255, .3) 26%, transparent 27%, transparent 74%, rgba(255, 0, 255, .3) 75%, rgba(255, 0, 255, .3) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(255, 0, 255, .3) 25%, rgba(255, 0, 255, .3) 26%, transparent 27%, transparent 74%, rgba(255, 0, 255, .3) 75%, rgba(255, 0, 255, .3) 76%, transparent 77%, transparent);
      background-size: 40px 40px;
      background-attachment: fixed;
      color: #fff;
      margin: 0; padding: 0;
    }
    .site-container { max-width: 1000px; margin: 0 auto; padding: 3rem 2rem; }
    .site-header {
      background: linear-gradient(180deg, #180c2e 0%, #440a67 100%);
      padding: 3rem;
      border: 4px solid #00ffff;
      margin-bottom: 3rem;
      box-shadow: 0 0 20px #ff00ff;
      text-align: center;
    }
    .site-title {
      font-family: 'Press Start 2P', cursive;
      font-size: 2.5rem;
      background: linear-gradient(to bottom, #ff0080 0%, #ff8c00 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      text-shadow: 3px 3px 0px rgba(0,0,0,0.5);
      line-height: 1.5;
    }
    .site-description { font-size: 1.5rem; color: #00ffff; margin-top: 2rem; text-transform: uppercase; letter-spacing: 2px; }
    .site-content {
      background: rgba(0, 0, 0, 0.8);
      border: 2px solid #ff00ff;
      padding: 3rem;
      box-shadow: 10px 10px 0 #2a004f;
    }
    .content-section h2 {
      font-family: 'Press Start 2P', cursive;
      font-size: 1.5rem;
      color: #ff00ff;
      margin-bottom: 2rem;
      text-transform: uppercase;
    }
    .content-section p { font-size: 1.4rem; color: #e0e0e0; line-height: 1.6; }
    .site-footer { padding: 3rem; text-align: center; color: #ff8c00; font-size: 1.2rem; text-transform: uppercase; }
    .cta-button {
      background: transparent;
      color: #00ffff;
      font-family: 'Press Start 2P', cursive;
      font-size: 0.9rem;
      padding: 1.5rem;
      border: 4px solid #00ffff;
      cursor: pointer;
      box-shadow: 0 0 10px #00ffff;
      transition: all 0.2s;
    }
    .cta-button:hover { background: #00ffff; color: #000; box-shadow: 0 0 30px #00ffff; }
  `,

  [SiteTheme.ACADEMIA]: `
    /* Thème Dark Academia */
    @import url('https://fonts.googleapis.com/css2?family=Crimson+Text:ital,wght@0,400;0,600;0,700;1,400&display=swap');

    body {
      font-family: 'Crimson Text', serif;
      background-color: #1c1c1c;
      color: #d7d7d7;
      margin: 0; padding: 0;
      line-height: 1.8;
    }
    .site-container { max-width: 900px; margin: 0 auto; padding: 4rem 2rem; }
    .site-header {
      background: #2b1d1a;
      padding: 4rem;
      border-radius: 4px;
      margin-bottom: 3rem;
      border-bottom: 3px solid #5d4037;
    }
    .site-title { font-size: 3.5rem; font-weight: 400; color: #e8d5b5; margin: 0; letter-spacing: 0.05em; border-bottom: 1px solid #5d4037; display: inline-block; padding-bottom: 1rem; }
    .site-description { font-size: 1.3rem; color: #a1887f; margin-top: 1.5rem; font-style: italic; }
    .site-content {
      background: #261e1b;
      padding: 4rem;
      border: 1px solid #3e2723;
      margin-bottom: 3rem;
      position: relative;
    }
    .content-section h2 { font-size: 2.2rem; color: #e8d5b5; margin-bottom: 1.5rem; font-weight: 600; font-variant: small-caps; letter-spacing: 0.1em; }
    .content-section p { font-size: 1.25rem; color: #bcaaa4; line-height: 1.9; text-align: justify; }
    .site-footer { border-top: 1px solid #3e2723; padding: 3rem; text-align: center; color: #5d4037; font-style: italic; }
    .cta-button {
      background: #3e2723;
      color: #e8d5b5;
      padding: 1rem 3rem;
      border: 1px solid #5d4037;
      font-family: 'Crimson Text', serif;
      font-size: 1.2rem;
      cursor: pointer;
      transition: all 0.3s;
      border-radius: 2px;
    }
    .cta-button:hover { background: #5d4037; color: #fff; }
  `,

  [SiteTheme.NEUMORPHISM]: `
    /* Thème Neumorphism (Soft UI) */
    @import url('https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@300;400;600;700&display=swap');

    body {
      font-family: 'Nunito Sans', sans-serif;
      background-color: #e0e5ec;
      color: #4a5568;
      margin: 0; padding: 0;
      line-height: 1.7;
    }
    .site-container { max-width: 1000px; margin: 0 auto; padding: 3rem 2rem; }
    .site-header {
      background: #e0e5ec;
      padding: 3rem;
      border-radius: 50px;
      margin-bottom: 3rem;
      box-shadow: 20px 20px 60px #bec3c9, -20px -20px 60px #ffffff;
      text-align: center;
    }
    .site-title { font-size: 3rem; font-weight: 700; color: #4a5568; margin: 0; letter-spacing: -0.02em; }
    .site-description { font-size: 1.2rem; color: #718096; margin-top: 1rem; }
    .site-content {
      background: #e0e5ec;
      padding: 3rem;
      border-radius: 40px;
      margin-bottom: 3rem;
      box-shadow: inset 20px 20px 60px #bec3c9, inset -20px -20px 60px #ffffff;
    }
    .content-section h2 { font-size: 2rem; color: #2d3748; margin-bottom: 1.5rem; font-weight: 600; }
    .content-section p { font-size: 1.1rem; color: #4a5568; }
    .site-footer { padding: 2rem; text-align: center; color: #a0aec0; }
    .cta-button {
      background: #e0e5ec;
      color: #4a5568;
      padding: 1.2rem 3rem;
      border-radius: 50px;
      border: none;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 9px 9px 16px #bec3c9, -9px -9px 16px #ffffff;
      transition: all 0.2s;
    }
    .cta-button:hover { box-shadow: inset 9px 9px 16px #bec3c9, inset -9px -9px 16px #ffffff; transform: scale(0.98); }
  `,

  [SiteTheme.COSMIC]: `
    /* Thème Cosmic */
    @import url('https://fonts.googleapis.com/css2?family=Exo+2:wght@300;400;700&display=swap');

    body {
      font-family: 'Exo 2', sans-serif;
      background: radial-gradient(ellipse at bottom, #1b2735 0%, #090a0f 100%);
      color: #fff;
      margin: 0; padding: 0;
      min-height: 100vh;
    }
    .site-container { max-width: 1100px; margin: 0 auto; padding: 3rem 2rem; }
    .site-header {
      background: linear-gradient(135deg, rgba(76, 29, 149, 0.4) 0%, rgba(30, 58, 138, 0.4) 100%);
      padding: 4rem;
      border-radius: 20px;
      border: 1px solid rgba(139, 92, 246, 0.3);
      margin-bottom: 3rem;
      position: relative;
      overflow: hidden;
      box-shadow: 0 0 50px rgba(76, 29, 149, 0.5);
    }
    .site-title {
      font-size: 4rem; font-weight: 700; margin: 0;
      background: linear-gradient(to right, #c084fc, #6366f1);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .site-description { font-size: 1.4rem; color: #a5b4fc; margin-top: 1rem; font-weight: 300; }
    .site-content {
      background: rgba(15, 23, 42, 0.6);
      padding: 3rem;
      border-radius: 20px;
      border-top: 2px solid #8b5cf6;
      margin-bottom: 3rem;
    }
    .content-section h2 { font-size: 2.2rem; color: #e879f9; margin-bottom: 1.5rem; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; }
    .content-section p { font-size: 1.1rem; line-height: 1.8; color: #cbd5e1; }
    .site-footer { padding: 3rem; text-align: center; color: #64748b; border-top: 1px solid rgba(255,255,255,0.1); }
    .cta-button {
      background: linear-gradient(90deg, #7c3aed 0%, #2563eb 100%);
      color: white;
      padding: 1rem 3rem;
      border-radius: 8px;
      border: none;
      font-weight: 700;
      font-size: 1.1rem;
      cursor: pointer;
      box-shadow: 0 0 20px rgba(124, 58, 237, 0.5);
      transition: transform 0.3s;
    }
    .cta-button:hover { transform: scale(1.05); box-shadow: 0 0 30px rgba(124, 58, 237, 0.8); }
  `,

  [SiteTheme.POPART]: `
    /* Thème Pop Art */
    @import url('https://fonts.googleapis.com/css2?family=Bangers&family=Comic+Neue:wght@400;700&display=swap');

    body {
      font-family: 'Comic Neue', cursive;
      background-color: #facc15;
      background-image: radial-gradient(#ef4444 15%, transparent 16%), radial-gradient(#ef4444 15%, transparent 16%);
      background-size: 20px 20px;
      background-position: 0 0, 10px 10px;
      color: #000;
      margin: 0; padding: 0;
    }
    .site-container { max-width: 1000px; margin: 0 auto; padding: 2rem; }
    .site-header {
      background: #fff;
      padding: 3rem;
      border: 5px solid #000;
      box-shadow: 15px 15px 0px #000;
      margin-bottom: 3rem;
      transform: rotate(-1deg);
    }
    .site-title {
      font-family: 'Bangers', cursive;
      font-size: 4.5rem;
      color: #3b82f6;
      text-shadow: 3px 3px 0px #000;
      margin: 0;
      letter-spacing: 2px;
      text-transform: uppercase;
    }
    .site-description { font-size: 1.8rem; font-weight: 700; color: #000; background: #ef4444; display: inline-block; padding: 0.2rem 1rem; color: #fff; border: 3px solid #000; transform: rotate(2deg); margin-top: 1rem; }
    .site-content {
      background: #fff;
      padding: 3rem;
      border: 5px solid #000;
      box-shadow: 15px 15px 0px #3b82f6;
      margin-bottom: 3rem;
    }
    .content-section h2 {
      font-family: 'Bangers', cursive;
      font-size: 3rem;
      color: #000;
      margin-bottom: 1.5rem;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .content-section p { font-size: 1.4rem; line-height: 1.5; font-weight: 700; }
    .site-footer { background: #000; padding: 2rem; text-align: center; color: #fff; font-family: 'Bangers', cursive; font-size: 1.5rem; letter-spacing: 2px; }
    .cta-button {
      background: #ef4444;
      color: #fff;
      font-family: 'Bangers', cursive;
      font-size: 2rem;
      padding: 1rem 3rem;
      border: 4px solid #000;
      cursor: pointer;
      transition: transform 0.2s;
      letter-spacing: 2px;
    }
    .cta-button:hover { transform: scale(1.1) rotate(-3deg); background: #facc15; color: #000; }
  `,
};
