/**
 * @param {Object} submenuInfo - submenu info for make template
 *   @param {Locale} locale - Translate text
 *   @param {Function} makeSvgIcon - svg icon generator
 * @returns {string}
 */
export default ({locale, makeSvgIcon}) => (`
    <ul class="tui-image-editor-submenu-item">
        <li class="tie-filtersection-button">
            <div class="tui-image-editor-button filtersection rect-filtersection">
                <div>
                    ${makeSvgIcon(['normal', 'active'], 'shape-rectangle', true)}
                </div>
                <label> ${locale.localize('Rectangle')} </label>
            </div>
        </li>
        <li class="tui-image-editor-partition">
            <div></div>
        </li>
        <li class="tie-filtersection-color-button">
            <!--
            <div class="tie-color-fill-filtersection" title="${locale.localize('Fill')}"></div>
            -->
            <div class="tie-color-stroke-filtersection" title="${locale.localize('Stroke')}"></div>
        </li>
        <li class="tui-image-editor-partition only-left-right">
            <div></div>
        </li>
        <li class="tui-image-editor-newline tui-image-editor-range-wrap">
            <label class="range">${locale.localize('Radius')}</label>
            <div class="tie-radius-range-filtersection"></div>
            <input class="tie-radius-range-value-filtersection tui-image-editor-range-value" value="0" />
        </li>
        <li class="tui-image-editor-newline tui-image-editor-range-wrap">
            <label class="range">${locale.localize('Pixelate')}</label>
            <div class="tie-pixelate-range-filtersection"></div>
            <input class="tie-pixelate-range-value-filtersection tui-image-editor-range-value" value="0" />
        </li>
        <li class="tie-filtersection-button action">
            <div class="tui-image-editor-button apply">
                ${makeSvgIcon(['normal', 'active'], 'apply')}
                <label>
                    ${locale.localize('Apply')}
                </label>
            </div>
        </li>
    </ul>
`);
