module.exports = (shepherd) => {
  shepherd.get('/electrum/merkle/verify', (req, res, next) => {
    shepherd.verifyMerkleByCoin(req.query.coin, req.query.txid, req.query.height)
    .then((verifyMerkleRes) => {
      const successObj = {
        msg: 'success',
        result: {
          merkleProof: verifyMerkleRes,
        },
      };

      res.end(JSON.stringify(successObj));
    });
  });

  return shepherd;
};
