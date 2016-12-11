var NodeRSA = require('node-rsa');
var Promise = require("bluebird");
var randomstring = require("randomstring");

var moment = require('moment');


var errorHandle = function(req, res, errCode, msg){
    res.writeHead(errCode, {
        'Content-Type': 'application/json'
    });
    res.end(JSON.stringify({
        success: false,
        message: msg
    }));
};


// Adopted version of SSL Client auth wrapper: https://www.npmjs.com/package/client-certificate-auth
function auth_by_ssl_fingerprint(device, req, res) {
    return new Promise(function (resolve, reject) {
        if (!req.client.authorized) {
            errorHandle(401,'Unauthorized: Client certificate required' );
            return resolve();
            //return resolve(express_promise_401('Unauthorized: Client certificate required (' + req.client.authorizationError + ')'))
        }
        var cert = req.connection.getPeerCertificate();
        if (!cert || !Object.keys(cert).length) {
            errorHandle(500,'Client certificate was authenticated but certificate information could not be retrieved.');
            return resolve();
            //return resolve(express_promise_500('Client certificate was authenticated but certificate information could not be retrieved.'))
        }
        var dev_id_key_by_cert = cert.subject.OU.split("_")[1];
        if (device.ID != dev_id_key_by_cert) {
            errorHandle(500,'Bad SSL certificate OU device key');
            return resolve();
            //return resolve(express_promise_401('Bad SSL certificate OU device key'));
        }
        if (device.authSSLFingerprint != cert.fingerprint) {
            errorHandle(500,'Unauthorized by SSL fingerprint');
            return resolve();
            //return resolve(express_promise_401('Unauthorized by SSL fingerprint'));
        }
        return resolve()
    });
}

function auth_by_rsa_signature(device, req, res) {
    return new Promise(function (resolve, reject) {
        var one_time_key = req.body.one_time_key || 0;
        var data = req.body.data || 0;
        var signature = req.body.signature || "NO_SIGNATURE";
        var rsa_key_serv = new NodeRSA();
        rsa_key_serv.importKey(device.authRSAPublicKey);
        var is_valid = rsa_key_serv.verify(one_time_key + data, signature, "utf8", "base64");

        if (!is_valid) {
            return resolve( errorHandle(500,'Unauthorized by RSA Signature') );
            //resolve(express_promise_401('Unauthorized by RSA Signature'));
        }
        resolve();
    });
}

function auth_by_one_time_key(device, req, res) {
    var next_one_time_key = randomstring.generate({
        length: 5,
        charset: "alphanumeric"
    });
    res.setHeader("next-one-time-key", next_one_time_key);

    var r_device = req.app.redis_models.Device.get(req.params.devID);
    return r_device.one_time_key.getValue()
        .then(function (one_time_key) {
            return r_device.one_time_key.setValue(next_one_time_key)
                .then(function () {
                    return one_time_key;
                });
        })
        .then(function (one_time_key) {
            if (!req.body.hasOwnProperty("one_time_key") || req.body.one_time_key != one_time_key) {
                //console.log("Expecting/gotten", one_time_key, req.body.one_time_key, "next:", next_one_time_key)
                errorHandle(500,"Bad ONE TIME KEY authentication");
                return resolve();
                //return express_promise_401("Bad ONE TIME KEY authentication");
            }
            return null
        });
}


module.exports = function (req, res, next) {

    return req.app.mongoose_models.Device.findOne({
        ID: req.params.devID
    })
        .then(function (device) {
            if (device == null) {
                return errorHandle(req,res,422, 'Device not found (mdb)');
            }
            var pr_authentications = [];
            var one_time_key_promise = Promise.resolve();            // ONE TIME KEY AUTH should be first to regenerate one time key even on bad SSL/RSA auth

            if (req.app.settings.DEVICE.AUTHENTICATION_ONE_TIME_KEY) {
                one_time_key_promise = auth_by_one_time_key(device, req, res);
                pr_authentications.push(one_time_key_promise);
            }
            if (req.app.settings.DEVICE.AUTHENTICATION_SSL) {
                pr_authentications.push(one_time_key_promise.then(function() {
                        return auth_by_ssl_fingerprint(device, req, res);
                    })
                );
            }
            if (req.app.settings.DEVICE.AUTHENTICATION_RSA) {
                pr_authentications.push(one_time_key_promise.then(function() {
                        return auth_by_rsa_signature(device, req, res);
                    })
                );
            }

            if (pr_authentications.length == 0) {
                //console.warn("Caution! No Authentication protection used, relying on devID sent");
            }
            var r_device = req.app.redis_models.Device.get(req.params.devID);
            pr_authentications.concat([r_device]);

            return Promise.all(pr_authentications)
                .then(function () {
                    //req.app.db_redis.getAsync("devices:" + req.params.devID + ":is_alive").then(
                    //  function(val){
                    //      console.log("Device previous IS_ALIVE:", val);
                    //  }
                    //);
                    return r_device.is_alive.setValue(true);
                })
                .then(function () {
                    return r_device.is_alive.setValueExpiration(device.TTL);
                })
                .then(function () {
                    device.lastMessage = moment().unix();
                    return device.save();
                })
                .then(function () {
                    return new next();
                });
        });
};