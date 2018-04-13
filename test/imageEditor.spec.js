/**
 * @fileoverview Test env
 * @author NHN Ent. FE Development Lab <dl_javascript@nhnent.com>
 */

import snippet from 'tui-code-snippet';
import ImageEditor from '../src/js/imageEditor';

describe('ImageEditor', () => {
    // hostnameSent module scope variable can not be reset.
    // maintain cases with xit as it always fail, if you want to test these cases, change xit to fit one by one
    describe('constructor', () => {
        let imageEditor, el;

        beforeEach(() => {
            el = document.createElement('div');
            spyOn(snippet, 'imagePing');
        });

        afterEach(() => {
            imageEditor.destroy();
        });

        xit('should send hostname by default', () => {
            imageEditor = new ImageEditor(el);

            expect(snippet.imagePing).toHaveBeenCalled();
        });

        xit('should not send hostname on usageStatistics option false', () => {
            imageEditor = new ImageEditor(el, {
                usageStatistics: false
            });

            expect(snippet.imagePing).not.toHaveBeenCalled();
        });
    });
});
