'use strict';

class NotFoundError extends Error {
    constructor(message, extra) {
        super(message);

    	this.name = 'NotFoundError';
    	this.status = 404;

	    Error.captureStackTrace(this, NotFoundError);

	    this.message = message;
		this.extra = extra;
	}
}

module.exports = NotFoundError;