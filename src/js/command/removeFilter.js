/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @fileoverview Remove a filter from an image
 */
import consts from '../consts';

const {componentNames} = consts;
const {FILTER} = componentNames;

const command = {
    name: 'removeFilter',

    /**
     * Remove a filter from an image
     * @param {object.<string, Component>} compMap - Components injection
     * @param {string} type - Filter type
     * @returns {Promise}
     */
    execute(compMap, type) {
        const filterComp = compMap[FILTER];

        this.store = filterComp.getOptions(type);

        return filterComp.remove(type);
    },
    /**
     * @param {object.<string, Component>} compMap - Components injection
     * @param {string} type - Filter type
     * @returns {Promise}
     */
    undo(compMap, type) {
        const filterComp = compMap[FILTER];

        return filterComp.add(type, this.store);
    }
};

module.exports = command;
