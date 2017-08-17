(function () {
    /**
     * 事件操作
     */
    function addEvent(element, event, handler) {
        element.addEventListener(event, handler, false);
    }
    function delEvent(element, event, handler) {
        element.removeEventListener(event, handler, false);
    }

    /**
     * 线性插值
     */
    function ease(x) {
        return Math.sqrt(1 - Math.pow(x - 1, 2));
    }
    function reverseEase(y) {
        return 1 - Math.sqrt(1 - y * y);
    }

    /**
     * 兼容raf函数
     */
    let vendors = ['webkit', 'moz'];
    for (let i = 0; i < vendors.length && !window.requestAnimationFrame; i++) {
        let vp = vendors[i];
        window.requestAnimationFrame = window[vp + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vp + 'CancelAnimationFrame'] || window[vp + 'CancelRequestAnimationFrame'];
    }
    if (/iP(ad|hone|od).*OS 6/.test(window.navigator.userAgent) || !window.requestAnimationFrame || !window.cancelAnimationFrame) {
        // iOS6 bug兼容
        let lastTime = 0;
        window.requestAnimationFrame = function(callback) {
            let now = Date.now();
            let nextTime = Math.max(lastTime + 16, now);
            return setTimeout(function() { 
                callback(lastTime = nextTime);
            }, nextTime - now);
        };
        window.cancelAnimationFrame = clearTimeout;
    }

    function noop() {};

    class Swiper {
        constructor(element, options = {}) {
            this.element = element;

            this.max = options.max === undefined ? 100 : options.max;
            this.min = options.min === undefined ? 0 : options.min;
            this.init = options.init === undefined ? 0 : options.init;
            this.direction = options.direction || 'v';

            this.onChange = (options.onChange || noop).bind(this);
            this.onEnd = (options.onEnd || noop).bind(this);

            this.touchProp = this.direction === 'v' ? 'pageY' : 'pageX';
            this.transformProp = this.direction === 'v' ? 'translateY' : 'translateX';
            this.start = null;
            this.pre = null;
            this.tickID = null;
            this.isTouchStart = false;

            this.onTouchstart = this.onTouchstart.bind(this);
            this.onTouchend = this.onTouchend.bind(this);
            this.onTouchcancel = this.onTouchcancel.bind(this);
            this.onTouchmove = this.onTouchmove.bind(this);

            addEvent(element, 'touchstart', this.onTouchstart);
            addEvent(element, 'touchend', this.onTouchend);
            addEvent(element, 'touchcancel', this.onTouchcancel);
            addEvent(element, 'touchmove', this.onTouchmove);
        }

        /**
         * 触摸事件
         */
        onTouchstart(evt) {
            this.isTouchStart = true;
            this.start = this.pre = evt.touches[0][this.touchProp];

            window.cancelAnimationFrame(this.tickID);
        }

        /**
         * 触摸事件
         */
        onTouchmove(evt) {
            if (this.isTouchStart) {
                let len = evt.touches.length;
                let current = evt.touches[0][this.touchProp];

                let d = current - this.pre;
                this.pre = current;

                let f = 1;
                let translate = this.getTranslate();
                if ((translate > this.max && d > 0) || (translate < this.min && d < 0)) {
                    f = 0.3;
                }
                d *= f;

                let newTranslate = translate + d;

                if (newTranslate <= this.max && newTranslate >= this.min) {
                    evt.preventDefault();
                    this.setTranslate(newTranslate);

                    this.onChange(newTranslate);
                }
            }
        }

        /**
         * 触摸事件
         */
        onTouchend(evt) {
            if (this.isTouchStart) {
                this.isTouchStart = false;

                let current = this.getTranslate();
                let triggerTap = Math.abs(evt.changedTouches[0].pageX - this.start) < 30;

                this.onEnd(evt, current);
            }

            this.start = null;
        }

        /**
         * 触摸事件
         */
        onTouchcancel(evt) {
            this.onTouchend(evt);
        }

        /**
         * 移动
         */
        recover(value) {
            value = value === undefined ? this.max : value

            let current = this.getTranslate();
            let dv = value - current;
            let beginTime = new Date();

            let toTick = () => {
                let dt = new Date() - beginTime;
                if (dt >= 200) {
                    this.setTranslate(value);
                    this.onChange(value);
                } else {
                    this.setTranslate(dv * ease(dt / 200) + current);
                    this.tickID = window.requestAnimationFrame(toTick);
                    
                    this.onChange(this.getTranslate());
                }
            };
            toTick();
        }

        /**
         * 获取偏移值
         */
        getTranslate() {
            let element = this.element;

            let value = element.style.webkitTransform || element.style.transform || '';
            return parseInt(value.substr(11, value.length - 14), 10) || this.init;
        }

        /**
         * 设置偏移值
         */
        setTranslate(value) {
            let element = this.element;
            let prop = this.transformProp;

            element.style.transform = `${prop}(${value}px)`;
            element.style.webkitTransform = `${prop}(${value}px)`;
        }

        destroy() {
            this.max = this.min = this.init = this.direction = this.onChange = this.onEnd = this.onTouchstart = this.onTouchend = this.onTouchcancel = this.onTouchmove = undefined;

            this.touchProp = this.transformProp = this.start = this.pre = this.tickID = this.isTouchStart = undefined;

            delEvent(element, 'touchstart', this.onTouchstart);
            delEvent(element, 'touchend', this.onTouchend);
            delEvent(element, 'touchcancel', this.onTouchcancel);
            delEvent(element, 'touchmove', this.onTouchmove);

            this.element = undefined;

            return;
        }
    }

    if (typeof module !== 'undefined' && typeof exports === 'object') {
        module.exports = Swiper;
    } else {
        window.Swiper = Swiper;
    }
})();
