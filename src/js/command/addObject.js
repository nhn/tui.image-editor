/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhn.com>
 * @fileoverview Add an object
 */
import commandFactory from '../factory/command';
import Promise from 'core-js/library/es6/promise';
import consts from '../consts';

const {commandNames, rejectMessages} = consts;

const command = {
    name: commandNames.ADD_OBJECT,

    /**
     * Add an object
     * @param {Graphics} graphics - Graphics instance
     * @param {Object} object - Fabric object
     * @returns {Promise}
     */
    execute(graphics, object) {
        return new Promise((resolve, reject) => {
            if (!graphics.contains(object)) {
                graphics.add(object);
                resolve(object);
            } else {
                reject(rejectMessages.addedObject);
            }
        });
    },
    /**
     * @param {Graphics} graphics - Graphics instance
     * @param {Object} object - Fabric object
     * @returns {Promise}
     */
    undo(graphics, object) {
        return new Promise((resolve, reject) => {
            if (graphics.contains(object)) {
                graphics.remove(object);
                resolve(object);
            } else {
                reject(rejectMessages.noObject);
            }
        });
    }
};

commandFactory.register(command);

module.exports = command;
