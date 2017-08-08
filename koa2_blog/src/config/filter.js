'use strict'

const ParamIllegalError = require('../error/index').ParamIllegalError;

module.exports = {
    'ALL /api/:service/:id': [
        async (ctx, next) => {
            let id = parseInt(ctx.params.id, 10);
            ctx.__id = id;

            if (isNaN(id)) {
                // id不合法
                throw new ParamIllegalError();
            }

            await next();
        }
    ],
};