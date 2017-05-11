/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @fileoverview Apply a filter into an image
 */
import consts from '../consts';

const {componentNames} = consts;
const {FILTER} = componentNames;

const command = {
    name: 'applyFilter',

    /**
     * Apply a filter into an image
     * @param {object.<string, Component>} compMap - Components injection
     * @param {string} type - Filter type
     * @param {object} options - Filter options
     * @returns {Promise}
     */
    execute(compMap, type, options) {
        const filterComp = compMap[FILTER];

        if (type === 'mask') {
            this.store = options.mask;
            options.mask.remove();
        } else {
            this.store = filterComp.getOptions(type);
        }

        return filterComp.add(type, options);
    },
    /**
     * @param {object.<string, Component>} compMap - Components injection
     * @param {string} type - Filter type
     * @returns {Promise}
     */
    undo(compMap, type) {
        const filterComp = compMap[FILTER];

        if (type === 'mask') {
            filterComp.getCanvas().add(this.store); // this.store is mask image

            return filterComp.remove(type);
        }

        // options changed case
        if (this.store) {
            return filterComp.add(type, this.store);  // this.store is options object
        }

        // filter added case
        return filterComp.remove(type);  // this.store is options object
    }
};

module.exports = command;
