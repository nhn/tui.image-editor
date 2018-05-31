export default ({iconStyle: {normal, active}}) => (`
    <ul class="menu">
        <li id="crop-button" class="apply">
            <div class="button apply">
                <svg class="svg_ic-menu">
                    <use xlink:href="${normal.path}/${normal.name}.svg#${normal.name}-ic-apply" class="normal"/>
                    <use xlink:href="${active.path}/${active.name}.svg#${active.name}-ic-apply" class="active"/>
                </svg>
                <label>
                    Apply
                </label>
            </div>
            <div class="button cancel">
                <svg class="svg_ic-menu">
                    <use xlink:href="${normal.path}/${normal.name}.svg#${normal.name}-ic-cancel" class="normal"/>
                    <use xlink:href="${active.path}/${active.name}.svg#${active.name}-ic-cancel" class="active"/>
                </svg>
                <label>
                    Cancel
                </label>
            </div>
        </li>
    </ul>
`);
