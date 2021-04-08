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
 * @param {Resize} resizeComp - resize component
 * @returns {object} - undodata
 */
function makeUndoData(resizeComp) {
  return {
    dimensions: resizeComp.getCurrentDimensions(),
  };
}

const command = {
  name: commandNames.RESIZE_IMAGE,

  /**
   * Resize an image
   * @param {Graphics} graphics - Graphics instance
   * @param {object} dimensions - Image Dimensions
   * @param {boolean} isSilent - is silent execution or not
   * @returns {Promise}
   */
  execute(graphics, dimensions, isSilent) {
    const resizeComp = graphics.getComponent(RESIZE);

    if (!this.isRedo) {
      const undoData = makeUndoData(resizeComp);

      cachedUndoDataForSilent = this.setUndoData(undoData, cachedUndoDataForSilent, isSilent);
    }

    return resizeComp.resize(dimensions);
  },

  /**
   * @param {Graphics} graphics - Graphics instance
   * @returns {Promise}
   */
  undo(graphics) {
    const resizeComp = graphics.getComponent(RESIZE);
    const [, type, dimensions] = this.args;

    if (type === 'resize') {
      return resizeComp[type](this.undoData.dimensions);
    }

    return resizeComp.resize(dimensions);
  },
};

commandFactory.register(command);

export default command;
