const electrumJSCore = require('./electrumjs.core.js');

module.exports = (api) => {
  // test
  api.get('/pushtx', async(req, res, next) => {
    if (api.checkServerData(req.query, res)) {
      const {port, ip, proto} = req.query;
      const ecl = await api.ecl.getServer([ip, port, proto || 'tcp']);
      
      if (ecl.hasOwnProperty('code')) {
        const successObj = {
          msg: 'error',
          result: ecl,
        };
        res.set({ 'Content-Type': 'application/json' });
        res.end(JSON.stringify(successObj));
      } else {
        if (req.query.eprotocol &&
            Number(req.query.eprotocol) > 0) {
          ecl.setProtocolVersion(req.query.eprotocol);
        }

        ecl.blockchainTransactionBroadcast(req.query.rawtx)
        .then((json) => {
          const successObj = {
            msg: json.code ? 'error' : 'success',
            result: json,
          };

          res.set({ 'Content-Type': 'application/json' });
          res.end(JSON.stringify(successObj));
        });
      }
    }
  });

  // live
  api.post('/pushtx', async(req, res, next) => {
    if (api.checkServerData(req.body, res)) {
      const {port, ip, proto} = req.body;
      const ecl = await api.ecl.getServer([ip, port, proto || 'tcp']);
      
      if (ecl.hasOwnProperty('code')) {
        const successObj = {
          msg: 'error',
          result: ecl,
        };
        res.set({ 'Content-Type': 'application/json' });
        res.end(JSON.stringify(successObj));
      } else {
        if (req.body.eprotocol &&
            Number(req.body.eprotocol) > 0) {
          ecl.setProtocolVersion(req.query.eprotocol);
        }
        
        ecl.blockchainTransactionBroadcast(req.body.rawtx)
        .then((json) => {
          const successObj = {
            msg: json.code ? 'error' : 'success',
            result: json,
          };

          res.set({ 'Content-Type': 'application/json' });
          res.end(JSON.stringify(successObj));
        });
      }
    }
  });

  return api;
};