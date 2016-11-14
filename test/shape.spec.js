/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @fileoverview Test cases of "src/js/component/line.js"
 */
'use strict';

var Main = require('../src/js/component/main');
var Shape = require('../src/js/component/shape');

describe('Shape', function() {
    var canvas, main, mockImage, fEvent, shape, shapeObj;

    beforeAll(function() {
        canvas = new fabric.Canvas($('<canvas>')[0]);
        main = new Main();
        main.canvas = canvas;

        shape = new Shape(main);
    });

    beforeEach(function() {
        mockImage = new fabric.Image();
        main.setCanvasImage('mockImage', mockImage);

        fEvent = {
            e: {}
        };
    });

    afterEach(function() {
        canvas.forEachObject(function(obj) {
            canvas.remove(obj);
        });
    });

    it('The rectagle object is created on canvas.', function() {
        var obj = shape.add('rect');

        shapeObj = main.canvas.getObjects()[0];

        expect(shapeObj).toEqual(obj);
        expect(shapeObj.type).toBe('rect');
    });

    it('The circle object(ellipse) is created on canvas.', function() {
        var obj = shape.add('circle');

        shapeObj = main.canvas.getObjects()[0];

        expect(shapeObj).toEqual(obj);
        expect(shapeObj.type).toBe('circle');
    });

    it('When add() is called with no options, the default options set the rectangle object.', function() {
        var defaultOptions = {
            width: 0,
            height: 0
        };
        var defaultStrokeWidth = 1;
        var obj = shape.add('rect');

        expect(obj.getWidth()).toBe(defaultOptions.width + defaultStrokeWidth); // the rectagle has 1px stroke
        expect(obj.getHeight()).toBe(defaultOptions.height + defaultStrokeWidth);
    });

    it('When add() is called with no options, the default options set the circle object.', function() {
        var defaultOptions = {
            rx: 0,
            ry: 0
        };

        shapeObj = shape.add('circle');

        expect(shapeObj.getRx()).toBe(defaultOptions.rx);
        expect(shapeObj.getRy()).toBe(defaultOptions.ry);
    });

    it('When add() is called with the options, this options set the rectagle object.', function() {
        var settings = {
            fill: 'blue',
            stroke: 'red',
            strokeWidth: 0, // the rectagle has strokeWidth in width and height values
            type: 'rect',
            width: 100,
            height: 100
        };

        shape.add('rect', settings);
        shapeObj = main.canvas.getObjects()[0];

        expect(shapeObj.getFill()).toBe('blue');
        expect(shapeObj.getStroke()).toBe('red');
        expect(shapeObj.getStrokeWidth()).toBe(0);
        expect(shapeObj.getWidth()).toBe(100);
        expect(shapeObj.getHeight()).toBe(100);
    });

    it('When add() is called with the options, this options set the circle object.', function() {
        var settings = {
            fill: 'blue',
            stroke: 'red',
            strokeWidth: 3,
            type: 'circle',
            rx: 100,
            ry: 100
        };

        shape.add('circle', settings);
        shapeObj = main.canvas.getObjects()[0];

        expect(shapeObj.getFill()).toBe('blue');
        expect(shapeObj.getStroke()).toBe('red');
        expect(shapeObj.getStrokeWidth()).toBe(3);
        expect(shapeObj.getRx()).toBe(100);
        expect(shapeObj.getRy()).toBe(100);
    });

    it('When change() is called, the style of the rectagle object is changed.', function() {
        shape.add('rect');

        shapeObj = main.canvas.getObjects()[0];
        shape.change(shapeObj, {
            fill: 'blue',
            stroke: 'red',
            strokeWidth: 0,
            width: 10,
            height: 20
        });

        expect(shapeObj.getFill()).toBe('blue');
        expect(shapeObj.getStroke()).toBe('red');
        expect(shapeObj.getWidth()).toBe(10);
        expect(shapeObj.getHeight()).toBe(20);
    });

    it('When change() is called, the style of the circle object is changed.', function() {
        shape.add('circle');

        shapeObj = main.canvas.getObjects()[0];
        shape.change(shapeObj, {
            fill: 'blue',
            stroke: 'red',
            rx: 10,
            ry: 20
        });

        expect(shapeObj.getFill()).toBe('blue');
        expect(shapeObj.getStroke()).toBe('red');
        expect(shapeObj.getRx()).toBe(10);
        expect(shapeObj.getRy()).toBe(20);
    });

    describe('_onFabricMouseDown()', function() {
        beforeEach(function() {
            shape.start();
            spyOn(main.canvas, 'getPointer').and.returnValue({x: 10, y: 10});
        });

        it('The current pointer values are set initial width and height of the rectagle object.', function() {
            shape._onFabricMouseDown(fEvent);

            shapeObj = main.canvas.getObjects()[0];

            expect(shapeObj.getWidth()).toBe(1);
            expect(shapeObj.getHeight()).toBe(1);
        });

        it('The current pointer values are set initial x and y radius of the circle object.', function() {
            shape.setStates('circle');
            shape._onFabricMouseDown(fEvent);

            shapeObj = main.canvas.getObjects()[0];

            expect(shapeObj.getWidth()).toBe(1);
            expect(shapeObj.getHeight()).toBe(1);
        });
    });

    describe('_onFabricMouseMove()', function() {
        beforeEach(function() {
            shape._shapeObj = shape.add('rect', {left: 100, top: 100});
            shape._startPoint = {x: 100, y: 100};
        });

        it('When the mouse direction is in 1th quadrant,' +
            'the origin values of shape set to "left" and "top".', function() {
            spyOn(main.canvas, 'getPointer').and.returnValue({x: 200, y: 120});

            shape._onFabricMouseMove(fEvent);

            shapeObj = main.canvas.getObjects()[0];

            expect(shapeObj.getOriginX()).toBe('left');
            expect(shapeObj.getOriginY()).toBe('top');
        });

        it('When the mouse direction is in 2th quadrant,' +
            'the origin values of shape set to "right" and "top".', function() {
            spyOn(main.canvas, 'getPointer').and.returnValue({x: 80, y: 100});

            shape._onFabricMouseMove(fEvent);

            shapeObj = main.canvas.getObjects()[0];

            expect(shapeObj.getOriginX()).toBe('right');
            expect(shapeObj.getOriginY()).toBe('top');
        });

        it('When the mouse direction is in 3th quadrant,' +
            'the origin values of shape set to "right" and "bottom".', function() {
            spyOn(main.canvas, 'getPointer').and.returnValue({x: 80, y: 80});

            shape._onFabricMouseMove(fEvent);

            shapeObj = main.canvas.getObjects()[0];

            expect(shapeObj.getOriginX()).toBe('right');
            expect(shapeObj.getOriginY()).toBe('bottom');
        });

        it('When the mouse direction is in 4th quadrant,' +
            'the origin values of shape set to "left" and "bottom".', function() {
            spyOn(main.canvas, 'getPointer').and.returnValue({x: 200, y: 80});

            shape._onFabricMouseMove(fEvent);

            shapeObj = main.canvas.getObjects()[0];

            expect(shapeObj.getOriginX()).toBe('left');
            expect(shapeObj.getOriginY()).toBe('bottom');
        });
    });

    describe('_onFabricMouseUp()', function() {
        var point;

        beforeEach(function() {
            shape._shapeObj = shape.add('circle', {left: 100, top: 100});
            shape._startPoint = {x: 100, y: 100};
        });

        it('When the drawing shape is in 1th quadrant, "left" and "top" are the same as start point.', function() {
            spyOn(main.canvas, 'getPointer').and.returnValue({x: 200, y: 120});

            shape._onFabricMouseMove(fEvent);
            shape._onFabricMouseUp();

            point = main.canvas.getObjects()[0].getPointByOrigin('left', 'top');

            expect(point.x).toBe(100);
            expect(point.y).toBe(100);
        });

        it('When the drawing shape is in 2th quadrant, "right" and "top" are the same as start point.', function() {
            spyOn(main.canvas, 'getPointer').and.returnValue({x: 80, y: 120});

            shape._onFabricMouseMove(fEvent);
            shape._onFabricMouseUp();

            point = main.canvas.getObjects()[0].getPointByOrigin('right', 'top');

            expect(point.x).toBe(100);
            expect(point.y).toBe(100);
        });

        it('When the drawing shape is in 3th quadrant, "right" and "bottom" are the same as start point.', function() {
            spyOn(main.canvas, 'getPointer').and.returnValue({x: 80, y: 80});

            shape._onFabricMouseMove(fEvent);
            shape._onFabricMouseUp();

            point = main.canvas.getObjects()[0].getPointByOrigin('right', 'bottom');

            expect(point.x).toBe(100);
            expect(point.y).toBe(100);
        });

        it('When the drawing shape is in 4th quadrant, "left" and "bottom" are the same as start point.', function() {
            spyOn(main.canvas, 'getPointer').and.returnValue({x: 120, y: 80});

            shape._onFabricMouseMove(fEvent);
            shape._onFabricMouseUp();

            point = main.canvas.getObjects()[0].getPointByOrigin('left', 'bottom');

            expect(point.x).toBe(100);
            expect(point.y).toBe(100);
        });
    });

    describe('When drawing the shape with pressing the shift key and', function() {
        beforeEach(function() {
            shape.setStates('rect');

            shape._shapeObj = shape.add('rect', {left: 0, top: 0, strokeWidth: 0});
            shape._startPoint = {x: 0, y: 0};
            shape._withShiftKey = true;
        });

        it('"width" is larger than "height", "height" set to "width".', function() {
            spyOn(main.canvas, 'getPointer').and.returnValue({x: 200, y: 100});

            shape._onFabricMouseMove(fEvent);
            shape._onFabricMouseUp();

            shapeObj = main.canvas.getObjects()[0];

            expect(shapeObj.getHeight()).toBe(200);
        });

        it('"height" is larger than "width", "width" set to "height".', function() {
            spyOn(main.canvas, 'getPointer').and.returnValue({x: 100, y: 200});

            shape._onFabricMouseMove(fEvent);
            shape._onFabricMouseUp();

            shapeObj = main.canvas.getObjects()[0];

            expect(shapeObj.getWidth()).toBe(200);
        });
    });

    describe('When drawing the shape with mouse and the "isOneRatio" option set to true,', function() {
        it('the created rectangle shape has the same "width" and "height" values.', function() {
            shape.setStates('rect', null, true);

            shape._shapeObj = shape.add('rect', {left: 0, top: 0, strokeWidth: 0});
            shape._startPoint = {x: 0, y: 0};

            spyOn(main.canvas, 'getPointer').and.returnValue({x: 200, y: 100});

            shape._onFabricMouseMove(fEvent);
            shape._onFabricMouseUp();

            shapeObj = main.canvas.getObjects()[0];

            expect(shapeObj.getHeight()).toBe(shapeObj.getWidth());
        });
    });
});
