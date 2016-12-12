/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @fileoverview Test cases of "src/js/component/rotation.js"
 */
'use strict';

var Main = require('../src/js/component/main');
var Rotation = require('../src/js/component/rotation');

describe('Rotation', function() {
    var main, rotationModule, mockImage;

    beforeAll(function() {
        main = new Main();
        rotationModule = new Rotation(main);
        main.canvas = new fabric.Canvas($('<canvas>')[0]);
    });

    beforeEach(function() {
        mockImage = new fabric.Image();
        main.setCanvasImage('mockImage', mockImage);
    });

    it('"getCurrentAngle()" should return current angle value', function() {
        mockImage.angle = 30;

        expect(rotationModule.getCurrentAngle()).toEqual(30);
    });

    it('"setAngle()" should set angle value', function() {
        rotationModule.setAngle(40);

        expect(rotationModule.getCurrentAngle()).toEqual(40);
    });

    it('"setAnglue()" should not set angle value if no change', function() {
        var current = rotationModule.getCurrentAngle();
        var spy = jasmine.createSpy();

        rotationModule.setAngle(current).then(function() {
            expect(spy).toHaveBeenCalled();
        });
    });

    it('"rotate()" should add angle value', function() {
        var current = rotationModule.getCurrentAngle();

        rotationModule.rotate(10);
        expect(rotationModule.getCurrentAngle()).toBe(current + 10);

        current = rotationModule.getCurrentAngle();
        rotationModule.rotate(20);
        expect(rotationModule.getCurrentAngle()).toBe(current + 20);
    });

    it('"rotate()" should set angle value modular 360(===2*PI)', function() {
        rotationModule.setAngle(0);

        rotationModule.rotate(370);
        expect(rotationModule.getCurrentAngle()).toBe(10);
    });

    //@todo Move this tc to main.spec.js
    it('"adjustCanvasDimension()" should set canvas dimension from image-rect', function() {
        spyOn(mockImage, 'getBoundingRect').and.returnValue({
            width: 100,
            height: 110
        });

        rotationModule.adjustCanvasDimension();
        expect(main.canvas.getWidth()).toEqual(100);
        expect(main.canvas.getHeight()).toEqual(110);
    });
});
