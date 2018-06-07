export default ({biImage, commonStyle, headerStyle, loadButtonStyle, downloadButtonStyle, submenuStyle}) => (`
    <div class="tui-image-editor-main-container" style="${commonStyle}">
        <div class="tui-image-editor-header" style="${headerStyle}">
            <div class="tui-image-editor-header-logo">
                <img src="${biImage}" height="21px" />
            </div>
            <div class="tui-image-editor-header-buttons">
                <button style="${loadButtonStyle}">
                    Load
                    <input type="file" class="tui-image-editor-load-btn" />
                </button>
                <button class="tui-image-editor-download-btn" style="${downloadButtonStyle}">
                    Download
                </button>
            </div>
        </div>
        <div class="tui-image-editor-main">
            <div class="tui-image-editor-submenu" style="${submenuStyle}">
            </div>
            <div class="tui-image-editor-wrap">
                <div class="tui-image-editor"></div>
            </div>
        </div>
    </div>
`);
