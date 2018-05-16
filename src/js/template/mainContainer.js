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
                                    <svg class="svg_ic-rotate-clockwise normal"><use xlink:href="../dist/icon-a.svg#ic-rotate-clockwise"/></svg>
                                    <svg class="svg_ic-rotate-clockwise active"><use xlink:href="../dist/icon-b.svg#ic-rotate-clockwise"/></svg>
                                </div>
                                <label>
                                    30
                                </label>
                            </div>
                            <div class="button counterclockwise">
                                <div>
                                    <svg class="svg_ic-rotate-counterclockwise normal"><use xlink:href="../dist/icon-a.svg#ic-rotate-counterclockwise"/></svg>
                                    <svg class="svg_ic-rotate-counterclockwise active"><use xlink:href="../dist/icon-b.svg#ic-rotate-counterclockwise"/></svg>
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
                                <svg class="svg_ic-apply normal"> <use xlink:href="../dist/icon-a.svg#ic-apply"/> </svg>
                                <svg class="svg_ic-apply active"> <use xlink:href="../dist/icon-b.svg#ic-apply"/> </svg>
                                <label>
                                    Apply
                                </label>
                            </div>
                            <div class="button cancel">
                                <svg class="svg_ic-cancel normal"> <use xlink:href="../dist/icon-a.svg#ic-cancel"/> </svg>
                                <svg class="svg_ic-cancel active"> <use xlink:href="../dist/icon-b.svg#ic-cancel"/> </svg>
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
                                    <svg class="svg_ic-flip-x normal"> <use xlink:href="../dist/icon-a.svg#ic-flip-x"/> </svg>
                                    <svg class="svg_ic-flip-x active"> <use xlink:href="../dist/icon-b.svg#ic-flip-x"/> </svg>
                                </div>
                                <label>
                                    Flip X
                                </label>
                            </div>
                            <div class="button flipY">
                                <div>
                                    <svg class="svg_ic-flip-y normal"> <use xlink:href="../dist/icon-a.svg#ic-flip-y"/> </svg>
                                    <svg class="svg_ic-flip-y active"> <use xlink:href="../dist/icon-b.svg#ic-flip-y"/> </svg>
                                </div>
                                <label>
                                    Flip Y
                                </label>
                            </div>
                        </li>
                        <li>
                            <div class="button resetFlip">
                                <div>
                                    <svg class="svg_ic-flip-reset normal"> <use xlink:href="../dist/icon-a.svg#ic-flip-reset"/> </svg>
                                    <svg class="svg_ic-flip-reset active"> <use xlink:href="../dist/icon-b.svg#ic-flip-reset"/> </svg>
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
                                    <svg class="svg_ic-shape-rectangle normal"> <use xlink:href="../dist/icon-a.svg#ic-shape-rectangle"/> </svg>
                                    <svg class="svg_ic-shape-rectangle active"> <use xlink:href="../dist/icon-b.svg#ic-shape-rectangle"/> </svg>
                                </div>
                                <label> Rectangle </label>
                            </div>
                            <div class="button circle">
                                <div>
                                    <svg class="svg_ic-shape-circle normal"> <use xlink:href="../dist/icon-a.svg#ic-shape-circle"/> </svg>
                                    <svg class="svg_ic-shape-circle active"> <use xlink:href="../dist/icon-b.svg#ic-shape-circle"/> </svg>
                                </div>
                                <label> Circle </label>
                            </div>
                            <div class="button triangle">
                                <div>
                                    <svg class="svg_ic-shape-triangle normal"> <use xlink:href="../dist/icon-a.svg#ic-shape-triangle"/> </svg>
                                    <svg class="svg_ic-shape-triangle active"> <use xlink:href="../dist/icon-b.svg#ic-shape-triangle"/> </svg>
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
