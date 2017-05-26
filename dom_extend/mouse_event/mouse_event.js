(function () {
    function addEvent(elem, event, handler) {
        elem.addEventListener(event, handler, false);
    }

    function delEvent(elem, event, handler) {
        elem.removeEventListener(event, handler, false);
    }

    function noop() {};

    class HandlerAdmin {
        constructor(element) {
            this.handlers = [];
            this.element = element;
        }

        add(handler) {
            this.handlers.push(handler);
        }

        del(handler) {
            if (!handler) this.handlers = [];

            for (let i = this.handlers.length; i >= 0; i--) {
                if (this.handlers[i] === handler) {
                    this.handlers.splice(i, 1);
                }
            }
        }

        dispatch() {
            for (let i = 0, len = this.handlers.length; i < len; i++) {
                let handler = this.handlers[i];
                if (typeof handler === 'function') handler.apply(this.element, arguments);
            }
        }

        static getInstance(element, handler) {
            let handlerAdmin = new HandlerAdmin(element);
            handlerAdmin.add(handler);

            return handlerAdmin;
        }
    }

    class MouseEvent {
        constructor(element, options = {}) {
            this.element = element;
            this.mouseDownPosition = {};

            this.dblclickInterval = options.dblclickInterval || 300; // 双击间隔判断
            this.longclickDuration = options.longclickDuration || 500; // 长点击时间判断

            this.onClick = this.onClick.bind(this);
            this.onMouseDown = this.onMouseDown.bind(this);
            this.onMouseUp = this.onMouseUp.bind(this);
            this.onMouseMove = this.onMouseMove.bind(this);
            this.onWindowMouseUp = this.onWindowMouseUp.bind(this);
            this.onWindowMouseMove = this.onWindowMouseMove.bind(this);

            this.onMouseEnter = this.onMouseEnter.bind(this);
            this.onMouseLeave = this.onMouseLeave.bind(this);
            this.onMouseOver = this.onMouseOver.bind(this);

            addEvent(this.element, 'click', this.onClick);
            addEvent(this.element, 'mousedown', this.onMouseDown);
            addEvent(this.element, 'mouseup', this.onMouseUp);
            addEvent(this.element, 'mousemove', this.onMouseMove);
            addEvent(this.element, 'mouseenter', this.onMouseEnter);
            addEvent(this.element, 'mouseleave', this.onMouseLeave);
            addEvent(this.element, 'mouseover', this.onMouseOver);

            this.click = HandlerAdmin.getInstance(this.element, options.click || noop);
            this.mousedown = HandlerAdmin.getInstance(this.element, options.mousedown || noop);
            this.mouseup = HandlerAdmin.getInstance(this.element, options.mouseup || noop);
            this.mousemove = HandlerAdmin.getInstance(this.element, options.mousemove || noop);
            this.mouseenter = HandlerAdmin.getInstance(this.element, options.mouseenter || noop);
            this.mouseleave = HandlerAdmin.getInstance(this.element, options.mouseleave || noop);
            this.mouseover = HandlerAdmin.getInstance(this.element, options.mouseover || noop);

            this.dblclick = HandlerAdmin.getInstance(this.element, options.dblclick || noop);
            this.drag = HandlerAdmin.getInstance(this.element, options.drag || noop);
            this.longclick = HandlerAdmin.getInstance(this.element, options.longclick || noop);
            this.longclickstart = HandlerAdmin.getInstance(this.element, options.longclickstart || noop);
            this.swipe = HandlerAdmin.getInstance(this.element, options.swipe || noop);
        }

        onClick(evt) {
            let nowStamp = +new Date();

            if (this.lastClickStamp && nowStamp - this.lastClickStamp <= this.dblclickInterval) {
                // 触发双击
                this.lastClickStamp = undefined;
                this.dblclick.dispatch({ source: this.element, evt });
            } else {
                // 触发单击
                this.lastClickStamp = nowStamp;
                this.click.dispatch({ source: this.element, evt });
            }
        }

        onMouseDown(evt) {
            this.mousedown.dispatch({ source: this.element, evt });

            // 记录鼠标按下位置
            this.mouseDownPosition = {
                x: evt.clientX,
                y: evt.clientY
            };

            this.isMouseDown = true;
            this.mouseDownStamp = +new Date();

            addEvent(window, 'mouseup', this.onWindowMouseUp);
            addEvent(window, 'mousemove', this.onWindowMouseMove);

            this._timer = setTimeout(() => {
                if (this.isMouseDown) this.longclickstart.dispatch({ source: this.element, evt });
            }, 500);
        }

        onMouseUp(evt) {
            this.mouseup.dispatch({ source: this.element, evt });

            let nowStamp = +new Date()
            if (this.mouseDownStamp && nowStamp - this.mouseDownStamp > this.longclickDuration) {
                // 触发长按
                this.longclick.dispatch({ source: this.element, evt });
            }

            if (this.mouseDownStamp && nowStamp - this.mouseDownStamp < 200) {
                // 触发划动
                let { x, y } = this.mouseDownPosition;
                let x2 = evt.clientX;
                let y2 = evt.clientY;

                if (Math.abs(x - x2) > 30 || Math.abs(y - y2) > 30) {
                    let direction = Math.abs(x - x2) >= Math.abs(y - y2) ? (x - x2 > 0 ? 'left' : 'right') : (y - y2 > 0 ? 'up' : 'down');
                    this.swipe.dispatch({ source: this.element, evt, direction });
                }
            }

            this.mouseDownStamp = undefined;
        }

        onMouseMove(evt) {
            this.mousemove.dispatch({ source: this.element, evt });
        }

        onWindowMouseUp(evt) {
            this.isMouseDown = false;
            this.mouseDownStamp = undefined;

            delEvent(window, 'mouseup', this.onWindowMouseUp);
            delEvent(window, 'mousemove', this.onWindowMouseMove);

            if (this._timer) this._timer = clearTimeout(this._timer);
        }

        onWindowMouseMove(evt) {
            if (this.isMouseDown) {
                // 触发拖拽
                let nowX = evt.clientX;
                let nowY = evt.clientY;

                let { x, y } = this.lastDragPosition || this.mouseDownPosition;

                this.drag.dispatch({ source: this.element, evt, dragX: nowX - x, dragY: nowY - y });

                // 记录鼠标当前位置
                this.lastDragPosition = {
                    x: nowX,
                    y: nowY
                };
            }
        }

        onMouseEnter(evt) {
            this.mouseenter.dispatch({ source: this.element, evt });
        }

        onMouseLeave(evt) {
            this.mouseleave.dispatch({ source: this.element, evt });
        }

        onMouseOver(evt) {
            this.mouseover.dispatch({ source: this.element, evt });
        }

        on(evt, handler) {
            if (this[evt]) {
                this[evt].add(handler);
            }
        }

        off(evt, handler) {
            if (this[evt]) {
                this[evt].del(handler);
            }
        }

        destroy() {
            delEvent(this.element, 'click', this.onClick);
            delEvent(this.element, 'mousedown', this.onMouseDown);
            delEvent(this.element, 'mouseup', this.onMouseUp);
            delEvent(this.element, 'mousemove', this.onMouseMove);
            delEvent(this.element, 'mouseenter', this.onMouseEnter);
            delEvent(this.element, 'mouseleave', this.onMouseLeave);
            delEvent(this.element, 'mouseover', this.onMouseOver);

            delEvent(window, 'mouseup', this.onWindowMouseUp);
            delEvent(window, 'mousemove', this.onWindowMouseMove);

            this.element = undefined;

            this.click = this.mousedown = this.mouseup = this.mousemove = this.mouseenter = this.mouseleave = this.mouseover =  this.dblclick = this.drag = this.longclick = this.swipe = this.longclickstart = undefined;

            return;
        }
    }

    if (typeof module !== 'undefined' && typeof exports === 'object') {
        module.exports = MouseEvent;
    } else {
        window.MouseEvent = MouseEvent;
    }
})();
