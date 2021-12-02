/**
 * @author NHN. FE Development Team <dl_javascript@nhn.com>
 * @fileoverview Load a background (main) image
 */
import commandFactory from '@/factory/command';
import { commandNames } from '@/consts';

const command = {
  name: commandNames.SET_SRC,

  /**
   * Load a background (main) image
   * @param {Graphics} graphics - Graphics instance
   * @param {string} imgUrl - Image Url
   * @returns {Promise}
   */
  execute(graphics, imgUrl, type) {
    const prevImage = graphics.getCanvasImage();
    const prevImageWidth = prevImage ? prevImage.width : 0;
    const prevImageHeight = prevImage ? prevImage.height : 0;
    const objects = graphics
      .removeAll(false)
      .filter((objectItem) => objectItem.type !== 'cropzone');

    objects.forEach((objectItem) => {
      objectItem.evented = true;
    });

    this.undoData = {
      image: prevImage.getSrc(),
      objects,
    };

    return graphics.setSrc(imgUrl, type).then((newImage) => ({
      oldWidth: prevImageWidth,
      oldHeight: prevImageHeight,
      newWidth: newImage.width,
      newHeight: newImage.height,
    }));
  },

  /**
   * @param {Graphics} graphics - Graphics instance
   * @returns {Promise}
   */
  undo(graphics) {
    const { objects, image } = this.undoData;

    graphics.removeAll(false);
    graphics.add(objects);

    return graphics.setSrc(image);
  },
};

commandFactory.register(command);

export default command;
