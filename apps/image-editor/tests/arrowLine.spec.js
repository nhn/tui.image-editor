/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhn.com>
 * @fileoverview Test cases of "src/js/extension/allowLine.js"
 */
import ArrowLine from '../src/js/extension/arrowLine';

describe('AllowLine', () => {
  let ctx, arrowLine, linePath;

  beforeEach(() => {
    ctx = {
      lineWidth: 1,
      beginPath: jasmine.createSpy('beginPath'),
      moveTo: jasmine.createSpy('moveTo'),
      lineTo: jasmine.createSpy('lineTo'),
      closePath: jasmine.createSpy('closePath'),
    };
    arrowLine = new ArrowLine();
    arrowLine.ctx = ctx;
    linePath = {
      fromX: 1,
      fromY: 1,
      toX: 10,
      toY: 10,
    };
  });

  it('When attaching the "chevron" type to the endpoint, you need to draw the "v" calculated according to the angle around the "tail" of the line.', () => {
    arrowLine.arrowType = {
      tail: 'chevron',
    };
    arrowLine._drawDecoratorPath(linePath);

    const firstPoint = ctx.moveTo.calls.argsFor(0).map((value) => Math.round(value));
    const secondPoint = ctx.lineTo.calls.argsFor(0).map((value) => Math.round(value));
    const lastPoint = ctx.lineTo.calls.argsFor(1).map((value) => Math.round(value));

    expect(firstPoint).toEqual([9, 7]);
    expect(secondPoint).toEqual([10, 10]);
    expect(lastPoint).toEqual([7, 9]);
  });

  it('When attaching the "chevron" type to the startpoint, you need to draw the "v" calculated according to the angle around the "head" of the line.', () => {
    arrowLine.arrowType = {
      head: 'chevron',
    };
    arrowLine._drawDecoratorPath(linePath);

    const firstPoint = ctx.moveTo.calls.argsFor(0).map((value) => Math.round(value));
    const secondPoint = ctx.lineTo.calls.argsFor(0).map((value) => Math.round(value));
    const lastPoint = ctx.lineTo.calls.argsFor(1).map((value) => Math.round(value));

    expect(firstPoint).toEqual([2, 4]);
    expect(secondPoint).toEqual([1, 1]);
    expect(lastPoint).toEqual([4, 2]);
  });

  it('"triangle" should be a triangular shape that closes the path with closePath after drawing.', () => {
    arrowLine.arrowType = {
      head: 'triangle',
    };
    arrowLine._drawDecoratorPath(linePath);

    const firstPoint = ctx.moveTo.calls.argsFor(0).map((value) => Math.round(value));
    const secondPoint = ctx.lineTo.calls.argsFor(0).map((value) => Math.round(value));
    const thirdPoint = ctx.lineTo.calls.argsFor(1).map((value) => Math.round(value));

    expect(firstPoint).toEqual([1, 3]);
    expect(secondPoint).toEqual([1, 1]);
    expect(thirdPoint).toEqual([3, 1]);
    expect(ctx.closePath.calls.count()).toBe(1);
  });
});
