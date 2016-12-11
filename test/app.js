process.env.NODE_ENV = 'test'

var chai = require('chai');
var expect = chai.expect;
var chaiHttp = require('chai-http');
var app = require('../app.js')
var expect = chai.expect();
var should = chai.should();


chai.use(chaiHttp);

describe('TEST APP: ', function() {
  it('Should be able to run app.js and returns 200 on GET /', function(done){
  	chai.request(app)
		.get('/')
		.end(function(err, res){
			//console.log( res.status );
			res.should.have.status(200);
			done();
		})
  }); 

});