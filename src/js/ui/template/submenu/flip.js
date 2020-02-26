/**
 * @param {Locale} locale - Translate text
 * @param {Object} normal - iconStyle
 * @param {Object} active - iconStyle
 * @returns {string}
 */
export default ({locale, iconStyle: {normal, active}}) => (`
    <ul class="tie-flip-button tui-image-editor-submenu-item">
        <li>
            <div class="tui-image-editor-button flipX">
                <div>
                    <svg class="svg_ic-submenu">
                        <use xlink:href="#ic-flip-x" class="normal normal-color"/>
                        <use xlink:href="#ic-flip-x" class="active active-color"/>
                    </svg>
                </div>
                <label>
                    ${locale.localize('Flip X')}
                </label>
            </div>
            <div class="tui-image-editor-button flipY">
                <div>
                    <svg class="svg_ic-submenu">
                        <use xlink:href="#ic-flip-y" class="normal normal-color"/>
                        <use xlink:href="#ic-flip-y" class="active active-color"/>
                    </svg>
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
                    <svg class="svg_ic-submenu">
                        <use xlink:href="#ic-flip-reset" class="normal normal-color"/>
                        <use xlink:href="#ic-flip-reset" class="active active-color"/>
                    </svg>
                </div>
                <label>
                    ${locale.localize('Reset')}
                </label>
            </div>
        </li>
    </ul>
`);
