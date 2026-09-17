import { STORE_TAGLINE } from '../config';

const STICKER_POS = [
  { top: '4%', left: '6%', rotate: '-7deg', tag: { bg: 'var(--lime)', color: 'var(--ink)', top: '-10px', left: '10px' } },
  { top: '30%', left: '46%', rotate: '5deg', tag: { bg: 'var(--coral)', color: '#fff', top: '-10px', right: '-6px' } },
  { top: '2%', left: '78%', rotate: '-3deg', tag: { bg: 'var(--cobalt)', color: '#fff', bottom: '-10px', left: '10px' } },
];

export default function Hero({ featured, productCount, totalUnits }) {
  const stickers = featured.slice(0, 3);

  return (
    <section className="hero">
      <div className="hero-copy">
        <h1>Vístete a tu manera</h1>
        <p>{STORE_TAGLINE}. Piezas urbanas pensadas para moverte, mezclarte y destacar. Catálogo actualizado todos los días.</p>
        <a href="#catalogo" className="btn-primary">
          Ver catálogo
        </a>
        <div className="hero-stats">
          <div>
            <strong>{productCount}</strong>
            <span>Modelos activos</span>
          </div>
          <div>
            <strong>{totalUnits}</strong>
            <span>Prendas en stock</span>
          </div>
        </div>
      </div>
      <div className="hero-stickers">
        {stickers.map((p, i) => {
          const pos = STICKER_POS[i];
          if (!pos) return null;
          return (
            <div
              key={p.id}
              className="sticker"
              style={{ top: pos.top, left: pos.left, transform: `rotate(${pos.rotate})` }}
            >
              <img src={p.image} alt={p.name} />
              <span
                className="sticker-tag"
                style={{
                  background: pos.tag.bg,
                  color: pos.tag.color,
                  top: pos.tag.top,
                  left: pos.tag.left,
                  right: pos.tag.right,
                  bottom: pos.tag.bottom,
                }}
              >
                {p.category}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
