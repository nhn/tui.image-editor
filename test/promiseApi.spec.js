/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhn.com>
 * @fileoverview Test cases of "src/js/component/filter.js"
 */
import ImageEditor from '../src/js/imageEditor';

describe('Promise API', () => {
    let imageEditor, canvas, activeObjectId;
    const imageURL = 'base/test/fixtures/sampleImage.jpg';

    beforeAll(() => {
        imageEditor = new ImageEditor(document.createElement('div'), {
            cssMaxWidth: 700,
            cssMaxHeight: 500
        });
        canvas = imageEditor._graphics.getCanvas();

        imageEditor.on('objectActivated', objectProps => {
            activeObjectId = objectProps.id;
        });
    });

    afterAll(() => {
        imageEditor.destroy();
    });

    beforeEach(done => {
        imageEditor.loadImageFromURL(imageURL, 'sampleImage').then(() => done()
        )['catch'](() =>
            done()
        );
    });

    it('addIcon() supports Promise', done => {
        imageEditor.addIcon('arrow', {
            left: 10,
            top: 10
        }).then(() => {
            expect(canvas.getObjects().length).toBe(1);
            done();
        })['catch'](message => {
            fail(message);
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
            expect(canvas.getObjects().length).toBe(0);
            done();
        })['catch'](message => {
            fail(message);
            done();
        });
    });

    it('changeIconColor() supports Promise', done => {
        imageEditor.addIcon('arrow', {
            left: 10,
            top: 10
        }).then(() => imageEditor.changeIconColor(activeObjectId, '#FFFF00')
        ).then(() => {
            expect(canvas.getObjects()[0].fill).toBe('#FFFF00');
            done();
        })['catch'](message => {
            fail(message);
            done();
        });
    });

    it('addShape() supports Promise', done => {
        imageEditor.addShape('rect', {
            width: 100,
            height: 100,
            fill: '#FFFF00'
        }).then(() => {
            const [shape] = canvas.getObjects();
            expect(shape.type).toBe('rect');
            expect(shape.width).toBe(100);
            expect(shape.height).toBe(100);
            expect(shape.fill).toBe('#FFFF00');
            done();
        })['catch'](message => {
            fail(message);
            done();
        });
    });

    it('changeShape() supports Promise', done => {
        imageEditor.addShape('rect', {
            width: 100,
            height: 100,
            fill: '#FFFF00'
        }).then(() => imageEditor.changeShape(activeObjectId, {
            type: 'triangle',
            width: 200,
            fill: '#FF0000'
        })).then(() => {
            const [shape] = canvas.getObjects();
            expect(shape.type).toBe('triangle');
            expect(shape.width).toBe(200);
            expect(shape.fill).toBe('#FF0000');
            done();
        })['catch'](message => {
            fail(message);
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

            return imageEditor.changeShape(null, {
                type: 'triangle',
                widht: 200,
                fill: '#FF0000'
            });
        }).then(() => {
            fail();
            done();
        })['catch'](message => {
            expect(message).toBe('The object is not in canvas.');
            done();
        });
    });

    it('addImageObject() supports Promise', done => {
        const maskImageURL = 'base/test/fixtures/mask.png';
        imageEditor.addImageObject(maskImageURL).then(objectProps => {
            expect(canvas.getObjects().length).toBe(1);
            expect(objectProps.id).toBe(activeObjectId);
            done();
        })['catch'](message => {
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
        )['catch'](message => {
            fail(message);
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
            expect(canvas.getObjects().length).toBe(0);
            done();
        })['catch'](message => {
            fail(message);
            done();
        });
    });

    it('flipX() supports Promise', done => {
        imageEditor.flipX().then(obj => {
            expect(obj).toEqual({
                flipX: true,
                flipY: false,
                angle: 0
            });
            done();
        })['catch'](message => {
            fail(message);
            done();
        });
    });

    it('flipY() supports Promise', done => {
        imageEditor.flipY().then(obj => {
            expect(obj).toEqual({
                flipX: false,
                flipY: true,
                angle: 0
            });
            done();
        })['catch'](message => {
            fail(message);
            done();
        });
    });

    it('resetFlip() supports Promise', done => {
        imageEditor.resetFlip().then(obj => {
            expect(obj).toEqual({
                flipX: false,
                flipY: false,
                angle: 0
            });
            fail();
            done();
        })['catch'](message => {
            expect(message).toBe('The flipX and flipY setting values are not changed.');
            done();
        });
    });

    it('rotate() supports Promise', done => {
        imageEditor.rotate(10).then(angle => {
            expect(angle).toBe(10);
            done();
        })['catch'](message => {
            fail(message);
            done();
        });
    });

    it('setAngle() supports Promise', done => {
        imageEditor.setAngle(10).then(angle => {
            expect(angle).toBe(10);
            done();
        })['catch'](message => {
            fail(message);
            done();
        });
    });

    it('removeObject() supports Promise', done => {
        imageEditor.addShape('rect', {
            width: 100,
            height: 100
        }).then(objectProps =>
            imageEditor.removeObject(objectProps.id)
        ).then(() => {
            expect(canvas.getObjects().length).toBe(0);
            done();
        })['catch'](message => {
            fail(message);
            done();
        });
    });

    describe('Watermark', () => {
        const maskImageURL = 'base/test/fixtures/mask.png';
        const properties = {
            fill: 'rgba(255, 255, 0, 0.5)',
            left: 150,
            top: 30
        };

        beforeEach(done => {
            imageEditor.addImageObject(maskImageURL).then(() => {
                done();
            });
        });

        it('setObjectProperties() should change object\'s properties', done => {
            imageEditor.setObjectProperties(activeObjectId, properties).then(() => {
                done();
            })['catch'](message => {
                fail(message);
                done();
            });
        });

        it('getObjectProperties() should return object\'s properties', done => {
            imageEditor.setObjectProperties(activeObjectId, properties).then(() => {
                const propKeys = {
                    fill: null,
                    left: null,
                    top: null
                };
                const result = imageEditor.getObjectProperties(activeObjectId, propKeys);

                expect(result).not.toBe(null);
                expect(result).toEqual(jasmine.objectContaining({
                    fill: 'rgba(255, 255, 0, 0.5)',
                    left: 150,
                    top: 30
                }));
                done();
            })['catch'](message => {
                fail(message);
                done();
            });
        });

        it('getObjectProperties(objectKeys) should return false if there is no object', done => {
            imageEditor.setObjectProperties(activeObjectId, properties).then(() => {
                const propKeys = {
                    fill: null,
                    width: null,
                    left: null,
                    top: null,
                    height: null
                };

                imageEditor.deactivateAll();

                const result = imageEditor.getObjectProperties(null, propKeys);

                expect(result).toBe(null);
                done();
            })['catch'](message => {
                fail(message);
                done();
            });
        });

        it('getObjectProperties(arrayKeys) should return object\'s properties', done => {
            imageEditor.setObjectProperties(activeObjectId, properties).then(() => {
                const arrayKeys = [
                    'fill',
                    'width',
                    'left',
                    'top',
                    'height'
                ];
                const result = imageEditor.getObjectProperties(activeObjectId, arrayKeys);

                expect(result).not.toBe(null);
                expect(result).toEqual(jasmine.objectContaining(properties));
                done();
            })['catch'](message => {
                fail(message);
                done();
            });
        });

        it('getObjectProperties(stringKey) should return object\'s property', done => {
            imageEditor.setObjectProperties(activeObjectId, properties).then(() => {
                const result = imageEditor.getObjectProperties(activeObjectId, 'fill');

                expect(result).not.toBe(null);
                expect(result).toEqual(jasmine.objectContaining({
                    fill: 'rgba(255, 255, 0, 0.5)'
                }));
                done();
            })['catch'](message => {
                fail(message);
                done();
            });
        });

        it('getCanvasSize() should return canvas\'s width, height.', () => {
            expect(imageEditor.getCanvasSize()).toEqual(jasmine.objectContaining({
                width: 1600,
                height: 1066
            }));
        });

        it('getObjectPosition() should return global point by origin.', () => {
            // ImageEditor's object has origin('center', 'center').
            const {left, top, width, height} = imageEditor.getObjectProperties(activeObjectId,
                ['left', 'top', 'width', 'height']);
            const ltPoint = imageEditor.getObjectPosition(activeObjectId, 'left', 'top');
            const ccPoint = imageEditor.getObjectPosition(activeObjectId, 'center', 'center');
            const rbPoint = imageEditor.getObjectPosition(activeObjectId, 'right', 'bottom');

            expect(ltPoint.x).toBe(left - (width / 2));
            expect(ltPoint.y).toBe(top - (height / 2));
            expect(ccPoint.x).toBe(left);
            expect(ccPoint.y).toBe(top);
            expect(rbPoint.x).toBe(left + (width / 2));
            expect(rbPoint.y).toBe(top + (height / 2));
        });

        it('setObjectPosition() can set object position by origin', done => {
            imageEditor.setObjectProperties(activeObjectId, {
                width: 200,
                height: 100
            }).then(() =>
                imageEditor.setObjectPosition(activeObjectId, {
                    x: 0,
                    y: 0,
                    originX: 'left',
                    originY: 'top'
                })
            ).then(() => {
                const result = imageEditor.getObjectProperties(activeObjectId, ['left', 'top']);

                expect(result.left).toBe(100);
                expect(result.top).toBe(50);

                done();
            })['catch'](message => {
                fail(message);
                done();
            });
        });
    });
});
