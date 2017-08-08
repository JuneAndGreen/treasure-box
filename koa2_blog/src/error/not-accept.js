'use strict';

class NotAcceptError extends Error {
    constructor(message, extra) {
        super(message);

    	this.name = 'NotAcceptError';
    	this.status = 406;

	    Error.captureStackTrace(this, NotAcceptError);

	    this.message = message;
		this.extra = extra;
	}
}

module.exports = NotAcceptError;