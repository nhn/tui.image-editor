import { fabric } from 'fabric';
import Graphics from '@/graphics';
import Rotation from '@/component/rotation';

describe('Rotation', () => {
  let graphics, rotation, mockImage, canvas;

  beforeAll(() => {
    graphics = new Graphics(document.createElement('canvas'));
    canvas = graphics.getCanvas();
    rotation = new Rotation(graphics);
  });

  beforeEach(() => {
    mockImage = new fabric.Image();
    graphics.setCanvasImage('mockImage', mockImage);
  });

  it('should return current angle', () => {
    mockImage.angle = 30;

    expect(rotation.getCurrentAngle()).toEqual(30);
  });

  it('should set angle', () => {
    rotation.setAngle(40);

    expect(rotation.getCurrentAngle()).toEqual(40);
  });

  it('should add angle', () => {
    let angle = rotation.getCurrentAngle();

    rotation.rotate(10);

    expect(rotation.getCurrentAngle()).toBe(angle + 10);

    angle = rotation.getCurrentAngle();

    rotation.rotate(20);

    expect(rotation.getCurrentAngle()).toBe(angle + 20);
  });

  it('should add angle modular 360(===2*PI)', async () => {
    await rotation.setAngle(10);
    await rotation.rotate(380);

    expect(rotation.getCurrentAngle()).toBe(30);
  });

  it('should set canvas dimension from image-rect', () => {
    jest.spyOn(mockImage, 'getBoundingRect').mockReturnValue({ width: 100, height: 110 });

    rotation.adjustCanvasDimension();

    expect(canvas.getWidth()).toBe(100);
    expect(canvas.getHeight()).toBe(110);
  });
});
