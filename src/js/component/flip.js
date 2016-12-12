/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @fileoverview Image flip module
 */
import Promise from 'core-js/library/es6/promise';
import Component from '../interface/component';
import consts from '../consts';

/**
 * Flip
 * @class Flip
 * @param {Component} parent - parent component
 * @extends {Component}
 * @ignore
 */
class Flip extends Component {
    constructor(parent) {
        super();
        this.setParent(parent);

        /**
         * Component name
         * @type {string}
         */
        this.name = consts.componentNames.FLIP;
    }

    /**
     * Get current flip settings
     * @returns {{flipX: Boolean, flipY: Boolean}}
     */
    getCurrentSetting() {
        const canvasImage = this.getCanvasImage();

        return {
            flipX: canvasImage.flipX,
            flipY: canvasImage.flipY
        };
    }

    /**
     * Set flipX, flipY
     * @param {{flipX: Boolean, flipY: Boolean}} newSetting - Flip setting
     * @returns {jQuery.Deferred}
     */
    set(newSetting) {
        const setting = this.getCurrentSetting();
        const isChangingFlipX = (setting.flipX !== newSetting.flipX);
        const isChangingFlipY = (setting.flipY !== newSetting.flipY);

        if (!isChangingFlipX && !isChangingFlipY) {
            return Promise.reject();
        }

        tui.util.extend(setting, newSetting);
        this.setImageProperties(setting, true);
        this._invertAngle(isChangingFlipX, isChangingFlipY);
        this._flipObjects(isChangingFlipX, isChangingFlipY);

        return Promise.resolve({
            setting,
            angle: this.getCanvasImage().angle
        });
    }

    /**
     * Invert image angle for flip
     * @param {boolean} isChangingFlipX - Change flipX
     * @param {boolean} isChangingFlipY - Change flipY
     */
    _invertAngle(isChangingFlipX, isChangingFlipY) {
        const canvasImage = this.getCanvasImage();
        let angle = canvasImage.angle;

        if (isChangingFlipX) {
            angle *= -1;
        }
        if (isChangingFlipY) {
            angle *= -1;
        }
        canvasImage.setAngle(parseFloat(angle)).setCoords();// parseFloat for -0 to 0
    }

    /**
     * Flip objects
     * @param {boolean} isChangingFlipX - Change flipX
     * @param {boolean} isChangingFlipY - Change flipY
     * @private
     */
    _flipObjects(isChangingFlipX, isChangingFlipY) {
        const canvas = this.getCanvas();

        if (isChangingFlipX) {
            canvas.forEachObject(obj => {
                obj.set({
                    angle: parseFloat(obj.angle * -1), // parseFloat for -0 to 0
                    flipX: !obj.flipX,
                    left: canvas.width - obj.left
                }).setCoords();
            });
        }
        if (isChangingFlipY) {
            canvas.forEachObject(obj => {
                obj.set({
                    angle: parseFloat(obj.angle * -1), // parseFloat for -0 to 0
                    flipY: !obj.flipY,
                    top: canvas.height - obj.top
                }).setCoords();
            });
        }
        canvas.renderAll();
    }

    /**
     * Reset flip settings
     * @returns {jQuery.Deferred}
     */
    reset() {
        return this.set({
            flipX: false,
            flipY: false
        });
    }

    /**
     * Flip x
     * @returns {jQuery.Deferred}
     */
    flipX() {
        const current = this.getCurrentSetting();

        return this.set({
            flipX: !current.flipX,
            flipY: current.flipY
        });
    }

    /**
     * Flip y
     * @returns {jQuery.Deferred}
     */
    flipY() {
        const current = this.getCurrentSetting();

        return this.set({
            flipX: current.flipX,
            flipY: !current.flipY
        });
    }
}

module.exports = Flip;
