/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhn.com>
 * @fileoverview Apply a filter into an image
 */
import commandFactory from '../factory/command';
import consts from '../consts';

const {componentNames, rejectMessages, commandNames} = consts;
const {FILTER} = componentNames;

const command = {
    name: commandNames.APPLY_FILTER,

    /**
     * Apply a filter into an image
     * @param {Graphics} graphics - Graphics instance
     * @param {string} type - Filter type
     * @param {Object} options - Filter options
     *  @param {number} options.maskObjId - masking image object id
     * @returns {Promise}
     */
    execute(graphics, type, options) {
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

        if (type === 'mask') {
            this.undoData.object = options.mask;
            graphics.remove(options.mask);
        } else {
            this.undoData.options = filterComp.getOptions(type);
        }

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
