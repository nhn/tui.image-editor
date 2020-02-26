/**
 * @param {Locale} locale - Translate text
 * @param {Object} normal - iconStyle
 * @param {Object} active - iconStyle
 * @returns {string}
 */
export default ({locale, svgIconMaker}) => (`
    <ul class="tui-image-editor-submenu-item">
        <li>
            <div class="tui-image-editor-button">
                <div>
                    <input type="file" accept="image/*" class="tie-mask-image-file">
                    ${svgIconMaker(['normal', 'active'], 'mask-load', true)}
                </div>
                <label> ${locale.localize('Load Mask Image')} </label>
            </div>
        </li>
        <li class="tui-image-editor-partition only-left-right">
            <div></div>
        </li>
        <li class="tie-mask-apply tui-image-editor-newline apply" style="margin-top: 22px;margin-bottom: 5px">
            <div class="tui-image-editor-button apply">
                ${svgIconMaker(['normal', 'active'], 'apply')}
                <label>
                    ${locale.localize('Apply')}
                </label>
            </div>
        </li>
    </ul>
`);
