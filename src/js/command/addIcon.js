/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @fileoverview Add an icon
 */
import Promise from 'core-js/library/es6/promise';
import consts from '../consts';

const {componentNames} = consts;
const {ICON} = componentNames;

const command = {
    name: 'addIcon',

    /**
     * Add an icon
     * @param {object.<string, Component>} compMap - Components injection
     * @param {string} type - Icon type ('arrow', 'cancel', custom icon name)
     * @param {object} options - Icon options
     *      @param {string} [options.fill] - Icon foreground color
     *      @param {string} [options.left] - Icon x position
     *      @param {string} [options.top] - Icon y position
     * @returns {Promise}
     */
    execute(compMap, type, options) {
        const iconComp = compMap[ICON];
        const self = this;

        return iconComp.add(type, options).then(icon => {
            self.store = icon;
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
