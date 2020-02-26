export default ({locale, biImage, iconStyle: {normal, hover, disabled}, loadButtonStyle, downloadButtonStyle}) => (`
    <div class="tui-image-editor-controls">
        <div class="tui-image-editor-controls-logo">
            <img src="${biImage}" />
        </div>
        <ul class="tui-image-editor-menu">
            <li class="tie-btn-undo tui-image-editor-item">
                <svg class="svg_ic-menu">
                    <use xlink:href="#ic-undo" class="enabled normal-color"/>
                    <use xlink:href="#ic-undo" class="normal disabled-color"/>
                    <use xlink:href="#ic-undo" class="hover hover-color"/>
                </svg>
            </li>
            <li class="tie-btn-redo tui-image-editor-item">
                <svg class="svg_ic-menu">
                    <use xlink:href="#ic-redo" class="enabled normal-color"/>
                    <use xlink:href="#ic-redo" class="normal disabled-color"/>
                    <use xlink:href="#ic-redo" class="hover hover-color"/>
                </svg>
            </li>
            <li class="tie-btn-reset tui-image-editor-item">
                <svg class="svg_ic-menu">
                    <use xlink:href="#ic-reset" class="enabled normal-color"/>
                    <use xlink:href="#ic-reset" class="normal disabled-color"/>
                    <use xlink:href="#ic-reset" class="hover hover-color"/>
                </svg>
            </li>
            <li class="tui-image-editor-item">
                <div class="tui-image-editor-icpartition"></div>
            </li>
            <li class="tie-btn-delete tui-image-editor-item">
                <svg class="svg_ic-menu">
                    <use xlink:href="#ic-delete" class="enabled normal-color"/>
                    <use xlink:href="#ic-delete" class="normal disabled-color"/>
                    <use xlink:href="#ic-delete" class="hover hover-color"/>
                </svg>
            </li>
            <li class="tie-btn-delete-all tui-image-editor-item">
                <svg class="svg_ic-menu">
                    <use xlink:href="#ic-delete-all" class="enabled normal-color"/>
                    <use xlink:href="#ic-delete-all" class="normal disabled-color"/>
                    <use xlink:href="#ic-delete-all" class="hover hover-color"/>
                </svg>
            </li>
            <li class="tui-image-editor-item">
                <div class="tui-image-editor-icpartition"></div>
            </li>
        </ul>

        <div class="tui-image-editor-controls-buttons">
            <div style="${loadButtonStyle}">
                ${locale.localize('Load')}
                <input type="file" class="tui-image-editor-load-btn" />
            </div>
            <button class="tui-image-editor-download-btn" style="${downloadButtonStyle}">
                ${locale.localize('Download')}
            </button>
        </div>
    </div>
`);
