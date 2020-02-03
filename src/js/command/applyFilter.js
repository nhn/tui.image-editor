/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhn.com>
 * @fileoverview Apply a filter into an image
 */
import snippet from 'tui-code-snippet';
import commandFactory from '../factory/command';
import consts from '../consts';

const {componentNames, rejectMessages, commandNames} = consts;
const {FILTER} = componentNames;

/**
 * Make undoData
 * @param {Graphics} graphics - Graphics instance
 * @param {string} type - Filter type 
 * @param {Component} filterComp - filter component
 * @param {Object} options - Filter options
 *  @param {number} options.maskObjId - masking image object id
 * @param {boolean} isSilent - is silent execution or not
 * @returns {object} - undo data
 */
function makeUndoData(graphics, type, filterComp, options, isSilent) {
    const undoData = {};

    if (type === 'mask') {
        undoData.object = options.mask;
        graphics.remove(options.mask);
    } else if (!isSilent) {
        const isRedo = !snippet.isUndefined(undoData.options);

        if (!isRedo) {
            undoData.options = filterComp.filterChangedStateForUndoStack[type] || null;
            filterComp.filterChangedStateForUndoStack[type] = snippet.extend({}, options);
        }
    }

    return undoData;
}

const command = {
    name: commandNames.APPLY_FILTER,

    /**
     * Apply a filter into an image
     * @param {Graphics} graphics - Graphics instance
     * @param {string} type - Filter type
     * @param {Object} options - Filter options
     *  @param {number} options.maskObjId - masking image object id
     * @param {boolean} isSilent - is silent execution or not
     * @returns {Promise}
     */
    execute(graphics, type, options, isSilent) {
        const filterComp = graphics.getComponent(FILTER);

        if (type === 'mask') {
            const maskObj = graphics.getObject(options.maskObjId);

            if (!(maskObj && maskObj.isType('image'))) {
                return Promise.reject(rejectMessages.invalidParameters);
            }

            options = {
                mask: maskObj
            };
        }

        snippet.extend(this.undoData, makeUndoData(graphics, type, filterComp, options, isSilent));

        return filterComp.add(type, options);
    },
    /**
     * @param {Graphics} graphics - Graphics instance
     * @param {string} type - Filter type
     * @returns {Promise}
     */
    undo(graphics, type) {
        const filterComp = graphics.getComponent(FILTER);

        if (type === 'mask') {
            const mask = this.undoData.object;
            graphics.add(mask);
            graphics.setActiveObject(mask);

            return filterComp.remove(type);
        }

        // options changed case
        if (this.undoData.options) {
            return filterComp.add(type, this.undoData.options);
        }

        // filter added case
        return filterComp.remove(type);
    }
};

commandFactory.register(command);

module.exports = command;
