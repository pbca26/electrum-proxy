const express = require('express');
const	bodyParser = require('body-parser');
const compression = require('compression');
let shepherd = require('./routes/shepherd');
let app = express();

app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Headers', 'X-Requested-With');
	res.header('Access-Control-Allow-Credentials', 'true');
	res.header('Access-Control-Allow-Headers', 'Content-Type');
	res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
	next();
});

app.use(bodyParser.json({ limit: '1mb' })); // support json encoded bodies
app.use(bodyParser.urlencoded({
	limit: '1mb',
	extended: true,
})); // support encoded bodies

app.get('/', (req, res) => {
	res.send('Electrum Proxy Server');
});

app.use(compression({
	level: 9,
	threshold: 0,
}));
app.use('/api', shepherd);

let config = {
	https: false,
};
let server;

process.argv.forEach((val, index) => {
	if (val.indexOf('ip=') > -1) {
		config.ip = val.replace('ip=', '');
	} else if (val.indexOf('port=') > -1) {
		config.port = val.replace('port=', '');
	}
});

if (config.https) {
  const options = {
    key: fs.readFileSync('certs/priv.pem'),
    cert: fs.readFileSync('certs/cert.pem'),
  };
  server = require('https')
            .createServer(options, app)
            .listen(config.port || 8118, config.ip || 'localhost');
} else {
  server = require('http')
            .createServer(app)
            .listen(config.port || 8118, config.ip || 'localhost');
}

console.log(`Electrum Proxy Server is running at ${config.ip || 'localhost'}:${config.port || 8118}`);