export default `
    <div class="tui-image-editor-main-container">
        <div class="tui-image-editor-header">
            <div class="logo">
                <img src="img/icon/img-bi.svg" />
            </div>
            <div class="buttons">
                <button>Load</button>
                <button class="download">Download</button>
            </div>
        </div>
        <div class="main">
            <div class="sub-menu">
                <div class="draw">
                    <ul class="menu">
                        <li id="draw-line-select-button">
                            <div class="button free">
                                <div>
                                    <svg class="svg_ic-submenu">
                                        <use xlink:href="../dist/icon-a.svg#icon-a-ic-draw-free" class="normal"/>
                                        <use xlink:href="../dist/icon-b.svg#icon-b-ic-draw-free" class="active"/>
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
                                        <use xlink:href="../dist/icon-b.svg#icon-b-ic-draw-line" class="active"/>
                                    </svg>
                                </div>
                                <label>
                                    Straight
                                </label>
                            </div>
                        </li>
                        <li>
                            <div class="partition-left"></div>
                        </li>
                        <li>
                            <div id="draw-color" title="Color"></div>
                        </li>

                        <li class="newline tui-image-editor-range-wrap">
                            <label>Range</label>
                            <div id="draw-range" min="5" max="30"></div>
                            <input id="draw-range-value" class="tui-image-editor-range-value" value="0" />
                        </li>
                    </ul>
                </div>
                <div class="icon">
                    <ul class="menu">
                        <li id="icon-add-button">
                            <div class="button" data-icontype="icon-arrow">
                                <div>
                                    <svg class="svg_ic-submenu">
                                        <use xlink:href="../dist/icon-a.svg#icon-a-ic-icon-arrow" class="normal"/>
                                        <use xlink:href="../dist/icon-b.svg#icon-b-ic-icon-arrow" class="active"/>
                                    </svg>
                                </div>
                                <label>
                                    Arrow
                                </label>
                            </div>
                            <div class="button" data-icontype="icon-arrow-2">
                                <div>
                                    <svg class="svg_ic-submenu">
                                        <use xlink:href="../dist/icon-a.svg#icon-a-ic-icon-arrow-2" class="normal"/>
                                        <use xlink:href="../dist/icon-b.svg#icon-b-ic-icon-arrow-2" class="active"/>
                                    </svg>
                                </div>
                                <label>
                                    Arrow-2
                                </label>
                            </div>
                            <div class="button" data-icontype="icon-arrow-3">
                                <div>
                                    <svg class="svg_ic-submenu">
                                        <use xlink:href="../dist/icon-a.svg#icon-a-ic-icon-arrow-3" class="normal"/>
                                        <use xlink:href="../dist/icon-b.svg#icon-b-ic-icon-arrow-3" class="active"/>
                                    </svg>
                                </div>
                                <label>
                                    Arrow-3
                                </label>
                            </div>
                            <div class="button" data-icontype="icon-star">
                                <div>
                                    <svg class="svg_ic-submenu">
                                        <use xlink:href="../dist/icon-a.svg#icon-a-ic-icon-star" class="normal"/>
                                        <use xlink:href="../dist/icon-b.svg#icon-b-ic-icon-star" class="active"/>
                                    </svg>
                                </div>
                                <label>
                                    Star-1
                                </label>
                            </div>
                            <div class="button" data-icontype="icon-star-2">
                                <div>
                                    <svg class="svg_ic-submenu">
                                        <use xlink:href="../dist/icon-a.svg#icon-a-ic-icon-star-2" class="normal"/>
                                        <use xlink:href="../dist/icon-b.svg#icon-b-ic-icon-star-2" class="active"/>
                                    </svg>
                                </div>
                                <label>
                                    Star-2
                                </label>
                            </div>

                            <div class="button" data-icontype="icon-polygon">
                                <div>
                                    <svg class="svg_ic-submenu">
                                        <use xlink:href="../dist/icon-a.svg#icon-a-ic-icon-polygon" class="normal"/>
                                        <use xlink:href="../dist/icon-b.svg#icon-b-ic-icon-polygon" class="active"/>
                                    </svg>
                                </div>
                                <label>
                                    Polygon
                                </label>
                            </div>

                            <div class="button" data-icontype="icon-location">
                                <div>
                                    <svg class="svg_ic-submenu">
                                        <use xlink:href="../dist/icon-a.svg#icon-a-ic-icon-location" class="normal"/>
                                        <use xlink:href="../dist/icon-b.svg#icon-b-ic-icon-location" class="active"/>
                                    </svg>
                                </div>
                                <label>
                                    Location
                                </label>
                            </div>

                            <div class="button" data-icontype="icon-heart">
                                <div>
                                    <svg class="svg_ic-submenu">
                                        <use xlink:href="../dist/icon-a.svg#icon-a-ic-icon-heart" class="normal"/>
                                        <use xlink:href="../dist/icon-b.svg#icon-b-ic-icon-heart" class="active"/>
                                    </svg>
                                </div>
                                <label>
                                    Heart
                                </label>
                            </div>

                            <div class="button" data-icontype="icon-bubble">
                                <div>
                                    <svg class="svg_ic-submenu">
                                        <use xlink:href="../dist/icon-a.svg#icon-a-ic-icon-bubble" class="normal"/>
                                        <use xlink:href="../dist/icon-b.svg#icon-b-ic-icon-bubble" class="active"/>
                                    </svg>
                                </div>
                                <label>
                                    Bubble
                                </label>
                            </div>
                        </li>
                        <li>
                            <div class="partition-left"></div>
                        </li>
                        <li id="icon-add-button">
                            <div class="button clockwise">
                                <div>
                                    <input type="file" accept="image/*" id="icon-image-file">
                                    <svg class="svg_ic-submenu">
                                        <use xlink:href="../dist/icon-a.svg#icon-a-ic-icon-load" class="normal"/>
                                        <use xlink:href="../dist/icon-b.svg#icon-b-ic-icon-load" class="active"/>
                                    </svg>
                                </div>
                                <label>
                                    Custom icon
                                </label>
                            </div>
                        </li>
                        <li>
                            <div class="partition-left"></div>
                        </li>
                        <li>
                            <div id="icon-color" title="Color"></div>
                        </li>
                    </ul>
                </div>
                <div class="rotate">
                    <ul class="menu">
                        <li id="retate-button">
                            <div class="button clockwise">
                                <div>
                                    <svg class="svg_ic-submenu">
                                        <use xlink:href="../dist/icon-a.svg#icon-a-ic-rotate-clockwise" class="normal"/>
                                        <use xlink:href="../dist/icon-b.svg#icon-b-ic-rotate-clockwise" class="active"/>
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
                                        <use xlink:href="../dist/icon-b.svg#icon-b-ic-rotate-counterclockwise" class="active"/>
                                    </svg>
                                </div>
                                <label>
                                    -30
                                </label>
                            </div>
                        </li>
                        <li class="newline tui-image-editor-range-wrap">
                            <label>Range</label>
                            <div id="rotate-range" min="-360" max="360"></div>
                            <input id="ratate-range-value" class="tui-image-editor-range-value" value="0" />
                        </li>
                    </ul>
                </div>
                <div class="crop">
                    <ul class="menu">
                        <li id="crop-button" class="apply">
                            <div class="button apply">
                                <svg class="svg_ic-menu">
                                    <use xlink:href="../dist/icon-a.svg#icon-a-ic-apply" class="normal"/>
                                    <use xlink:href="../dist/icon-b.svg#icon-b-ic-apply" class="active"/>
                                </svg>
                                <label>
                                    Apply
                                </label>
                            </div>
                            <div class="button cancel">
                                <svg class="svg_ic-menu">
                                    <use xlink:href="../dist/icon-a.svg#icon-a-ic-cancel" class="normal"/>
                                    <use xlink:href="../dist/icon-b.svg#icon-b-ic-cancel" class="active"/>
                                </svg>
                                <label>
                                    Cancel
                                </label>
                            </div>
                        </li>
                    </ul>
                </div>
                <div class="flip">
                    <ul id="flip-button" class="menu">
                        <li>
                            <div class="button flipX">
                                <div>
                                    <svg class="svg_ic-submenu">
                                        <use xlink:href="../dist/icon-a.svg#icon-a-ic-flip-x" class="normal"/>
                                        <use xlink:href="../dist/icon-b.svg#icon-b-ic-flip-x" class="active"/>
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
                                        <use xlink:href="../dist/icon-b.svg#icon-b-ic-flip-y" class="active"/>
                                    </svg>
                                </div>
                                <label>
                                    Flip Y
                                </label>
                            </div>
                        </li>
                        <li>
                            <div class="button resetFlip">
                                <div>
                                    <svg class="svg_ic-submenu">
                                        <use xlink:href="../dist/icon-a.svg#icon-a-ic-flip-reset" class="normal"/>
                                        <use xlink:href="../dist/icon-b.svg#icon-b-ic-flip-reset" class="active"/>
                                    </svg>
                                </div>
                                <label>
                                    Reset
                                </label>
                            </div>
                        </li>
                    </ul>
                </div>
                <div class="mask">
                    <ul class="menu">
                        <li>
                            <div class="button">
                                <div>
                                    <input type="file" accept="image/*" id="mask-image-file">
                                    <svg class="svg_ic-submenu">
                                        <use xlink:href="../dist/icon-a.svg#icon-a-ic-mask-load" class="normal"/>
                                        <use xlink:href="../dist/icon-b.svg#icon-b-ic-mask-load" class="active"/>
                                    </svg>
                                </div>
                                <label> Load Mask Image </label>
                            </div>
                        </li>
                        <li id="mask-apply" class="newline apply">
                            <div class="button apply">
                                <svg class="svg_ic-menu">
                                    <use xlink:href="../dist/icon-a.svg#icon-a-ic-apply" class="normal"/>
                                    <use xlink:href="../dist/icon-b.svg#icon-b-ic-apply" class="active"/>
                                </svg>
                                <label>
                                    Apply
                                </label>
                            </div>
                        </li>
                    </ul>
                </div>
                <div class="text">
                    <ul class="menu">
                        <li id="text-effect-button">
                            <div class="button bold">
                                <div>
                                    <svg class="svg_ic-submenu">
                                        <use xlink:href="../dist/icon-a.svg#icon-a-ic-text-bold" class="normal"/>
                                        <use xlink:href="../dist/icon-b.svg#icon-b-ic-text-bold" class="active"/>
                                    </svg>
                                </div>
                                <label> Bold </label>
                            </div>
                            <div class="button italic">
                                <div>
                                    <svg class="svg_ic-submenu">
                                        <use xlink:href="../dist/icon-a.svg#icon-a-ic-text-italic" class="normal"/>
                                        <use xlink:href="../dist/icon-b.svg#icon-b-ic-text-italic" class="active"/>
                                    </svg>
                                </div>
                                <label> Italic </label>
                            </div>
                            <div class="button underline">
                                <div>
                                    <svg class="svg_ic-submenu">
                                        <use xlink:href="../dist/icon-a.svg#icon-a-ic-text-underline" class="normal"/>
                                        <use xlink:href="../dist/icon-b.svg#icon-b-ic-text-underline" class="active"/>
                                    </svg>
                                </div>
                                <label> Underline </label>
                            </div>
                        </li>
                        <li>
                            <div class="partition-left"></div>
                        </li>
                        <li id="text-align-button">
                            <div class="button left">
                                <div>
                                    <svg class="svg_ic-submenu">
                                        <use xlink:href="../dist/icon-a.svg#icon-a-ic-text-align-left" class="normal"/>
                                        <use xlink:href="../dist/icon-b.svg#icon-b-ic-text-align-left" class="active"/>
                                    </svg>
                                </div>
                                <label> left </label>
                            </div>
                            <div class="button center">
                                <div>
                                    <svg class="svg_ic-submenu">
                                        <use xlink:href="../dist/icon-a.svg#icon-a-ic-text-align-center" class="normal"/>
                                        <use xlink:href="../dist/icon-b.svg#icon-b-ic-text-align-center" class="active"/>
                                    </svg>
                                </div>
                                <label> center </label>
                            </div>
                            <div class="button right">
                                <div>
                                    <svg class="svg_ic-submenu">
                                        <use xlink:href="../dist/icon-a.svg#icon-a-ic-text-align-right" class="normal"/>
                                        <use xlink:href="../dist/icon-b.svg#icon-b-ic-text-align-right" class="active"/>
                                    </svg>
                                </div>
                                <label> right </label>
                            </div>
                        </li>
                        <li>
                            <div class="partition-left"></div>
                        </li>
                        <li>
                            <div id="text-color" title="Color"></div>
                        </li>
                        <li class="newline tui-image-editor-range-wrap">
                            <label>Text size</label>
                            <div id="text-range" min="10" max="100"></div>
                            <input id="text-range-value" class="tui-image-editor-range-value" value="0" />
                        </li>
                    </ul>
                </div>
                <div class="shape">
                    <ul class="menu">
                        <li id="shape-button" class="rect">
                            <div class="button rect">
                                <div>
                                    <svg class="svg_ic-submenu">
                                        <use xlink:href="../dist/icon-a.svg#icon-a-ic-shape-rectangle" class="normal"/>
                                        <use xlink:href="../dist/icon-b.svg#icon-b-ic-shape-rectangle" class="active"/>
                                    </svg>
                                </div>
                                <label> Rectangle </label>
                            </div>
                            <div class="button circle">
                                <div>
                                    <svg class="svg_ic-submenu">
                                        <use xlink:href="../dist/icon-a.svg#icon-a-ic-shape-circle" class="normal"/>
                                        <use xlink:href="../dist/icon-b.svg#icon-b-ic-shape-circle" class="active"/>
                                    </svg>
                                </div>
                                <label> Circle </label>
                            </div>
                            <div class="button triangle">
                                <div>
                                    <svg class="svg_ic-submenu">
                                        <use xlink:href="../dist/icon-a.svg#icon-a-ic-shape-triangle" class="normal"/>
                                        <use xlink:href="../dist/icon-b.svg#icon-b-ic-shape-triangle" class="active"/>
                                    </svg>
                                </div>
                                <label> Triangle </label>
                            </div>
                        </li>
                        <li>
                            <div class="partition-left"></div>
                        </li>
                        <li id="shape-color-button">
                            <div id="color-fill" title="fill"></div>
                            <div id="color-stroke" title="stroke"></div>
                        </li>
                        <li class="newline tui-image-editor-range-wrap">
                            <label>Stroke</label>
                            <div id="stroke-range" min="0" max="300"></div>
                            <input id="stroke-range-value" class="tui-image-editor-range-value" value="0" />
                        </li>
                    </ul>
                </div>
            </div>
            <div class="tui-image-editor-wrap">
                <div class="tui-image-editor"></div>
            </div>
        </div>
    </div>
`;
