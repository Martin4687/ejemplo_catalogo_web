import { openDB } from 'idb';
import { buildSeedProducts } from '../data/seedProducts';

// ---------------------------------------------------------------------------
// Almacenamiento del catálogo.
//
// Estrategia: IndexedDB es la fuente de verdad (soporta muchos productos e
// imágenes en base64 sin problema de tamaño). Cada vez que se escribe algo,
// también se guarda una copia en localStorage bajo LS_BACKUP_KEY. Si por
// algún motivo IndexedDB no está disponible en el navegador (modo privado
// muy restrictivo, navegador viejo, etc.) la app cae automáticamente a
// trabajar solo con localStorage, así el catálogo nunca deja de funcionar.
// ---------------------------------------------------------------------------

const DB_NAME = 'cancha-catalogo-db';
const DB_VERSION = 1;
const STORE_PRODUCTS = 'products';
const STORE_MISC = 'misc';
const LS_BACKUP_KEY = 'cancha_catalogo_backup_v1';
const LS_FALLBACK_KEY = 'cancha_catalogo_fallback_v1';

let dbPromise = null;
let indexedDbUsable = true;

function getDb() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_PRODUCTS)) {
          db.createObjectStore(STORE_PRODUCTS, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORE_MISC)) {
          db.createObjectStore(STORE_MISC);
        }
      },
    }).catch((err) => {
      console.warn('IndexedDB no disponible, usando localStorage como respaldo único.', err);
      indexedDbUsable = false;
      return null;
    });
  }
  return dbPromise;
}

function backupToLocalStorage(products) {
  try {
    localStorage.setItem(LS_BACKUP_KEY, JSON.stringify(products));
  } catch (err) {
    console.warn('No se pudo respaldar el catálogo en localStorage (¿espacio lleno?).', err);
  }
}

function readLocalStorageFallback() {
  try {
    const raw = localStorage.getItem(LS_FALLBACK_KEY) || localStorage.getItem(LS_BACKUP_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeLocalStorageFallback(products) {
  try {
    localStorage.setItem(LS_FALLBACK_KEY, JSON.stringify(products));
  } catch (err) {
    console.warn('No se pudo escribir en localStorage.', err);
  }
}

// Carga todos los productos. Si la base está vacía (primer uso), la llena
// con el catálogo de ejemplo definido en src/data/seedProducts.js.
export async function loadAllProducts() {
  const db = await getDb();

  if (!db) {
    let products = readLocalStorageFallback();
    if (!products) {
      products = buildSeedProducts();
      writeLocalStorageFallback(products);
    }
    return products;
  }

  let all = await db.getAll(STORE_PRODUCTS);
  if (all.length === 0) {
    const seeded = buildSeedProducts();
    const tx = db.transaction(STORE_PRODUCTS, 'readwrite');
    await Promise.all(seeded.map((p) => tx.store.put(p)));
    await tx.done;
    all = seeded;
  }
  backupToLocalStorage(all);
  return all;
}

export async function saveProduct(product) {
  const db = await getDb();
  if (!db) {
    const products = readLocalStorageFallback() || [];
    const idx = products.findIndex((p) => p.id === product.id);
    if (idx >= 0) products[idx] = product;
    else products.push(product);
    writeLocalStorageFallback(products);
    return product;
  }
  await db.put(STORE_PRODUCTS, product);
  const all = await db.getAll(STORE_PRODUCTS);
  backupToLocalStorage(all);
  return product;
}

export async function deleteProduct(id) {
  const db = await getDb();
  if (!db) {
    const products = (readLocalStorageFallback() || []).filter((p) => p.id !== id);
    writeLocalStorageFallback(products);
    return;
  }
  await db.delete(STORE_PRODUCTS, id);
  const all = await db.getAll(STORE_PRODUCTS);
  backupToLocalStorage(all);
}

export async function replaceAllProducts(products) {
  const db = await getDb();
  if (!db) {
    writeLocalStorageFallback(products);
    return;
  }
  const tx = db.transaction(STORE_PRODUCTS, 'readwrite');
  await tx.store.clear();
  await Promise.all(products.map((p) => tx.store.put(p)));
  await tx.done;
  backupToLocalStorage(products);
}

export function isUsingIndexedDb() {
  return indexedDbUsable;
}

// Exporta el catálogo completo como un objeto JSON descargable (respaldo manual).
export function exportCatalogAsJson(products) {
  return JSON.stringify({ exportedAt: new Date().toISOString(), products }, null, 2);
}

export function parseImportedCatalog(jsonText) {
  const data = JSON.parse(jsonText);
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.products)) return data.products;
  throw new Error('El archivo no tiene un formato de catálogo reconocible.');
}
