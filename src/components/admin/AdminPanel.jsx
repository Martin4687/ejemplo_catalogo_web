import { useMemo, useRef, useState } from 'react';
import { Plus, Pencil, Trash2, Download, Upload as UploadIcon } from 'lucide-react';
import { formatPrice, totalStock, LOW_STOCK_THRESHOLD } from '../../config';
import { exportCatalogAsJson, parseImportedCatalog } from '../../db/database';
import ProductForm from './ProductForm';

export default function AdminPanel({ products, categories, onAdd, onUpdate, onRemove, onImportAll, notify }) {
  const [editing, setEditing] = useState(null); // product being edited, or 'new'
  const fileInputRef = useRef(null);

  const stats = useMemo(() => {
    const totalUnits = products.reduce((sum, p) => sum + totalStock(p), 0);
    const catalogValue = products.reduce((sum, p) => sum + totalStock(p) * (p.salePrice || p.price), 0);
    const lowStock = products.filter((p) => {
      const s = totalStock(p);
      return s > 0 && s <= LOW_STOCK_THRESHOLD;
    }).length;
    const outOfStock = products.filter((p) => totalStock(p) === 0).length;
    return { totalUnits, catalogValue, lowStock, outOfStock };
  }, [products]);

  function handleQuickField(product, field, value) {
    if (field === 'price') {
      onUpdate(product.id, { price: Math.max(0, Number(value) || 0) });
    } else if (field === 'salePrice') {
      onUpdate(product.id, { salePrice: value === '' ? null : Math.max(0, Number(value) || 0) });
    }
  }

  function handleQuickStock(product, size, value) {
    const sizeStock = { ...product.sizeStock, [size]: Math.max(0, Number(value) || 0) };
    onUpdate(product.id, { sizeStock });
  }

  function handleDelete(product) {
    if (window.confirm(`¿Eliminar "${product.name}" del catálogo? Esta acción no se puede deshacer.`)) {
      onRemove(product.id);
      notify('Producto eliminado');
    }
  }

  function handleSaveForm(data) {
    if (editing === 'new') {
      onAdd(data);
      notify('Producto añadido al catálogo');
    } else {
      onUpdate(editing.id, data);
      notify('Cambios guardados');
    }
    setEditing(null);
  }

  function handleExport() {
    const json = exportCatalogAsJson(products);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `catalogo-cancha-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    notify('Catálogo exportado');
  }

  async function handleImportFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const imported = parseImportedCatalog(text);
      if (window.confirm(`Se importarán ${imported.length} productos y se reemplazará el catálogo actual. ¿Continuar?`)) {
        await onImportAll(imported);
        notify('Catálogo importado correctamente');
      }
    } catch (err) {
      window.alert('No se pudo leer el archivo. Verifica que sea un JSON exportado desde esta misma app.');
    } finally {
      e.target.value = '';
    }
  }

  return (
    <div className="admin-shell">
      <div className="admin-header">
        <h2>Panel de administración</h2>
        <div className="admin-actions">
          <button className="btn-ghost" onClick={handleExport}>
            <Download size={15} /> Exportar
          </button>
          <button className="btn-ghost" onClick={() => fileInputRef.current?.click()}>
            <UploadIcon size={15} /> Importar
          </button>
          <input ref={fileInputRef} type="file" accept="application/json" onChange={handleImportFile} style={{ display: 'none' }} />
          <button className="btn-primary" onClick={() => setEditing('new')}>
            <Plus size={16} /> Nuevo producto
          </button>
        </div>
      </div>

      <div className="stat-cards">
        <div className="stat-card">
          <strong>{products.length}</strong>
          <span>Productos en catálogo</span>
        </div>
        <div className="stat-card">
          <strong>{stats.totalUnits}</strong>
          <span>Unidades totales</span>
        </div>
        <div className="stat-card">
          <strong>{formatPrice(stats.catalogValue)}</strong>
          <span>Valor del inventario</span>
        </div>
        <div className={`stat-card ${stats.lowStock > 0 ? 'alert' : ''}`}>
          <strong>{stats.lowStock}</strong>
          <span>Con poco stock</span>
        </div>
        <div className={`stat-card ${stats.outOfStock > 0 ? 'alert' : ''}`}>
          <strong>{stats.outOfStock}</strong>
          <span>Agotados</span>
        </div>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th></th>
              <th>Producto</th>
              <th>Categoría</th>
              <th>Precio</th>
              <th>Oferta</th>
              <th>Existencias por talla</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: 30, color: 'var(--muted)' }}>
                  Todavía no hay productos. Añade el primero con "Nuevo producto".
                </td>
              </tr>
            )}
            {products.map((p) => {
              const stock = totalStock(p);
              return (
                <tr key={p.id}>
                  <td>
                    <img className="row-thumb" src={p.image} alt={p.name} />
                  </td>
                  <td>
                    <strong>{p.name}</strong>
                    {stock === 0 && <div className="tag-out">Sin stock</div>}
                  </td>
                  <td>{p.category}</td>
                  <td>
                    <input
                      className="inline-input"
                      type="number"
                      min="0"
                      defaultValue={p.price}
                      onBlur={(e) => handleQuickField(p, 'price', e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      className="inline-input"
                      type="number"
                      min="0"
                      placeholder="—"
                      defaultValue={p.salePrice ?? ''}
                      onBlur={(e) => handleQuickField(p, 'salePrice', e.target.value)}
                    />
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {Object.entries(p.sizeStock || {}).map(([size, qty]) => (
                        <div key={size} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{size}</span>
                          <input
                            className="inline-input"
                            style={{ width: 52 }}
                            type="number"
                            min="0"
                            defaultValue={qty}
                            onBlur={(e) => handleQuickStock(p, size, e.target.value)}
                          />
                        </div>
                      ))}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="icon-btn" onClick={() => setEditing(p)} aria-label="Editar">
                        <Pencil size={15} />
                      </button>
                      <button className="icon-btn danger" onClick={() => handleDelete(p)} aria-label="Eliminar">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {editing && (
        <ProductForm
          initial={editing === 'new' ? null : editing}
          categories={categories}
          onSave={handleSaveForm}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
