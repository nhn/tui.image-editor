/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhn.com>
 * @fileoverview Blur extending fabric.Image.filters.Convolute
 */
import fabric from 'fabric';

const ArrowLine = fabric.util.createClass(fabric.Line, fabric.Observable, /** @lends Convolute.prototype */{

    /**
     * Line type
     * @param {String} type
     * @default
     */
    type: 'ArrowLine',

    initialize(ctx, t) {
        this.callSuper('initialize', ctx, t);
    },

    renderHead({ctx, fromX, fromY, toX, toY}) {
        const headlen = 30;
        const theta = 30;
        const angle = Math.atan2(fromY - toY, fromX - toX) * 180 / Math.PI;
        const angle1 = (angle + theta) * Math.PI / 180;
        const angle2 = (angle - theta) * Math.PI / 180;
        const topX = headlen * Math.cos(angle1);
        const topY = headlen * Math.sin(angle1);
        const botX = headlen * Math.cos(angle2);
        const botY = headlen * Math.sin(angle2);

        let arrowX = toX + topX;
        let arrowY = toY + topY;

        ctx.moveTo(arrowX, arrowY);
        ctx.lineTo(toX, toY);

        arrowX = toX + botX;
        arrowY = toY + botY;
        ctx.fillStyle = this.stroke;

        // ctx.lineCap = "butt" || "round" || "square";
        ctx.lineTo(arrowX, arrowY);
        ctx.lineCap = 'round';
        ctx.fill();
    },

    /**
     * Render ArrowLine
     * @private
     * @override
     */
    _render(ctx) {
        const r = this.calcLinePoints();
        const fromX = r.x1;
        const fromY = r.y1;
        const toX = r.x2;
        const toY = r.y2;
        const s = ctx.strokeStyle;

        const angle = Math.atan2(fromY - toY, fromX - toX) * 180 / Math.PI;
        console.log(angle);
        // const x2 = toX - (200 * Math.cos(angle));
        // const y2 = toY - (200 * Math.sin(angle));

        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        // ctx.lineTo(x2, y2);
        ctx.lineTo(toX, toY);

        ctx.lineWidth = this.strokeWidth;
        ctx.strokeStyle = this.stroke || ctx.fillStyle;
        if (this.stroke) {
            this._renderStroke(ctx);
        }
        ctx.strokeStyle = s;

        this.renderHead({
            ctx,
            fromX,
            fromY,
            toX,
            toY
        });

    }
});

export default ArrowLine;
