export default `
    <ul class="menu">
        <li>
            <div class="button">
                <div>
                    <input type="file" accept="image/*" id="mask-image-file">
                    <svg class="svg_ic-submenu">
                        <use xlink:href="../dist/icon-a.svg#icon-a-ic-mask-load" class="normal"/>
                        <use xlink:href="../dist/icon-c.svg#icon-c-ic-mask-load" class="active"/>
                    </svg>
                </div>
                <label> Load Mask Image </label>
            </div>
        </li>
        <li class="tui-image-editor-partition only-left-right">
            <div></div>
        </li>
        <li id="mask-apply" class="newline apply">
            <div class="button apply">
                <svg class="svg_ic-menu">
                    <use xlink:href="../dist/icon-a.svg#icon-a-ic-apply" class="normal"/>
                    <use xlink:href="../dist/icon-c.svg#icon-c-ic-apply" class="active"/>
                </svg>
                <label>
                    Apply
                </label>
            </div>
        </li>
    </ul>
`;
