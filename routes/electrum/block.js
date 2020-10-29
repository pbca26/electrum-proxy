const electrumJSCore = require('./electrumjs.core.js');

module.exports = (api) => {
  api.get('/getblockinfo', async(req, res, next) => {
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
        ecl.blockchainBlockGetHeader(req.query.height)
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

  api.get('/getcurrentblock', async(req, res, next) => {
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

        ecl.blockchainHeadersSubscribe()
        .then((json) => {
          const successObj = {
            msg: json.code || (!json.block_height && !json.height) ? 'error' : 'success',
            result: json.block_height || json.height,
          };

          res.set({ 'Content-Type': 'application/json' });
          res.end(JSON.stringify(successObj));
        });
      }
    }
  });

  return api;
};