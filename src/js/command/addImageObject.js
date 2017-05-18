/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @fileoverview Add an image object
 */
import commandFactory from '../factory/command';
import Promise from 'core-js/library/es6/promise';
import consts from '../consts';

const {commandNames} = consts;

const command = {
    name: commandNames.ADD_IMAGE_OBJECT,

    /**
     * Add an image object
     * @param {Graphics} graphics - Graphics instance
     * @param {string} imgUrl - Image url to make object
     * @returns {Promise}
     */
    execute(graphics, imgUrl) {
        const undoData = this.undoData;

        return graphics.addImageObject(imgUrl).then(objectProps => {
            undoData.object = graphics.getObject(objectProps.id);

            return objectProps;
        });
    },
    /**
     * @param {Graphics} graphics - Graphics instance
     * @returns {Promise}
     */
    undo(graphics) {
        graphics.remove(this.undoData.object);

        return Promise.resolve();
    }
};

commandFactory.register(command);

module.exports = command;
