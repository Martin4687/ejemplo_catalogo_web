import { formatPrice, totalStock, LOW_STOCK_THRESHOLD } from '../config';

export default function ProductCard({ product, onOpen }) {
  const stock = totalStock(product);
  const isOut = stock === 0;
  const isLow = !isOut && stock <= LOW_STOCK_THRESHOLD;
  const onSale = product.salePrice && product.salePrice < product.price;

  return (
    <article className="product-card" onClick={() => onOpen(product)}>
      <div className="product-media">
        {product.isNew && !isOut && <span className="badge new">NUEVO</span>}
        {onSale && !isOut && <span className="badge sale">OFERTA</span>}
        {isOut && <span className="badge out">AGOTADO</span>}
        <img src={product.image} alt={product.name} loading="lazy" />
      </div>
      <div className="product-info">
        <p className="category">{product.category}</p>
        <h3>{product.name}</h3>
        <div className="price-row">
          {onSale ? (
            <>
              <span className="price-now">{formatPrice(product.salePrice)}</span>
              <span className="price-old">{formatPrice(product.price)}</span>
            </>
          ) : (
            <span className="price-now">{formatPrice(product.price)}</span>
          )}
        </div>
        <p className={`stock-hint ${isLow ? 'low' : ''}`}>
          {isOut ? 'Sin existencias' : isLow ? `Últimas ${stock} unidades` : `${stock} unidades disponibles`}
        </p>
      </div>
    </article>
  );
}
