const electrumJSCore = require('./electrumjs.core.js');

module.exports = (shepherd) => {
  shepherd.get('/listunspent', (req, res, next) => {
    if (shepherd.checkServerData(req.query.port, req.query.ip, res)) {
      const ecl = new electrumJSCore(req.query.port, req.query.ip, req.query.proto || 'tcp');
      const verbose = req.query.verbose && req.query.verbose === 'true' ? true : false;

      if (req.query.eprotocol &&
          Number(req.query.eprotocol) > 0) {
        ecl.setProtocolVersion(req.query.eprotocol);
      }

      ecl.connect();
      ecl.blockchainAddressListunspent(req.query.address)
      .then((json) => {
        if (!verbose) {
          ecl.close();
          
          const successObj = {
            msg: json.code ? 'error' : 'success',
            result: json,
          };

          res.set({ 'Content-Type': 'application/json' });
          res.end(JSON.stringify(successObj));
        } else {
          if (json.code) {
            ecl.close();

            const successObj = {
              msg: json.code ? 'error' : 'success',
              result: json,
            };

            res.end(JSON.stringify(successObj));
          } else {
            if (json &&
                json.length) {
              Promise.all(json.map((transaction, index) => {
                return new Promise((resolve, reject) => {
                  ecl.blockchainTransactionGet(transaction.tx_hash, true)
                  .then((verboseTx) => {
                    if (verboseTx.hasOwnProperty('hex')) {
                      json[index].verbose = verboseTx;
                    }

                    resolve(true);
                  });
                });
              }))
              .then(promiseResult => {
                ecl.close();

                const successObj = {
                  msg: 'success',
                  result: json,
                };

                res.set({ 'Content-Type': 'application/json' });
                res.end(JSON.stringify(successObj));
              });
            } else {
              ecl.close();

              const successObj = {
                msg: 'success',
                result: [],
              };

              res.set({ 'Content-Type': 'application/json' });
              res.end(JSON.stringify(successObj));
            }
          }
        }
      });
    }
  });

  return shepherd;
};