const electrumJSCore = require('./electrumjs.core.js');

module.exports = (api) => {
  // test
  api.get('/pushtx', (req, res, next) => {
    if (api.checkServerData(req.query, res)) {
      const ecl = new electrumJSCore(req.query.port, req.query.ip, req.query.proto || 'tcp');

      if (req.query.eprotocol &&
          Number(req.query.eprotocol) > 0) {
        ecl.setProtocolVersion(req.query.eprotocol);
      }

      ecl.connect();
      ecl.blockchainTransactionBroadcast(req.query.rawtx)
      .then((json) => {
        ecl.close();

        const successObj = {
          msg: json.code ? 'error' : 'success',
          result: json,
        };

        res.set({ 'Content-Type': 'application/json' });
        res.end(JSON.stringify(successObj));
      });
    }
  });

  // live
  api.post('/pushtx', (req, res, next) => {
    if (api.checkServerData(req.body, res)) {
      const ecl = new electrumJSCore(req.body.port, req.body.ip, req.body.proto || 'tcp');

      if (req.body.eprotocol &&
          Number(req.body.eprotocol) > 0) {
        ecl.setProtocolVersion(req.query.eprotocol);
      }
      
      ecl.connect();
      ecl.blockchainTransactionBroadcast(req.body.rawtx)
      .then((json) => {
        ecl.close();

        const successObj = {
          msg: json.code ? 'error' : 'success',
          result: json,
        };

        res.set({ 'Content-Type': 'application/json' });
        res.end(JSON.stringify(successObj));
      });
    }
  });

  return api;
};