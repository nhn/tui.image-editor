export default `
    <ul id="flip-button" class="menu">
        <li>
            <div class="button flipX">
                <div>
                    <svg class="svg_ic-submenu">
                        <use xlink:href="../dist/icon-a.svg#icon-a-ic-flip-x" class="normal"/>
                        <use xlink:href="../dist/icon-c.svg#icon-c-ic-flip-x" class="active"/>
                    </svg>
                </div>
                <label>
                    Flip X
                </label>
            </div>
            <div class="button flipY">
                <div>
                    <svg class="svg_ic-submenu">
                        <use xlink:href="../dist/icon-a.svg#icon-a-ic-flip-y" class="normal"/>
                        <use xlink:href="../dist/icon-c.svg#icon-c-ic-flip-y" class="active"/>
                    </svg>
                </div>
                <label>
                    Flip Y
                </label>
            </div>
        </li>
        <li class="tui-image-editor-partition">
            <div></div>
        </li>
        <li>
            <div class="button resetFlip">
                <div>
                    <svg class="svg_ic-submenu">
                        <use xlink:href="../dist/icon-a.svg#icon-a-ic-flip-reset" class="normal"/>
                        <use xlink:href="../dist/icon-c.svg#icon-c-ic-flip-reset" class="active"/>
                    </svg>
                </div>
                <label>
                    Reset
                </label>
            </div>
        </li>
    </ul>
`;
