const express = require('express');
const	bodyParser = require('body-parser');

var shepherd = require('./routes/shepherd');
var app = express();

/*guiapp.use(function(req, res, next) {
	res.header('Access-Control-Allow-Origin', appConfig.dev ? '*' : 'http://127.0.0.1:3000');
	res.header('Access-Control-Allow-Headers', 'X-Requested-With');
	res.header('Access-Control-Allow-Credentials', 'true');
	res.header('Access-Control-Allow-Headers', 'Content-Type');
	res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
	next();
});*/

app.use(bodyParser.json({ limit: '1mb' })); // support json encoded bodies
app.use(bodyParser.urlencoded({
	limit: '1mb',
	extended: true,
})); // support encoded bodies

app.get('/', function(req, res) {
	res.send('Electrum Proxy Server');
});

app.use('/api', shepherd);

const server = require('http')
                .createServer(app)
                .listen(9999, '127.0.0.1');