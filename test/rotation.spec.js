/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhn.com>
 * @fileoverview Test cases of "src/js/component/rotation.js"
 */
import fabric from 'fabric';
import $ from 'jquery';
import Graphics from '../src/js/graphics';
import Rotation from '../src/js/component/rotation';

describe('Rotation', () => {
    let graphics, rotationModule, mockImage, canvas;

    beforeAll(() => {
        graphics = new Graphics($('<canvas>')[0]);
        canvas = graphics.getCanvas();
        rotationModule = new Rotation(graphics);
    });

    beforeEach(() => {
        mockImage = new fabric.Image();
        graphics.setCanvasImage('mockImage', mockImage);
    });

    it('"getCurrentAngle()" should return current angle value', () => {
        mockImage.angle = 30;

        expect(rotationModule.getCurrentAngle()).toEqual(30);
    });

    it('"setAngle()" should set angle value', () => {
        rotationModule.setAngle(40);

        expect(rotationModule.getCurrentAngle()).toEqual(40);
    });

    it('"rotate()" should add angle value', () => {
        let current = rotationModule.getCurrentAngle();

        rotationModule.rotate(10);
        expect(rotationModule.getCurrentAngle()).toBe(current + 10);

        current = rotationModule.getCurrentAngle();
        rotationModule.rotate(20);
        expect(rotationModule.getCurrentAngle()).toBe(current + 20);
    });

    it('"rotate()" should add angle value modular 360(===2*PI)', done => {
        rotationModule.setAngle(10).then(() => rotationModule.rotate(380)).then(() => {
            expect(rotationModule.getCurrentAngle()).toBe(30);
            done();
        });
    });

    // @todo Move this tc to main.spec.js
    it('"adjustCanvasDimension()" should set canvas dimension from image-rect', () => {
        spyOn(mockImage, 'getBoundingRect').and.returnValue({
            width: 100,
            height: 110
        });

        rotationModule.adjustCanvasDimension();
        expect(canvas.getWidth()).toEqual(100);
        expect(canvas.getHeight()).toEqual(110);
    });
});
