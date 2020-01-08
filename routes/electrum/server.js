const electrumJSCore = require('./electrumjs.core.js');
const { urlParamsCheck } = require('../utils');

module.exports = (api) => {
  api.checkServerData = (params, res) => {
    const missingParams = urlParamsCheck(params);

    const successObj = {
      msg: 'error',
      result: missingParams,
    };

    if (Object.keys(missingParams).length > 0) {
      res.set({ 'Content-Type': 'application/json' });
      res.end(JSON.stringify(successObj));
      return false;
    }

    return true;
  };

  api.get('/server/version', (req, res, next) => {
    if (api.checkServerData(req.query, res)) {
      const ecl = new electrumJSCore(req.query.port, req.query.ip, req.query.proto || 'tcp');

      ecl.connect();
      api.addElectrumConnection(ecl);
      ecl.serverVersion()
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

  api.serverVersion = async function (ecl, res, eprotocol) { 
    return new Promise((resolve, reject) => { 
      if (eprotocol &&
          Number(eprotocol) > 0) {
        ecl.serverVersion('', eprotocol)
        .then((serverData) => {
          if (serverData &&
              JSON.stringify(serverData).indexOf('"code":') === -1) {
            ecl.setProtocolVersion(eprotocol);
            resolve(true);
          } else {
            res.set({ 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              msg: 'error',
              result: serverData,
            }));
            resolve(false);
          }
        });
      } else {
        resolve(true);
      }
    });
  };

  return api;
}