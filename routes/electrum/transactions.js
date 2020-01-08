const electrumJSCore = require('./electrumjs.core.js');
const { sortTransactions } = require('../utils');

module.exports = (api) => {
  api.get('/listtransactions', (req, res, next) => {
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
      (async function() {
        const ecl = new electrumJSCore(port, ip, proto || 'tcp');
        
        ecl.connect();
        api.addElectrumConnection(ecl);
        
        if (await api.serverVersion(ecl, res, req.query.eprotocol) === true) {
          if (!raw) {
            ecl.blockchainAddressGetHistory(address)
            .then((json) => {
              ecl.close();

              const successObj = {
                msg: json.code ? 'error' : 'success',
                result: json,
              };

              res.set({ 'Content-Type': 'application/json' });
              res.end(JSON.stringify(successObj));
            });
          } else {
            const MAX_TX = pagination ? maxHistoryDepth : (maxlength && Number(maxlength) >= 10 && Number(maxlength) <= 100 ? maxlength : 10);

            ecl.blockchainAddressGetHistory(address)
            .then((json) => {
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
                      ecl.close();
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
                        ecl.blockchainTransactionGet(transaction.tx_hash, req.query.verbose && req.query.verbose === 'true' ? true : null)
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
                      ecl.close();

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
                  ecl.close();

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
            });
          }
        } else {
          ecl.close();
        }
      })();
    }
  });

  api.get('/gettransaction', (req, res, next) => {
    if (api.checkServerData(req.query, res)) {
      const ecl = new electrumJSCore(req.query.port, req.query.ip, req.query.proto || 'tcp');

      if (req.query.eprotocol &&
          Number(req.query.eprotocol) > 0) {
        ecl.setProtocolVersion(req.query.eprotocol);
      }

      ecl.connect();
      api.addElectrumConnection(ecl);
      ecl.blockchainTransactionGet(req.query.txid, req.query.verbose)
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