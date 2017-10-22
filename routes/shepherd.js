const express = require('express');
var shepherd = express.Router();

shepherd.Promise = require('bluebird');
shepherd.electrumJSCore = require('./electrum/electrumjs.core.js');

shepherd.CONNECTION_ERROR_OR_INCOMPLETE_DATA = 'connection error or incomplete data';

shepherd = require('./electrum/merkle.js')(shepherd);
shepherd = require('./electrum/balance.js')(shepherd);
shepherd = require('./electrum/transactions.js')(shepherd);
shepherd = require('./electrum/block.js')(shepherd);
shepherd = require('./electrum/createtx.js')(shepherd);
shepherd = require('./electrum/listunspent.js')(shepherd);
shepherd = require('./electrum/estimate.js')(shepherd);

// default route
shepherd.get('/', (req, res, next) => {
  res.send('Electrum Proxy Server');
});

module.exports = shepherd;