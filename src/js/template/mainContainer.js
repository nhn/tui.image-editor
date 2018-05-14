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
                    <ul class="menu">
                        <li class="menu-item" id="btn-flip-x">FlipX</li>
                        <li class="menu-item" id="btn-flip-y">FlipY</li>
                        <li class="menu-item" id="btn-reset-flip">Reset</li>
                        <li class="menu-item close">Close</li>
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
                            <!--
                            <select name="select-color-type">
                                <option value="fill">Fill</option>
                                <option value="stroke">Stroke</option>
                            </select>
                            <label><input type="checkbox" id="input-check-transparent">transparent</label>
                            <div id="tui-shape-color-picker"></div>
                            -->

                            <div class="button circle">
                                <div>
                                    <svg class="svg_ic-color-transparent-w">
                                        <use xlink:href="../dist/icon-a.svg#ic-color-transparent-w" />
                                    </svg>
                                </div>
                                <label> Fill </label>
                            </div>

                        </li>
                        <li class="newline">
                            <label class="menu-item no-pointer">
                                Stroke width
                                <input id="input-stroke-width-range" type="range" min="0" max="300" value="12">
                            </label>
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
