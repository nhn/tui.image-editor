/**
 * @fileoverview The standard theme
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 */
export default {
    common: {
        backgroundImage: 'none',
        backgroundColor: '#1e1e1e',
        border: '0px'
    },
    header: {
        backgroundImage: 'none',
        backgroundColor: 'transparent',
        border: '0px'
    },
    loadButton: {
        backgroundColor: '#fff',
        border: '1px solid #ddd',
        color: '#222',
        fontFamily: 'NotoSans, sans-serif',
        fontSize: '12px'
    },
    downloadButton: {
        backgroundColor: '#fdba3b',
        border: '1px solid #fdba3b',
        color: '#fff',
        fontFamily: 'NotoSans, sans-serif',
        fontSize: '12px'
    },
    menu: {
        icon: {
            normal: {
                path: '../dist/svg',
                name: 'icon-a'
            },
            active: {
                path: '../dist/svg',
                name: 'icon-b'
            }
        }
    },
    submenu: {
        backgroundColor: 'transparent',
        partition: {
            color: '#858585'
        },
        icon: {
            normal: {
                path: '../dist/svg',
                name: 'icon-a'
            },
            active: {
                path: '../dist/svg',
                name: 'icon-c'
            }
        },
        label: {
            normal: {
                color: '#858585',
                fontWeight: 'lighter'
            },
            active: {
                color: '#fff',
                fontWeight: 'lighter'
            }
        },
        checkbox: {
            border: '1px solid #ccc',
            backgroundColor: '#fff'
        },
        range: {
            pointer: {
                color: '#fff'
            },
            value: {
                color: '#fff',
                fontWeight: 'lighter',
                border: '1px solid #353535',
                backgroundColor: '#151515'
            },
            title: {
                color: '#fff',
                fontWeight: 'lighter'
            }
        },
        colorpicker: {
            button: {
                border: '1px solid #1e1e1e'
            },
            title: {
                color: '#fff'
            }
        }
    }
};
