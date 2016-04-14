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
});
