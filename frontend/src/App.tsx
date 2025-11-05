import { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { SiteBuilder } from './components/SiteBuilder';
import { UserProfile } from './components/UserProfile';
import * as api from './lib/builderApi';

export type User = {
  id: string;
  email: string;
  name: string;
};

export type Site = {
  id: string;
  name: string;
  description: string;
  primaryColor: string;
  fontFamily: string;
  contact: string;
  url: string;
  createdAt: string;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock: number;
  variants?: { name: string; options: string[] }[];
};

export type Page = 'landing' | 'dashboard' | 'builder' | 'profile';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [user, setUser] = useState<User | null>(null);
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);
  const [sites, setSites] = useState<Site[]>([]);

  const handleLogin = (email: string, password: string) => {
    // call backend login
    api.login(email, password)
      .then(() => {
        setUser({ id: '1', email, name: email.split('@')[0] });
        setCurrentPage('dashboard');
        loadSites();
      })
      .catch((err) => {
        console.error('Login failed', err);
      });
  };

  const handleSignup = (email: string, password: string, name: string) => {
    api.register(email, password)
      .then(() => {
        setUser({ id: '1', email, name });
        setCurrentPage('dashboard');
        loadSites();
      })
      .catch((err) => console.error('Register failed', err));
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage('landing');
    setSelectedSiteId(null);
  };

  const handleCreateSite = (site: Omit<Site, 'id' | 'createdAt' | 'url'>) => {
    // create site via backend then update config
    return api.createSite(site.name)
      .then((res) => {
        // update config
        const cfg = {
          css_template: JSON.stringify({ primaryColor: site.primaryColor, fontFamily: site.fontFamily }),
          title: site.name,
          description: site.description,
          contact_text: site.contact,
        } as api.SiteConfig;
        return api.updateSiteConfig(res.id, cfg).then(() => {
          const mapped: Site = {
            id: String(res.id),
            name: res.siteName,
            description: site.description,
            primaryColor: site.primaryColor,
            fontFamily: site.fontFamily,
            contact: site.contact,
            url: res.stringId,
            createdAt: res.createdAt,
          };
          setSites((s) => [...s, mapped]);
          return mapped;
        });
      })
      .catch((err) => {
        console.error('Create site failed', err);
        throw err;
      });
  };

  const handleUpdateSite = (siteId: string, updates: Partial<Site>) => {
    const idNum = parseInt(siteId, 10);
    if (!isNaN(idNum)) {
      if (updates.name) {
        api.updateSite(idNum, updates.name).catch((err) => console.error('Update site name failed', err));
      }
      const cfg: api.SiteConfig = {
        css_template: JSON.stringify({ primaryColor: updates.primaryColor ?? '', fontFamily: updates.fontFamily ?? '' }),
        title: updates.name ?? '',
        description: updates.description ?? '',
        contact_text: updates.contact ?? '',
      };
      api.updateSiteConfig(idNum, cfg).catch((err) => console.error('Update site config failed', err));
    }
    setSites(sites.map(site => 
      site.id === siteId ? { ...site, ...updates } : site
    ));
  };

  const handleDeleteSite = (siteId: string) => {
    const idNum = parseInt(siteId, 10);
    if (!isNaN(idNum)) {
      api.deleteSite(idNum).catch((err) => console.error('Delete site failed', err));
    }
    setSites(sites.filter(site => site.id !== siteId));
    if (selectedSiteId === siteId) {
      setSelectedSiteId(null);
      setCurrentPage('dashboard');
    }
  };

  const currentSite = sites.find(site => site.id === selectedSiteId);

  // load sites if token present on mount
  useEffect(() => {
    if (api.getStoredToken()) {
      loadSites();
      // set a basic user from token presence
      setUser((u) => u ?? { id: '1', email: 'me@shane.local', name: 'shane' });
      setCurrentPage('dashboard');
    }
  }, []);

  function loadSites() {
    api.getSites()
      .then((list) => {
        const mapped = list.map((s) => ({
          id: String(s.id),
          name: s.siteName,
          description: '',
          primaryColor: '#3B82F6',
          fontFamily: 'Inter',
          contact: '',
          url: s.stringId,
          createdAt: s.createdAt,
        } as Site));
        setSites(mapped);
      })
      .catch((err) => console.error('Load sites failed', err));
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header 
        user={user}
        onNavigate={setCurrentPage}
        onLogin={handleLogin}
        onSignup={handleSignup}
        onLogout={handleLogout}
      />
      
      <main>
        {currentPage === 'landing' && (
          <LandingPage 
            onGetStarted={() => user ? setCurrentPage('dashboard') : setCurrentPage('landing')}
            user={user}
          />
        )}
        
        {currentPage === 'dashboard' && user && (
          <Dashboard 
            sites={sites}
            onCreateNew={() => setCurrentPage('builder')}
            onEditSite={(siteId) => {
              setSelectedSiteId(siteId);
              setCurrentPage('builder');
            }}
            onDeleteSite={handleDeleteSite}
          />
        )}
        
        {currentPage === 'builder' && user && (
          <SiteBuilder 
            site={currentSite}
            onSave={(site) => {
              if (currentSite) {
                handleUpdateSite(currentSite.id, site);
              } else {
                handleCreateSite(site).then((newSite) => {
                  setSelectedSiteId(newSite.id);
                }).catch(() => {});
              }
            }}
            onBack={() => setCurrentPage('dashboard')}
          />
        )}
        
        {currentPage === 'profile' && user && (
          <UserProfile 
            user={user}
            onUpdateUser={(updates) => setUser({ ...user, ...updates })}
            onBack={() => setCurrentPage('dashboard')}
          />
        )}
      </main>
    </div>
  );
}

export default App;
