const electrumJSCore = require('./electrumjs.core.js');

module.exports = (api) => {
  api.get('/getbalance', (req, res, next) => {
    if (api.checkServerData(req.query, res)) {
      (async function() {
        const ecl = new electrumJSCore(req.query.port, req.query.ip, req.query.proto || 'tcp');

        ecl.connect();
        
        if (await api.serverVersion(ecl, res, req.query.eprotocol) === true) {
          ecl.blockchainAddressGetBalance(req.query.address)
          .then((json) => {
            if (json &&
                json.hasOwnProperty('confirmed') &&
                json.hasOwnProperty('unconfirmed')) {
              ecl.close();

              const successObj = {
                msg: json.code ? 'error' : 'success',
                result: json,
              };

              res.set({ 'Content-Type': 'application/json' });
              res.end(JSON.stringify(successObj));
            } else {
              ecl.close();

              const successObj = {
                msg: json.code ? 'error' : 'success',
                result: json,
              };

              res.set({ 'Content-Type': 'application/json' });
              res.end(JSON.stringify(successObj));
            }
          });
        } else {
          ecl.close();
        }
      })();
    }
  });

  return api;
};