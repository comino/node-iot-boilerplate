var mongoose = require('mongoose');

function mongodb_connection(settings) {
    console.log(settings);
    return mongoose.connect(settings.URI, settings.OPTIONS);
}

module.exports = mongodb_connection;
