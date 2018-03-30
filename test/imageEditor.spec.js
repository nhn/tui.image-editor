/**
 * @fileoverview Test env
 * @author NHN Ent. FE Development Lab <dl_javascript@nhnent.com>
 */

import snippet from 'tui-code-snippet';
import ImageEditor from '../src/js/imageEditor';

describe('ImageEditor', () => {
    describe('constructor', () => {
        let imageEditor;

        afterEach(() => {
            imageEditor.destroy();
        });

        it('should send hostname by default', () => {
            const el = document.createElement('div');
            spyOn(snippet, 'imagePing');

            imageEditor = new ImageEditor(el);

            expect(snippet.imagePing).toHaveBeenCalled();
        });

        it('should not send hostname on usageStatistics option false', () => {
            const el = document.createElement('div');
            spyOn(snippet, 'imagePing');

            imageEditor = new ImageEditor(el, {
                usageStatistics: false
            });

            expect(snippet.imagePing).not.toHaveBeenCalled();
        });
    });
});
