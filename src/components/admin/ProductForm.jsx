import { useState } from 'react';
import { X, Upload } from 'lucide-react';
import { AVAILABLE_SIZES, DEFAULT_CATEGORIES } from '../../config';

const emptyForm = {
  name: '',
  category: DEFAULT_CATEGORIES[0],
  description: '',
  price: '',
  salePrice: '',
  colors: [],
  sizeStock: {},
  image: '',
  isNew: true,
  featured: false,
};

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function ProductForm({ initial, categories, onSave, onClose }) {
  const [form, setForm] = useState(() =>
    initial
      ? { ...emptyForm, ...initial, price: String(initial.price ?? ''), salePrice: initial.salePrice ? String(initial.salePrice) : '' }
      : emptyForm,
  );
  const [colorDraft, setColorDraft] = useState('');
  const [customCategory, setCustomCategory] = useState(false);

  const allCategories = Array.from(new Set([...DEFAULT_CATEGORIES, ...categories]));

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function updateSizeStock(size, qty) {
    setForm((f) => ({ ...f, sizeStock: { ...f.sizeStock, [size]: qty === '' ? 0 : Math.max(0, Number(qty)) } }));
  }

  function toggleSize(size) {
    setForm((f) => {
      const next = { ...f.sizeStock };
      if (size in next) delete next[size];
      else next[size] = 0;
      return { ...f, sizeStock: next };
    });
  }

  function addColor() {
    const c = colorDraft.trim();
    if (!c || form.colors.includes(c)) return;
    setForm((f) => ({ ...f, colors: [...f.colors, c] }));
    setColorDraft('');
  }

  function removeColor(c) {
    setForm((f) => ({ ...f, colors: f.colors.filter((x) => x !== c) }));
  }

  async function handleImageFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const base64 = await fileToBase64(file);
    update('image', base64);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    const payload = {
      ...form,
      price: Number(form.price) || 0,
      salePrice: form.salePrice ? Number(form.salePrice) : null,
      image: form.image || `https://picsum.photos/seed/${encodeURIComponent(form.name)}/600/800`,
    };
    onSave(payload);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Cerrar">
          <X size={18} />
        </button>
        <h2 style={{ fontFamily: 'var(--font-display)', marginTop: 0 }}>
          {initial ? 'Editar producto' : 'Nuevo producto'}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="field full">
              <label>Nombre del producto</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                placeholder="Ej. Hoodie Cancha Classic"
                required
              />
            </div>

            <div className="field">
              <label>Categoría</label>
              {customCategory ? (
                <input
                  type="text"
                  value={form.category}
                  onChange={(e) => update('category', e.target.value)}
                  placeholder="Nueva categoría"
                />
              ) : (
                <select value={form.category} onChange={(e) => update('category', e.target.value)}>
                  {allCategories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              )}
              <button
                type="button"
                onClick={() => setCustomCategory((v) => !v)}
                style={{ alignSelf: 'flex-start', background: 'none', border: 'none', color: 'var(--cobalt)', fontSize: 12, cursor: 'pointer', padding: 0 }}
              >
                {customCategory ? 'Elegir de la lista' : '+ Crear nueva categoría'}
              </button>
            </div>

            <div className="field">
              <label>Imagen del producto</label>
              <div className="image-upload">
                <img className="preview" src={form.image || undefined} alt="" />
                <label className="btn-outline" style={{ cursor: 'pointer', display: 'inline-flex', gap: 6, alignItems: 'center', fontSize: 12 }}>
                  <Upload size={14} /> Subir imagen
                  <input type="file" accept="image/*" onChange={handleImageFile} style={{ display: 'none' }} />
                </label>
              </div>
            </div>

            <div className="field full">
              <label>Descripción</label>
              <textarea
                value={form.description}
                onChange={(e) => update('description', e.target.value)}
                placeholder="Tela, corte, detalles del producto..."
              />
            </div>

            <div className="field">
              <label>Precio ({'Bs'})</label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={form.price}
                onChange={(e) => update('price', e.target.value)}
                required
              />
            </div>

            <div className="field">
              <label>Precio de oferta (opcional)</label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={form.salePrice}
                onChange={(e) => update('salePrice', e.target.value)}
                placeholder="Dejar vacío si no hay oferta"
              />
            </div>

            <div className="field full">
              <label>Colores disponibles</label>
              <div className="chip-input-row">
                {form.colors.map((c) => (
                  <span className="chip" key={c}>
                    {c}
                    <button type="button" onClick={() => removeColor(c)} aria-label={`Quitar ${c}`}>
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="text"
                  value={colorDraft}
                  onChange={(e) => setColorDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addColor();
                    }
                  }}
                  placeholder="Ej. Negro"
                />
                <button type="button" className="btn-outline" onClick={addColor}>
                  Añadir
                </button>
              </div>
            </div>

            <div className="field full">
              <label>Tallas y existencias</label>
              <div className="chip-input-row">
                {AVAILABLE_SIZES.map((s) => (
                  <button
                    type="button"
                    key={s}
                    className={`pill ${s in form.sizeStock ? 'active' : ''}`}
                    onClick={() => toggleSize(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
              {Object.keys(form.sizeStock).length > 0 && (
                <div className="size-stock-grid">
                  {Object.entries(form.sizeStock).map(([size, qty]) => (
                    <div key={size}>
                      <label>Talla {size}</label>
                      <input
                        type="number"
                        min="0"
                        value={qty}
                        onChange={(e) => updateSizeStock(size, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="field full checkbox-row">
              <label>
                <input type="checkbox" checked={form.isNew} onChange={(e) => update('isNew', e.target.checked)} />
                Marcar como nuevo
              </label>
              <label>
                <input type="checkbox" checked={form.featured} onChange={(e) => update('featured', e.target.checked)} />
                Destacar en portada
              </label>
            </div>

            <div className="form-footer">
              <button type="button" className="btn-outline" onClick={onClose}>
                Cancelar
              </button>
              <button type="submit" className="btn-primary">
                {initial ? 'Guardar cambios' : 'Añadir producto'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
