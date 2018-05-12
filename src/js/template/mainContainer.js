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
                        <li class="menu-item" id="btn-apply-crop">Apply</li>
                        <li class="menu-item" id="btn-cancel-crop">Cancel</li>
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
                                    <svg class="svg_ic-shape-rectangle">
                                        <use xlink:href="../dist/icon-a.svg#ic-shape-rectangle" class="normal"/>
                                        <use xlink:href="../dist/icon-b.svg#ic-shape-rectangle" class="active"/>
                                    </svg>
                                </div>
                                <label> Rectangle </label>
                            </div>
                            <div class="button circle">
                                <div>
                                    <svg class="svg_ic-shape-circle">
                                        <use xlink:href="../dist/icon-a.svg#ic-shape-circle" class="normal"/>
                                        <use xlink:href="../dist/icon-b.svg#ic-shape-circle" class="active"/>
                                    </svg>
                                </div>
                                <label> Circle </label>
                            </div>
                            <div class="button triangle">
                                <div>
                                    <svg class="svg_ic-shape-triangle">
                                        <use xlink:href="../dist/icon-a.svg#ic-shape-triangle" class="normal"/>
                                        <use xlink:href="../dist/icon-b.svg#ic-shape-triangle" class="active"/>
                                    </svg>
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
