/**
 * @author NHN. FE Development Team <dl_javascript@nhn.com>
 * @fileoverview Rotate an image
 */
import commandFactory from '@/factory/command';
import { componentNames, commandNames } from '@/consts';

const { RESIZE } = componentNames;

const command = {
  name: commandNames.RESIZE_IMAGE,

  /**
   * Resize an image
   * @param {Graphics} graphics - Graphics instance
   * @param {object} dimensions - Image Dimensions
   * @returns {Promise}
   */
  execute(graphics, dimensions) {
    const resizeComp = graphics.getComponent(RESIZE);

    if (!this.isRedo) {
      this.undoData.dimensions = resizeComp.getOriginalDimensions();
    }

    return resizeComp.resize(dimensions);
  },

  /**
   * @param {Graphics} graphics - Graphics instance
   * @returns {Promise}
   */
  undo(graphics) {
    const resizeComp = graphics.getComponent(RESIZE);

    return resizeComp.resize(this.undoData.dimensions);
  },
};

commandFactory.register(command);

export default command;
