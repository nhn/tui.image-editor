/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @fileoverview Component interface
 */

/**
 * Component interface
 * @class
 * @ignore
 */
class Component {
    /**
     * Save image(background) of canvas
     * @param {string} name - Name of image
     * @param {fabric.Image} oImage - Fabric image instance
     */
    setCanvasImage(name, oImage) {
        this.getRoot().setCanvasImage(name, oImage);
    }

    /**
     * Returns canvas element of fabric.Canvas[[lower-canvas]]
     * @returns {HTMLCanvasElement}
     */
    getCanvasElement() {
        return this.getRoot().getCanvasElement();
    }

    /**
     * Get fabric.Canvas instance
     * @returns {fabric.Canvas}
     */
    getCanvas() {
        return this.getRoot().getCanvas();
    }

    /**
     * Get canvasImage (fabric.Image instance)
     * @returns {fabric.Image}
     */
    getCanvasImage() {
        return this.getRoot().getCanvasImage();
    }

    /**
     * Get image name
     * @returns {string}
     */
    getImageName() {
        return this.getRoot().getImageName();
    }

    /**
     * Get image editor
     * @returns {ImageEditor}
     */
    getEditor() {
        return this.getRoot().getEditor();
    }

    /**
     * Return component name
     * @returns {string}
     */
    getName() {
        return this.name;
    }

    /**
     * Set image properties
     * @param {object} setting - Image properties
     * @param {boolean} [withRendering] - If true, The changed image will be reflected in the canvas
     */
    setImageProperties(setting, withRendering) {
        this.getRoot().setImageProperties(setting, withRendering);
    }

    /**
     * Set canvas dimension - css only
     * @param {object} dimension - Canvas css dimension
     */
    setCanvasCssDimension(dimension) {
        this.getRoot().setCanvasCssDimension(dimension);
    }

    /**
     * Set canvas dimension - css only
     * @param {object} dimension - Canvas backstore dimension
     */
    setCanvasBackstoreDimension(dimension) {
        this.getRoot().setCanvasBackstoreDimension(dimension);
    }

    /**
     * Set parent
     * @param {Component|null} parent - Parent
     */
    setParent(parent) {
        this._parent = parent || null;
    }

    /**
     * Adjust canvas dimension with scaling image
     */
    adjustCanvasDimension() {
        this.getRoot().adjustCanvasDimension();
    }

    /**
     * Return parent.
     * If the view is root, return null
     * @returns {Component|null}
     */
    getParent() {
        return this._parent;
    }

    /**
     * Return root
     * @returns {Component}
     */
    getRoot() {
        let next = this.getParent();
        let current = this; // eslint-disable-line consistent-this

        while (next) {
            current = next;
            next = current.getParent();
        }

        return current;
    }
}

module.exports = Component;
