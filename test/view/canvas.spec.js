'use strict';

var Canvas = require('../../src/js/view/canvas');

describe('canvas', function() {
    var editorMock = {};

    it('should have viewName', function() {
        var canvas = new Canvas(editorMock);

        expect(canvas.getName()).toEqual('canvas');
    });

    it('should throw error when call a not implemented render method', function() {
        var canvas = new Canvas(editorMock),
            renderMethod = (delete canvas.render) && tui.util.bind(canvas.render, canvas);

        expect(renderMethod).toThrowError(/canvas.*render/);
    });
});
