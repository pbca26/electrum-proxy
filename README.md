# Electrum-proxy

Electrum server wrapper API for HTTP based apps. Simply mediates TCP (Electrum) and HTTP (any web browser) connections.

## Requirements

Node >= 7.x

## Setup

npm start ip=127.0.0.1 port=9999

Run npm install

## How to run

npm start

## Supported calls

Refer to Electrum Server doc for method specific params and outputs https://github.com/kyuupichan/electrumx/blob/master/docs/PROTOCOL.rst

### All calls are required to have a target Electrum server's IP and a port.

ex. GET /getbalance?ip=127.0.0.1&port=1111&address=RD1D2UgjiimRPbR8ZMFB21LimBgppcnaU1

#### [GET] getbalance eq. to blockchain.address.get_balance
params: ip, port, address where address is a valid pub address

ex. GET /getbalance?ip=127.0.0.1&port=1111&address=RD1D2UgjiimRPbR8ZMFB21LimBgppcnaU1

#### [GET] getblockinfo eq. to blockchain.block.get_header
params: ip, port, height where height is a valid blockchain height

ex. GET /getblockinfo?ip=127.0.0.1&port=1111&height=100000

#### [GET] getcurrentblock eq. to blockchain.numblocks.subscribe
params: ip, port

ex. GET /getcurrentblock?ip=127.0.0.1&port=1111

#### [GET] estimatefee eq. to blockchain.estimatefee
params: ip, port, blocks where blocks is a target number of blocks you want your transaction to be included within

ex. GET /estimatefee?ip=127.0.0.1&port=1111&blocks=10
* applies only to coin daemons that have built in support for smart fees

#### [GET] gettransaction eq. to blockchain.transaction.get
params: ip, port, txid where txid is a valid blockchain transaction hash

ex. GET /estimatefee?ip=127.0.0.1&port=1111&txid=a110b2ce1a4ab3c6182d3861100s0c1143b0e2473fbf1ddcdd4c4899c1349fb1

#### [GET] listtransactions eq. to blockchain.address.get_history
params: ip, port, address where address is a valid pub address

ex. GET /listtransactions?ip=127.0.0.1&port=1111&address=RD1D2UgjiimRPbR8ZMFB21LimBgppcnaU1

ex. GET /listtransactions?ip=127.0.0.1&port=1111&address=RD1D2UgjiimRPbR8ZMFB21LimBgppcnaU1&raw=true

ex. GET /listtransactions?ip=127.0.0.1&port=1111&address=RD1D2UgjiimRPbR8ZMFB21LimBgppcnaU1&raw=true&page=2&pagination=true

optional params: raw - return raw transaction data for all transactions, maxlength (only together with raw, default value 10). If raw=true transactions are sorted Z to A by timestamp value.

pagination=true - enable pagination

page - specific page number

pagesize - number within a range from 10 to 30, default 10

return format: txsCount - total transactions count for a specific address, pageSize - transactions per page, page, pagesTotal, transactions - transactions object

#### [GET] listunspent eq. to blockchain.address.listunspent
params: ip, port, address where address is a valid pub address

ex. GET /listunspent?ip=127.0.0.1&port=1111&address=RD1D2UgjiimRPbR8ZMFB21LimBgppcnaU1

#### [POST] pushtx eq. to blockchain.transaction.broadcast
params: ip, port, address where address is a valid pub address

ex. POST /pushtx data: { ip: 127.0.0.1, port: 1111, rawtx: 010000000001010000000000000000000000000000000000000000000000000000000000000000ffffffff061368b73f0101ffffffff0250d6dc01000000001976a914bfc6e590610d2f598a340bf5ff3f2675c7903af188ac0000000000000000222b24cc21a9ede2f61c3f71d1defd3fa999dfa36953755c690689499462b48bebd332974e8cc91120000000000000000000000000000000000000000000000000000000000000000000000000 }

#### [GET] getmerkle eq. to blockchain.transaction.get_merkle
params: ip, port, txid, height where txid is a valid blockchain transaction hash and height is a valid blockchain height

ex. GET /getmerkle?ip=127.0.0.1&port=1111&txid=a110b2ce1a4ab3c6182d3861100s0c1143b0e2473fbf1ddcdd4c4899c1349fb1&height=100000

#### [GET] server/version eq. to server.version
params: ip, port

ex. GET /server/version?ip=127.0.0.1&port=1111