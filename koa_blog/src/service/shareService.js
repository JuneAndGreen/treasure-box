'use strict';

const BaseService = require('./baseService');
const ShareDao = require('../dao/shareDao');

module.exports = class ShareService extends BaseService {
    constructor() {
        super(new ShareDao());
    }
};