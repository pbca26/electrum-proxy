const express = require('express');
let api = express.Router();

api = require('./electrum/balance.js')(api);
api = require('./electrum/transactions.js')(api);
api = require('./electrum/block.js')(api);
api = require('./electrum/pushtx.js')(api);
api = require('./electrum/listunspent.js')(api);
api = require('./electrum/estimate.js')(api);
api = require('./electrum/merkle.js')(api);
api = require('./electrum/server.js')(api);
api = require('./electrum/conn.manager.js')(api);

api.initElectrumManager();

// default route
api.get('/', (req, res, next) => {
  res.send('Electrum HTTP-to-TCP Proxy Server');
});

module.exports = api;