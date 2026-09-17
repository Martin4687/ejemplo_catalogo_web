import { useMemo, useState } from 'react';
import { useProducts } from './hooks/useProducts';
import { STORE_NAME, STORE_TAGLINE, DEFAULT_CATEGORIES, totalStock } from './config';
import Hero from './components/Hero';
import FiltersBar from './components/FiltersBar';
import ProductGrid from './components/ProductGrid';
import ProductQuickView from './components/ProductQuickView';
import AdminPanel from './components/admin/AdminPanel';
import Toast from './components/Toast';

export default function App() {
  const { products, loading, addProduct, updateProduct, removeProduct, importProducts } = useProducts();

  const [mode, setMode] = useState('tienda'); // 'tienda' | 'admin'
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [activeSize, setActiveSize] = useState('Todas');
  const [sortBy, setSortBy] = useState('recientes');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [toastMsg, setToastMsg] = useState('');

  const categories = useMemo(() => {
    const fromProducts = products.map((p) => p.category).filter(Boolean);
    return Array.from(new Set([...DEFAULT_CATEGORIES, ...fromProducts]));
  }, [products]);

  const filtered = useMemo(() => {
    let list = [...products];

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q),
      );
    }

    if (activeCategory !== 'Todos') {
      list = list.filter((p) => p.category === activeCategory);
    }

    if (activeSize !== 'Todas') {
      list = list.filter((p) => (p.sizeStock?.[activeSize] ?? 0) > 0);
    }

    switch (sortBy) {
      case 'precio-asc':
        list.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
        break;
      case 'precio-desc':
        list.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));
        break;
      case 'nombre':
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    }

    return list;
  }, [products, query, activeCategory, activeSize, sortBy]);

  const featured = useMemo(() => {
    const marked = products.filter((p) => p.featured);
    return (marked.length ? marked : products).slice(0, 3);
  }, [products]);

  const totalUnits = useMemo(() => products.reduce((sum, p) => sum + totalStock(p), 0), [products]);

  function notify(msg) {
    setToastMsg(msg);
  }

  if (loading) {
    return <div className="loading-screen">Cargando catálogo…</div>;
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          {STORE_NAME}
          <small>{STORE_TAGLINE}</small>
        </div>
        <div className="mode-switch">
          <button className={mode === 'tienda' ? 'active' : ''} onClick={() => setMode('tienda')}>
            Tienda
          </button>
          <button className={mode === 'admin' ? 'active' : ''} onClick={() => setMode('admin')}>
            Admin
          </button>
        </div>
      </header>

      {mode === 'tienda' ? (
        <>
          <Hero featured={featured} productCount={products.length} totalUnits={totalUnits} />

          <div id="catalogo">
            <FiltersBar
              categories={categories}
              query={query}
              onQueryChange={setQuery}
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
              activeSize={activeSize}
              onSizeChange={setActiveSize}
              sortBy={sortBy}
              onSortChange={setSortBy}
            />

            <section className="catalog-section">
              <p className="results-line">{filtered.length} productos encontrados</p>
              <ProductGrid products={filtered} onOpen={setSelectedProduct} />
            </section>
          </div>

          <p className="footer-note">
            {STORE_NAME} · Catálogo guardado en este dispositivo (IndexedDB / localStorage)
          </p>

          <ProductQuickView product={selectedProduct} onClose={() => setSelectedProduct(null)} />
        </>
      ) : (
        <AdminPanel
          products={products}
          categories={categories}
          onAdd={addProduct}
          onUpdate={updateProduct}
          onRemove={removeProduct}
          onImportAll={importProducts}
          notify={notify}
        />
      )}

      <Toast message={toastMsg} onDone={() => setToastMsg('')} />
    </div>
  );
}
