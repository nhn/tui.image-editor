/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhn.com>
 * @fileoverview Test cases of "src/js/extension/allowLine.js"
 */
import ArrowLine from '../src/js/extension/arrowLine';

describe('AllowLine', () => {
    let ctx;

    beforeEach(() => {
        ctx = {
            lineWidth: 1,
            beginPath: jasmine.createSpy('beginPath'),
            moveTo: jasmine.createSpy('moveTo'),
            lineTo: jasmine.createSpy('lineTo')
        };
    });

    /*
    it('"_render" needs to move and draw the start and end points according to the canvas api.', () => {
        const arrowLine = new ArrowLine([0, 0, 10, 20]);

        arrowLine._render(ctx);

        expect(ctx.moveTo.calls.first().args).toEqual([-5, -10]);
        expect(ctx.lineTo.calls.first().args).toEqual([5, 10]);
    });
    */

    it('"renderHead" should draw the "v" calculated according to the angle around the end of the line.', () => {
        const arrowLine = new ArrowLine();
        const [fromX, fromY, toX, toY] = [0, 0, 10, 10];
        arrowLine.headType = 'chevron';

        arrowLine._setDecoratorPath({
            fromX,
            fromY,
            toX,
            toY
        });

        const firstPoint = ctx.moveTo.calls.argsFor(0).map(value => Math.round(value));
        const secondPoint = ctx.lineTo.calls.argsFor(0).map(value => Math.round(value));
        const lastPoint = ctx.lineTo.calls.argsFor(1).map(value => Math.round(value));

        expect(firstPoint).toEqual([9, 7]);
        expect(secondPoint).toEqual([10, 10]);
        expect(lastPoint).toEqual([7, 9]);
    });
});
