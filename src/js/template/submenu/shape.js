export default `
    <ul class="menu">
        <li id="shape-button" class="rect">
            <div class="button rect">
                <div>
                    <svg class="svg_ic-submenu">
                        <use xlink:href="../dist/icon-a.svg#icon-a-ic-shape-rectangle" class="normal"/>
                        <use xlink:href="../dist/icon-c.svg#icon-c-ic-shape-rectangle" class="active"/>
                    </svg>
                </div>
                <label> Rectangle </label>
            </div>
            <div class="button circle">
                <div>
                    <svg class="svg_ic-submenu">
                        <use xlink:href="../dist/icon-a.svg#icon-a-ic-shape-circle" class="normal"/>
                        <use xlink:href="../dist/icon-c.svg#icon-c-ic-shape-circle" class="active"/>
                    </svg>
                </div>
                <label> Circle </label>
            </div>
            <div class="button triangle">
                <div>
                    <svg class="svg_ic-submenu">
                        <use xlink:href="../dist/icon-a.svg#icon-a-ic-shape-triangle" class="normal"/>
                        <use xlink:href="../dist/icon-c.svg#icon-c-ic-shape-triangle" class="active"/>
                    </svg>
                </div>
                <label> Triangle </label>
            </div>
        </li>
        <li>
            <div class="tui-image-editor-partition"></div>
        </li>
        <li id="shape-color-button">
            <div id="color-fill" title="fill"></div>
            <div id="color-stroke" title="stroke"></div>
        </li>
        <li class="newline tui-image-editor-range-wrap">
            <label>Stroke</label>
            <div id="stroke-range"></div>
            <input id="stroke-range-value" class="tui-image-editor-range-value" value="0" />
        </li>
    </ul>
`;
