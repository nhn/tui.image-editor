/**
 * @param {Object} submenuInfo - submenu info for mosaic template
 *   @param {Locale} locale - Translate text
 * @returns {string}
 */
export default ({ locale }) => `
    <ul class="tui-image-editor-submenu-item">
        <li class="tui-image-editor-newline tui-image-editor-range-wrap">
            <label class="range">${locale.localize('Range')}</label>
            <div class="tie-mosaic-range"></div>
            <input class="tie-mosaic-range-value tui-image-editor-range-value" value="0" />
        </li>
    </ul>
`;
