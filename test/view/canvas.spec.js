'use strict';

var Canvas = require('./../../src/js/view/canvas');

describe('Canvas view', function() {
    var canvas;

    beforeEach(function() {
        canvas = new Canvas({});
    });

    it('should have view name', function() {
        expect(canvas.getName()).toEqual('canvas');
    });
});
