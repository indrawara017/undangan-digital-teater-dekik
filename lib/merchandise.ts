export function getMerchandiseImages(
  imageUrls?: string[] | null,
  imageUrl?: string | null,
): string[] {
  const gallery = Array.isArray(imageUrls)
    ? imageUrls.map((image) => image?.trim()).filter((image): image is string => Boolean(image))
    : [];
  const primary = imageUrl?.trim();

  return primary
    ? [primary, ...gallery.filter((image) => image !== primary)]
    : gallery;
}

export function formatMerchandisePrice(value: number): string {
  const roundedValue = Math.round(Number.isFinite(value) ? value : 0);
  return `Rp${roundedValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
}
