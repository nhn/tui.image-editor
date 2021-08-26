import ArrowLine from '@/extension/arrowLine';

describe('ArrowLine', () => {
  let ctx, arrowLine, linePath;
  function assertPointsToMatchSnapshots() {
    const [firstPoint] = ctx.moveTo.mock.calls;
    const [secondPoint] = ctx.lineTo.mock.calls;
    const [, lastPoint] = ctx.lineTo.mock.calls;

    expect(firstPoint).toMatchSnapshot();
    expect(secondPoint).toMatchSnapshot();
    expect(lastPoint).toMatchSnapshot();
  }

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

    assertPointsToMatchSnapshots();
  });

  it('should draw the "v" calculated according to the angle around the "head" of the line when attaching the "chevron" type to the start point', () => {
    arrowLine.arrowType = { head: 'chevron' };
    arrowLine._drawDecoratorPath(linePath);

    assertPointsToMatchSnapshots();
  });

  it('should be a triangular shape that closes the path with closePath after drawing', () => {
    arrowLine.arrowType = { head: 'triangle' };
    arrowLine._drawDecoratorPath(linePath);

    assertPointsToMatchSnapshots();
    expect(ctx.closePath).toBeCalledTimes(1);
  });
});
