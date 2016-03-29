var should = require('chai').should();
var request = require('supertest');
var http = require('http');
var app = require('../auctionserver');
var agent = request.agent(app);

describe('GET /auction/api/user/login', function() {
	it('should return user as JSON', function(done) {
		agent
	        .get('/auction/api/user/login?name=test')
	        .end(function(err, res) {
	        	if (err) return done(err);
	            res.should.be.json;
	            var expected = {
	            	name: 'test',
	            	coin: 1000,
	            	inventory: [
	            	    { name: 'Bread', quantity: 30 },
	            	    { name: 'Carrot', quantity: 18 },
	            	    { name: 'Diamond', quantity: 1 }
	            	]
	            };
	            var result = JSON.parse(res.text);
	            result.name.should.equal(expected.name);
	            result.coin.should.equal(expected.coin);
	            result.inventory.length.should.equal(expected.inventory.length);
	            result.inventory[0].name.should.equal(expected.inventory[0].name);
	            result.inventory[0].quantity.should.equal(expected.inventory[0].quantity);
	            done();
	        });
	});
});

describe('GET /auction/api/user/get', function() {
	it('should return user as JSON if exist', function(done) {
		agent
	        .get('/auction/api/user/get?name=test')
	        .end(function(err, res) {
	        	if (err) return done(err);
	            res.should.be.json;
	            var expected = {
	            	name: 'test',
	            	coin: 1000,
	            	inventory: [
	            	    { name: 'Bread', quantity: 30 },
	            	    { name: 'Carrot', quantity: 18 },
	            	    { name: 'Diamond', quantity: 1 }
	            	]
	            };
	            var result = JSON.parse(res.text);
	            result.name.should.equal(expected.name);
	            result.coin.should.equal(expected.coin);
	            result.inventory.length.should.equal(expected.inventory.length);
	            result.inventory[0].name.should.equal(expected.inventory[0].name);
	            result.inventory[0].quantity.should.equal(expected.inventory[0].quantity);
	            done();
	        });
	});
	
	it('should return nothing if user not exist', function(done) {
		agent
	        .get('/auction/api/user/get?name=test1')
	        .end(function(err, res) {
	        	if (err) return done(err);
	            (!res.text).should.be.true;
	            done();
	        });
	});
});

describe('GET /auction/api/auction/current', function() {
	it('should return nothing if there is no auction in progress', function(done) {
		agent
	        .get('/auction/api/auction/current')
	        .end(function(err, res) {
	        	if (err) return done(err);
	            (!res.text).should.be.true;
	            done();
	        });
	});
});
