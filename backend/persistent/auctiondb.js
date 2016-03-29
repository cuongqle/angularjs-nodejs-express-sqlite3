var sqlite3 = require('sqlite3').verbose(); //persistent
var fs = require('fs');
var file = 'auction.db';
var exists = fs.existsSync(file);
var db = new sqlite3.Database(file);

exports.initialize = function() {
	if (!exists) {
		fs.openSync(file, "w");
	}
	
	db.serialize(function() {
		if(!exists) {
			db.run("CREATE TABLE user (name TEXT, coin INT)");
			db.run("CREATE TABLE inventory (user TEXT, item TEXT, quantity INT)");
			db.run("CREATE TABLE auction (seller TEXT, buyer TEXT, item TEXT, quantity INT)");
		}
	});
};

exports.addNewUser = function(name) {
	user = {
		name: name,
		coin: 1000,
		inventory: [
        	{ name: 'Bread', quantity: 30 },
        	{ name: 'Carrot', quantity: 18 },
        	{ name: 'Diamond', quantity: 1 }
		]	
	};
    
	db.serialize(function() {
		// insert to user
		db.run("INSERT INTO user (name, coin) VALUES (?,?)", user.name, user.coin);
		// insert into inventory
		for (var i = 0 ; i < user.inventory.length ; i++) {
	    	var item = user.inventory[i];
	    	db.run("INSERT INTO inventory (user, item, quantity) VALUES (?,?,?)", user.name, item.name, item.quantity);
	    };
	});
	
	return user;
};

exports.getUserByName = function(name, success) {
	var that = this;
	db.get("SELECT * FROM user WHERE name=\'" + name + "\'", function(err, user) {
		if (!!user) {
			that.getUserInventory(user, success);
		} else {
			success(user);
		}
	});
};

exports.getUserInventory = function(user, success) {
	db.each("SELECT item, quantity FROM inventory WHERE user=\'" + user.name + "\'", function(err, row) { 
		if (!user.inventory) {
    		user.inventory = [];
    	}
    	user.inventory.push( { name: row.item, quantity: row.quantity });
	}, function(err, rows) {
		success(user);
	});
};

exports.sellerCompleteAuction = function(auction, callback) {
	var that = this;
	this.getUserByName(auction.seller, function(seller) {
		// update coin
		seller.coin += auction.winningbid;
		// update inventory for seller
		for (var i = 0 ; i < seller.inventory.length; i ++) {
			var item = seller.inventory[i];
			if (item.name === auction.item.name) {
				item.quantity -= auction.quantity;
				break;
			}
		}
		// persistent
		that.updateUser(seller, callback);
	});
};

exports.buyerCompleteAuction = function(auction, callback) {
	var that = this;
	this.getUserByName(auction.bidder, function(bidder) {
		// update coin
		bidder.coin -= auction.winningbid;
		// update inventory for bidder
		for (var i = 0 ; i < bidder.inventory.length; i ++) {
			var item = bidder.inventory[i];
			if (item.name === auction.item.name) {
				item.quantity += auction.quantity;
				break;
			}
		}
		// persistent
		that.updateUser(bidder, callback);
	});
};

exports.updateUser = function(user, callback) {
	db.serialize(function() {
		// update coin
		db.run("UPDATE user SET coin = ? WHERE name = ?", [user.coin, user.name]);
		// update inventory
		for (var i = 0 ; i < user.inventory.length ; i++) {
	    	var item = user.inventory[i];
	    	db.run("UPDATE inventory SET quantity = ? WHERE user = ? AND item = ? ", [item.quantity, user.name, item.name]);
	    };
	    callback();
	});
};
