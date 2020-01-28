import Range from '../src/js/ui/tools/range';
import {defaultRotateRangeValus} from '../src/js/consts';

describe('Range', () => {
    let range, input, slider;
    beforeEach(() => {
        input = document.createElement('input');
        slider = document.createElement('div');
        range = new Range({
            slider,
            input
        }, defaultRotateRangeValus);
    });

    it('The value must be incremented by 1, when keyCode 38 is found in the event handler with changeInputWithArrow.', () => {
        const ev = {
            target: input,
            keyCode: 38
        };
        input.value = '3';
        range.eventHandler.changeInputWithArrow(ev);

        expect(range.value).toBe(4);
    });
    it('The value must be decremented by 1, when keyCode 40 is found in the event handler with changeInputWithArrow.', () => {
        const ev = {
            target: input,
            keyCode: 40
        };
        input.value = '3';
        range.eventHandler.changeInputWithArrow(ev);

        expect(range.value).toBe(2);
    });

    it('The `changeInput` event handler should filter out any invalid input values.', () => {
        const ev = {
            target: input,
            keyCode: 83
        };
        input.value = '-3!!6s0s';

        range.eventHandler.changeInput(ev);
        expect(range.value).toBe(-360);
    });
});
