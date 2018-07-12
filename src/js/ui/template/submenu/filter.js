export default () => (`
    <ul class="tui-image-editor-submenu-item">
        <li class="tui-image-editor-submenu-align">
            <div class="tui-image-editor-checkbox-wrap fixed-width">
                <div class="tui-image-editor-checkbox">
                    <input type="checkbox" id="tie-grayscale">
                    <label for="tie-grayscale">Grayscale</label>
                </div>
                <div class="tui-image-editor-checkbox">
                    <input type="checkbox" id="tie-invert">
                    <label for="tie-invert">Invert</label>
                </div>
                <div class="tui-image-editor-checkbox">
                    <input type="checkbox" id="tie-sepia">
                    <label for="tie-sepia">Sepia</label>
                </div>
                <div class="tui-image-editor-checkbox">
                    <input type="checkbox" id="tie-sepia2">
                    <label for="tie-sepia2">Sepia2</label>
                </div>
                <div class="tui-image-editor-checkbox">
                    <input type="checkbox" id="tie-blur">
                    <label for="tie-blur">Blur</label>
                </div>
                <div class="tui-image-editor-checkbox">
                    <input type="checkbox" id="tie-sharpen">
                    <label for="tie-sharpen">Sharpen</label>
                </div>
                <div class="tui-image-editor-checkbox">
                    <input type="checkbox" id="tie-emboss">
                    <label for="tie-emboss">Emboss</label>
                </div>
            </div>
        </li>
        <li class="tui-image-editor-partition">
            <div></div>
        </li>
        <li class="tui-image-editor-submenu-align">
            <div>
                <div class="tui-image-editor-checkbox-wrap">
                    <div class="tui-image-editor-checkbox">
                        <input type="checkbox" id="tie-remove-white">
                        <label for="tie-remove-white">Remove White</label>
                    </div>
                </div>
                <div class="tui-image-editor-newline tui-image-editor-range-wrap short">
                    <label>Threshold</label>
                    <div id="tie-removewhite-threshold-range"></div>
                </div>
                <div class="tui-image-editor-newline tui-image-editor-range-wrap short">
                    <label>Distance</label>
                    <div id="tie-removewhite-distance-range"></div>
                </div>
            </div>
            <div>
                <div class="tui-image-editor-newline tui-image-editor-checkbox-wrap">
                    <div class="tui-image-editor-checkbox">
                        <input type="checkbox" id="tie-gradient-transparency">
                        <label for="tie-gradient-transparency">Grayscale</label>
                    </div>
                </div>
                <div class="tui-image-editor-newline tui-image-editor-range-wrap short">
                    <label>Value</label>
                    <div id="tie-gradient-transparency-range"></div>
                </div>
            </div>
        </li>
        <li class="tui-image-editor-partition only-left-right">
            <div></div>
        </li>
        <li class="tui-image-editor-submenu-align">
            <div>
                <div class="tui-image-editor-checkbox">
                    <input type="checkbox" id="tie-brightness">
                    <label for="tie-brightness">Brightness</label>
                </div>
                <div class="tui-image-editor-range-wrap short">
                    <div id="tie-brightness-range"></div>
                </div>
            </div>
            <div>
                <div class="tui-image-editor-checkbox">
                    <input type="checkbox" id="tie-noise">
                    <label for="tie-noise">Noise</label>
                </div>
                <div class="tui-image-editor-range-wrap short">
                    <div id="tie-noise-range"></div>
                </div>
            </div>

            <div>
                <div class="tui-image-editor-checkbox">
                    <input type="checkbox" id="tie-pixelate">
                    <label for="tie-pixelate">Pixelate</label>
                </div>
                <div class="tui-image-editor-range-wrap short">
                    <div id="tie-pixelate-range"></div>
                </div>
            </div>
            <div>
                <div class="tui-image-editor-newline tui-image-editor-checkbox-wrap">
                    <div class="tui-image-editor-checkbox">
                        <input type="checkbox" id="tie-color-filter">
                        <label for="tie-color-filter">Color Filter</label>
                    </div>
                </div>
                <div class="tui-image-editor-newline tui-image-editor-range-wrap short">
                    <label>Threshold</label>
                    <div id="tie-colorfilter-threshole-range"></div>
                </div>
            </div>
        </li>
        <li class="tui-image-editor-partition">
            <div></div>
        </li>
        <li>
            <div class="filter-color-item">
                <div id="tie-filter-tint-color" title="Tint"></div>
                <div class="tui-image-editor-checkbox">
                    <input type="checkbox" id="tie-tint">
                    <label for="tie-tint"></label>
                </div>
            </div>
            <div class="filter-color-item">
                <div id="tie-filter-multiply-color" title="Multiply"></div>
                <div class="tui-image-editor-checkbox">
                    <input type="checkbox" id="tie-multiply">
                    <label for="tie-multiply"></label>
                </div>
            </div>
            <div class="filter-color-item">
                <div id="tie-filter-blend-color" title="Blend"></div>
                <div class="tui-image-editor-checkbox">
                    <input type="checkbox" id="tie-blend">
                    <label for="tie-blend"></label>
                </div>
            </div>
        </li>
    </ul>
`);
