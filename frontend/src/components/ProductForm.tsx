import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { X, Plus, Trash2 } from 'lucide-react';
import type { Product } from '../App';

type ProductFormProps = {
  product?: Product;
  onSave: (product: Omit<Product, 'id'>) => void;
  onCancel: () => void;
};

type Variant = {
  name: string;
  options: string[];
};

const categories = [
  'Vêtements',
  'Électronique',
  'Maison & Jardin',
  'Beauté & Santé',
  'Sport & Loisirs',
  'Alimentation',
  'Livres & Média',
  'Jouets & Enfants',
  'Autre',
];

export function ProductForm({ product, onSave, onCancel }: ProductFormProps) {
  const [name, setName] = useState(product?.name || '');
  const [description, setDescription] = useState(product?.description || '');
  const [price, setPrice] = useState(product?.price.toString() || '');
  const [image, setImage] = useState(product?.image || '');
  const [category, setCategory] = useState(product?.category || categories[0]);
  const [stock, setStock] = useState(product?.stock.toString() || '0');
  const [variants, setVariants] = useState<Variant[]>(product?.variants || []);
  const [newVariantName, setNewVariantName] = useState('');
  const [newVariantOption, setNewVariantOption] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      description,
      price: parseFloat(price),
      image,
      category,
      stock: parseInt(stock),
      variants: variants.length > 0 ? variants : undefined,
    });
  };

  const handleAddVariant = () => {
    if (newVariantName) {
      setVariants([...variants, { name: newVariantName, options: [] }]);
      setNewVariantName('');
    }
  };

  const handleAddVariantOption = (index: number) => {
    if (newVariantOption) {
      const updated = [...variants];
      updated[index].options.push(newVariantOption);
      setVariants(updated);
      setNewVariantOption('');
    }
  };

  const handleRemoveVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleRemoveVariantOption = (variantIndex: number, optionIndex: number) => {
    const updated = [...variants];
    updated[variantIndex].options = updated[variantIndex].options.filter((_, i) => i !== optionIndex);
    setVariants(updated);
  };

  const isValid = name && description && price && parseFloat(price) >= 0 && image && stock && parseInt(stock) >= 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            {product ? 'Modifier le produit' : 'Nouveau produit'}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom du produit *</Label>
                <Input
                  id="name"
                  placeholder="Ex: T-shirt en coton"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Décrivez votre produit..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Catégorie *</Label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-md bg-white text-slate-900"
                  required
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="price">Prix (€) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="29.99"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stock">Stock *</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  placeholder="100"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">URL de l'image *</Label>
                <Input
                  id="image"
                  type="url"
                  placeholder="https://exemple.com/image.jpg"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  required
                />
                {image && (
                  <div className="mt-2 aspect-square w-32 bg-slate-100 rounded-lg overflow-hidden">
                    <img
                      src={image}
                      alt="Aperçu"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '';
                        e.currentTarget.classList.add('hidden');
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-6">
            <h3 className="text-slate-900 mb-4">Variantes (optionnel)</h3>
            
            <div className="space-y-4">
              {variants.map((variant, variantIndex) => (
                <div key={variantIndex} className="border border-slate-200 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-slate-900">{variant.name}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveVariant(variantIndex)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {variant.options.map((option, optionIndex) => (
                      <div 
                        key={optionIndex}
                        className="flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-full"
                      >
                        <span className="text-slate-900">{option}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveVariantOption(variantIndex, optionIndex)}
                          className="text-slate-400 hover:text-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex gap-2">
                    <Input
                      placeholder="Nouvelle option"
                      value={newVariantOption}
                      onChange={(e) => setNewVariantOption(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddVariantOption(variantIndex);
                        }
                      }}
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handleAddVariantOption(variantIndex)}
                      disabled={!newVariantOption}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              
              <div className="flex gap-2">
                <Input
                  placeholder="Nom de la variante (ex: Taille, Couleur)"
                  value={newVariantName}
                  onChange={(e) => setNewVariantName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddVariant();
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={handleAddVariant}
                  disabled={!newVariantName}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter variante
                </Button>
              </div>
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-4 border-t border-slate-200">
            <Button type="button" variant="outline" onClick={onCancel}>
              Annuler
            </Button>
            <Button 
              type="submit"
              disabled={!isValid}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {product ? 'Enregistrer' : 'Créer le produit'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
