export default ({submenuIcon: {normal, active}}) => (`
    <ul class="menu">
        <li id="icon-add-button">
            <div class="button" data-icontype="icon-arrow">
                <div>
                    <svg class="svg_ic-submenu">
                        <use xlink:href="${normal.path}/${normal.name}.svg#${normal.name}-ic-icon-arrow"
                            class="normal"/>
                        <use xlink:href="${active.path}/${active.name}.svg#${active.name}-ic-icon-arrow"
                            class="active"/>
                    </svg>
                </div>
                <label>
                    Arrow
                </label>
            </div>
            <div class="button" data-icontype="icon-arrow-2">
                <div>
                    <svg class="svg_ic-submenu">
                        <use xlink:href="${normal.path}/${normal.name}.svg#${normal.name}-ic-icon-arrow-2"
                            class="normal"/>
                        <use xlink:href="${active.path}/${active.name}.svg#${active.name}-ic-icon-arrow-2"
                            class="active"/>
                    </svg>
                </div>
                <label>
                    Arrow-2
                </label>
            </div>
            <div class="button" data-icontype="icon-arrow-3">
                <div>
                    <svg class="svg_ic-submenu">
                        <use xlink:href="${normal.path}/${normal.name}.svg#${normal.name}-ic-icon-arrow-3"
                            class="normal"/>
                        <use xlink:href="${active.path}/${active.name}.svg#${active.name}-ic-icon-arrow-3"
                            class="active"/>
                    </svg>
                </div>
                <label>
                    Arrow-3
                </label>
            </div>
            <div class="button" data-icontype="icon-star">
                <div>
                    <svg class="svg_ic-submenu">
                        <use xlink:href="${normal.path}/${normal.name}.svg#${normal.name}-ic-icon-star" class="normal"/>
                        <use xlink:href="${active.path}/${active.name}.svg#${active.name}-ic-icon-star" class="active"/>
                    </svg>
                </div>
                <label>
                    Star-1
                </label>
            </div>
            <div class="button" data-icontype="icon-star-2">
                <div>
                    <svg class="svg_ic-submenu">
                        <use xlink:href="${normal.path}/${normal.name}.svg#${normal.name}-ic-icon-star-2"
                            class="normal"/>
                        <use xlink:href="${active.path}/${active.name}.svg#${active.name}-ic-icon-star-2"
                            class="active"/>
                    </svg>
                </div>
                <label>
                    Star-2
                </label>
            </div>

            <div class="button" data-icontype="icon-polygon">
                <div>
                    <svg class="svg_ic-submenu">
                        <use xlink:href="${normal.path}/${normal.name}.svg#${normal.name}-ic-icon-polygon"
                            class="normal"/>
                        <use xlink:href="${normal.path}/${normal.name}.svg#${normal.name}-ic-icon-polygon"
                            class="active"/>
                    </svg>
                </div>
                <label>
                    Polygon
                </label>
            </div>

            <div class="button" data-icontype="icon-location">
                <div>
                    <svg class="svg_ic-submenu">
                        <use xlink:href="${normal.path}/${normal.name}.svg#${normal.name}-ic-icon-location"
                            class="normal"/>
                        <use xlink:href="${active.path}/${active.name}.svg#${active.name}-ic-icon-location"
                            class="active"/>
                    </svg>
                </div>
                <label>
                    Location
                </label>
            </div>

            <div class="button" data-icontype="icon-heart">
                <div>
                    <svg class="svg_ic-submenu">
                        <use xlink:href="${normal.path}/${normal.name}.svg#${normal.name}-ic-icon-heart"
                            class="normal"/>
                        <use xlink:href="${active.path}/${active.name}.svg#${active.name}-ic-icon-heart"
                            class="active"/>
                    </svg>
                </div>
                <label>
                    Heart
                </label>
            </div>

            <div class="button" data-icontype="icon-bubble">
                <div>
                    <svg class="svg_ic-submenu">
                        <use xlink:href="${normal.path}/${normal.name}.svg#${normal.name}-ic-icon-bubble"
                            class="normal"/>
                        <use xlink:href="${active.path}/${active.name}.svg#${active.name}-ic-icon-bubble"
                            class="active"/>
                    </svg>
                </div>
                <label>
                    Bubble
                </label>
            </div>
        </li>
        <li class="tui-image-editor-partition">
            <div></div>
        </li>
        <li id="icon-add-button">
            <div class="button">
                <div>
                    <input type="file" accept="image/*" id="icon-image-file">
                    <svg class="svg_ic-submenu">
                        <use xlink:href="${normal.path}/${normal.name}.svg#${normal.name}-ic-icon-load" class="normal"/>
                        <use xlink:href="${active.path}/${active.name}.svg#${active.name}-ic-icon-load" class="active"/>
                    </svg>
                </div>
                <label>
                    Custom icon
                </label>
            </div>
        </li>
        <li class="tui-image-editor-partition">
            <div></div>
        </li>
        <li>
            <div id="icon-color" title="Color"></div>
        </li>
    </ul>
`);
