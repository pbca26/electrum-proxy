const electrumJSCore = require('./electrumjs.core.js');

module.exports = (shepherd) => {
  shepherd.CONNECTION_ERROR_OR_INCOMPLETE_DATA = 'connection error or incomplete data';

  shepherd.checkServerData = (port, ip, res) => {
    let missingParams = {};

    if (!port) {
      missingParams.port = 'param is missing';
    }

    if (!ip) {
      missingParams.ip = 'param is missing';
    }

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

  shepherd.get('/server/version', (req, res, next) => {
    if (shepherd.checkServerData(req.query.port, req.query.ip, res)) {
      const ecl = new electrumJSCore(req.query.port, req.query.ip, req.query.proto || 'tcp');

      ecl.connect();
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

  return shepherd;
};
