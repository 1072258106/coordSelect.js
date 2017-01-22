function coordSelect() {
    /* jshint validthis: true */
    'use strict';

    var canvasStorage = {};

    var defaultStyle = {
        border: '2px dashed #dd4e26',
        backgroundColor: 'rgba(221, 78, 37, 0.06)'
    };

    function Canvas(canvas, output, style) {
        var prop;

        this.canvas = canvas;
        this.output = output;

        this.id = generateId();
        this.style = generateStyle(style);

        this.initCanvas = function () {
            this.canvas.style.cssText = 'position: relative; cursor: crosshair;';
            this.canvas.setAttribute('data-id', this.id);
            this.canvas.setAttribute('data-sizing', 'false');
        };

        this.initBox = function () {
            addDrawEvents(this.canvas);
        };

        this.getId = function () {
            return this.id;
        };
    }

    var lib = {
        create: function (canvas, output, style) {
            var target;

            if (!canvas || typeof canvas !== 'string') {
                throw new Error('Canvas selector must be a string.');
            }

            target = [].slice.call(document.querySelectorAll(canvas));

            if (!target.length) {
                throw new Error('No element found matching: \'' + canvas + '\'');
            }

            target.forEach(function (el) {
                var canvas = new Canvas(el, output, style);

                canvas.initCanvas();
                canvas.initBox();

                canvasStorage[canvas.getId()] = canvas;
            });
        }
    };

    function addDrawEvents(el) {
        el.addEventListener('mousedown', createBox.bind(el), false);
        el.addEventListener('mousemove', sizeBox.bind(el), false);
        el.addEventListener('mouseup', calculateCoords.bind(el), false);
    }

    function createBox(e) {
        var lastBox = getBox(this);

        if (lastBox) {
            this.removeChild(lastBox);
        }

        var box = document.createElement('div');
        var boxTop = e.pageY - this.offsetTop;
        var boxLeft = e.pageX - this.offsetLeft;
        var style = canvasStorage[this.getAttribute('data-id')].style;

        box.style.cssText = assembleStyles(boxTop, boxLeft, style);
        box.id = this.getAttribute('data-id');

        this.appendChild(box);

        this.setAttribute('data-sizing', 'true');
        box.setAttribute('data-x', (box.style.left).replace('px', ''));
        box.setAttribute('data-y', (box.style.top).replace('px', ''));
    }

    function sizeBox(e) {
        if (this.getAttribute('data-sizing') === 'true') {
            var box = getBox(this);
            var startTop = box.getAttribute('data-y');
            var startLeft = box.getAttribute('data-x');
            var height = e.pageY - this.offsetTop - startTop;
            var width = e.pageX - this.offsetLeft - startLeft;

            if (height < 0) {
                box.style.top = '';
                box.style.bottom = (this.offsetHeight - startTop) + 'px';
                box.style.height = Math.abs(height) + 'px';
            } else {
                box.style.top = startTop + 'px';
                box.style.bottom = '';
                box.style.height = height + 'px';
            }

            if (width < 0) {
                box.style.left = '';
                box.style.right = (this.offsetWidth - startLeft) + 'px';
                box.style.width = Math.abs(width) + 'px';
            } else {
                box.style.left = startLeft + 'px';
                box.style.right = '';
                box.style.width = width + 'px';
            }
        }
    }

    function calculateCoords(e) {
        var canvasObj = canvasStorage[this.getAttribute('data-id')];
        var canvas = canvasObj.canvas;
        var output = canvasObj.output;
        var box = getBox(canvas);
        var originalX = parseInt(box.getAttribute('data-x'), 10);
        var originalY = parseInt(box.getAttribute('data-y'), 10);
        var selectWidth, selectHeight, selectTL, selectBR;

        if (typeof output === 'object') {
            selectWidth = pxToInt(box.style.width);
            selectHeight = pxToInt(box.style.height);
            selectTL = [box.offsetTop, box.offsetLeft];
            selectBR = [selectTL[0] + selectWidth, selectTL[1] + selectHeight];

            document.getElementById(output.selectTL).value = selectTL;
            document.getElementById(output.selectBR).value = selectBR;
            document.getElementById(output.selectWidth).value = selectWidth;
            document.getElementById(output.selectHeight).value = selectHeight;
        }

        function pxToInt(number) {
            return parseInt(number.replace('px', ''), 10);
        }

        canvas.setAttribute('data-sizing', 'false');
    }

    function assembleStyles(boxTop, boxLeft, styleObj) {
        var style = 'top: ' + boxTop + 'px; left: ' + boxLeft + 'px; ';

        for (var prop in styleObj) {
            style += prop + ': ' + styleObj[prop] + '; ';
        }

        return style;
    }

    function generateStyle(customStyle) {
        var prop;

        var style = {
            position: 'absolute'
        };

        if (typeof customStyle === 'object') {
            for (prop in customStyle) {
                style[cleanProp(prop)] = customStyle[prop];
            }
        } else {
            for (prop in defaultStyle) {
                style[cleanProp(prop)] = defaultStyle[prop];
            }
        }

        function cleanProp(prop) {
            return prop.replace(/([A-Z])/g, '-$1').toLowerCase();
        }

        return style;
    }

    function generateId() {
        var i, random;
        var uuid = '';

        for (i = 0; i < 32; i++) {
            random = Math.random() * 16 | 0;
            if (i === 8 || i === 12 || i === 16 || i === 20) {
                uuid += '-';
            }
            uuid += (i === 12 ? 4 : (i === 16 ? (random & 3 | 8) : random)).toString(16);
        }

        return uuid;
    }

    function getBox(el) {
        var id = el.getAttribute('data-id');
        return document.getElementById(id);
    }

    return lib;
}

(function exposeAPI(root, lib) {

    if (typeof exports === 'object') {
        module.exports = lib();
    } else {
        root.coordSelect = lib();
    }

})(this, coordSelect);
