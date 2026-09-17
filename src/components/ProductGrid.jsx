import ProductCard from './ProductCard';

export default function ProductGrid({ products, onOpen }) {
  if (products.length === 0) {
    return (
      <div className="empty-state">
        <h3>No encontramos nada por aquí</h3>
        <p>Prueba con otra búsqueda, talla o categoría.</p>
      </div>
    );
  }

  return (
    <div className="product-grid">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} onOpen={onOpen} />
      ))}
    </div>
  );
}
