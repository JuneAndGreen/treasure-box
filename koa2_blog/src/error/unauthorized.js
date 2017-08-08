'use strict';

class UnauthorizedError extends Error {
    constructor(message, extra) {
        super(message);

    	this.name = 'UnauthorizedError';
    	this.status = 401;

	    Error.captureStackTrace(this, UnauthorizedError);

	    this.message = message;
		this.extra = extra;
	}
}

module.exports = UnauthorizedError;