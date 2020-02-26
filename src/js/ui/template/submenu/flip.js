/**
 * @param {Locale} locale - Translate text
 * @param {Object} normal - iconStyle
 * @param {Object} active - iconStyle
 * @returns {string}
 */
export default ({locale, svgIconMaker}) => (`
    <ul class="tie-flip-button tui-image-editor-submenu-item">
        <li>
            <div class="tui-image-editor-button flipX">
                <div>
                    ${svgIconMaker(['normal', 'active'], 'flip-x', true)}
                </div>
                <label>
                    ${locale.localize('Flip X')}
                </label>
            </div>
            <div class="tui-image-editor-button flipY">
                <div>
                    ${svgIconMaker(['normal', 'active'], 'flip-y', true)}
                </div>
                <label>
                    ${locale.localize('Flip Y')}
                </label>
            </div>
        </li>
        <li class="tui-image-editor-partition">
            <div></div>
        </li>
        <li>
            <div class="tui-image-editor-button resetFlip">
                <div>
                    ${svgIconMaker(['normal', 'active'], 'flip-reset', true)}
                </div>
                <label>
                    ${locale.localize('Reset')}
                </label>
            </div>
        </li>
    </ul>
`);
