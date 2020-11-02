const electrumJSCore = require('./electrumjs.core.js');

module.exports = (api) => {
  api.get('/getblockinfo', async (req, res, next) => {
    if (api.checkServerData(req.query, res)) {
      const {port, ip, proto, height} = req.query;
      const ecl = await api.ecl.getServer([ip, port, proto || 'tcp']);
      
      if (ecl.hasOwnProperty('code')) {
        const successObj = {
          msg: 'error',
          result: ecl,
        };
        res.set({ 'Content-Type': 'application/json' });
        res.end(JSON.stringify(successObj));
      } else {
        const json = await ecl.blockchainBlockGetHeader(height);

        const successObj = {
          msg: json.code ? 'error' : 'success',
          result: json,
        };

        res.set({ 'Content-Type': 'application/json' });
        res.end(JSON.stringify(successObj));
      }
    }
  });

  api.get('/getcurrentblock', async (req, res, next) => {
    if (api.checkServerData(req.query, res)) {
      const {port, ip, proto, eprotocol} = req.query;
      const ecl = await api.ecl.getServer([ip, port, proto || 'tcp']);
      
      if (ecl.hasOwnProperty('code')) {
        const successObj = {
          msg: 'error',
          result: ecl,
        };
        res.set({ 'Content-Type': 'application/json' });
        res.end(JSON.stringify(successObj));
      } else {
        if (eprotocol &&
            Number(eprotocol) > 0) {
          ecl.setProtocolVersion(eprotocol);
        }

        const json = await ecl.blockchainHeadersSubscribe();

        const successObj = {
          msg: json.code || (!json.block_height && !json.height) ? 'error' : 'success',
          result: json.block_height || json.height,
        };

        res.set({ 'Content-Type': 'application/json' });
        res.end(JSON.stringify(successObj));
      }
    }
  });

  return api;
};