const electrumJSCore = require('./electrumjs.core.js');

module.exports = (shepherd) => {
  // test
  shepherd.get('/pushtx', (req, res, next) => {
    if (shepherd.checkServerData(req.query.port, req.query.ip, res)) {
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
  shepherd.post('/pushtx', (req, res, next) => {
    if (shepherd.checkServerData(req.body.port, req.body.ip, res)) {
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

  return shepherd;
};