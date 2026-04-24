export function buildProductHref(productId) {
  if (!productId) return '#';
  if (typeof window === 'undefined') return `?product=${productId}`;
  const params = new URLSearchParams(window.location.search);
  params.set('product', productId);
  const query = params.toString();
  return `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`;
}
