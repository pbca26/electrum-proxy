const electrumJSCore = require('./electrumjs.core.js');

module.exports = (api) => {
  api.get('/estimatefee', async(req, res, next) => {
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

        ecl.blockchainEstimatefee(req.query.blocks)
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