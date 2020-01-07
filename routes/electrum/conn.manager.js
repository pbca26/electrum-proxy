const { checkTimestamp } = require('../utils');

const CHECK_INTERVAL = 2000;
const MAX_TIME = 20; // s

module.exports = (api) => {
  api.eclStack = [];

  api.checkOpenElectrumConnections = () => {
    for (let i = 0; i < api.eclStack.length; i++) {
      const secPassed = checkTimestamp(api.eclStack[i].timestamp);

      if (secPassed >= MAX_TIME) {
        api.eclStack[i].ecl.close();
        api.eclStack.splice(i, 1);
        console.log(`conn terminated | total conn: ${api.eclStack.length}`);
      }
    }
  };

  api.addElectrumConnection = (ecl) => {
    api.eclStack.push({
      timestamp: Date.now(),
      ecl,
    });
  };

  api.initElectrumManager = () => {
    setInterval(() => {
      api.checkOpenElectrumConnections();
    }, CHECK_INTERVAL);
  };

  return api;
};