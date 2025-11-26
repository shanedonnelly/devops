// Énumération des thèmes disponibles
export const SiteTheme = {
  MODERN: 'modern',
  NATURE: 'nature',
  ARTISTIC: 'artistic',
  MINIMAL: 'minimal',
  VINTAGE: 'vintage',
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
};
