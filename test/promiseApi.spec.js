/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @fileoverview Test cases of "src/js/component/filter.js"
 */
import ImageEditor from '../src/js/imageEditor';

describe('Promise API', () => {
    let imageEditor;
    const imageURL = 'base/test/fixtures/sampleImage.jpg';

    beforeAll(() => {
        imageEditor = new ImageEditor($('<div></div>'), {
            cssMaxWidth: 700,
            cssMaxHeight: 500
        });
    });

    afterAll(() => {
        imageEditor.destroy();
    });

    beforeEach(done => {
        imageEditor.loadImageFromURL(imageURL, 'sampleImage').then(() => done()
        ).catch(() =>
            done()
        );
    });

    it('addIcon() supports Promise', done => {
        imageEditor.addIcon('arrow', {
            left: 10,
            top: 10
        }).then(() => {
            expect(imageEditor._canvas.getObjects().length).toBe(1);
            done();
        }).catch(() => {
            fail();
            done();
        });
    });

    it('clearObjects() supports Promise', done => {
        imageEditor.addIcon('arrow', {
            left: 10,
            top: 10
        }).then(() =>
            imageEditor.clearObjects()
        ).then(() => {
            expect(imageEditor._canvas.getObjects().length).toBe(0);
            done();
        }).catch(() => {
            fail();
            done();
        });
    });

    it('changeIconColor() supports Promise', done => {
        imageEditor.addIcon('arrow', {
            left: 10,
            top: 10
        }).then(() => imageEditor.changeIconColor('#FFFF00')
        ).then(() => {
            expect(imageEditor._canvas.getObjects()[0].getFill()).toBe('#FFFF00');
            done();
        }).catch(() => {
            fail();
            done();
        });
    });

    it('addShape() supports Promise', done => {
        imageEditor.addShape('rect', {
            width: 100,
            height: 100,
            fill: '#FFFF00'
        }).then(() => {
            const shape = imageEditor._canvas.getObjects()[0];
            expect(shape.type).toBe('rect');
            expect(shape.width).toBe(100);
            expect(shape.height).toBe(100);
            expect(shape.getFill()).toBe('#FFFF00');
            done();
        }).catch(() => {
            fail();
            done();
        });
    });

    it('changeShape() supports Promise', done => {
        imageEditor.addShape('rect', {
            width: 100,
            height: 100,
            fill: '#FFFF00'
        }).then(() => imageEditor.changeShape({
            type: 'triangle',
            width: 200,
            fill: '#FF0000'
        })).then(() => {
            const shape = imageEditor._canvas.getObjects()[0];
            expect(shape.type).toBe('triangle');
            expect(shape.width).toBe(200);
            expect(shape.getFill()).toBe('#FF0000');
            done();
        }).catch(() => {
            fail();
            done();
        });
    });

    it('can catch on failure', done => {
        imageEditor.addShape('rect', {
            width: 100,
            height: 100,
            fill: '#FFFF00'
        }).then(() => {
            imageEditor.deactivateAll();

            return imageEditor.changeShape({
                type: 'triangle',
                widht: 200,
                fill: '#FF0000'
            });
        }).then(() => {
            fail();
            done();
        }).catch(message => {
            expect(message).toBe('There is no active object.');
            done();
        });
    });

    it('addImageObject() supports Promise', done => {
        const maskImageURL = 'base/test/fixtures/mask.png';
        imageEditor.addImageObject(maskImageURL).then(() => {
            expect(imageEditor._canvas.getObjects().length).toBe(1);
            done();
        }).catch(message => {
            fail(message);
            done();
        });
    });

    it('resizeCanvasDimension() supports Promise', done => {
        imageEditor.resizeCanvasDimension({
            width: 900,
            height: 700
        }).then(() =>
            // There is no way to get canvas dimension
            done()
        ).catch(() => {
            fail();
            done();
        });
    });

    it('undo() supports Promise', done => {
        imageEditor.addShape('rect', {
            width: 100,
            height: 100,
            fill: '#FFFF00'
        }).then(() =>
            imageEditor.undo()
        ).then(() => {
            expect(imageEditor._canvas.getObjects().length).toBe(0);
            done();
        }).catch(() => {
            fail();
            done();
        });
    });

    it('flipX() supports Promise', done => {
        imageEditor.flipX().then(obj => {
            expect(obj).toEqual({
                setting: {
                    flipX: true,
                    flipY: false
                },
                angle: 0
            });
            done();
        }).catch(() => {
            fail();
            done();
        });
    });

    it('flipY() supports Promise', done => {
        imageEditor.flipY().then(obj => {
            expect(obj).toEqual({
                setting: {
                    flipX: false,
                    flipY: true
                },
                angle: 0
            });
            done();
        }).catch(() => {
            fail();
            done();
        });
    });

    it('resetFlip() supports Promise', done => {
        imageEditor.resetFlip().then(obj => {
            expect(obj).toEqual({
                setting: {
                    flipX: false,
                    flipY: false
                },
                angle: 0
            });
            fail();
            done();
        }).catch(message => {
            expect(message).toBe('The flipX and flipY setting values are not changed.');
            done();
        });
    });

    it('rotate() supports Promise', done => {
        imageEditor.rotate(10).then(angle => {
            expect(angle).toBe(10);
            done();
        }).catch(() => {
            fail();
            done();
        });
    });

    it('setAngle() supports Promise', done => {
        imageEditor.setAngle(10).then(angle => {
            expect(angle).toBe(10);
            done();
        }).catch(() => {
            fail();
            done();
        });
    });

    it('removeActiveObject() supports Promise', done => {
        imageEditor.addShape('rect', {
            width: 100,
            height: 100
        }).then(() =>
            imageEditor.removeActiveObject()
        ).then(() => {
            expect(imageEditor._canvas.getObjects().length).toBe(0);
            done();
        }).catch(() => {
            fail();
            done();
        });
    });
});
