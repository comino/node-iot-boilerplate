var mongoose = require('mongoose');

var deviceSchema = mongoose.Schema({

    deviceID:{
        type: String,
        default: " " + Math.random() + Math.random(),
        required : true
    },

    last_update: {type : Date , default : Date.now, required: true},
    model:{type: String, default:  "MyDevice" , required: true},
    secret : {type:String, required: true}

});

module.exports = mongoose.model('Devices', deviceSchema);


