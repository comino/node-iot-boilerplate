/*

   .g8"""bgd                               db
 .dP'     `M
 dM'       `  ,pW"Wq.  `7MMpMMMb.pMMMb.  `7MM   ,pW"Wq.
 MM          6W'   `Wb   MM    MM    MM    MM  6W'   `Wb
 MM.         8M     M8   MM    MM    MM    MM  8M     M8
 `Mb.     ,' YA.   ,A9   MM    MM    MM    MM  YA.   ,A9
   `"bmmmd'   `Ybmd9'  .JMML  JMML  JMML..JMML. `Ybmd9'

                                       IoT- Boilerplate
Licence: MIT
 */

var app = require("./app");
var http = require('http');
var https = require('https');
var fs = require('fs');

function processError(port, error) {
    if (error.syscall !== 'listen') {
        throw error;
    }
    var bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;

    var msg = "";
    switch (error.code) {
        case 'EACCES':
            msg = 'Cannot bind ' + bind + ', it requires elevated privileges';
            break;
        case 'EADDRINUSE':
            msg = 'Cannot bind ' + bind + ', it is already in use';
            break;
        default:
            throw error;
    }
    console.error(msg);
    process.exit(1);
}


// HTTP Server
if (app.config.HTTP.ENABLED) {
    var server = http.createServer(app).listen(app.config.HTTP.PORT, function () {
        console.log("HTTP server started at port " + app.config.HTTP.PORT);
    });
    server.on('error', function (error) {
        processError(app.config.HTTP.PORT, error)
    });
}


// HTTPS Server
if (app.config.HTTPS.ENABLED || true ) {
    var options = {};
    options.key = app.config.HTTPS.PRIVATE_KEY || fs.readFileSync(app.config.HTTPS.PRIVATE_KEY_FILE);
    options.cert = app.config.HTTPS.CERTIFICATE || fs.readFileSync(app.config.HTTPS.CERTIFICATE_FILE);
    //
/*   options.ciphers =  ["DHE-RSA-AES128-GCM-SHA256",
		"DHE-RSA-AES128-SHA256",
		"DHE-RSA-AES256-SHA256",
		"!RC4",
		"HIGH",
		"!MD5",
		"!aNULL",
		"!DES",
		"!PSK"
	].join(":"),*/
    options.requestCert = true;  // SSL client auth
    options.rejectUnauthorized = false;

    var secure_server = https.createServer(options, app);

    secure_server.on('secureConnection', function (tlsSocket) {
        // The default fragment size of 16kB is problematic for lots of embedded devices
        // This paramater needs to be in sync with device's implementation!
        tlsSocket.setMaxSendFragment(app.config.HTTPS.FRAGMENT_SIZE);
    });

    secure_server.on('error', function (error) {
        processError(app.config.HTTPS.PORT, error)
    });

    secure_server.listen(app.config.HTTPS.PORT, function () {
        console.log("HTTPS server started at port " + app.config.HTTPS.PORT);
    });

}

