/**
 * @param {Locale} locale - Translate text
 * @param {Object} normal - iconStyle
 * @param {Object} active - iconStyle
 * @returns {string}
 */
export default ({locale, iconStyle: {normal, active}}) => (`
    <ul class="tui-image-editor-submenu-item">
        <li class="tie-icon-add-button">
            <div class="tui-image-editor-button" data-icontype="icon-arrow">
                <div>
                    <svg class="svg_ic-submenu">
                        <use xlink:href="#ic-icon-arrow" class="normal normal-color"/>
                        <use xlink:href="#ic-icon-arrow" class="active active-color"/>
                    </svg>
                </div>
                <label>
                    ${locale.localize('Arrow')}
                </label>
            </div>
            <div class="tui-image-editor-button" data-icontype="icon-arrow-2">
                <div>
                    <svg class="svg_ic-submenu">
                        <use xlink:href="#ic-icon-arrow-2" class="normal normal-color"/>
                        <use xlink:href="#ic-icon-arrow-2" class="active active-color"/>
                    </svg>
                </div>
                <label>
                    ${locale.localize('Arrow-2')}
                </label>
            </div>
            <div class="tui-image-editor-button" data-icontype="icon-arrow-3">
                <div>
                    <svg class="svg_ic-submenu">
                        <use xlink:href="#ic-icon-arrow-3" class="normal normal-color"/>
                        <use xlink:href="#ic-icon-arrow-3" class="active active-color"/>
                    </svg>
                </div>
                <label>
                    ${locale.localize('Arrow-3')}
                </label>
            </div>
            <div class="tui-image-editor-button" data-icontype="icon-star">
                <div>
                    <svg class="svg_ic-submenu">
                        <use xlink:href="#ic-icon-star" class="normal normal-color"/>
                        <use xlink:href="#ic-icon-star" class="active active-color"/>
                    </svg>
                </div>
                <label>
                    ${locale.localize('Star-1')}
                </label>
            </div>
            <div class="tui-image-editor-button" data-icontype="icon-star-2">
                <div>
                    <svg class="svg_ic-submenu">
                        <use xlink:href="#ic-icon-star-2" class="normal normal-color"/>
                        <use xlink:href="#ic-icon-star-2" class="active active-color"/>
                    </svg>
                </div>
                <label>
                    ${locale.localize('Star-2')}
                </label>
            </div>

            <div class="tui-image-editor-button" data-icontype="icon-polygon">
                <div>
                    <svg class="svg_ic-submenu">
                        <use xlink:href="#ic-icon-polygon" class="normal normal-color"/>
                        <use xlink:href="#ic-icon-polygon" class="active active-color"/>
                    </svg>
                </div>
                <label>
                    ${locale.localize('Polygon')}
                </label>
            </div>

            <div class="tui-image-editor-button" data-icontype="icon-location">
                <div>
                    <svg class="svg_ic-submenu">
                        <use xlink:href="#ic-icon-location" class="normal normal-color"/>
                        <use xlink:href="#ic-icon-location" class="active active-color"/>
                    </svg>
                </div>
                <label>
                    ${locale.localize('Location')}
                </label>
            </div>

            <div class="tui-image-editor-button" data-icontype="icon-heart">
                <div>
                    <svg class="svg_ic-submenu">
                        <use xlink:href="#ic-icon-heart" class="normal normal-color"/>
                        <use xlink:href="#ic-icon-heart" class="active active-color"/>
                    </svg>
                </div>
                <label>
                    ${locale.localize('Heart')}
                </label>
            </div>

            <div class="tui-image-editor-button" data-icontype="icon-bubble">
                <div>
                    <svg class="svg_ic-submenu">
                        <use xlink:href="#ic-icon-bubble" class="normal normal-color"/>
                        <use xlink:href="#ic-icon-bubble" class="active active-color"/>
                    </svg>
                </div>
                <label>
                    ${locale.localize('Bubble')}
                </label>
            </div>
        </li>
        <li class="tui-image-editor-partition">
            <div></div>
        </li>
        <li class="tie-icon-add-button">
            <div class="tui-image-editor-button" style="margin:0">
                <div>
                    <input type="file" accept="image/*" class="tie-icon-image-file">
                    <svg class="svg_ic-submenu">
                        <use xlink:href="#ic-icon-load" class="normal normal-color"/>
                        <use xlink:href="#ic-icon-load" class="active active-color"/>
                    </svg>
                </div>
                <label>
                    ${locale.localize('Custom icon')}
                </label>
            </div>
        </li>
        <li class="tui-image-editor-partition">
            <div></div>
        </li>
        <li>
            <div class="tie-icon-color" title="${locale.localize('Color')}"></div>
        </li>
    </ul>
`);
