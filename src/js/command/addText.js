/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @fileoverview Add a text object
 */
import Promise from 'core-js/library/es6/promise';
import consts from '../consts';

const {componentNames} = consts;
const {TEXT} = componentNames;

const command = {
    name: 'addText',

    /**
     * Add a text object
     * @param {object.<string, Component>} compMap - Components injection
     * @param {string} text - Initial input text
     * @param {object} [options] Options for generating text
     *     @param {object} [options.styles] Initial styles
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
    execute(compMap, text, options) {
        const textComp = compMap[TEXT];
        const self = this;

        return textComp.add(text, options).then(textObj => {
            self.store = textObj;
        });
    },
    /**
     * @returns {Promise}
     */
    undo() {
        this.store.remove();

        return Promise.resolve();
    }
};

module.exports = command;
