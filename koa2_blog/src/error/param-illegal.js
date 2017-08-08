'use strict';

class ParamIllegalError extends Error {
    constructor(message, extra) {
        super(message);

    	this.name = 'ParamIllegalError';
    	this.status = 400;

	    Error.captureStackTrace(this, ParamIllegalError);

	    this.message = message;
		this.extra = extra;
	}
}

module.exports = ParamIllegalError;