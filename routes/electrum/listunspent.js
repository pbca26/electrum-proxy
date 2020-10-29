const electrumJSCore = require('./electrumjs.core.js');

module.exports = (api) => {
  api.get('/listunspent', async(req, res, next) => {
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
        const verbose = req.query.verbose && req.query.verbose === 'true' ? true : false;
        
        if (req.query.eprotocol &&
            Number(req.query.eprotocol) > 0) {
          ecl.setProtocolVersion(req.query.eprotocol);
        }

        ecl.blockchainAddressListunspent(req.query.address)
        .then((json) => {
          if (!verbose) {              
            const successObj = {
              msg: json.code ? 'error' : 'success',
              result: json,
            };

            res.set({ 'Content-Type': 'application/json' });
            res.end(JSON.stringify(successObj));
          } else {
            if (json.code) {
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
                  const successObj = {
                    msg: 'success',
                    result: json,
                  };

                  res.set({ 'Content-Type': 'application/json' });
                  res.end(JSON.stringify(successObj));
                });
              } else {
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
    }
  });

  return api;
};