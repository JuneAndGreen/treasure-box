'use strict';

class ForbiddenError extends Error {
    constructor(message, extra) {
        super(message);

    	this.name = 'ForbiddenError';
    	this.status = 403;
        
	    Error.captureStackTrace(this, ForbiddenError);

	    this.message = message;
		this.extra = extra;
	}
}

module.exports = ForbiddenError;