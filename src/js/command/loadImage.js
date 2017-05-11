/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @fileoverview Load a image
 */
import consts from '../consts';

const {componentNames} = consts;
const {IMAGE_LOADER} = componentNames;

const command = {
    name: 'loadImage',

    /**
     * Add an image object on canvas
     * @param {object.<string, Component>} compMap - Components injection
     * @param {string} imageName - Image name
     * @param {string|fabric.Image} img - Image(or url)
     * @returns {Promise}
     */
    execute(compMap, imageName, img) {
        const loader = compMap[IMAGE_LOADER];
        const canvas = loader.getCanvas();

        this.store = {
            prevName: loader.getImageName(),
            prevImage: loader.getCanvasImage(),
            // Slice: "canvas.clear()" clears the objects array, So shallow copy the array
            objects: canvas.getObjects().slice()
        };
        canvas.clear();

        return loader.load(imageName, img);
    },
    /**
     * @param {object.<string, Component>} compMap - Components injection
     * @returns {Promise}
     */
    undo(compMap) {
        const loader = compMap[IMAGE_LOADER];
        const canvas = loader.getCanvas();
        const store = this.store;
        const canvasContext = canvas;

        canvas.clear();
        canvas.add.apply(canvasContext, store.objects);

        return loader.load(store.prevName, store.prevImage);
    }
};

module.exports = command;
