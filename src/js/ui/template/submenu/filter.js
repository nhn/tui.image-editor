/**
 * @param {Locale} locale - Translate text
 * @returns {string}
 */
export default ({locale}) => (`
    <ul class="tui-image-editor-submenu-item">
        <li class="tui-image-editor-submenu-align">
            <div class="tui-image-editor-checkbox-wrap fixed-width">
                <div class="tui-image-editor-checkbox">
                    <input type="checkbox" id="tie-grayscale">
                    <label for="tie-grayscale">${locale.localize('Grayscale')}</label>
                </div>
                <div class="tui-image-editor-checkbox">
                    <input type="checkbox" id="tie-invert">
                    <label for="tie-invert">${locale.localize('Invert')}</label>
                </div>
                <div class="tui-image-editor-checkbox">
                    <input type="checkbox" id="tie-sepia">
                    <label for="tie-sepia">${locale.localize('Sepia')}</label>
                </div>
                <div class="tui-image-editor-checkbox">
                    <input type="checkbox" id="tie-sepia2">
                    <label for="tie-sepia2">${locale.localize('Sepia2')}</label>
                </div>
                <div class="tui-image-editor-checkbox">
                    <input type="checkbox" id="tie-blur">
                    <label for="tie-blur">${locale.localize('Blur')}</label>
                </div>
                <div class="tui-image-editor-checkbox">
                    <input type="checkbox" id="tie-sharpen">
                    <label for="tie-sharpen">${locale.localize('Sharpen')}</label>
                </div>
                <div class="tui-image-editor-checkbox">
                    <input type="checkbox" id="tie-emboss">
                    <label for="tie-emboss">${locale.localize('Emboss')}</label>
                </div>
            </div>
        </li>
        <li class="tui-image-editor-partition">
            <div></div>
        </li>
        <li class="tui-image-editor-submenu-align">
            <div class="tui-image-editor-checkbox-group tui-image-editor-disabled" style="margin-bottom: 7px;">
                <div class="tui-image-editor-checkbox-wrap">
                    <div class="tui-image-editor-checkbox">
                        <input type="checkbox" id="tie-remove-white">
                        <label for="tie-remove-white">${locale.localize('Remove White')}</label>
                    </div>
                </div>
                <div class="tui-image-editor-newline tui-image-editor-range-wrap short">
                    <label>${locale.localize('Distance')}</label>
                    <div id="tie-removewhite-distance-range"></div>
                </div>
            </div>
            <div class="tui-image-editor-checkbox-group tui-image-editor-disabled">
                <div class="tui-image-editor-checkbox">
                    <input type="checkbox" id="tie-brightness">
                    <label for="tie-brightness">${locale.localize('Brightness')}</label>
                </div>
                <div class="tui-image-editor-range-wrap short">
                    <div id="tie-brightness-range"></div>
                </div>
            </div>
            <div class="tui-image-editor-checkbox-group tui-image-editor-disabled">
                <div class="tui-image-editor-checkbox">
                    <input type="checkbox" id="tie-noise">
                    <label for="tie-noise">${locale.localize('Noise')}</label>
                </div>
                <div class="tui-image-editor-range-wrap short">
                    <div id="tie-noise-range"></div>
                </div>
            </div>
        </li>
        <li class="tui-image-editor-partition only-left-right">
            <div></div>
        </li>
        <li class="tui-image-editor-submenu-align">
            <div class="tui-image-editor-checkbox-group tui-image-editor-disabled">
                <div class="tui-image-editor-checkbox">
                    <input type="checkbox" id="tie-pixelate">
                    <label for="tie-pixelate">${locale.localize('Pixelate')}</label>
                </div>
                <div class="tui-image-editor-range-wrap short">
                    <div id="tie-pixelate-range"></div>
                </div>
            </div>
            <div class="tui-image-editor-checkbox-group tui-image-editor-disabled">
                <div class="tui-image-editor-newline tui-image-editor-checkbox-wrap">
                    <div class="tui-image-editor-checkbox">
                        <input type="checkbox" id="tie-color-filter">
                        <label for="tie-color-filter">${locale.localize('Color Filter')}</label>
                    </div>
                </div>
                <div class="tui-image-editor-newline tui-image-editor-range-wrap short">
                    <label>${locale.localize('Threshold')}</label>
                    <div id="tie-colorfilter-threshole-range"></div>
                </div>
            </div>
        </li>
        <li class="tui-image-editor-partition">
            <div></div>
        </li>
        <li>
            <div class="filter-color-item">
                <div id="tie-filter-tint-color" title="${locale.localize('Tint')}"></div>
                <div class="tui-image-editor-checkbox">
                    <input type="checkbox" id="tie-tint">
                    <label for="tie-tint"></label>
                </div>
            </div>
            <div class="filter-color-item">
                <div id="tie-filter-multiply-color" title="${locale.localize('Multiply')}"></div>
                <div class="tui-image-editor-checkbox">
                    <input type="checkbox" id="tie-multiply">
                    <label for="tie-multiply"></label>
                </div>
            </div>
            <div class="filter-color-item">
                <div id="tie-filter-blend-color" title="${locale.localize('Blend')}"></div>
                <div class="tui-image-editor-checkbox">
                    <input type="checkbox" id="tie-blend">
                    <label for="tie-blend"></label>
                </div>
            </div>
        </li>
    </ul>
`);
