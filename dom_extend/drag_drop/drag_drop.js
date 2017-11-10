(function () {
    window.droppables = window.droppables || [];

    const noop = () => {};
    const getComputedStyle = (element, property) => {
        let computedStyle = element.currentStyle || window.getComputedStyle(element, null);
        return property ? computedStyle[property] : computedStyle;
    }

    /**
     * 获取相对于浏览器窗口的绝对位置
     */
    const getPosition = (element) => {
        let doc = element && element.ownerDocument;

        let box = element.getBoundingClientRect ? element.getBoundingClientRect() : { left: 0, top: 0 };

        let docElem = doc.documentElement;
        let body = doc.body;
        let clientLeft = docElem.clientLeft || body.clientLeft || 0;
        let clientTop = docElem.clientTop || body.clientTop || 0;

        return { left: box.left - clientLeft, top: box.top - clientTop };
    }

    /**
     * 获取元素大小
     */
    const getSize = (element) => {
        return { width: element.offsetWidth, height: element.offsetHeight };
    }

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

    class Drop {
        constructor(element, options) {
            window.droppables.push(this);

            this.element = element;
            this.name = options.name || '';

            this.dragenter = HandlerAdmin.getInstance(this.element, options.dragenter || noop);
            this.dragleave = HandlerAdmin.getInstance(this.element, options.dragleave || noop);
            this.dragover = HandlerAdmin.getInstance(this.element, options.dragover || noop);
            this.drop = HandlerAdmin.getInstance(this.element, options.drop || noop);
        }

        dispatchDragEnter(obj = {}) {
            obj.target = this.element;
            this.dragenter.dispatch(obj);
        }

        dispatchDragLeave(obj = {}) {
            obj.target = this.element;
            this.dragleave.dispatch(obj);
        }

        dispatchDragOver(obj = {}) {
            let position = getPosition(this.element);
            let evt = obj.evt;

            obj.offsetX = evt.clientX - position.left;
            obj.offsetY = evt.clientY - position.top;

            obj.target = this.element;
            this.dragover.dispatch(obj);
        }

        dispatchDrop(obj = {}) {
            obj.target = this.element;
            this.drop.dispatch(obj);
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

        setProperty(prop, value) {
            this[prop] = value;
        }

        destroy() {
            window.droppables.splice(window.droppables.indexOf(this), 1);
        }
    }

    class Drag {
        constructor(element, options) {
            this.element = element;
            this.name = options.name || '';

            this.dragFlag = true;
            this.dragging = false;
            this.proxyNode = undefined;
            this.startX = 0;
            this.startY = 0;
            this.dragX = 0;
            this.dragY = 0;
            this.startLeft = 0;
            this.startTop = 0;
            this.droppable = undefined;
            this.proxy = options.proxy || 'clone';
            this.proxyClass = options.proxyClass || 'proxy-element';
            this.direction = options.direction || '';
            this.interval = options.interval || 200;

            this.dragstart = HandlerAdmin.getInstance(this.element, options.dragstart || noop);
            this.drag = HandlerAdmin.getInstance(this.element, options.drag || noop);
            this.dragend = HandlerAdmin.getInstance(this.element, options.dragend || noop);
            this.click = HandlerAdmin.getInstance(this.element, options.click || noop);
            this.dblclick = HandlerAdmin.getInstance(this.element, options.dblclick || noop);
            this.mousedown = HandlerAdmin.getInstance(this.element, options.mousedown || noop);
            this.mousemove = HandlerAdmin.getInstance(this.element, options.mousemove || noop);
            this.mouseup = HandlerAdmin.getInstance(this.element, options.mouseup || noop);

            this.onMouseDown = this.onMouseDown.bind(this);
            this.onMouseMove = this.onMouseMove.bind(this);
            this.onMouseUp = this.onMouseUp.bind(this);
            this.cancel = this.cancel.bind(this);

            this.element.addEventListener('mousedown', this.onMouseDown);
        }

        /**
         * 获取拖拽中的代理元素
         */
        getProxy() {
            let proxy;
            let source = this.element;

            if (typeof this.proxy === 'function') proxy = this.proxy();
            else if (this.proxy === 'self') proxy = source;
            else if (this.proxy === 'clone' || this.proxy === 'cloneShape') {
                if (this.proxy === 'clone') {
                    proxy = source.cloneNode(true);
                } else {
                    // 只是复制形状
                    proxy = document.createElement('div');
                }
                this.setProxyFixed(proxy, getPosition(source));
                let size = getSize(source);
                proxy.style.width = size.width + 'px';
                proxy.style.height = size.height + 'px';
                source.parentNode.appendChild(proxy);
            }

            if (proxy) {
                proxy.classList.add(this.proxyClass);

                let position = getComputedStyle(proxy, 'position');
                if (!position || position === 'static') {
                    proxy.style.position = 'relative'; // 设置为可移动
                }
            }

            return proxy;
        }

        setProxyFixed(proxy, position = { left: 0, top: 0 }) {
            proxy.style.left = position.left + 'px';
            proxy.style.top = position.top + 'px';
            proxy.style.zIndex = '9999';
            proxy.style.position = 'fixed';
            proxy.style.display = '';
        }

        onMouseDown(evt) {
            this.mousedown.dispatch({
                source: this.element,
                evt,
            });

            this.startX = evt.clientX;
            this.startY = evt.clientY;
            this.dragX = 0;
            this.dragY = 0;

            this.dragFlag = true;

            window.addEventListener('mousemove', this.onMouseMove);
            window.addEventListener('mouseup', this.onMouseUp);
        }

        onMouseMove(evt) {
            this.mousemove.dispatch({
                source: this.element,
                evt,
            });

            this.dragX = evt.clientX - this.startX;
            this.dragY = evt.clientY - this.startY;

            if (this.dragX || this.dragY) this.dragFlag = false; // 标志为拖拽中，则不触发click和dblclick事件
            else return; // 非拖拽不触发之后的事件

            if (this.dragging === false) this.onMouseMoveStart(evt);
            else this.onMouseMoving(evt);
        }

        onMouseMoveStart(evt) {
            let proxy = this.getProxy();

            // 代理元素的位置从MouseMoveStart开始算，这样在MouseDown中也可以预先处理位置
            // 获取初始的left和top值
            let computedStyle = proxy ? getComputedStyle(proxy) : {};
            let left = computedStyle.left;
            let top = computedStyle.top;
            if (!left || left === 'auto') left = '0px';
            if (!top || top === 'auto') top = '0px';

            proxy.style.left = left;
            proxy.style.top = top;

            this.dragging = true;
            this.proxyNode = proxy;
            this.startLeft = +left.slice(0, -2);
            this.startTop = +top.slice(0, -2);
            this.droppable = undefined; // 初始化drop对象

            this.dragstart.dispatch({
                source: this.element,
                evt,
            });
        }

        onMouseMoving(evt) {
            // 拖拽约束
            let next = this.restrict();
            // 设置位置
            if (this.proxyNode) {
                if (!this.direction || this.direction === 'horizontal') this.proxyNode.style.left = next.left + 'px';
                if (!this.direction || this.direction === 'vertical') this.proxyNode.style.top = next.top + 'px';
            }

            this.drag.dispatch({
                source: this.element,
                evt,
                dragX: this.dragX,
                dragY: this.dragY
            });

            if (!this.dragging) return;

            // 获取鼠标下的dom节点
            let pointElement = null;
            if (this.proxyNode) {
                this.proxyNode.style.display = 'none';
                pointElement = document.elementFromPoint(evt.clientX, evt.clientY);
                this.proxyNode.style.display = '';
            } else pointElement = document.elementFromPoint(evt.clientX, evt.clientY);

            // 获取鼠标下的drop对象
            let pointDroppable = null;
            while (pointElement) {
                for (let droppable of window.droppables) {
                    if (droppable.element === pointElement && (!droppable.name || droppable.name === this.name)) pointDroppable = droppable;
                }

                if (pointDroppable) break;
                else pointElement = pointElement.parentNode;
            }

            // 如果当前鼠标下的drop对象不是保存的drop对象，则表明已离开保存的drop对象进入新的drop对象了，要调整保存的drop对象
            if (this.droppable !== pointDroppable) {
                if (this.droppable && this.droppable.name === this.name) {
                    this.droppable.dispatchDragLeave({
                        source: this.element,
                        evt,
                    });
                }

                if (pointDroppable && pointDroppable.name === this.name) {
                    pointDroppable.dispatchDragEnter({
                        source: this.element,
                        evt,
                    });
                }

                this.droppable = pointDroppable;
            }

            // dragEnter之后也要dragOver
            if (pointDroppable && pointDroppable.name === this.name) {
                pointDroppable.dispatchDragOver({
                    source: this.element,
                    evt,
                });
            }
        }

        /**
         * 计算移动后的坐标
         */
        restrict() {
            return {
                left: this.startLeft + this.dragX,
                top: this.startTop + this.dragY,
            };
        }

        onMouseUp(evt) {
            this.mouseup.dispatch({
                source: this.element,
                evt,
            });

            let button = evt.button;
            // 必须是鼠标左键事件，且不在拖拽中
            if (this.dragFlag && button === 0) {
                if (this.clickType === 1) {
                    // 置为双击
                    this.clickType = 2;
                } else if (!this.clickType) {
                    // 置为单击
                    this.clickType = 1;
                }


                setTimeout(() => {
                    if (this.clickType === 1) {
                        // 触发单击
                        this.click.dispatch({
                            source: this.element,
                            evt,
                        });
                    } else if (this.clickType === 2) {
                        // 触发双击
                        this.dblclick.dispatch({
                            source: this.element,
                            evt,
                        });
                    }

                    this.clickType = 0;
                }, this.interval);
            }
            this.dragFlag = true;

            // 触发放置事件
            if (this.dragging) {
                this.droppable && this.droppable.dispatchDrop({
                    source: this.element,
                    evt,
                });
                this.cancel(evt);
            }

            window.removeEventListener('mousemove', this.onMouseMove);
            window.removeEventListener('mouseup', this.onMouseUp);
        }

        cancel(evt) {
            this.dragend.dispatch({
                source: this.element,
                evt,
            });

            // 删掉不需要的代理节点
            if (this.proxyNode) {
                this.proxyNode.classList.remove(this.proxyClass)
                if (this.proxy === 'clone' || this.proxy === 'cloneShape') this.proxyNode.parentNode.removeChild(this.proxyNode);
            }

            this.reset();
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

        setProperty(prop, value) {
            this[prop] = value;
        }

        reset() {
            this.dragFlag = true;
            this.dragging = false;
            this.proxyNode = undefined;
            this.range = undefined;
            this.startX = 0;
            this.startY = 0;
            this.dragX = 0;
            this.dragY = 0;
            this.startLeft = 0;
            this.startTop = 0;
            this.droppable = undefined;
        }

        destroy() {
            this.reset();

            this.dragstart.del();
            this.drag.del();
            this.dragend.del();
            this.click.del();
            this.dblclick.del();
            this.mousedown.del();
            this.mousemove.del();
            this.mouseup.del();

            window.removeEventListener('mousemove', this.onMouseMove);
            window.removeEventListener('mouseup', this.onMouseUp);
            this.element.removeEventListener('mousedown', this.onMouseDown);

            this.element = undefined;

            return;
        }
    }

    if (typeof module !== 'undefined' && typeof exports === 'object') {
        module.exports = {
            Drag,
            Drop
        };
    } else {
        window.Drag = Drag;
        window.Drop = Drop;
    }
})();
