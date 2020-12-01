/**
 * @author NHN. FE Development Team <dl_javascript@nhn.com>
 * @fileoverview Selection modify helper
 */

/**
 * Cached selection's info
 * @type {Array}
 * @private
 */
let cachedUndoDataForChangeDimension = null;

/**
 * Set cached undo data
 * @param {Object} graphics - graphic object
 * @param {fabric.Object} obj - selection object
 * @private
 */
export function setCachedUndoDataForChangeDimension(graphics, obj) {
    if (obj) {
        cachedUndoDataForChangeDimension = makeUndoData(graphics, obj);
    }
}

/**
 * Get cached undo data
 * @returns {Object} cached undo data
 * @private
 */
export function getCachedUndoDataForChangeDimension() {
    return cachedUndoDataForChangeDimension;
}

/**
 * Make undo data
 * @param {Object} graphics - graphic object
 * @param {fabric.Object} obj - selection object
 * @returns {Array} undoData
 * @private
 */
export function makeUndoData(graphics, obj) {
    let undoData;

    if (obj.type === 'activeSelection') {
        undoData = obj.getObjects().map(item => {
            const {angle, left, top} = item;

            obj.realizeTransform(item);
            const result = makeUndoDatum(graphics, item);

            item.set({
                angle,
                left,
                top
            });

            return result;
        });
    } else {
        undoData = [makeUndoDatum(graphics, obj)];
    }

    return undoData;
}

/**
 * Make undo datum
 * @param {Object} graphics - graphic object
 * @param {fabric.Object} obj - selection object
 * @returns {Object} undo datum
 * @private
 */
export function makeUndoDatum(graphics, obj) {
    return {
        id: graphics.getObjectId(obj),
        width: obj.width,
        height: obj.height,
        top: obj.top,
        left: obj.left,
        angle: obj.angle,
        scaleX: obj.scaleX,
        scaleY: obj.scaleY
    };
}
