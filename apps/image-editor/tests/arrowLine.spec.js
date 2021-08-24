import ArrowLine from '@/extension/arrowLine';

describe('ArrowLine', () => {
  const transformFn = (value) => Math.round(value);
  let ctx, arrowLine, linePath;

  beforeEach(() => {
    ctx = {
      lineWidth: 1,
      beginPath: jest.fn(),
      moveTo: jest.fn(),
      lineTo: jest.fn(),
      closePath: jest.fn(),
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

  it('should draw the "v" calculated according to the angle around the "tail" of the line when attaching the "chevron" type to the end point', () => {
    arrowLine.arrowType = { tail: 'chevron' };
    arrowLine._drawDecoratorPath(linePath);

    const firstPoint = ctx.moveTo.mock.calls[0].map(transformFn);
    const secondPoint = ctx.lineTo.mock.calls[0].map(transformFn);
    const lastPoint = ctx.lineTo.mock.calls[1].map(transformFn);

    expect(firstPoint).toEqual([9, 7]);
    expect(secondPoint).toEqual([10, 10]);
    expect(lastPoint).toEqual([7, 9]);
  });

  it('should draw the "v" calculated according to the angle around the "head" of the line when attaching the "chevron" type to the start point', () => {
    arrowLine.arrowType = { head: 'chevron' };
    arrowLine._drawDecoratorPath(linePath);

    const firstPoint = ctx.moveTo.mock.calls[0].map(transformFn);
    const secondPoint = ctx.lineTo.mock.calls[0].map(transformFn);
    const lastPoint = ctx.lineTo.mock.calls[1].map(transformFn);

    expect(firstPoint).toEqual([2, 4]);
    expect(secondPoint).toEqual([1, 1]);
    expect(lastPoint).toEqual([4, 2]);
  });

  it('should be a triangular shape that closes the path with closePath after drawing', () => {
    arrowLine.arrowType = { head: 'triangle' };
    arrowLine._drawDecoratorPath(linePath);

    const firstPoint = ctx.moveTo.mock.calls[0].map(transformFn);
    const secondPoint = ctx.lineTo.mock.calls[0].map(transformFn);
    const lastPoint = ctx.lineTo.mock.calls[1].map(transformFn);

    expect(firstPoint).toEqual([1, 3]);
    expect(secondPoint).toEqual([1, 1]);
    expect(lastPoint).toEqual([3, 1]);
    expect(ctx.closePath).toBeCalledTimes(1);
  });
});
