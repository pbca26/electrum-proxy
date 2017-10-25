module.exports = (shepherd) => {
  shepherd.get('/listunspent', (req, res, next) => {
    const ecl = new shepherd.electrumJSCore(req.query.port, req.query.ip, 'tcp');

    ecl.connect();
    ecl.blockchainAddressListunspent(address)
    .then((json) => {
      ecl.close();

      const successObj = {
        msg: json.code ? 'error' : 'success',
        result: json,
      };

      res.end(JSON.stringify(successObj));
    });
  });

  return shepherd;
};