export function getProductImageUrls(producto) {
  if (!producto) return [];

  // Formato viejo: array de URLs
  if (Array.isArray(producto.imagenesUrl)) return producto.imagenesUrl.filter(Boolean);

  // Formato nuevo: array de objetos { id, url, principal }
  if (Array.isArray(producto.imagenes)) {
    return producto.imagenes
      .filter((img) => img && typeof img.url === 'string' && img.url.trim() !== '')
      .slice()
      .sort((a, b) => {
        const ap = a.principal ? 1 : 0;
        const bp = b.principal ? 1 : 0;
        if (ap !== bp) return bp - ap; // principal primero
        const aid = typeof a.id === 'number' ? a.id : Number(a.id) || 0;
        const bid = typeof b.id === 'number' ? b.id : Number(b.id) || 0;
        return aid - bid;
      })
      .map((img) => img.url);
  }

  // Otros formatos legacy posibles en admin form
  if (Array.isArray(producto.images)) {
    return producto.images
      .map((img) => (typeof img === 'string' ? img : img?.url))
      .filter(Boolean);
  }

  return [];
}

export function getMainProductImageUrl(producto) {
  return getProductImageUrls(producto)[0] || '';
}

