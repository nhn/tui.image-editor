/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @fileoverview Command interface
 */
import errorMessage from '../factory/errorMessage';

const createMessage = errorMessage.create;
const errorTypes = errorMessage.types;

/**
 * Command class
 * @class
 * @param {{execute: function, undo: function}} actions - Command actions
 * @param {Array} args - passing arguments on execute, undo
 * @ignore
 */
class Command {
    constructor(actions, args) {
        /**
         * command name
         * @type {string}
         */
        this.name = actions.name;

        /**
         * arguments
         * @type {Array}
         */
        this.args = args;

        /**
         * Execute function
         * @type {function}
         */
        this.execute = actions.execute;

        /**
         * Undo function
         * @type {function}
         */
        this.undo = actions.undo;

        /**
         * executeCallback
         * @type {null}
         */
        this.executeCallback = null;

        /**
         * undoCallback
         * @type {null}
         */
        this.undoCallback = null;
    }

    /**
     * Execute action
     * @param {Object.<string, Component>} compMap - Components injection
     * @abstract
     */
    execute() {
        throw new Error(createMessage(errorTypes.UN_IMPLEMENTATION, 'execute'));
    }

    /**
     * Undo action
     * @param {Object.<string, Component>} compMap - Components injection
     * @abstract
     */
    undo() {
        throw new Error(createMessage(errorTypes.UN_IMPLEMENTATION, 'undo'));
    }

    /**
     * Attach execute callabck
     * @param {function} callback - Callback after execution
     * @returns {Command} this
     */
    setExecuteCallback(callback) {
        this.executeCallback = callback;

        return this;
    }

    /**
     * Attach undo callback
     * @param {function} callback - Callback after undo
     * @returns {Command} this
     */
    setUndoCallback(callback) {
        this.undoCallback = callback;

        return this;
    }
}

module.exports = Command;
