import { describe, expect, it } from 'vitest';
import { formatMerchandisePrice, getMerchandiseImages } from './merchandise';

describe('getMerchandiseImages', () => {
  it('uses the gallery and keeps the legacy primary image only once', () => {
    expect(getMerchandiseImages(['detail-1.jpg', 'cover.jpg'], 'cover.jpg')).toEqual([
      'cover.jpg',
      'detail-1.jpg',
    ]);
  });

  it('keeps legacy products visible as a one-image gallery', () => {
    expect(getMerchandiseImages(null, 'cover.jpg')).toEqual(['cover.jpg']);
  });

  it('drops empty image values', () => {
    expect(getMerchandiseImages(['', '  ', 'detail.jpg'], null)).toEqual(['detail.jpg']);
  });
});

describe('formatMerchandisePrice', () => {
  it('uses a deterministic Rupiah format for server and browser rendering', () => {
    expect(formatMerchandisePrice(85000)).toBe('Rp85.000');
  });
});
