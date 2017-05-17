/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @fileoverview Load a background (main) image
 */
import commandFactory from '../factory/command';
import consts from '../consts';

const {componentNames, commandNames} = consts;
const {IMAGE_LOADER} = componentNames;

const command = {
    name: commandNames.LOAD_IMAGE,

    /**
     * Load a background (main) image
     * @param {Graphics} graphics - Graphics instance
     * @param {string} imageName - Image name
     * @param {string} imgUrl - Image Url
     * @returns {Promise}
     */
    execute(graphics, imageName, imgUrl) {
        const loader = graphics.getComponent(IMAGE_LOADER);

        this.undoData = {
            prevName: loader.getImageName(),
            prevImage: loader.getCanvasImage(),
            objects: graphics.removeAll(true)
        };

        const oldRect = graphics.getCanvasElement().getBoundingClientRect();

        return loader.load(imageName, imgUrl).then(() => {
            const newRect = graphics.getCanvasElement().getBoundingClientRect();

            return {
                oldWidth: oldRect.width,
                oldHeight: oldRect.height,
                newWidth: newRect.width,
                newHeight: newRect.height
            };
        });
    },
    /**
     * @param {Graphics} graphics - Graphics instance
     * @returns {Promise}
     */
    undo(graphics) {
        const loader = graphics.getComponent(IMAGE_LOADER);
        const undoData = this.undoData;

        graphics.removeAll(true);
        graphics.add(undoData.objects);

        return loader.load(undoData.prevName, undoData.prevImage);
    }
};

commandFactory.register(command);

module.exports = command;
