var jwt = require('jwt-simple');
var config = require('../config/config');
var UserModel = require('../models/users');


module.exports = function(req, res, next) {
    /** Getting the token and the key values from the request object */

    var token = utilities.getToken(req);
    var key = utilities.getKey(req);
    var decoded = {};

    if (token && key) {
        try {  decoded = jwt.decode(token, config.JWT.SECRET);  }
        catch (err) {
            return res.status(500).json({
                "status": 500,
                "message": "Invalid Session",
                "error": err
            });
        }

        var keyRegEx = new RegExp('^' + key + '$', 'i');

        if (decoded.exp <= Date.now() || !keyRegEx.test(decoded.user.username)) {
            return res.status(400).json({ "status": 400, "message": "Token Expired" });
        }

        UserModel.getUser(key, function(err, dbUser){
            if (!err && dbUser) {

                // After validation allow access to only api, and if user is admin allow access to Admin routes
                if ((req.url.indexOf('admin') >= 0 && dbUser.role == 'admin') ||
                    (req.url.indexOf('admin') < 0 && req.url.indexOf('/v0/') >= 0)) {

                    //Save current authenticated user in req object
                    req.currentUser = dbUser;

                    next(); // authentication successful, continue
                }
                else {
                    return res.status(403).json({ "status": 403, "message": "Not Authorized" });
                }
            }
            else {
                // User does not exists, respond back with a 401
                return res.status(401).json({ "status": 401, "message": "Invalid User" });
            }
        });
    }
    else {
        return res.status(401).json({ "status": 401, "message": "Invalid Token or Key" });
    }
};