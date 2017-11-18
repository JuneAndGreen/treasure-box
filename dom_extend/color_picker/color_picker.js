(function() {
    const noop = function() {};

    /**
     * 拆分事件
     */
    function splitEvent(eventString) {
        return eventString.split(/\s/).filter(item => !!item).map(item => {
            let arr = item.split('.');

            return {
                name: arr[0] || '',
                nameSpace: arr[1] || ''
            };
        });
    }

    /**
     * 监听事件
     */
    function addEvent(element, eventString, handler) {
        if (!handler) return;

        // 先拆分事件
        let eventList = splitEvent(eventString);

        element.eventCache = element.eventCache || {};
        let eventCache = element.eventCache;

        eventList.forEach(event => {
            if (event.name) {
                let nameSpace = event.nameSpace || '__DEFAULT__';

                element.addEventListener(event.name, handler);
                eventCache[nameSpace] = eventCache[nameSpace] || {};

                let handlerMap = eventCache[nameSpace];
                handlerMap[event.name] = handlerMap[event.name] || [];
                handlerMap[event.name].push(handler);
            }
        });
    }

    /**
     * 取消事件监听
     */
    function delEvent(element, eventString, handler) {
        // 先拆分事件
        let eventList = splitEvent(eventString);

        element.eventCache = element.eventCache || {};
        let eventCache = element.eventCache;

        eventList.forEach(event => {
            let nameSpace = event.nameSpace || '__DEFAULT__';
            let handlerMap = eventCache[nameSpace] || {};

            if (!event.name && event.nameSpace) {
                // 干掉命名空间下所有事件
                Object.keys(handlerMap).forEach(eventName => {
                    handlerMap[eventName].forEach(handler => {
                        element.removeEventListener(eventName, handler);
                    });

                    handlerMap[eventName] = [];
                });
            } else if (event.name && !event.nameSpace) {
                // 干掉所有命名空间下的该事件
                Object.keys(eventCache).forEach(nameSpace => {
                    let handlerMap = eventCache[nameSpace] || {};
                    if (handlerMap[event.name]) {
                        handlerMap[event.name].forEach(handler => {
                            element.removeEventListener(event.name, handler);
                        });

                        handlerMap[event.name] = [];
                    }
                });
            } else if (event.name && event.nameSpace) {
                // 干掉命名空间下的该事件
                if (handlerMap[event.name]) {
                    handlerMap[event.name].forEach(handler => {
                        element.removeEventListener(event.name, handler);
                    });

                    handlerMap[event.name] = [];
                }
            }
        });
    }

    class Colors {
        constructor(options = {}) {
            this.colors = {};
            this.options = Object.assign({
                color: 'rgba(0, 0, 0, 1)', // 初始颜色值
                grey: { r: 0.298954, g: 0.586434, b: 0.114612 }, // CIE-XYZ 1931，用于计算灰度色值
                luminance: { r: 0.2126, g: 0.7152, b: 0.0722 }, // W3C 2.0，用于计算亮度
                valueRanges: { // 值的范围
                    rgb:   { r: [0, 255], g: [0, 255], b: [0, 255] },
                    hsv:   { h: [0, 360], s: [0, 100], v: [0, 100] },
                    hsl:   { h: [0, 360], s: [0, 100], l: [0, 100] },
                },
                background: '#fff', // 背景色，用于计算混入后的亮度用
            }, options);

            this.init();
        }

        /**
         * 初始化
         */
        init() {
            // 初始化颜色
            this.options.background = this.toColor(this.options.background).rgb;
            this.setColor(this.options.color);
        }

        /**
         * 设置颜色
         * @param {String|Object} color 颜色，可传入"#FFF"|"rgb(0, 0, 0)"|"rgba(0, 0, 0, 0.5)"|"hsl(360, 0, 0)"|{ r: 255, g: 255, b: 255 }|{ h: 360, s: 100, v: 100 }|{ h: 360, s: 100, l: 100 }等值
         * @param {String}        type  颜色类型，当color字段传入为对象时生效，值可为"rgb"|"hsl"|"hsv"
         * @param {Number}        alpha 阿尔法通道
         */
        setColor(color, type, alpha) {
            let colors = this.colors

            if (typeof color === 'string') {
                // 颜色字符串需转成颜色对象
                color = this.toColor(color);
                type = color.type;
                colors[type] = color[type];

                alpha = alpha !== undefined ? alpha : color.alpha;
            } else if (color) {
                for (let n in color) {
                    colors[type][n] = this.limitValue(color[n], this.options.valueRanges[type][n][0], this.options.valueRanges[type][n][1]);
                }
            }

            if (alpha !== undefined) {
                colors.alpha = this.limitValue(+alpha, 0, 1);
            }

            this.convertColors(type);
        }

        /**
         * 输出当前颜色的字符串
         * @param {String} type 颜色类型，当color字段传入为对象时生效，值可为"rgb"|"rgba"|"hsl"|"hex"
         */
        toString(type = 'rgb') {
            type = type.toLowerCase();

            let colors = this.colors;
            let alpha = Math.round(colors.alpha * 100) / 100;

            let rgb = colors.rgb;
            let hsl = colors.hsl;

            let isHex = type === 'hex';
            let isRgb = type === 'rgb';
            let isRgba = type === 'rgba';

            let innerText = isRgb || isRgba ? `${Math.round(rgb.r)}, ${Math.round(rgb.g)}, ${Math.round(rgb.b)}` : isHex ? `#${colors.HEX}` : `${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%`;

            return isHex ? innerText : `${type}(${innerText}${isRgba ? ', ' + alpha : ''})`;
        }

        /**
         * 字符串转颜色对象
         */
        toColor(txt) {
            let color = {};
            let parts = txt.replace(/(?:#|\)|%)/g, '').split('(');
            let values = (parts[1] || '').split(/,\s*/);
            let type = parts[1] ? parts[0].substr(0, 3) : 'rgb';

            color.type = type;
            color[type] = {};

            if (parts[1]) {
                for (let n = 2; n >= 0; n--) {
                    let m = type[n];
                    color[type][m] = +values[n];
                }
            } else {
                color.rgb = this.HEX2rgb(parts[0]);
            }
            
            color.alpha = values[3] ? +values[3] : 1;

            return color;
        }

        /**
         * 转换颜色
         */
        convertColors(setType) {
            let colors = this.colors;
            let options = this.options;
            let ranges = this.options.valueRanges;

            for (var type in ranges) {
                if (setType !== type) {
                    // 计算其他类型的颜色模型
                    colors[type] = this[setType + '2' + type](colors[setType]);
                }
            }

            // 色调的rgb模型
            colors.hueRGB = this.hue2rgb(colors.hsv.h);

            // 16进制
            colors.HEX = this.rgb2HEX(colors.rgb);

            // 灰度
            colors.equivalentGrey = options.grey.r * colors.rgb.r + options.grey.g * colors.rgb.g + options.grey.b * colors.rgb.b;

            // 混淆背景后的颜色
            colors.rgbaMixBackground = this.mixColors(colors.rgb, options.background, colors.alpha, 1);
            colors.rgbaMixBackground.luminance = this.getLuminance(colors.rgbaMixBackground);

            // rgb亮度
            colors.RGBLuminance = this.getLuminance(colors.rgb);

            // 色调亮度
            colors.HUELuminance = this.getLuminance(colors.hueRGB);
        }

        /**
         * rgb转16进制
         */
        rgb2HEX(rgb) {
            let r = Math.round(rgb.r);
            let g = Math.round(rgb.g);
            let b = Math.round(rgb.b);

            let hexString = (r < 16 ? '0' : '') + r.toString(16) + (g < 16 ? '0' : '') + g.toString(16) + (b < 16 ? '0' : '') + b.toString(16)

            return hexString.toUpperCase()
        }

        /**
         * 16进制转rgb
         */
        HEX2rgb(HEX) {
            return {
                r: +('0x' + HEX[0] + HEX[HEX[3] ? 1 : 0]),
                g: +('0x' + HEX[HEX[3] ? 2 : 1] + (HEX[3] || HEX[1])),
                b: +('0x' + (HEX[4] || HEX[2]) + (HEX[5] || HEX[2]))
            };
        }

        /**
         * 色调转rgb
         */
        hue2rgb(hue) {
            let h = hue / 60;
            let mod = ~~h % 6;
            let i = h === 6 ? 0 : (h - mod);

            return {
                r: Math.round([1, 1 - i, 0, 0, i, 1][mod] * 255),
                g: Math.round([i, 1, 1, 1 - i, 0, 0][mod] * 255),
                b: Math.round([0, 0, i, 1, 1, 1 - i][mod] * 255)
            };
        }

        /**
         * rgb转hsv
         */
        rgb2hsv(rgb) {
            let r = rgb.r;
            let g = rgb.g;
            let b = rgb.b;

            let k = 0;

            if (g < b) {
                g = b + (b = g, 0);
                k = -360;
            }

            let min = b;
            if (r < g) {
                r = g + (g = r, 0);
                k = -120 - k;
                min = Math.min(g, b);
            }

            let chroma = r - min;
            let s = r ? (chroma / r) : 0;

            return {
                h: s < 1e-15 ? 0 : chroma ? Math.abs(k + (g - b) * 60 / chroma) : 0,
                s: r ? (chroma / r) * 100 : 0,
                v: r / 255 * 100
            };
        }

        /**
         * hsv转rgb
         */
        hsv2rgb(hsv) {
            let h = hsv.h / 60;
            let s = hsv.s / 100;
            let v = hsv.v / 100;

            let i = ~~h;
            let f = h - i;
            let mod = i % 6;

            let p = v * (1 - s);
            let q = v * (1 - f * s);
            let t = v * (1 - (1 - f) * s);

            return {
                r: [v, q, p, p, t, v][mod] * 255,
                g: [t, v, v, q, p, p][mod] * 255,
                b: [p, p, t, v, v, q][mod] * 255
            };
        }

        /**
         * hsv转hsl
         */
        hsv2hsl(hsv) {
            let l = (200 - hsv.s) * hsv.v / 100;
            let s = hsv.s * hsv.v;

            s = !hsv.s ? 0 : l >= 100 ? s / (200 - l) : l ? s / l : 0;

            return {
                h: hsv.h,
                s: !hsv.v && !s ? 0 : s,
                l: l / 2
            };
        }

        /**
         * hsl转hsv
         */
        hsl2hsv(hsl) {
            let rgb = this.hsl2rgb(hsl);

            return this.rgb2hsv(rgb);
        }

        /**
         * rgb转hsl
         */
        rgb2hsl(rgb) {
            let hsv = this.rgb2hsv(rgb);

            return this.hsv2hsl(hsv);
        }

        /**
         * hsl转rgb
         */
        hsl2rgb(hsl) {
            let h = hsl.h / 60;
            let s = hsl.s / 100;
            let l = hsl.l / 100;

            let v = l < 0.5 ? l * (1 + s) : (l + s) - (s * l);
            let m = l + l - v;
            
            let sv = v ? ((v - m) / v) : 0;
            let sextant = ~~h;
            let fract = h - sextant;
            let vsf = v * sv * fract;
            let mod = sextant % 6;
            
            let t = m + vsf;
            let q = v - vsf;

            return {
                r: [v, q, m, m, t, v][mod] * 255,
                g: [t, v, v, q, m, m][mod] * 255,
                b: [m, m, t, v, v, q][mod] * 255
            };
        }

        /**
         * 获取亮度
         */
        getLuminance(rgb) {
            rgb = [rgb.r / 255, rgb.g / 255, rgb.b / 255];
            let luminance = this.options.luminance;

            for (let i = 0; i <= 3; i++) {
                rgb[i] = rgb[i] <= 0.03928 ? rgb[i] / 12.92 : Math.pow(((rgb[i] + 0.055) / 1.055), 2.4);
            }

            return ((luminance.r * rgb[0]) + (luminance.g * rgb[1]) + (luminance.b * rgb[2]));
        }

        /**
         * 混入颜色
         */
        mixColors(topColor, bottomColor, topAlpha = 1, bottomAlpha = 1) {
            let newColor = {};
            let alpha = 1 - (1 - topAlpha) * (1 - bottomAlpha);

            for (let n in topColor) {
                newColor[n] = (topColor[n] * topAlpha + bottomColor[n] * bottomAlpha * (1 - topAlpha)) / alpha;
            }

            newColor.a = alpha;
            return newColor;
        }

        /**
         * 调校值的范围
         */
        limitValue(value, min, max) {
            return value > max ? max : value < min ? min : value;
        }
    }

    class ColorPicker {
        constructor(element, options) {
            this.element = element; // 盛放拾色器容器

            this.options = Object.assign({
                onChange: noop, // 颜色选择变化
            }, options);

            this.color = new Colors(this.options);

            this.build();
            this.init();
            this.render();
        }

        /**
         * 渲染
         */
        render() {
            let colors = this.color.colors;

            let hueRGB = colors.hueRGB;
            let h = (1 - colors.hsv.h / 360) * this.zWidth;
            let s = colors.hsv.s / 100 * this.xyWidth;
            let v = (1 - colors.hsv.v / 100) * this.xyHeight;
            let a = colors.alpha * this.aWidth;

            this.xySliderNode.style.backgroundColor = `rgb(${hueRGB.r}, ${hueRGB.g}, ${hueRGB.b})`;

            this.xyCursorNode.style.left = s + 'px';
            this.xyCursorNode.style.top = v + 'px';
            this.xyCursorNode.style.borderColor = colors.RGBLuminance > 0.22 ? '#222' : '#ddd'; // 光标需要判断明暗

            this.zCursorNode.style.left = h + 'px';
            this.zCursorNode.style.borderColor = `${colors.HUELuminance > 0.22 ? '#222' : '#ddd'} transparent`; // 光标需要判断明暗

            this.alphaNode.style.background = `linear-gradient(to right, rgba(0, 0, 0, 0), #${colors.HEX})`;

            this.alphaCursorNode.style.left = a + 'px';
            this.alphaCursorNode.style.borderColor = `${colors.rgbaMixBackground.luminance > 0.22 ? '#222' : '#ddd'} transparent`; // 光标需要判断明暗
        }

        /**
         * 初始化
         */
        init() {
            // 监听事件
            addEvent(this.xySliderNode, 'touchstart.cp mousedown.cp', this.onPointdown.bind(this, 'xy', true));
            addEvent(this.zSliderNode, 'touchstart.cp mousedown.cp', this.onPointdown.bind(this, 'z', true));
            addEvent(this.alphaNode, 'touchstart.cp mousedown.cp', this.onPointdown.bind(this, 'a', true));

            // 预处理节点
            this.xyWidth = this.xySliderNode.clientWidth;
            this.xyHeight = this.xySliderNode.clientHeight;
            this.zWidth = this.zSliderNode.clientWidth;
            this.aWidth = this.alphaNode.clientWidth;
        }

        /**
         * 点击色板
         */
        onPointdown(action, needAddEvent, evt) {
            evt.preventDefault();

            evt = evt.touches ? evt.touches[0] : evt;

            if (action === 'xy') {
                // 点击xy色板
                let { left, top } = this.xySliderNode.getBoundingClientRect();
                let x = evt.pageX - left;
                let y = evt.pageY - top;

                this.setColor({
                    s: x / this.xyWidth * 100,
                    v: 100 - (y / this.xyHeight * 100)
                }, 'hsv');
            } else if (action === 'z') {
                // 点击z色板
                let { left } = this.zSliderNode.getBoundingClientRect();
                let z = evt.pageX - left;

                this.setColor({
                    h: 360 - (z / this.zWidth * 360)
                }, 'hsv');
            } else if (action === 'a') {
                // 点击alpha色板
                let { left } = this.alphaNode.getBoundingClientRect();
                let alpha = (evt.pageX - left) / this.aWidth;

                this.setAlpha(alpha);
            }

            if (needAddEvent) {
                // 监听事件
                addEvent(document, 'touchend.cp mouseup.cp', evt => {
                    delEvent(document, '.cp');
                });
                addEvent(document, 'touchmove.cp mousemove.cp', evt => {
                    this.onPointdown(action, false, evt);
                });
            }
        }

        /**
         * 设置颜色
         */
        setColor(color, type) {
            this.color.setColor(color, type);

            this.render();

            // 触发变化句柄
            this.options.onChange(this.getColor());
        }

        /**
         * 设置alpha值
         */
        setAlpha(alpha) {
            this.color.setColor({}, 'rgb', alpha);

            this.render();

            // 触发变化句柄
            this.options.onChange(this.getColor());
        }

        /**
         * 获取当前颜色
         */
        getColor() {
            return {
                rgb: this.color.toString('rgb'),
                rgba: this.color.toString('rgba'),
                hex: this.color.toString('hex'),
                hsl: this.color.toString('hsl'),
                color: {
                    rgb: {
                        r: Math.round(this.color.colors.rgb.r),
                        g: Math.round(this.color.colors.rgb.g),
                        b: Math.round(this.color.colors.rgb.b),
                    },
                    hsl: {
                        h: Math.round(this.color.colors.hsl.h),
                        s: Math.round(this.color.colors.hsl.s),
                        l: Math.round(this.color.colors.hsl.l),
                    },
                    alpha: this.color.colors.alpha
                }
            };
        }

        /**
         * 构建html结构
         */
        build() {
            // 插入样式
            let style = document.createElement('style');
            style.type = 'text/css';
            style.innerHTML = `
                .cp-color-picker {
                    cursor: default;
                    border-radius: 5px;
                }
                .cp-xy-slider {
                    position: relative;
                    height: 200px;
                    width: 200px;
                    background: linear-gradient(to right, #FFF, rgba(255, 255, 255, 0));
                    overflow: hidden;
                }
                .cp-white {
                    height: 100%;
                    width: 100%;
                    background: linear-gradient(rgba(0, 0, 0, 0), #000);
                }
                .cp-xy-cursor {
                    position: absolute;
                    top: 0;
                    width: 10px;
                    height: 10px;
                    margin: -5px;
                    border: 1px solid #fff;
                    border-radius: 100%;
                    box-sizing: border-box;
                }
                .cp-z-slider {
                    position: relative;
                    margin-top: 10px;
                    width: 200px;
                    height: 30px;
                    background: linear-gradient(to right, red 0, #f0f 17%, #00f 33%, #0ff 50%, #0f0 67%, #ff0 83%, red 100%);
                    overflow: hidden;
                }
                .cp-alpha {
                    position: relative;
                    margin-top: 10px;
                    width: 200px;
                    height: 30px;
                    overflow: hidden;
                }
                .cp-z-cursor, .cp-alpha-cursor {
                    position: absolute;
                    margin-left: -4px;
                    height: 100%;
                    border: 4px solid #fff;
                    border-color: #fff transparent;
                    box-sizing: border-box;
                }
            `;

            document.querySelector('head').appendChild(style);
            this.style = style;

            // 插入节点
            let container = document.createElement('div');
            container.className = 'cp-color-picker';

            container.innerHTML = `
                <div class="cp-xy-slider">
                    <div class="cp-white"></div>
                    <div class="cp-xy-cursor"></div>
                </div>
                <div class="cp-z-slider">
                    <div class="cp-z-cursor"></div>
                </div>
                <div class="cp-alpha">
                    <div class="cp-alpha-cursor"></div>
                </div>
            `;

            this.element.appendChild(container);

            this.xySliderNode = container.querySelector('.cp-xy-slider');
            this.xyCursorNode = container.querySelector('.cp-xy-cursor');
            this.zSliderNode =  container.querySelector('.cp-z-slider');
            this.zCursorNode = container.querySelector('.cp-z-cursor');
            this.alphaNode = container.querySelector('.cp-alpha');
            this.alphaCursorNode = container.querySelector('.cp-alpha-cursor');
        }
    }

    if (typeof module !== 'undefined' && typeof exports === 'object') {
        module.exports = ColorPicker;
    } else {
        window.ColorPicker = ColorPicker;
    }
})();
