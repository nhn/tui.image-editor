/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhn.com>
 * @fileoverview Test cases of "src/js/component/line.js"
 */
import fabric from 'fabric';
import $ from 'jquery';
import Graphics from '../src/js/graphics';
import Line from '../src/js/component/line';

describe('Line', () => {
    let canvas, graphics, mockImage, line, fEvent;

    beforeAll(() => {
        graphics = new Graphics($('<canvas>')[0]);
        canvas = graphics.getCanvas();
        line = new Line(graphics);
    });

    beforeEach(() => {
        mockImage = new fabric.Image();
        graphics.setCanvasImage('mockImage', mockImage);

        fEvent = {
            e: {}
        };
    });

    afterEach(() => {
        canvas.forEachObject(obj => {
            canvas.remove(obj);
        });
    });

    it('_onFabricMouseDown() should insert the line.', () => {
        line._onFabricMouseDown(fEvent);

        expect(canvas.getObjects().length).toEqual(1);
    });

    it('_onFabricMouseMove() should draw line located by mouse pointer.', () => {
        line._line = new fabric.Line([10, 20, 10, 20]);

        canvas.add(line._line);

        spyOn(canvas, 'getPointer').and.returnValue({
            x: 30,
            y: 60
        });

        expect(canvas.getObjects()[0].get('x2')).toEqual(10);
        expect(canvas.getObjects()[0].get('y2')).toEqual(20);

        line._onFabricMouseMove(fEvent);

        expect(canvas.getObjects()[0].get('x2')).toEqual(30);
        expect(canvas.getObjects()[0].get('y2')).toEqual(60);
    });

    it('end() should restore all drawing objects activated.', () => {
        const path = new fabric.Path();

        canvas.add(path);

        line.start();

        expect(canvas.getObjects()[0].get('evented')).toEqual(false);

        line.end();

        expect(canvas.getObjects()[0].get('evented')).toEqual(true);
    });
});
