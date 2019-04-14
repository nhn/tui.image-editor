/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhn.com>
 * @fileoverview Add a text object
 */
import commandFactory from '../factory/command';
import Promise from 'core-js/library/es6/promise';
import consts from '../consts';

const {componentNames, commandNames} = consts;
const {TEXT} = componentNames;

const command = {
    name: commandNames.ADD_TEXT,

    /**
     * Add a text object
     * @param {Graphics} graphics - Graphics instance
     * @param {string} text - Initial input text
     * @param {Object} [options] Options for text styles
     *     @param {Object} [options.styles] Initial styles
     *         @param {string} [options.styles.fill] Color
     *         @param {string} [options.styles.fontFamily] Font type for text
     *         @param {number} [options.styles.fontSize] Size
     *         @param {string} [options.styles.fontStyle] Type of inclination (normal / italic)
     *         @param {string} [options.styles.fontWeight] Type of thicker or thinner looking (normal / bold)
     *         @param {string} [options.styles.textAlign] Type of text align (left / center / right)
     *         @param {string} [options.styles.textDecoraiton] Type of line (underline / line-throgh / overline)
     *     @param {{x: number, y: number}} [options.position] - Initial position
     * @returns {Promise}
     */
    execute(graphics, text, options) {
        const textComp = graphics.getComponent(TEXT);

        return textComp.add(text, options).then(objectProps => {
            this.undoData.object = graphics.getObject(objectProps.id);

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
