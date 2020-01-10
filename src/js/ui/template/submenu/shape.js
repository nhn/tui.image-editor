/**
 * @param {Locale} locale - Translate text
 * @param {Object} normal - iconStyle
 * @param {Object} active - iconStyle
 * @returns {string}
 */
export default ({locale, iconStyle: {normal, active}}) => (`
    <ul class="tui-image-editor-submenu-item">
        <li class="tie-shape-button">
            <div class="tui-image-editor-button rect">
                <div>
                    <svg class="svg_ic-submenu">
                        <use xlink:href="${normal.path}#${normal.name}-ic-shape-rectangle"
                            class="normal"/>
                        <use xlink:href="${active.path}#${active.name}-ic-shape-rectangle"
                            class="active"/>
                    </svg>
                </div>
                <label> ${locale.localize('Rectangle')} </label>
            </div>
            <div class="tui-image-editor-button circle">
                <div>
                    <svg class="svg_ic-submenu">
                        <use xlink:href="${normal.path}#${normal.name}-ic-shape-circle"
                            class="normal"/>
                        <use xlink:href="${active.path}#${active.name}-ic-shape-circle"
                            class="active"/>
                    </svg>
                </div>
                <label> ${locale.localize('Circle')} </label>
            </div>
            <div class="tui-image-editor-button triangle">
                <div>
                    <svg class="svg_ic-submenu">
                        <use xlink:href="${normal.path}#${normal.name}-ic-shape-triangle"
                            class="normal"/>
                        <use xlink:href="${active.path}#${active.name}-ic-shape-triangle"
                            class="active"/>
                    </svg>
                </div>
                <label> ${locale.localize('Triangle')} </label>
            </div>
        </li>
        <li class="tui-image-editor-partition">
            <div></div>
        </li>
        <li class="tie-shape-color-button">
            <div class="tie-color-fill" title="${locale.localize('Fill')}"></div>
            <div class="tie-color-stroke" title="${locale.localize('Stroke')}"></div>
        </li>
        <li class="tui-image-editor-partition only-left-right">
            <div></div>
        </li>
        <li class="tui-image-editor-newline tui-image-editor-range-wrap">
            <label class="range">${locale.localize('Stroke')}</label>
            <div class="tie-stroke-range"></div>
            <input class="tie-stroke-range-value tui-image-editor-range-value" value="0" />
        </li>
    </ul>
`);
