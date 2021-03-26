/**
 * @author NHN. FE Development Team <dl_javascript@nhn.com>
 * @fileoverview Rotate an image
 */
import commandFactory from '@/factory/command';
import { componentNames, commandNames } from '@/consts';

const { RESIZE } = componentNames;

/**
 * Cached data for undo
 * @type {Object}
 */
let cachedUndoDataForSilent = null;

/**
 * Make undo data
 * @param {Component} resizeComp - resize component
 * @returns {object} - undodata
 */
function makeUndoData(resizeComp) {
  return {
    angle: resizeComp.getCurrentSize(), // @todo make getCurrentSize() method
  };
}

const command = {
  name: commandNames.RESIZE_IMAGE,

  /**
   * Rotate an image
   * @param {Graphics} graphics - Graphics instance
   * @param {string} type - 'rotate' or 'setAngle'
   * @param {number} angle - angle value (degree)
   * @param {boolean} isSilent - is silent execution or not
   * @returns {Promise}
   */
  execute(graphics, type, angle, isSilent) {
    // @todo params and docs
    const resizeComp = graphics.getComponent(RESIZE);

    if (!this.isRedo) {
      const undoData = makeUndoData(resizeComp);

      cachedUndoDataForSilent = this.setUndoData(undoData, cachedUndoDataForSilent, isSilent);
    }

    return resizeComp[type](angle);
  },

  /**
   * @param {Graphics} graphics - Graphics instance
   * @returns {Promise}
   */
  undo(graphics) {
    const rotationComp = graphics.getComponent(RESIZE);
    const [, type, angle] = this.args;

    if (type === 'setAngle') {
      return rotationComp[type](this.undoData.angle);
    }

    return rotationComp.resize(-angle);
  },
};

commandFactory.register(command);

export default command;
