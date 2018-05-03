const express = require('express');
let shepherd = express.Router();

shepherd = require('./electrum/balance.js')(shepherd);
shepherd = require('./electrum/transactions.js')(shepherd);
shepherd = require('./electrum/block.js')(shepherd);
shepherd = require('./electrum/pushtx.js')(shepherd);
shepherd = require('./electrum/listunspent.js')(shepherd);
shepherd = require('./electrum/estimate.js')(shepherd);
shepherd = require('./electrum/merkle.js')(shepherd);
shepherd = require('./electrum/server.js')(shepherd);

// default route
shepherd.get('/', (req, res, next) => {
  res.send('Electrum HTTP-to-TCP Proxy Server');
});

module.exports = shepherd;