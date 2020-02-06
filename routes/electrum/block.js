const electrumJSCore = require('./electrumjs.core.js');

module.exports = (api) => {
  api.get('/getblockinfo', (req, res, next) => {
    if (api.checkServerData(req.query, res)) {
      (async function() {
        const ecl = new electrumJSCore(req.query.port, req.query.ip, req.query.proto || 'tcp');
        
        ecl.connect();
        api.addElectrumConnection(ecl);

        if (await api.serverVersion(ecl, res, req.query.eprotocol) === true) {
          ecl.blockchainBlockGetHeader(req.query.height)
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
      })();
    }
  });

  api.get('/getcurrentblock', (req, res, next) => {
    if (api.checkServerData(req.query, res)) {
      const ecl = new electrumJSCore(req.query.port, req.query.ip, req.query.proto || 'tcp');

      if (req.query.eprotocol &&
          Number(req.query.eprotocol) > 0) {
        ecl.setProtocolVersion(req.query.eprotocol);
      }

      ecl.connect();
      api.addElectrumConnection(ecl);
      ecl.blockchainHeadersSubscribe()
      .then((json) => {
        ecl.close();

        const successObj = {
          msg: json.code || (!json.block_height && !json.height) ? 'error' : 'success',
          result: json.block_height || json.height,
        };

        res.set({ 'Content-Type': 'application/json' });
        res.end(JSON.stringify(successObj));
      });
    }
  });

  return api;
};