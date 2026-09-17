import { X } from 'lucide-react';
import { formatPrice, totalStock } from '../config';

export default function ProductQuickView({ product, onClose }) {
  if (!product) return null;
  const onSale = product.salePrice && product.salePrice < product.price;
  const stock = totalStock(product);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Cerrar">
          <X size={18} />
        </button>
        <div className="quick-view">
          <img src={product.image} alt={product.name} />
          <div>
            <p className="category">{product.category}</p>
            <h2 style={{ fontFamily: 'var(--font-display)', margin: '4px 0 10px', fontSize: 22 }}>
              {product.name}
            </h2>
            <div className="price-row" style={{ marginBottom: 14 }}>
              {onSale ? (
                <>
                  <span className="price-now" style={{ fontSize: 20 }}>
                    {formatPrice(product.salePrice)}
                  </span>
                  <span className="price-old">{formatPrice(product.price)}</span>
                </>
              ) : (
                <span className="price-now" style={{ fontSize: 20 }}>
                  {formatPrice(product.price)}
                </span>
              )}
            </div>
            <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.5 }}>{product.description}</p>

            {product.colors?.length > 0 && (
              <>
                <p style={{ fontSize: 12, fontWeight: 700, marginTop: 18, marginBottom: 0 }}>Colores</p>
                <div className="swatch-row">
                  {product.colors.map((c) => (
                    <span className="swatch" key={c}>
                      {c}
                    </span>
                  ))}
                </div>
              </>
            )}

            <p style={{ fontSize: 12, fontWeight: 700, marginBottom: 0 }}>Tallas y existencias</p>
            <div className="size-grid">
              {Object.entries(product.sizeStock || {}).map(([size, qty]) => (
                <div key={size} className={`size-chip ${qty === 0 ? 'depleted' : ''}`}>
                  {size} · {qty}
                </div>
              ))}
            </div>

            <p style={{ fontSize: 12, color: stock === 0 ? 'var(--coral)' : 'var(--muted)', fontWeight: stock === 0 ? 700 : 400 }}>
              {stock === 0 ? 'Producto agotado por el momento.' : `${stock} unidades disponibles en total.`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
