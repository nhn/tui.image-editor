'use strict';

var consts = require('../consts');

var View = tui.util.defineClass({
    init: function(name) {
        this._name = name;
        this._element = null;
        this._$element = $();
    },

    getName: function() {
        return this._name;
    },

    getElement: function() {
        return this._element;
    },

    getjQueryElement: function() {
        return this._$element;
    },

    render: function() {
        throw new Error(consts.MSG_NOT_IMPLEMENTED + ': ' + this.getName() + ' - render');
    },

    destroy: function() {
        this._$element.remove();
        this._element = this._$element = null;
    }
});

module.exports = View;
