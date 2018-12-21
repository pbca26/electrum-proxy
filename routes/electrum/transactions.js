const Promise = require('bluebird');
const electrumJSCore = require('./electrumjs.core.js');

module.exports = (shepherd) => {
  shepherd.sortTransactions = (transactions) => {
    return transactions.sort((b, a) => {
      if (a.height < b.height &&
          a.height &&
          b.height) {
        return -1;
      }

      if (a.height > b.height &&
          a.height &&
          b.height) {
        return 1;
      }

      if (!a.height &&
          b.height) {
        return 1;
      }

      if (!b.height &&
          a.height) {
        return -1;
      }

      return 0;
    });
  }

  shepherd.get('/listtransactions', (req, res, next) => {
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

    if (shepherd.checkServerData(port, ip, res)) {
      const ecl = new electrumJSCore(port, ip, proto || 'tcp');

      if (!raw) {
        ecl.connect();
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
        ecl.connect();

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
              json = shepherd.sortTransactions(json);

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
                    ecl.blockchainTransactionGet(transaction.tx_hash)
                    .then((_rawtxJSON) => {
                      _transactions.push({
                        height: transaction.height,
                        txid: transaction.tx_hash,
                        raw: _rawtxJSON,
                      });
                      resolve();
                    });
                  });
                }))
                .then(promiseResult => {
                  ecl.close();

                  let successObj;
                  _transactions = shepherd.sortTransactions(_transactions);

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
    }
  });

  shepherd.get('/gettransaction', (req, res, next) => {
    if (shepherd.checkServerData(req.query.port, req.query.ip, res)) {
      const ecl = new electrumJSCore(req.query.port, req.query.ip, req.query.proto || 'tcp');

      ecl.connect();
      ecl.blockchainTransactionGet(req.query.txid)
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