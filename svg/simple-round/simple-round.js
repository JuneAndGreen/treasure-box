(function() {
    class Round {
        constructor(element, options) {
            this.element = element;

            this.xmlns = 'http://www.w3.org/2000/svg';

            this.setOptions(options);
            this.create();
            this.draw(this.data);
        }

        setOptions(options) {
            this.radius = options.radius || 100;
            this.strokeColor = options.strokeColor || '#0C1013'; // 边线颜色
            this.strokeWidth = options.strokeWidth || 1; // 边线宽度
            this.roundWidth = options.roundWidth || this.radius / 2; // 圆弧宽度
            this.data = options.data || []; // 颜色列表
        }

        reset(options) {
            this.setOptions(options);
            this.create();
            this.draw(this.data);
        }

        create() {
            this.svg = this.createSvg();
            this.pathGroup = this.createPathGroup();
            this.paths = this.createPaths();
            this.cnts = this.createCnts();
        }

        createSvg() {
            let diameter = this.radius * 2;

            let svg = document.createElementNS(this.xmlns, 'svg');
            svg.setAttributeNS(null, 'viewBox', '0 0 ' + diameter + ' ' + diameter);
            svg.setAttributeNS(null, 'width', diameter);
            svg.setAttributeNS(null, 'height', diameter);
            svg.style.display = 'block';

            this.element.appendChild(svg);

            return svg;
        }

        createPathGroup() {
            let pathGroup = document.createElementNS(this.xmlns, 'g');

            this.svg.appendChild(pathGroup);

            return pathGroup;
        }

        createPaths() {
            this.totalValue = 0;

            let paths = [];
            for (let i = 0, len = this.data.length; i < len; i++) {
                let path = document.createElementNS(this.xmlns, 'path');
                path.setAttributeNS(null, 'stroke-width', this.strokeWidth);
                path.setAttributeNS(null, 'stroke', this.strokeColor);

                paths.push(path);
                this.pathGroup.appendChild(path);

                this.totalValue += this.data[i].value; // 计算总值
            }

            return paths;
        }

        createCnts() {
            let cnts = [];
            for (let i = 0, len = this.data.length; i < len; i++) {
                let cnt = document.createElement('div');

                cnts.push(cnt);
                this.element.appendChild(cnt);
            }

            return cnts;
        }

        draw(data) {
            let startRadius = -Math.PI / 2; // -90度

            let offset = this.strokeWidth;
            let radius = this.radius - offset;
            let innerRadius = radius - this.roundWidth;

            let rotateAngle = 0;

            for (let i = 0, len = data.length; i < len; i++) {
                let angle = ((data[i].value || 0) / this.totalValue) * (Math.PI * 2); // 单块的角度
                let largeArcFlag = (angle % (Math.PI * 2)) > Math.PI ? 1 : 0;

                let endRadius = startRadius + angle;
                let startX = radius + Math.cos(startRadius) * radius + offset;
                let startY = radius + Math.sin(startRadius) * radius + offset;
                let endX = radius + Math.cos(endRadius) * radius + offset;
                let endY = radius + Math.sin(endRadius) * radius + offset;
                let startX2 = radius + Math.cos(endRadius) * innerRadius + offset;
                let startY2 = radius + Math.sin(endRadius) * innerRadius + offset;
                let endX2 = radius + Math.cos(startRadius) * innerRadius + offset;
                let endY2 = radius + Math.sin(startRadius) * innerRadius + offset;

                let cmd = [
                    'M', startX, startY, // 开始路径
                    'A', radius, radius, 0, largeArcFlag, 1, endX, endY, // 绘制外层圆弧
                    'L', startX2, startY2, // 绘制两端圆弧的连接线
                    'A', innerRadius, innerRadius, 0, largeArcFlag, 0, endX2, endY2, // 绘制里层圆弧
                    'Z' // 结束路径
                ];

                // svg路径
                let path = this.paths[i];
                path.setAttributeNS(null, 'd', cmd.join(' '));
                path.setAttributeNS(null, 'fill', data[i].color || '#ddd');

                startRadius += angle;

                // 各个块容器
                let cnt = this.cnts[i];
                let cntWidth = angle * radius;
                let halfAngleDeg = (((data[i].value || 0) / this.totalValue) * 360) / 2; // 当前容器的角度的一半
                rotateAngle += halfAngleDeg;
                cnt.style.cssText = `
                    position: absolute;
                    transform-origin: center bottom;
                    top: ${offset}px;
                    left: ${radius - cntWidth / 2 + offset}px;
                    width: ${cntWidth}px;
                    height: ${radius}px;
                    box-sizing: border-box;
                    transform: rotate(${rotateAngle}deg);
                `;
                cnt.classList.add(data[i].class || '');
                cnt.innerHTML = data[i].content || '';

                rotateAngle += halfAngleDeg;
            }
        }

        destory() {
            if (this.svg.parentNode) this.svg.parentNode.removeChild(this.svg);

            return null;
        }
    }

    if (typeof module !== 'undefined' && typeof exports === 'object') {
        module.exports = Round;
    } else {
        window.Round = Round;
    }
})();
