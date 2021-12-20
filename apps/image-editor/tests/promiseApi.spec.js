import { fabric } from 'fabric';
import ImageEditor from '@/imageEditor';
import { stamp } from '@/util';
import { rejectMessages } from '@/consts';

import '@/command/loadImage';
import '@/command/addIcon';
import '@/command/clearObjects';
import '@/command/changeIconColor';
import '@/command/addShape';
import '@/command/changeShape';
import '@/command/addImageObject';
import '@/command/flip';
import '@/command/rotate';
import '@/command/removeObject';
import '@/command/setObjectProperties';
import '@/command/setObjectPosition';

import img from 'fixtures/sampleImage.jpg';

describe('Promise API', () => {
  let imageEditor, canvas, activeObjectId;

  beforeAll(() => {
    imageEditor = new ImageEditor(document.createElement('div'), {
      cssMaxWidth: 700,
      cssMaxHeight: 500,
    });
    canvas = imageEditor._graphics.getCanvas();

    imageEditor.on('objectActivated', ({ id }) => {
      activeObjectId = id;
    });
    imageEditor.on('objectAdded', ({ id }) => {
      activeObjectId = id;
    });
  });

  afterAll(() => {
    imageEditor.destroy();
  });

  beforeEach(async () => {
    const image = new fabric.Image(img);
    await imageEditor.loadImageFromURL(image, 'sampleImage');
  });

  it('should support Promise(addIcon)', async () => {
    await imageEditor.addIcon('arrow', { left: 10, top: 10 });

    expect(canvas.getObjects()).toHaveLength(1);
  });

  it('should support Promise(clearObjects)', async () => {
    await imageEditor.addIcon('arrow', { left: 10, top: 10 });
    await imageEditor.clearObjects();

    expect(canvas.getObjects()).toHaveLength(0);
  });

  it('should support Promise(changeIconColor)', async () => {
    await imageEditor.addIcon('arrow', { left: 10, top: 10 });
    await imageEditor.changeIconColor(activeObjectId, '#FFFF00');

    const [object] = canvas.getObjects();
    expect(object).toMatchObject({ fill: '#FFFF00' });
  });

  it('should support Promise(addShape)', async () => {
    await imageEditor.addShape('rect', { width: 100, height: 100, fill: '#FFFF00' });

    const [object] = canvas.getObjects();
    expect(object).toMatchObject({ type: 'rect', width: 100, height: 100, fill: '#FFFF00' });
  });

  it('should support Promise(changeShape)', async () => {
    await imageEditor.addShape('rect', { width: 100, height: 100, fill: '#FFFF00' });
    await imageEditor.changeShape(activeObjectId, {
      type: 'triangle',
      width: 200,
      fill: '#FF0000',
    });

    const [object] = canvas.getObjects();
    expect(object).toMatchObject({ type: 'triangle', width: 200, fill: '#FF0000' });
  });

  it('should catch on failure when object is not in canvas', async () => {
    await imageEditor.addShape('rect', { width: 100, height: 100, fill: '#FFFF00' });
    imageEditor.deactivateAll();

    await expect(
      imageEditor.changeShape(null, { type: 'triangle', width: 200, fill: '#FF0000' })
    ).rejects.toBe(rejectMessages.noObject);
  });

  it('should support Promise(addImageObject)', async () => {
    imageEditor._graphics.addImageObject = jest.fn(() => {
      canvas.add(new fabric.Object());

      return Promise.resolve({ id: activeObjectId });
    });

    const objectProps = await imageEditor.addImageObject('fixtures/mask.png');

    expect(canvas.getObjects()).toHaveLength(1);
    expect(objectProps.id).toBe(activeObjectId);
  });

  it('should support Promise(undo)', async () => {
    await imageEditor.addShape('rect', { width: 100, height: 100, fill: '#FFFF00' });
    await imageEditor.undo();

    expect(canvas.getObjects()).toHaveLength(0);
  });

  it('should support Promise(flipX)', async () => {
    const obj = await imageEditor.flipX();

    expect(obj).toEqual({ flipX: true, flipY: false, angle: 0 });
  });

  it('should support Promise(flipY)', async () => {
    const obj = await imageEditor.flipY();

    expect(obj).toEqual({ flipX: false, flipY: true, angle: 0 });
  });

  it('should support Promise(resetFlip)', async () => {
    await expect(imageEditor.resetFlip()).rejects.toBe(rejectMessages.flip);
  });

  it('should support Promise(rotate)', async () => {
    const angle = await imageEditor.rotate(10);

    expect(angle).toBe(10);
  });

  it('should support Promise(setAngle)', async () => {
    const angle = await imageEditor.setAngle(10);

    expect(angle).toBe(10);
  });

  it('should support Promise(removeObject)', async () => {
    const objectProps = await imageEditor.addShape('rect', { width: 100, height: 100 });
    await imageEditor.removeObject(objectProps.id);

    expect(canvas.getObjects()).toHaveLength(0);
  });

  describe('Watermark', () => {
    const properties = { fill: 'rgba(255, 255, 0, 0.5)', left: 150, top: 30 };

    beforeEach(async () => {
      imageEditor._graphics.addImageObject = jest.fn(() => {
        const obj = new fabric.Object({ width: 1, height: 1, strokeWidth: 0 });
        canvas.add(obj);
        activeObjectId = stamp(obj);

        return Promise.resolve({ id: activeObjectId });
      });
      await imageEditor.addImageObject('fixtures/mask.png');
    });

    it("should return object's properties", async () => {
      await imageEditor.setObjectProperties(activeObjectId, properties);
      const propKeys = { fill: null, left: null, top: null };
      const result = imageEditor.getObjectProperties(activeObjectId, propKeys);

      expect(result).not.toBeNull();
      expect(result).toEqual(properties);
    });

    it('should return null if there is no object', async () => {
      await imageEditor.setObjectProperties(activeObjectId, properties);
      const propKeys = { fill: null, width: null, left: null, top: null, height: null };
      imageEditor.deactivateAll();

      const result = imageEditor.getObjectProperties(null, propKeys);

      expect(result).toBeNull();
    });

    it("should return object's properties with object's keys", async () => {
      await imageEditor.setObjectProperties(activeObjectId, properties);
      const keys = ['fill', 'width', 'left', 'top', 'height'];
      const result = imageEditor.getObjectProperties(activeObjectId, keys);

      expect(result).not.toBeNull();
      keys.forEach((key) => expect(result).toHaveProperty(key));
    });

    it("should return object's property with string keys", async () => {
      await imageEditor.setObjectProperties(activeObjectId, properties);
      const result = imageEditor.getObjectProperties(activeObjectId, 'fill');

      expect(result).not.toBeNull();
      expect(result).toEqual({ fill: properties.fill });
    });

    it("should return canvas's width, height", () => {
      expect(imageEditor.getCanvasSize()).toEqual({
        width: expect.any(Number),
        height: expect.any(Number),
      });
    });

    it('should return global point by origin', () => {
      const keys = ['left', 'top', 'width', 'height'];
      const ltPoint = imageEditor.getObjectPosition(activeObjectId, 'left', 'top');
      const ccPoint = imageEditor.getObjectPosition(activeObjectId, 'center', 'center');
      const rbPoint = imageEditor.getObjectPosition(activeObjectId, 'right', 'bottom');
      const { left, top, width, height } = imageEditor.getObjectProperties(activeObjectId, keys);

      expect(ltPoint).toMatchObject({ x: left, y: top });
      expect(ccPoint).toMatchObject({ x: width / 2, y: height / 2 });
      expect(rbPoint).toMatchObject({ x: left + width, y: top + height });
    });

    it('should set object position by origin', async () => {
      await imageEditor.setObjectProperties(activeObjectId, { width: 200, height: 100 });
      await imageEditor.setObjectPosition(activeObjectId, {
        x: 0,
        y: 0,
        originX: 'left',
        originY: 'top',
      });
      const result = imageEditor.getObjectProperties(activeObjectId, ['left', 'top']);

      expect(result).toMatchObject({ left: 100, top: 50 });
    });
  });
});
