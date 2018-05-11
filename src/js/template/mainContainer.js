export default `
    <div class="tui-image-editor-main-container" style="border: 2px solid red">
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
                        <li class="menu-item">
                            <label><input type="radio" name="select-shape-type" value="rect" checked="checked"> rect</label>
                            <label><input type="radio" name="select-shape-type" value="circle"> circle</label>
                            <label><input type="radio" name="select-shape-type" value="triangle"> triangle</label>
                        </li>
                        <li class="menu-item">
                            <select name="select-color-type">
                                <option value="fill">Fill</option>
                                <option value="stroke">Stroke</option>
                            </select>
                            <label><input type="checkbox" id="input-check-transparent">transparent</label>
                            <div id="tui-shape-color-picker"></div>
                        </li>
                        <li class="menu-item"><label class="menu-item no-pointer">Stroke width<input id="input-stroke-width-range" type="range" min="0" max="300" value="12"></label></li>
                    </ul>
                </div>
            </div>
            <div class="tui-image-editor"></div>
        </div>
    </div>
`;
