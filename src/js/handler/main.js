'use strict';

var Component = require('../interface/component'),
    ImageLoader = require('./imageLoader'),
    commands = require('../consts').commands;

var Main = tui.util.defineClass(Component, {
    init: function(broker) {
        this.broker = broker;

        this.canvas = null;
        this.oImage = null;
        this.components = {};
        this.registerActions();
    },

    registerActions: function() {
        this.registerAction(commands.SET_CANVAS_ELEMENT, this.setCanvasElement, this);
        this.registerAction(commands.SET_CANVAS_IMAGE, this.setCanvasImage, this);
    },

    setCanvasImage: function(oImage) {
        if (this.oImage) {
            this.oImage.remove();
        }
        this.oImage = oImage;
    },

    setCanvasElement: function(canvasElement) {
        this.canvas = new fabric.Canvas(canvasElement);
        this.setComponents();
    },

    setComponents: function() {
        this.components.imageLoader = new ImageLoader(this);
    },

    registerAction: function() {
        var broker = this.broker;

        broker.register.apply(broker, arguments);
    },

    deregisterAction: function() {
        var broker = this.broker;

        broker.deregister.apply(broker, arguments);
    },

    postCommand: function(command) {
        return this.broker.invoke(command);
    }
});

module.exports = Main;
