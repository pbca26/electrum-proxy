const electrumJSCore = require('./electrumjs.core.js');

module.exports = (shepherd) => {
  api.get('/estimatefee', (req, res, next) => {
    if (api.checkServerData(req.query.port, req.query.ip, res)) {
      const ecl = new electrumJSCore(req.query.port, req.query.ip, req.query.proto || 'tcp');

      if (req.query.eprotocol &&
          Number(req.query.eprotocol) > 0) {
        ecl.setProtocolVersion(req.query.eprotocol);
      }

      ecl.connect();
      ecl.blockchainEstimatefee(req.query.blocks)
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