import { useCallback, useEffect, useState } from 'react';
import {
  loadAllProducts,
  saveProduct,
  deleteProduct as dbDeleteProduct,
  replaceAllProducts,
} from '../db/database';
import { uid } from '../config';

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    loadAllProducts()
      .then((data) => {
        if (mounted) setProducts(data);
      })
      .catch((err) => {
        console.error(err);
        if (mounted) setError('No se pudo cargar el catálogo local.');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const addProduct = useCallback(async (data) => {
    const product = { ...data, id: uid(), createdAt: Date.now() };
    await saveProduct(product);
    setProducts((prev) => [product, ...prev]);
    return product;
  }, []);

  const updateProduct = useCallback(async (id, patch) => {
    let updated = null;
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        updated = { ...p, ...patch };
        return updated;
      }),
    );
    if (updated) await saveProduct(updated);
    return updated;
  }, []);

  const removeProduct = useCallback(async (id) => {
    await dbDeleteProduct(id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const importProducts = useCallback(async (newProducts) => {
    await replaceAllProducts(newProducts);
    setProducts(newProducts);
  }, []);

  return {
    products,
    loading,
    error,
    addProduct,
    updateProduct,
    removeProduct,
    importProducts,
  };
}
