import { useState, useEffect } from 'react';
import { catalogueApi } from '../services/api';
import type { CatalogueResponse, CategoryCreate} from '../types';
import './CatalogueManager.css';

interface CatalogueManagerProps {
  siteStringId: string;
  editable: boolean;
}

function CatalogueManager({ siteStringId, editable }: CatalogueManagerProps) {
  const [catalogue, setCatalogue] = useState<CatalogueResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadCatalogue();
  }, [siteStringId]);

  const loadCatalogue = async () => {
    try {
      const data = await catalogueApi.get(siteStringId);
      setCatalogue(data);
    } catch (err: any) {
      console.error('Error loading catalogue:', err);
      setError('Erreur lors du chargement du catalogue');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!catalogue) return;

    // Validation
    for (const category of catalogue.categories) {
      if (!category.name.trim()) {
        setMessage('Erreur : Toutes les catégories doivent avoir un nom');
        return;
      }
      for (const product of category.products) {
        if (!product.name.trim() || !product.description.trim()) {
          setMessage('Erreur : Tous les produits doivent avoir un nom et une description');
          return;
        }
        if (product.price < 0) {
          setMessage('Erreur : Le prix doit être positif');
          return;
        }
        for (const variant of product.variants) {
          if (!variant.name.trim()) {
            setMessage('Erreur : Toutes les variantes doivent avoir un nom');
            return;
          }
          if (variant.stock < 0) {
            setMessage('Erreur : Le stock doit être >= 0');
            return;
          }
        }
      }
    }

    setSaving(true);
    setMessage('');

    try {
      const updateData: { categories: CategoryCreate[] } = {
        categories: catalogue.categories.map(cat => ({
          name: cat.name,
          products: cat.products.map(prod => ({
            name: prod.name,
            description: prod.description,
            price: prod.price,
            variants: prod.variants.map(v => ({
              name: v.name,
              stock: v.stock
            }))
          }))
        }))
      };

      await catalogueApi.update(siteStringId, updateData);
      setMessage('Catalogue enregistré avec succès !');
      setTimeout(() => setMessage(''), 3000);
      await loadCatalogue();
    } catch (err: any) {
      setMessage(err.response?.data?.detail || 'Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  const addCategory = () => {
    if (!catalogue) return;
    setCatalogue({
      categories: [
        ...catalogue.categories,
        {
          id: Date.now(),
          name: '',
          siteId: 0,
          products: []
        }
      ]
    });
  };

  const deleteCategory = (categoryId: number) => {
    if (!catalogue) return;
    setCatalogue({
      categories: catalogue.categories.filter(c => c.id !== categoryId)
    });
  };

  const updateCategory = (categoryId: number, name: string) => {
    if (!catalogue) return;
    setCatalogue({
      categories: catalogue.categories.map(c =>
        c.id === categoryId ? { ...c, name } : c
      )
    });
  };

  const addProduct = (categoryId: number) => {
    if (!catalogue) return;
    setCatalogue({
      categories: catalogue.categories.map(c =>
        c.id === categoryId
          ? {
              ...c,
              products: [
                ...c.products,
                {
                  id: Date.now(),
                  name: '',
                  description: '',
                  price: 0,
                  categoryId: categoryId,
                  variants: []
                }
              ]
            }
          : c
      )
    });
  };

  const deleteProduct = (categoryId: number, productId: number) => {
    if (!catalogue) return;
    setCatalogue({
      categories: catalogue.categories.map(c =>
        c.id === categoryId
          ? { ...c, products: c.products.filter(p => p.id !== productId) }
          : c
      )
    });
  };

  const updateProduct = (categoryId: number, productId: number, field: string, value: any) => {
    if (!catalogue) return;
    setCatalogue({
      categories: catalogue.categories.map(c =>
        c.id === categoryId
          ? {
              ...c,
              products: c.products.map(p =>
                p.id === productId ? { ...p, [field]: value } : p
              )
            }
          : c
      )
    });
  };

  const addVariant = (categoryId: number, productId: number) => {
    if (!catalogue) return;
    setCatalogue({
      categories: catalogue.categories.map(c =>
        c.id === categoryId
          ? {
              ...c,
              products: c.products.map(p =>
                p.id === productId
                  ? {
                      ...p,
                      variants: [
                        ...p.variants,
                        {
                          id: Date.now(),
                          name: '',
                          stock: 0,
                          productId: productId
                        }
                      ]
                    }
                  : p
              )
            }
          : c
      )
    });
  };

  const deleteVariant = (categoryId: number, productId: number, variantId: number) => {
    if (!catalogue) return;
    setCatalogue({
      categories: catalogue.categories.map(c =>
        c.id === categoryId
          ? {
              ...c,
              products: c.products.map(p =>
                p.id === productId
                  ? { ...p, variants: p.variants.filter(v => v.id !== variantId) }
                  : p
              )
            }
          : c
      )
    });
  };

  const updateVariant = (categoryId: number, productId: number, variantId: number, field: string, value: any) => {
    if (!catalogue) return;
    setCatalogue({
      categories: catalogue.categories.map(c =>
        c.id === categoryId
          ? {
              ...c,
              products: c.products.map(p =>
                p.id === productId
                  ? {
                      ...p,
                      variants: p.variants.map(v =>
                        v.id === variantId ? { ...v, [field]: value } : v
                      )
                    }
                  : p
              )
            }
          : c
      )
    });
  };

  const toggleCategory = (categoryId: number) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  if (loading) {
    return <div className="catalogue-loading">Chargement du catalogue...</div>;
  }

  if (error) {
    return <div className="catalogue-error">{error}</div>;
  }

  if (!catalogue) {
    return <div className="catalogue-error">Catalogue non disponible</div>;
  }

  return (
    <div className="catalogue-manager">
      <div className="catalogue-header">
        <h2>Catalogue de Produits</h2>
        {editable && (
          <button onClick={addCategory} className="btn-add-category">
            + Ajouter une catégorie
          </button>
        )}
      </div>

      {message && (
        <div className={`catalogue-message ${message.includes('succès') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      {catalogue.categories.length === 0 ? (
        <div className="catalogue-empty">
          <p>Aucune catégorie dans le catalogue</p>
          {editable && <p className="hint">Cliquez sur "Ajouter une catégorie" pour commencer</p>}
        </div>
      ) : (
        <div className="categories-list">
          {catalogue.categories.map((category) => (
            <div key={category.id} className="category-card">
              <div className="category-header">
                <div className="category-title-row">
                  {editable ? (
                    <input
                      type="text"
                      value={category.name}
                      onChange={(e) => updateCategory(category.id, e.target.value)}
                      placeholder="Nom de la catégorie"
                      className="category-name-input"
                    />
                  ) : (
                    <h3 className="category-name">{category.name}</h3>
                  )}
                  <div className="category-actions">
                    <button
                      onClick={() => toggleCategory(category.id)}
                      className="btn-toggle"
                    >
                      {expandedCategories.has(category.id) ? '▼' : '▶'}
                    </button>
                    {editable && (
                      <>
                        <button
                          onClick={() => addProduct(category.id)}
                          className="btn-add-product"
                        >
                          + Produit
                        </button>
                        <button
                          onClick={() => deleteCategory(category.id)}
                          className="btn-delete-category"
                        >
                          🗑️
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {expandedCategories.has(category.id) && (
                <div className="products-list">
                  {category.products.length === 0 ? (
                    <p className="no-products">Aucun produit dans cette catégorie</p>
                  ) : (
                    category.products.map((product) => (
                      <div key={product.id} className="product-card">
                        <div className="product-header">
                          {editable ? (
                            <div className="product-edit">
                              <input
                                type="text"
                                value={product.name}
                                onChange={(e) => updateProduct(category.id, product.id, 'name', e.target.value)}
                                placeholder="Nom du produit"
                                className="product-name-input"
                              />
                              <textarea
                                value={product.description}
                                onChange={(e) => updateProduct(category.id, product.id, 'description', e.target.value)}
                                placeholder="Description"
                                className="product-description-input"
                                rows={2}
                              />
                              <input
                                type="number"
                                value={product.price}
                                onChange={(e) => updateProduct(category.id, product.id, 'price', parseFloat(e.target.value) || 0)}
                                placeholder="Prix"
                                className="product-price-input"
                                min="0"
                                step="0.01"
                              />
                            </div>
                          ) : (
                            <div className="product-view">
                              <h4 className="product-name">{product.name}</h4>
                              <p className="product-description">{product.description}</p>
                              <p className="product-price">{product.price.toFixed(2)} €</p>
                            </div>
                          )}
                          {editable && (
                            <div className="product-actions">
                              <button
                                onClick={() => addVariant(category.id, product.id)}
                                className="btn-add-variant"
                              >
                                + Variante
                              </button>
                              <button
                                onClick={() => deleteProduct(category.id, product.id)}
                                className="btn-delete-product"
                              >
                                🗑️
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="variants-list">
                          {product.variants.length === 0 ? (
                            <p className="no-variants">Aucune variante</p>
                          ) : (
                            product.variants.map((variant) => (
                              <div key={variant.id} className="variant-card">
                                {editable ? (
                                  <>
                                    <input
                                      type="text"
                                      value={variant.name}
                                      onChange={(e) => updateVariant(category.id, product.id, variant.id, 'name', e.target.value)}
                                      placeholder="Nom de la variante"
                                      className="variant-name-input"
                                    />
                                    <input
                                      type="number"
                                      value={variant.stock}
                                      onChange={(e) => updateVariant(category.id, product.id, variant.id, 'stock', parseInt(e.target.value) || 0)}
                                      placeholder="Stock"
                                      className="variant-stock-input"
                                      min="0"
                                    />
                                    <button
                                      onClick={() => deleteVariant(category.id, product.id, variant.id)}
                                      className="btn-delete-variant"
                                    >
                                      🗑️
                                    </button>
                                  </>
                                ) : (
                                  <div className="variant-view">
                                    <span className="variant-name">{variant.name}</span>
                                    <span className={`variant-stock ${variant.stock === 0 ? 'out-of-stock' : ''}`}>
                                      Stock: {variant.stock}
                                    </span>
                                  </div>
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {editable && (
        <button
          onClick={handleSave}
          className="btn-save-catalogue"
          disabled={saving}
        >
          {saving ? 'Enregistrement...' : 'Enregistrer le Catalogue'}
        </button>
      )}
    </div>
  );
}

export default CatalogueManager;