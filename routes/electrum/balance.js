const electrumJSCore = require('./electrumjs.core.js');

module.exports = (api) => {
  api.get('/getbalance', async (req, res, next) => {
    if (api.checkServerData(req.query, res)) {
      const {port, ip, proto, address} = req.query;
      const ecl = await api.ecl.getServer([ip, port, proto || 'tcp']);
      
      if (ecl.hasOwnProperty('code')) {
        const successObj = {
          msg: 'error',
          result: ecl,
        };
        res.set({ 'Content-Type': 'application/json' });
        res.end(JSON.stringify(successObj));
      } else {
        const json = await ecl.blockchainAddressGetBalance(address);

        if (json &&
            json.hasOwnProperty('confirmed') &&
            json.hasOwnProperty('unconfirmed')) {
          const successObj = {
            msg: json.code ? 'error' : 'success',
            result: json,
          };

          res.set({ 'Content-Type': 'application/json' });
          res.end(JSON.stringify(successObj));
        } else {
          const successObj = {
            msg: json.code ? 'error' : 'success',
            result: json,
          };

          res.set({ 'Content-Type': 'application/json' });
          res.end(JSON.stringify(successObj));
        }
      }
    }
  });

  return api;
};