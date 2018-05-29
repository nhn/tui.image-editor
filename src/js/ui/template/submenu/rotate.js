export default `
    <ul class="menu">
        <li id="retate-button">
            <div class="button clockwise">
                <div>
                    <svg class="svg_ic-submenu">
                        <use xlink:href="../dist/icon-a.svg#icon-a-ic-rotate-clockwise" class="normal"/>
                        <use xlink:href="../dist/icon-c.svg#icon-c-ic-rotate-clockwise" class="active"/>
                    </svg>
                </div>
                <label>
                    30
                </label>
            </div>
            <div class="button counterclockwise">
                <div>
                    <svg class="svg_ic-submenu">
                        <use xlink:href="../dist/icon-a.svg#icon-a-ic-rotate-counterclockwise" class="normal"/>
                        <use xlink:href="../dist/icon-c.svg#icon-c-ic-rotate-counterclockwise" class="active"/>
                    </svg>
                </div>
                <label>
                    -30
                </label>
            </div>
        </li>
        <li class="tui-image-editor-partition only-left-right">
            <div></div>
        </li>
        <li class="newline tui-image-editor-range-wrap">
            <label class="rangeo">Range</label>
            <div id="rotate-range"></div>
            <input id="ratate-range-value" class="tui-image-editor-range-value" value="0" />
        </li>
    </ul>
`;
