/*const { checkTimestamp } = require('../utils');

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
};*/

const { checkTimestamp } = require('../utils');
const electrumJSCore = require('./electrumjs.core.js');

const CHECK_INTERVAL = 1000;
const MAX_TIME = 30; // s
const MAX_IDLE_TIME = 5 * 60;
const PING_TIME = 60;

// TODO: reconnect/cycle if electrum server is not responding

let electrumServers = {};

getProtocolVersion = (_ecl) => {
  let protocolVersion;
  
  return new Promise((resolve, reject) => {
    _ecl.serverVersion('ElectrumProxy')
    .then((serverData) => {
      if (serverData &&
          JSON.stringify(serverData).indexOf('server.version already sent') > -1) {
        console.log('server version already sent');
        resolve('sent');
      }

      let serverVersion = 0;

      if (serverData &&
          typeof serverData === 'object' &&
          serverData[0] &&
          serverData[0].indexOf('ElectrumX') > -1 &&
          Number(serverData[1])
      ) {
        serverVersion = Number(serverData[1]);

        if (serverVersion) {            
          protocolVersion = Number(serverData[1]);
          _ecl.setProtocolVersion(protocolVersion);
        }
      }

      if (serverData.hasOwnProperty('code') &&
          serverData.code === '-777') {
        resolve(serverData);
      }

      console.log(`ecl ${`${_ecl.host}:${_ecl.port}:${_ecl.proto}`} protocol version: ${protocolVersion}`);
      resolve(protocolVersion);
    });
  });
};

// TODO: exclude server option
getServer = async(serverData) => {
  const server = [serverData.join(':')];

  if (!electrumServers[server]) {
    console.log('ecl server doesnt exist yet, lets add')

    const ecl = new electrumJSCore(serverData[1], serverData[0], serverData[2]);
    console.log(`ecl conn ${server}`);
    ecl.connect();
    console.log(`ecl req protocol ${server}`);
    const eclProtocolVersion = await getProtocolVersion(ecl);
    if (eclProtocolVersion.hasOwnProperty('code')) return eclProtocolVersion;
    
    if (!electrumServers[server]) {
      electrumServers[server] = {};
    }

    electrumServers[server] = {
      server: ecl,
      lastReq: Date.now(),
      lastPing: Date.now(),
    };

    //console.log(electrumServers)

    return electrumServers[server].server;
  } else {
    console.log(`ecl ${server} server exists`);
    let ecl = electrumServers[server];
    ecl.lastReq = Date.now();
    return ecl.server;
  }
};

module.exports = (api) => {
  api.eclStack = [];

  api.ecl = {
    getServer,
  };

  api.checkOpenElectrumConnections = () => {
    console.log('ecl stack check =>');
    console.log(api.eclStack);

    for (let i = 0; i < api.eclStack.length; i++) {
      const secPassed = checkTimestamp(api.eclStack[i].timestamp);
      console.log(`${secPassed}s ecl connection passed`);

      if (secPassed >= MAX_TIME) {
        console.log('conn terminated');
        api.eclStack[i].ecl.close();
        api.eclStack.splice(i, 1);
      }
    }
  };

  api.addElectrumConnection = (ecl) => {
    api.eclStack.push({
      timestamp: Date.now(),
      ecl,
    });

    console.log('ecl stack =>');
    console.log(api.eclStack);
  };

  api.initElectrumManager = () => {
    setInterval(() => {
      for (let server in electrumServers) {
        console.log(`ecl check server ${server}`);

        const pingSecPassed = checkTimestamp(electrumServers[server].lastPing);
        console.log(`ping sec passed ${pingSecPassed}`);
        
        if (pingSecPassed > PING_TIME) {
          console.log(`ecl ${server} ping limit passed, send ping`);

          getProtocolVersion(electrumServers[server].server)
          .then((eclProtocolVersion) => {
            if (eclProtocolVersion === 'sent') {
              console.log(`ecl ${server} ping success`);
              electrumServers[server].lastPing = Date.now();
            } else {
              console.log(`ecl ${server} ping fail, remove server`);
              delete electrumServers[server];
            }
          });
        }

        const reqSecPassed = checkTimestamp(electrumServers[server].lastReq);
        console.log(`req sec passed ${reqSecPassed}`);
        
        if (reqSecPassed > MAX_IDLE_TIME) {
          console.log(`ecl ${server} req limit passed, disconnect server`);
          electrumServers[server].server.close();
          delete electrumServers[server];
        }
      }
    }, CHECK_INTERVAL);
  };

  return api;
};