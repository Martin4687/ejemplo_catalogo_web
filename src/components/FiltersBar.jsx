import { Search } from 'lucide-react';
import { AVAILABLE_SIZES } from '../config';

export default function FiltersBar({
  categories,
  query,
  onQueryChange,
  activeCategory,
  onCategoryChange,
  activeSize,
  onSizeChange,
  sortBy,
  onSortChange,
}) {
  return (
    <div className="filters">
      <div className="search-box">
        <Search size={16} color="var(--muted)" />
        <input
          type="text"
          placeholder="Buscar poleras, hoodies, zapatillas..."
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
        />
      </div>

      <div className="pill-scroll">
        <button
          className={`pill ${activeCategory === 'Todos' ? 'active' : ''}`}
          onClick={() => onCategoryChange('Todos')}
        >
          Todos
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            className={`pill ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => onCategoryChange(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <select className="select-field" value={activeSize} onChange={(e) => onSizeChange(e.target.value)}>
        <option value="Todas">Todas las tallas</option>
        {AVAILABLE_SIZES.map((s) => (
          <option key={s} value={s}>
            Talla {s}
          </option>
        ))}
      </select>

      <select className="select-field" value={sortBy} onChange={(e) => onSortChange(e.target.value)}>
        <option value="recientes">Más recientes</option>
        <option value="precio-asc">Precio: menor a mayor</option>
        <option value="precio-desc">Precio: mayor a menor</option>
        <option value="nombre">Nombre A-Z</option>
      </select>
    </div>
  );
}
