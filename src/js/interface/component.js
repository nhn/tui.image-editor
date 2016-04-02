'use strict';

var mixer = require('../mixin/mixer');

var Component = tui.util.defineClass({
    init: function() {},

    getCanvas: function() {
        if (this === this.getRoot()) {
            return this.canvas;
        }

        return this.getRoot().getCanvas();
    },

    getComponent: function(name) {
        if (this === this.getRoot()) {
            return this.components[name];
        }

        return this.getRoot().getComponent(name);
    },

    getCanvasImage: function() {
        if (this === this.getRoot()) {
            return this.oImage;
        }

        return this.getRoot().getCanvasImage();
    },

    /**
     * Get image name
     * @returns {string}
     */
    getImageName: function() {
        if (this === this.getRoot()) {
            return this.imageName;
        }

        return this.getRoot().getImageName();
    }
});

mixer.mixin(Component, 'Delegator');
module.exports = Component;
