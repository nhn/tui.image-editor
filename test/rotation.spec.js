/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @fileoverview Test cases of "src/js/component/rotation.js"
 */
import Main from '../src/js/component/main';
import Rotation from '../src/js/component/rotation';

describe('Rotation', () => {
    let main, rotationModule, mockImage;

    beforeAll(() => {
        main = new Main();
        rotationModule = new Rotation(main);
        main.canvas = new fabric.Canvas($('<canvas>')[0]);
    });

    beforeEach(() => {
        mockImage = new fabric.Image();
        main.setCanvasImage('mockImage', mockImage);
    });

    it('"getCurrentAngle()" should return current angle value', () => {
        mockImage.angle = 30;

        expect(rotationModule.getCurrentAngle()).toEqual(30);
    });

    it('"setAngle()" should set angle value', () => {
        rotationModule.setAngle(40);

        expect(rotationModule.getCurrentAngle()).toEqual(40);
    });

    it('"setAngle()" should not set angle value if no change', done => {
        const current = rotationModule.getCurrentAngle();
        const spy = jasmine.createSpy();

        rotationModule.setAngle(current).catch(spy).then(() => {
            expect(spy).toHaveBeenCalled();
            done();
        });
    });

    it('"rotate()" should add angle value', () => {
        let current = rotationModule.getCurrentAngle();

        rotationModule.rotate(10);
        expect(rotationModule.getCurrentAngle()).toBe(current + 10);

        current = rotationModule.getCurrentAngle();
        rotationModule.rotate(20);
        expect(rotationModule.getCurrentAngle()).toBe(current + 20);
    });

    it('"rotate()" should set angle value modular 360(===2*PI)', () => {
        rotationModule.setAngle(10).then(() => rotationModule.rotate(380)).then(() => {
            expect(rotationModule.getCurrentAngle()).toBe(20);
        });
    });

    // @todo Move this tc to main.spec.js
    it('"adjustCanvasDimension()" should set canvas dimension from image-rect', () => {
        spyOn(mockImage, 'getBoundingRect').and.returnValue({
            width: 100,
            height: 110
        });

        rotationModule.adjustCanvasDimension();
        expect(main.canvas.getWidth()).toEqual(100);
        expect(main.canvas.getHeight()).toEqual(110);
    });
});
