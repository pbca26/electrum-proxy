const config = {
  ip: '127.0.0.1',
  port: 9999,
  btcjsNetwork: {
    komodo: { // networking
      messagePrefix: '\x19Komodo Signed Message:\n',
      bip32: {
        public: 0x0488b21e,
        private: 0x0488ade4,
      },
      pubKeyHash: 0x3c,
      scriptHash: 0x55,
      wif: 0xbc,
      dustThreshold: 1000,
      serverList: [
        'electrum1.cipig.net:10001',
        'electrum2.cipig.net:10001',
      ],
    },
  },
};

module.exports = config;