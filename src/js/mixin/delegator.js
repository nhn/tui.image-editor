'use strict';
var errorMessage = require('../factory/errorMessage');

var createMessage = errorMessage.create,
    errorTypes = errorMessage.types;

/**
 * This provides methods used for command delegation.
 * @module Delegator
 * @mixin
 */
var Delegator = {
    /**
     * Set parent
     * @param {Delegator|null} parent - Parent
     */
    setParent: function(parent) {
        this._parent = parent || null;
    },

    /**
     * Return parent.
     * If the view is root, return null
     * @returns {Delegator|null}
     */
    getParent: function() {
        return this._parent;
    },

    /**
     * Return root
     * @returns {Delegator}
     */
    getRoot: function() {
        var next = this.getParent(),
        /* eslint-disable consistent-this */
            current = this;
        /* eslint-enable consistent-this */

        while (next) {
            current = next;
            next = current.getParent();
        }

        return current;
    },

    getEditor: function() {
        return this.getRoot().editor;
    }
};

module.exports = Delegator;
