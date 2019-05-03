const sortTransactions = (transactions) => {
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
};

const urlParamsCheck = (params) => {
  let missingParams = {};
  
  if (!params.port) {
    missingParams.port = 'param is missing';
  }

  if (!params.ip) {
    missingParams.ip = 'param is missing';
  }

  if (params.port &&
      (!Number(params.port) || Number(params.port) < 0 || Number(params.port > 65536))) {
    missingParams.port = 'param must be in range 0 to 65536';
  }

  return missingParams;
};

module.exports = {
  sortTransactions,
  urlParamsCheck,
};