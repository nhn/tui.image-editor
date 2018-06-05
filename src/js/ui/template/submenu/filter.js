export default () => (`
    <ul class="tui-image-editor-submenu-item">
        <li class="tui-image-editor-submenu-align">
            <div class="tui-image-editor-checkbox-wrap fixed-width">
                <div class="tui-image-editor-checkbox">
                    <input type="checkbox" id="grayscale">
                    <label for="grayscale">Grayscale</label>
                </div>
                <div class="tui-image-editor-checkbox">
                    <input type="checkbox" id="invert">
                    <label for="invert">Invert</label>
                </div>
                <div class="tui-image-editor-checkbox">
                    <input type="checkbox" id="sepia">
                    <label for="sepia">Sepia</label>
                </div>
                <div class="tui-image-editor-checkbox">
                    <input type="checkbox" id="sepia2">
                    <label for="sepia2">Sepia2</label>
                </div>
                <div class="tui-image-editor-checkbox">
                    <input type="checkbox" id="blur">
                    <label for="blur">Blur</label>
                </div>
                <div class="tui-image-editor-checkbox">
                    <input type="checkbox" id="sharpen">
                    <label for="sharpen">Sharpen</label>
                </div>
                <div class="tui-image-editor-checkbox">
                    <input type="checkbox" id="emboss">
                    <label for="emboss">Emboss</label>
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
                        <input type="checkbox" id="remove-white">
                        <label for="remove-white">Remove White</label>
                    </div>
                </div>
                <div class="newline tui-image-editor-range-wrap short">
                    <label>Threshold</label>
                    <div id="removewhite-threshold-range"></div>
                </div>
                <div class="newline tui-image-editor-range-wrap short">
                    <label>Distance</label>
                    <div id="removewhite-distance-range"></div>
                </div>
            </div>
            <div>
                <div class="newline tui-image-editor-checkbox-wrap">
                    <div class="tui-image-editor-checkbox">
                        <input type="checkbox" id="gradient-transparency">
                        <label for="gradient-transparency">Grayscale</label>
                    </div>
                </div>
                <div class="newline tui-image-editor-range-wrap short">
                    <label>Value</label>
                    <div id="gradient-transparency-range"></div>
                </div>
            </div>
        </li>
        <li class="tui-image-editor-partition only-left-right">
            <div></div>
        </li>
        <li class="tui-image-editor-submenu-align">
            <div>
                <div class="tui-image-editor-checkbox">
                    <input type="checkbox" id="brightness">
                    <label for="brightness">Brightness</label>
                </div>
                <div class="tui-image-editor-range-wrap short">
                    <div id="brightness-range"></div>
                </div>
            </div>
            <div>
                <div class="tui-image-editor-checkbox">
                    <input type="checkbox" id="noise">
                    <label for="noise">Noise</label>
                </div>
                <div class="tui-image-editor-range-wrap short">
                    <div id="noise-range"></div>
                </div>
            </div>

            <div>
                <div class="tui-image-editor-checkbox">
                    <input type="checkbox" id="pixelate">
                    <label for="pixelate">Pixelate</label>
                </div>
                <div class="tui-image-editor-range-wrap short">
                    <div id="pixelate-range"></div>
                </div>
            </div>
            <div>
                <div class="newline tui-image-editor-checkbox-wrap">
                    <div class="tui-image-editor-checkbox">
                        <input type="checkbox" id="color-filter">
                        <label for="color-filter">Color Filter</label>
                    </div>
                </div>
                <div class="newline tui-image-editor-range-wrap short">
                    <label>Threshold</label>
                    <div id="colorfilter-threshole-range"></div>
                </div>
            </div>
        </li>
        <li class="tui-image-editor-partition">
            <div></div>
        </li>
        <li>
            <div class="filter-color-item">
                <div id="filter-tint-color" title="Tint"></div>
                <div class="tui-image-editor-checkbox">
                    <input type="checkbox" id="tint">
                    <label for="tint"></label>
                </div>
            </div>
            <div class="filter-color-item">
                <div id="filter-multiply-color" title="Multiply"></div>
                <div class="tui-image-editor-checkbox">
                    <input type="checkbox" id="multiply">
                    <label for="multiply"></label>
                </div>
            </div>
            <div class="filter-color-item">
                <div id="filter-blend-color" title="Blend"></div>
                <div class="tui-image-editor-checkbox">
                    <input type="checkbox" id="blend">
                    <label for="blend"></label>
                </div>
            </div>
        </li>
    </ul>
`);
