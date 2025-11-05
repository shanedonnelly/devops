import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ArrowLeft, Save, Eye } from 'lucide-react';
import { CatalogEditor } from './CatalogEditor';
import { SitePreview } from './SitePreview';
import type { Site, Product } from '../App';

type SiteBuilderProps = {
  site?: Site;
  onSave: (site: Omit<Site, 'id' | 'createdAt' | 'url'>) => void;
  onBack: () => void;
};

const fontOptions = [
  { value: 'Inter', label: 'Inter' },
  { value: 'Roboto', label: 'Roboto' },
  { value: 'Open Sans', label: 'Open Sans' },
  { value: 'Montserrat', label: 'Montserrat' },
  { value: 'Playfair Display', label: 'Playfair Display' },
];

const colorPresets = [
  { name: 'Bleu', value: '#3B82F6' },
  { name: 'Violet', value: '#8B5CF6' },
  { name: 'Rose', value: '#EC4899' },
  { name: 'Vert', value: '#10B981' },
  { name: 'Orange', value: '#F59E0B' },
  { name: 'Rouge', value: '#EF4444' },
];

export function SiteBuilder({ site, onSave, onBack }: SiteBuilderProps) {
  const [name, setName] = useState(site?.name || '');
  const [description, setDescription] = useState(site?.description || '');
  const [primaryColor, setPrimaryColor] = useState(site?.primaryColor || '#3B82F6');
  const [fontFamily, setFontFamily] = useState(site?.fontFamily || 'Inter');
  const [contact, setContact] = useState(site?.contact || '');
  const [products, setProducts] = useState<Product[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const handleSave = () => {
    onSave({
      name,
      description,
      primaryColor,
      fontFamily,
      contact,
    });
  };

  const isValid = name && description && contact;

  if (showPreview) {
    return (
      <SitePreview
        siteName={name}
        description={description}
        primaryColor={primaryColor}
        fontFamily={fontFamily}
        contact={contact}
        products={products}
        onClose={() => setShowPreview(false)}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          <div>
            <h1 className="text-slate-900">
              {site ? 'Modifier le site' : 'Créer un nouveau site'}
            </h1>
            <p className="text-slate-600">
              Configurez votre site et gérez votre catalogue
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowPreview(true)}>
            <Eye className="w-4 h-4 mr-2" />
            Aperçu
          </Button>
          <Button 
            onClick={handleSave}
            disabled={!isValid}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Save className="w-4 h-4 mr-2" />
            Enregistrer
          </Button>
        </div>
      </div>

      <Tabs defaultValue="settings" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="settings">Configuration</TabsTrigger>
          <TabsTrigger value="catalog">Catalogue</TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations générales</CardTitle>
              <CardDescription>
                Définissez les informations de base de votre site
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom du site *</Label>
                <Input
                  id="name"
                  placeholder="Ma Boutique"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description / Page d'accueil *</Label>
                <Textarea
                  id="description"
                  placeholder="Bienvenue sur ma boutique en ligne..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact">Contact *</Label>
                <Input
                  id="contact"
                  type="email"
                  placeholder="contact@maboutique.com"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Personnalisation</CardTitle>
              <CardDescription>
                Personnalisez l'apparence de votre site
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Couleur principale</Label>
                <div className="flex gap-2 flex-wrap">
                  {colorPresets.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setPrimaryColor(color.value)}
                      className="relative w-12 h-12 rounded-lg border-2 transition-all hover:scale-110"
                      style={{ 
                        backgroundColor: color.value,
                        borderColor: primaryColor === color.value ? '#1f2937' : '#e5e7eb'
                      }}
                      title={color.name}
                    >
                      {primaryColor === color.value && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-4 h-4 bg-white rounded-full" />
                        </div>
                      )}
                    </button>
                  ))}
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-12 h-12 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="font">Police de caractères</Label>
                <select
                  id="font"
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-md bg-white text-slate-900"
                >
                  {fontOptions.map((font) => (
                    <option key={font.value} value={font.value}>
                      {font.label}
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="catalog">
            <CatalogEditor 
              products={products}
              onProductsChange={setProducts}
              siteStringId={site ? site.url : null}
              isOwner={Boolean(site)}
            />
        </TabsContent>
      </Tabs>
    </div>
  );
}
