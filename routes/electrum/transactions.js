const electrumJSCore = require('./electrumjs.core.js');
const { sortTransactions } = require('../utils');

module.exports = (api) => {
  api.get('/listtransactions', async (req, res, next) => {
    let {
      port,
      ip,
      proto,
      address,
      maxlength,
      raw,
      pagination,
      page,
      pagesize,
    } = req.query;
    
    if (!pagesize ||
        !Number(pagesize) ||
        pagesize % 1 !== 0 ||
        pagesize < 10 ||
        pagesize > 30) {
      pagesize = 10;
    }

    const maxHistoryDepth = 2000;

    if (!page) page = 1;

    if (api.checkServerData(req.query, res)) {
      const ecl = await api.ecl.getServer([ip, port, proto || 'tcp']);
      
      if (ecl.hasOwnProperty('code')) {
        const successObj = {
          msg: 'error',
          result: ecl,
        };
        res.set({ 'Content-Type': 'application/json' });
        res.end(JSON.stringify(successObj));
      } else {        
        if (!raw) {
          const json = await ecl.blockchainAddressGetHistory(address);

          const successObj = {
            msg: json.code ? 'error' : 'success',
            result: json,
          };

          res.set({ 'Content-Type': 'application/json' });
          res.end(JSON.stringify(successObj));
        } else {
          const MAX_TX = pagination ? maxHistoryDepth : (maxlength && Number(maxlength) >= 10 && Number(maxlength) <= 100 ? maxlength : 10);

          const json = await ecl.blockchainAddressGetHistory(address);

          if (json.code) {

            const successObj = {
              msg: json.code ? 'error' : 'success',
              result: json,
            };

            res.end(JSON.stringify(successObj));
          } else {
            if (json &&
                json.length) {
              const txsCount = json.length;
              let isPaginationError = false;

              let pagesTotal = Math.ceil((Number(json.length) ? Number(json.length) : 0) / pagesize);
              json = sortTransactions(json);

              if (pagination &&
                  page &&
                  Number(page) &&
                  page > 0 &&
                  page <= pagesTotal) {
                json = json.slice(Number(page - 1) * pagesize, (page * pagesize));
              } else {
                if (!pagination) {
                  json = json.slice(0, pagination ? pagesize : MAX_TX);
                } else {
                  isPaginationError = true;

                  const retObj = {
                    msg: 'error',
                    result: 'wrong page number',
                  };

                  res.set({ 'Content-Type': 'application/json' });
                  res.end(JSON.stringify(retObj));
                }
              }

              if (!isPaginationError) {
                let _transactions = [];

                Promise.all(json.map((transaction, index) => {
                  return new Promise((resolve, reject) => {
                    ecl.blockchainTransactionGet(
                      transaction.tx_hash,
                      req.query.verbose && req.query.verbose === 'true' ? true : null
                    )
                    .then((_rawtxJSON) => {
                      let txObj = {
                        height: transaction.height,
                        txid: transaction.tx_hash,
                        raw: _rawtxJSON,
                      }

                      if (_rawtxJSON.hasOwnProperty('hex')) {
                        txObj.verbose = _rawtxJSON;
                        txObj.raw = _rawtxJSON.hex;
                      }

                      _transactions.push(txObj);
                      resolve();
                    });
                  });
                }))
                .then(promiseResult => {
                  let successObj;
                  _transactions = sortTransactions(_transactions);

                  if (pagination) {
                    successObj = {
                      msg: 'success',
                      result: {
                        txsCount,
                        pageSize: pagesize,
                        pagesTotal,
                        maxHistoryDepth,
                        page,
                        transactions: _transactions,
                      },
                    };
                  } else {
                    successObj = {
                      msg: 'success',
                      result: _transactions,
                    };
                  }

                  res.set({ 'Content-Type': 'application/json' });
                  res.end(JSON.stringify(successObj));
                });
              }
            } else {
              let successObj;

              if (pagination) {
                successObj = {
                  msg: 'success',
                  result: {
                    txsCount: 0,
                    pageSize: pagesize,
                    pagesTotal: 0,
                    maxHistoryDepth,
                    transactions: [],
                  },
                };
              } else {
                successObj = {
                  msg: 'success',
                  result: [],
                };
              }

              res.set({ 'Content-Type': 'application/json' });
              res.end(JSON.stringify(successObj));
            }
          }
        }
      }
    }
  });

  api.get('/gettransaction', async(req, res, next) => {
    if (api.checkServerData(req.query, res)) {
      const {port, ip, proto, eprotocol, txid, verbose} = req.query;
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

        const json = await ecl.blockchainTransactionGet(txid, verbose);

        const successObj = {
          msg: json.code ? 'error' : 'success',
          result: json,
        };

        res.set({ 'Content-Type': 'application/json' });
        res.end(JSON.stringify(successObj));
      }
    }
  });

  return api;
};