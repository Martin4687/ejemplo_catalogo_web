// Configuración central de la tienda.
// Cambia estos valores para adaptar el catálogo a tu marca sin tocar el resto del código.

export const STORE_NAME = 'CANCHA';
export const STORE_TAGLINE = 'Ropa urbana juvenil';
export const CURRENCY = 'Bs';

export const DEFAULT_CATEGORIES = [
  'Poleras',
  'Hoodies',
  'Pantalones',
  'Chaquetas',
  'Vestidos',
  'Calzado',
  'Accesorios',
];

export const AVAILABLE_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

export const LOW_STOCK_THRESHOLD = 5;

export function formatPrice(value) {
  const n = Number(value) || 0;
  return `${CURRENCY} ${n.toLocaleString('es-BO', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export function totalStock(product) {
  if (!product?.sizeStock) return 0;
  return Object.values(product.sizeStock).reduce((sum, qty) => sum + (Number(qty) || 0), 0);
}

export function uid() {
  return `p_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}
