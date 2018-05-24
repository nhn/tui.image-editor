export default `
    <ul class="menu">
        <li id="draw-line-select-button" class="line">
            <div class="button free">
                <div>
                    <svg class="svg_ic-submenu">
                        <use xlink:href="../dist/icon-a.svg#icon-a-ic-draw-free" class="normal"/>
                        <use xlink:href="../dist/icon-c.svg#icon-c-ic-draw-free" class="active"/>
                    </svg>
                </div>
                <label>
                    Free
                </label>
            </div>
            <div class="button line">
                <div>
                    <svg class="svg_ic-submenu">
                        <use xlink:href="../dist/icon-a.svg#icon-a-ic-draw-line" class="normal"/>
                        <use xlink:href="../dist/icon-c.svg#icon-c-ic-draw-line" class="active"/>
                    </svg>
                </div>
                <label>
                    Straight
                </label>
            </div>
        </li>
        <li>
            <div class="tui-image-editor-partition"></div>
        </li>
        <li>
            <div id="draw-color" title="Color"></div>
        </li>

        <li class="newline tui-image-editor-range-wrap">
            <label>Range</label>
            <div id="draw-range"></div>
            <input id="draw-range-value" class="tui-image-editor-range-value" value="0" />
        </li>
    </ul>
`;
