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
                <div class="rotate">
                    <ul class="menu">
                        <li id="retate-button">
                            <div class="button clockwise">
                                <div>
                                    <svg class="svg_ic-rotate-clockwise">
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
                                    <svg class="svg_ic-rotate-counterclockwise">
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
                                <svg class="svg_ic-apply">
                                    <use xlink:href="../dist/icon-a.svg#icon-a-ic-apply" class="normal"/>
                                    <use xlink:href="../dist/icon-b.svg#icon-b-ic-apply" class="active"/>
                                </svg>
                                <label>
                                    Apply
                                </label>
                            </div>
                            <div class="button cancel">
                                <svg class="svg_ic-cancel">
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
                                    <svg class="svg_ic-flip-x">
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
                                    <svg class="svg_ic-flip-y">
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
                                    <svg class="svg_ic-flip-reset">
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
                <div class="shape">
                    <ul class="menu">
                        <li id="shape-button" class="rect">
                            <div class="button rect">
                                <div>
                                    <svg class="svg_ic-shape-rectangle">
                                        <use xlink:href="../dist/icon-a.svg#icon-a-ic-shape-rectangle" class="normal"/>
                                        <use xlink:href="../dist/icon-b.svg#icon-b-ic-shape-rectangle" class="active"/>
                                    </svg>
                                </div>
                                <label> Rectangle </label>
                            </div>
                            <div class="button circle">
                                <div>
                                    <svg class="svg_ic-shape-circle">
                                        <use xlink:href="../dist/icon-a.svg#icon-a-ic-shape-circle" class="normal"/>
                                        <use xlink:href="../dist/icon-b.svg#icon-b-ic-shape-circle" class="active"/>
                                    </svg>
                                </div>
                                <label> Circle </label>
                            </div>
                            <div class="button triangle">
                                <div>
                                    <svg class="svg_ic-shape-triangle">
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
