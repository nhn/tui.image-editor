import { fabric } from 'fabric';
import Graphics from '@/graphics';
import Filter from '@/component/filter';

import img from 'fixtures/sampleImage.jpg';

describe('Filter', () => {
  const graphics = new Graphics(document.createElement('canvas'));
  const filter = new Filter(graphics);

  beforeEach(async () => {
    const image = new fabric.Image(img);
    jest.spyOn(image, 'applyFilters').mockReturnValue({});
    graphics.setCanvasImage('mockImage', image);

    await filter.add('colorFilter', {});
  });

  it('should add filter', () => {
    expect(filter.hasFilter('invert')).toBe(false);
    expect(filter.hasFilter('colorFilter')).toBe(true);
  });

  it('should remove added filter', async () => {
    await filter.remove('colorFilter');

    expect(filter.hasFilter('colorFilter')).toBe(false);
  });
});
