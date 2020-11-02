const { checkTimestamp } = require('../utils');
const electrumJSCore = require('./electrumjs.core.js');

const CHECK_INTERVAL = 1000;
const MAX_TIME = 30; // s
const MAX_IDLE_TIME = 5 * 60;
const PING_TIME = 60;

// TODO: reconnect/cycle if electrum server is not responding

let electrumServers = {};

const log = (data) => {
  if (process.argv.indexOf('debug') > -1) {
    console.log(data);
  }
};

const getProtocolVersion = async (_ecl) => {
  let protocolVersion;
  
  const serverData = await _ecl.serverVersion('ElectrumProxy');

  if (serverData &&
      JSON.stringify(serverData).indexOf('server.version already sent') > -1) {
    log('server version already sent');
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

  log(`ecl ${`${_ecl.host}:${_ecl.port}:${_ecl.proto}`} protocol version: ${protocolVersion}`);

  return protocolVersion;
};

// TODO: exclude server option
const getServer = async(serverData) => {
  const server = [serverData.join(':')];

  if (!electrumServers[server]) {
    log('ecl server doesnt exist yet, lets add');

    const ecl = new electrumJSCore(serverData[1], serverData[0], serverData[2]);
    log(`ecl conn ${server}`);
    ecl.connect();
    log(`ecl req protocol ${server}`);
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

    //log(electrumServers)

    return electrumServers[server].server;
  } else {
    log(`ecl ${server} server exists`);
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
    log('ecl stack check =>');
    log(api.eclStack);

    for (let i = 0; i < api.eclStack.length; i++) {
      const secPassed = checkTimestamp(api.eclStack[i].timestamp);
      log(`${secPassed}s ecl connection passed`);

      if (secPassed >= MAX_TIME) {
        log('conn terminated');
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

    log('ecl stack =>');
    log(api.eclStack);
  };

  api.initElectrumManager = () => {
    setInterval(() => {
      for (let server in electrumServers) {
        log(`ecl check server ${server}`);

        const pingSecPassed = checkTimestamp(electrumServers[server].lastPing);
        log(`ping sec passed ${pingSecPassed}`);
        
        if (pingSecPassed > PING_TIME) {
          log(`ecl ${server} ping limit passed, send ping`);

          getProtocolVersion(electrumServers[server].server)
          .then((eclProtocolVersion) => {
            if (eclProtocolVersion === 'sent') {
              log(`ecl ${server} ping success`);
              electrumServers[server].lastPing = Date.now();
            } else {
              log(`ecl ${server} ping fail, remove server`);
              delete electrumServers[server];
            }
          });
        }

        const reqSecPassed = checkTimestamp(electrumServers[server].lastReq);
        log(`req sec passed ${reqSecPassed}`);
        
        if (reqSecPassed > MAX_IDLE_TIME) {
          log(`ecl ${server} req limit passed, disconnect server`);
          electrumServers[server].server.close();
          delete electrumServers[server];
        }
      }
    }, CHECK_INTERVAL);
  };

  return api;
};