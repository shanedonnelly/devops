import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Plus, Edit, Trash2, Package } from 'lucide-react';
import { ProductForm } from './ProductForm';
import type { Product } from '../App';
import * as catalogApi from '../lib/catalogApi';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './ui/alert-dialog';
import { ImageWithFallback } from './figma/ImageWithFallback';

type CatalogEditorProps = {
  products: Product[];
  onProductsChange: (products: Product[]) => void;
  siteStringId?: string | null; // optional: when editing an existing site
  isOwner?: boolean; // whether the current viewer is the owner of the site
};

export function CatalogEditor({
  products,
  onProductsChange,
  siteStringId: propSiteStringId,
  isOwner: propIsOwner,
}: CatalogEditorProps) {
  const [localProducts, setLocalProducts] = useState<Product[]>(products || []);
  const [isEditMode, setIsEditMode] = useState<boolean>(true);
  const [loadingRemote, setLoadingRemote] = useState(false);
  const [siteStringId, setSiteStringId] = useState<string | null>(propSiteStringId ?? null);
  const [isOwner, setIsOwner] = useState<boolean>(propIsOwner ?? true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Sync props
  useEffect(() => setLocalProducts(products || []), [products]);
  useEffect(() => setSiteStringId(propSiteStringId ?? null), [propSiteStringId]);
  useEffect(() => setIsOwner(Boolean(propIsOwner)), [propIsOwner]);

  // Load remote catalogue if siteStringId is provided
  useEffect(() => {
    if (!siteStringId) return;
    setLoadingRemote(true);
    catalogApi
      .getCatalogue(siteStringId)
      .then((res: catalogApi.CatalogueResponse) => {
        const mapped: Product[] = [];
        (res.categories || []).forEach((cat: catalogApi.CategoryResponse) => {
          (cat.products || []).forEach((p: catalogApi.ProductResponse) => {
            const stock = (p.variants || []).reduce(
              (s: number, v: catalogApi.Variant) => s + (v.stock || 0),
              0
            );
            mapped.push({
              id: `p_${p.id}`,
              name: p.name,
              description: p.description,
              price: p.price,
              image: '',
              category: cat.name,
              stock,
            });
          });
        });
        setLocalProducts(mapped);
        onProductsChange(mapped);
      })
      .catch((err: unknown) => console.error('Failed to load catalogue', err))
      .finally(() => setLoadingRemote(false));
  }, [siteStringId]);

  // Handlers
  const handleSaveProduct = (product: Omit<Product, 'id'>) => {
    if (editingProduct) {
      const updated = localProducts.map((p) =>
        p.id === editingProduct.id ? { ...product, id: editingProduct.id } : p
      );
      setLocalProducts(updated);
      onProductsChange(updated);
      setEditingProduct(null);
    } else {
      const newProduct: Product = { ...product, id: `product_${Date.now()}` };
      const updated = [...localProducts, newProduct];
      setLocalProducts(updated);
      onProductsChange(updated);
      setIsCreating(false);
    }
  };

  const handleDeleteProduct = (productId: string) => {
    const updated = localProducts.filter((p) => p.id !== productId);
    setLocalProducts(updated);
    onProductsChange(updated);
  };

  const handleCancel = () => {
    setEditingProduct(null);
    setIsCreating(false);
  };

  // Editing or creating view
  if (isCreating || editingProduct) {
    return (
      <ProductForm
        product={editingProduct || undefined}
        onSave={handleSaveProduct}
        onCancel={handleCancel}
      />
    );
  }

  // Main view
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Catalogue de produits</CardTitle>
            <CardDescription>Gérez vos produits, catégories et stocks</CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm text-slate-600 mr-2">
              {isEditMode ? 'Mode Édition' : 'Mode Visualisation'}
            </div>
            <Button
              variant={isEditMode ? 'default' : 'outline'}
              onClick={() => isOwner && setIsEditMode((s) => !s)}
            >
              {isEditMode ? 'Basculer en visualisation' : 'Basculer en édition'}
            </Button>
            <Button
              onClick={() => setIsCreating(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              disabled={!isOwner || !isEditMode}
            >
              <Plus className="w-4 h-4 mr-2" /> Ajouter un produit
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {loadingRemote ? (
          <div className="py-6 text-center text-slate-600">Chargement du catalogue...</div>
        ) : localProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-slate-200 rounded-lg">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Package className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-slate-900 mb-2">Aucun produit</h3>
            <p className="text-slate-600 mb-4 text-center max-w-md">
              Commencez par ajouter vos premiers produits à votre catalogue
            </p>
            <Button onClick={() => setIsCreating(true)} disabled={!isOwner || !isEditMode}>
              <Plus className="w-4 h-4 mr-2" /> Ajouter mon premier produit
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {localProducts.map((product) => (
              <div
                key={product.id}
                className="flex gap-4 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div className="w-20 h-20 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                  <ImageWithFallback
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-slate-900 truncate">{product.name}</h4>
                      <p className="text-slate-600 text-sm line-clamp-2 mt-1">
                        {product.description}
                      </p>
                      <div className="flex flex-wrap gap-3 mt-2 text-sm">
                        <span className="text-slate-900">
                          {product.price.toFixed(2)} €
                        </span>
                        <span className="text-slate-600">Stock: {product.stock}</span>
                        <span className="text-slate-600">
                          Catégorie: {product.category}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingProduct(product)}
                        disabled={!isOwner || !isEditMode}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            disabled={!isOwner || !isEditMode}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Supprimer le produit</AlertDialogTitle>
                            <AlertDialogDescription>
                              Êtes-vous sûr de vouloir supprimer "{product.name}" ? Cette
                              action est irréversible.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteProduct(product.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Supprimer
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <div className="px-6 pb-6">
        <div className="flex justify-end gap-2">
          <Button
            onClick={() => {
              if (!siteStringId) return;
              const groups: Record<string, Product[]> = {};
              localProducts.forEach((p) => {
                const k = p.category || 'Uncategorized';
                groups[k] = groups[k] || [];
                groups[k].push(p);
              });
              const payload = Object.keys(groups).map((name) => ({
                name,
                products: groups[name].map((pr) => ({
                  name: pr.name,
                  description: pr.description,
                  price: pr.price,
                  variants: [],
                })),
              }));

              catalogApi
                .updateCatalogue(siteStringId, payload)
                .then(() => console.log('Catalogue updated'))
                .catch((err: unknown) =>
                  console.error('Update catalogue failed', err)
                );
            }}
            disabled={!isOwner || !isEditMode || !siteStringId}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            Enregistrer le catalogue
          </Button>
        </div>
      </div>
    </Card>
  );
}
