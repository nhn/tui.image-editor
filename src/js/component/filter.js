/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @fileoverview Add filter module
 */
import Component from '../interface/component';
import Mask from '../extension/mask';
import consts from '../consts';

/**
 * Filter
 * @class Filter
 * @param {Component} parent - parent component
 * @extends {Component}
 * @ignore
 */
class Filter extends Component {
    constructor(parent) {
        super();
        this.setParent(parent);

        /**
         * Component name
         * @type {string}
         */
        this.name = consts.componentNames.FILTER;
    }

    /**
     * Add filter to source image (a specific filter is added on fabric.js)
     * @param {string} type - Filter type
     * @param {object} [options] - Options of filter
     * @returns {Promise}
     */
    add(type, options) {
        return new Promise((resolve, reject) => {
            const filter = this._createFilter(type, options);
            const sourceImg = this._getSourceImage();
            const canvas = this.getCanvas();

            if (!filter) {
                reject();
            }

            sourceImg.filters.push(filter);

            this._apply(sourceImg, () => {
                canvas.renderAll();
                resolve(type, 'add');
            });
        });
    }

    /**
     * Remove filter to source image
     * @param {string} type - Filter type
     * @returns {Promise}
     */
    remove(type) {
        return new Promise((resolve, reject) => {
            const sourceImg = this._getSourceImage();
            const canvas = this.getCanvas();

            if (!sourceImg.filters.length) {
                reject();
            }

            sourceImg.filters.pop();

            this._apply(sourceImg, () => {
                canvas.renderAll();
                resolve(type, 'remove');
            });
        });
    }

    /**
     * Apply filter
     * @param {fabric.Image} sourceImg - Source image to apply filter
     * @param {function} callback - Executed function after applying filter
     * @private
     */
    _apply(sourceImg, callback) {
        sourceImg.applyFilters(callback);
    }

    /**
     * Get source image on canvas
     * @returns {fabric.Image} Current source image on canvas
     * @private
     */
    _getSourceImage() {
        return this.getCanvasImage();
    }

    /**
     * Create filter instance
     * @param {string} type - Filter type
     * @param {object} [options] - Options of filter
     * @returns {object} Fabric object of filter
     * @private
     */
    _createFilter(type, options) {
        let filterObj;

        switch (type) {
            case 'mask':
                filterObj = new Mask(options);
                break;
            case 'removeWhite':
                filterObj = new fabric.Image.filters.RemoveWhite(options);
                break;
            default:
                filterObj = null;
        }

        return filterObj;
    }
}

module.exports = Filter;
