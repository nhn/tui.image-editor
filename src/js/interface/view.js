'use strict';
var consts = require('./../consts');

var View = tui.util.defineClass({
    init: function() {},

    getElement: function() {
        if (!this.$element) {
            throw new Error(consts.messages.NO_ELEMENT);
        }
        return this.$element;
    },

    getName: function() {
        if (!this.name) {
            throw new Error(consts.messages.NO_VIEW_NAME);
        }
        return this.name;
    },

    hasView: function() {
        throw new Error(consts.messages.NOT_IMPLEMENTED);
    },

    addView: function() {
        throw new Error(consts.messages.NOT_IMPLEMENTED);
    },

    removeView: function() {
        throw new Error(consts.messages.NOT_IMPLEMENTED);
    },

    render: function() {
        throw new Error(consts.messages.NOT_IMPLEMENTED);
    },

    destroy: function() {
        throw new Error(consts.messages.NOT_IMPLEMENTED);
    }
});

module.exports = View;
