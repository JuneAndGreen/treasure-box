class Round {
    constructor(element, options) {
        this.element = element;

        this.xmlns = 'http://www.w3.org/2000/svg';

        this.setOptions(options);
        this.create();
        this.draw(this.data);
    }

    setOptions(options) {
        this.width = options.width || 200;
        this.strokeColor = options.strokeColor || '#0C1013'; // 边线颜色
        this.strokeWidth = options.strokeWidth || 1; // 边线宽度
        this.roundWidth = options.roundWidth || this.width / 4; // 圆弧宽度
        this.size = options.size || 5; // 块数
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
    }

    createSvg() {
        let svg = document.createElementNS(this.xmlns, 'svg');
        svg.setAttributeNS(null, 'viewBox', '0 0 ' + this.width + ' ' + this.width);
        svg.setAttributeNS(null, 'width', this.width);
        svg.setAttributeNS(null, 'height', this.width);
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
        let paths = [];
        for (let i = 0, len = this.size; i < len; i++) {
            let path = document.createElementNS(this.xmlns, 'path');
            path.setAttributeNS(null, 'stroke-width', this.strokeWidth);
            path.setAttributeNS(null, 'stroke', this.strokeColor);

            paths.push(path);
            this.pathGroup.appendChild(path);
        }

        return paths;
    }

    draw(data) {
        let startRadius = -Math.PI / 2; // -90度
        let angle = (1 / this.size) * (Math.PI * 2); // 单块的角度
        let largeArcFlag = (angle % (Math.PI * 2)) > Math.PI ? 1 : 0;

        let half = this.width / 2;
        let innerRadius = half - this.roundWidth;

        for (let i = 0; i < this.size; i++) {
            let endRadius = startRadius + angle;
            let startX = half + Math.cos(startRadius) * half;
            let startY = half + Math.sin(startRadius) * half;
            let endX = half + Math.cos(endRadius) * half;
            let endY = half + Math.sin(endRadius) * half;
            let startX2 = half + Math.cos(endRadius) * innerRadius;
            let startY2 = half + Math.sin(endRadius) * innerRadius;
            let endX2 = half + Math.cos(startRadius) * innerRadius;
            let endY2 = half + Math.sin(startRadius) * innerRadius;

            let cmd = [
                'M', startX, startY, // 开始路径
                'A', half, half, 0, largeArcFlag, 1, endX, endY, // 绘制外层圆弧
                'L', startX2, startY2, // 绘制两端圆弧的连接线
                'A', innerRadius, innerRadius, 0, largeArcFlag, 0, endX2, endY2, // 绘制里层圆弧
                'Z' // 结束路径
            ];

            let path = this.paths[i];
            path.setAttributeNS(null, 'd', cmd.join(' '));
            path.setAttributeNS(null, 'fill', data[i] || '#ddd');

            startRadius += angle;
        }
    }

    destory() {
        if (this.svg.parentNode) this.svg.parentNode.removeChild(this.svg);

        return null;
    }
}
