/**
 * @param {Locale} locale - Translate text
 * @param {Object} normal - iconStyle
 * @param {Object} active - iconStyle
 * @returns {string}
 */
export default ({locale, iconStyle: {normal, active}}) => (`
    <ul class="tui-image-editor-submenu-item">
        <li class="tie-draw-line-select-button">
            <div class="tui-image-editor-button free">
                <div>
                    <svg class="svg_ic-submenu">
                        <use xlink:href="${normal.path}#${normal.name}-ic-draw-free" class="normal"/>
                        <use xlink:href="${active.path}#${active.name}-ic-draw-free" class="active"/>
                    </svg>
                </div>
                <label>
                    ${locale.localize('Free')}
                </label>
            </div>
            <div class="tui-image-editor-button line">
                <div>
                    <svg class="svg_ic-submenu">
                        <use xlink:href="${normal.path}#${normal.name}-ic-draw-line" class="normal"/>
                        <use xlink:href="${active.path}#${active.name}-ic-draw-line" class="active"/>
                    </svg>
                </div>
                <label>
                    ${locale.localize('Straight')}
                </label>
            </div>
        </li>
        <li class="tui-image-editor-partition">
            <div></div>
        </li>
        <li>
            <div class="tie-draw-color" title="${locale.localize('Color')}"></div>
        </li>
        <li class="tui-image-editor-partition only-left-right">
            <div></div>
        </li>
        <li class="tui-image-editor-newline tui-image-editor-range-wrap">
            <label class="range">${locale.localize('Range')}</label>
            <div class="tie-draw-range"></div>
            <input class="tie-draw-range-value tui-image-editor-range-value" value="0" />
        </li>
    </ul>
`);
