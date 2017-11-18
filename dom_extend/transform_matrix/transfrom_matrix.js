(function() {
    const DEG_TO_RAD =  Math.PI / 180; // 用于计算角度到弧度

    class Matrix3D {
        constructor() {
            this.elements = [
                1, 0, 0, 0,
                0, 1, 0, 0,
                0, 0, 1, 0,
                0, 0, 0, 1
            ];
        }

        /**
         * 矩阵乘法
         */
        multiplyMatrices(be) {
            let ae = this.elements;
            let a11 = ae[0], a12 = ae[4], a13 = ae[8], a14 = ae[12];
            let a21 = ae[1], a22 = ae[5], a23 = ae[9], a24 = ae[13];
            let a31 = ae[2], a32 = ae[6], a33 = ae[10], a34 = ae[14];
            let a41 = ae[3], a42 = ae[7], a43 = ae[11], a44 = ae[15];

            let b11 = be[0], b12 = be[1], b13 = be[2], b14 = be[3];
            let b21 = be[4], b22 = be[5], b23 = be[6], b24 = be[7];
            let b31 = be[8], b32 = be[9], b33 = be[10], b34 = be[11];
            let b41 = be[12], b42 = be[13], b43 = be[14], b44 = be[15];

            ae[0] = a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41;
            ae[4] = a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42;
            ae[8] = a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43;
            ae[12] = a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44;

            ae[1] = a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41;
            ae[5] = a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42;
            ae[9] = a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43;
            ae[13] = a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44;

            ae[2] = a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41;
            ae[6] = a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42;
            ae[10] = a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43;
            ae[14] = a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44;

            ae[3] = a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41;
            ae[7] = a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42;
            ae[11] = a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43;
            ae[15] = a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44;
        }

        /**
         * 四舍五入，解决角度为90的整数倍导致Math.cos得到极小的数，其实是0。导致不渲染
         */
        round(value) {
            let i = Math.pow(10, 15);
            
            return Math.round(value * i) / i;
        }

        /**
         * 计算变换后的矩阵
         */
        transform(x, y, z, scaleX, scaleY, scaleZ, rotateX, rotateY, rotateZ, skewX, skewY) {
            let rx = rotateX * DEG_TO_RAD; // 转成弧度
            let cosx = this.round(Math.cos(rx));
            let sinx = this.round(Math.sin(rx));

            let ry = rotateY * DEG_TO_RAD; // 转成弧度
            let cosy = this.round(Math.cos(ry));
            let siny = this.round(Math.sin(ry));

            let rz = rotateZ * DEG_TO_RAD; // 转成弧度
            let cosz = this.round(Math.cos(rz * -1));
            let sinz = this.round(Math.sin(rz * -1));

            this.multiplyMatrices([
                cosy * cosz * scaleX, -sinx * sinx * cosz * scaleX - cosx * sinz * scaleX, -sinx * cosx * cosz * scaleX + sinx * sinz * scaleX, 0,
                cosy * sinz * scaleY, -sinx * sinx * sinz * scaleY + cosx * cosz * scaleY, -sinx * cosx * sinz * scaleY - sinx * cosz * scaleY, 0,
                siny * scaleZ, sinx * cosy * scaleZ, cosx * cosy * scaleZ, 0,
                x, y, z, 1
            ]);

            if (skewX || skewY) {
                let sx = skewX * DEG_TO_RAD;
                let sy = skewY * DEG_TO_RAD;
                let sinsx = this.round(Math.sin(sx));
                let cossx = this.round(Math.cos(sx));
                let sinsy = this.round(Math.sin(sy));
                let cossy = this.round(Math.cos(sy));

                this.multiplyMatrices([
                    cossx, -1 * sinsy, 0, 0,
                    sinsx, cossy, 0, 0,
                    0, 0, 1, 0,
                    0, 0, 0, 1
                ]);
            }

            return this.getMatrix3d();
        }

        /**
         * 计算调整中心点后的偏移，此接口必须在计算了变换后的矩阵才能调用
         */
        calcOffset(originX, originY, originZ) {
            let offset = {
                x: 0,
                y: 0,
                z: 0
            };

            if (originX || originY || originZ) {
                offset.x = this.elements[3] - (originX * this.elements[0] + originY * this.elements[1] + originZ * this.elements[2] - originX);
                offset.y  = this.elements[7] - (originX * this.elements[4] + originY * this.elements[5] + originZ * this.elements[6] - originY);
                offset.z = this.elements[11] - (originX * this.elements[8] + originY * this.elements[9] + originZ * this.elements[10] - originZ);
            }

            return offset;
        }

        /**
         * 直接计算调整了中心点的矩阵
         */
        transformWithOrigin(translateX, translateY, translateZ, scaleX, scaleY, scaleZ, rotateX, rotateY, rotateZ, skewX, skewY, originX, originY, originZ) {
            let matrix = this.transform(translateX, translateY, translateZ, scaleX, scaleY, scaleZ, rotateX, rotateY, rotateZ, skewX, skewY);
            let offset = this.calcOffset(originX, originY, originZ);

            matrix[12] += offset.x;
            matrix[13] += offset.y;
            matrix[14] += offset.z;

            return matrix;
        }

        /**
         * 获取transform中的matrix3d可用的矩阵值
         */
        getMatrix3d() {
            let indexMap = [0, 4, 8, 12, 1, 5, 9, 13, 2, 6, 10, 14, 3, 7, 11, 15];

            let ret = [];
            for (let i = 0; i < 16; i++) {
                ret.push(this.elements[indexMap[i]]);
            }

            return ret;
        }
    };

    if (typeof module !== 'undefined' && typeof exports === 'object') {
        module.exports = Matrix3D;
    } else {
        window.Matrix3D = Matrix3D;
    }
})();