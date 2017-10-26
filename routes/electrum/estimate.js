module.exports = (shepherd) => {
  shepherd.get('/estimatefee', (req, res, next) => {
    const ecl = new shepherd.electrumJSCore(req.query.port, req.query.ip, 'tcp');

    ecl.connect();
    ecl.blockchainEstimatefee(req.query.blocks)
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