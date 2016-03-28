'use strict';
var createMessage = require('../factory/errorMessage').create;

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

    /**
     * Post a command
     * The root will be override this method
     * @param {object} command - Command data
     * @param {function} callback - Callback if succeeded
     */
    postCommand: function(command, callback) {
        var root = this.getRoot();

        if (this.postCommand === root.postCommand) {
            throw new Error(createMessage('unImplementation', 'postCommand'));
        }

        root.postCommand(command, callback);
    },

    /**
     * Register action(s) to command(s)
     * The root will be override this method
     */
    registerAction: function() {
        var root = this.getRoot();

        if (this.registerAction === root.registerAction) {
            throw new Error(createMessage('unImplementation', 'registerAction'));
        }

        root.registerAction.apply(root, arguments);
    },

    /**
     * Deregister action(s)
     * The root will be override this method
     */
    deregisterAction: function() {
        var root = this.getRoot();

        if (this.deregisterAction === root.deregisterAction) {
            throw new Error(createMessage('unImplementation', 'deregisterAction'));
        }

        root.deregisterAction.apply(root, arguments);
    }
};

module.exports = Delegator;
