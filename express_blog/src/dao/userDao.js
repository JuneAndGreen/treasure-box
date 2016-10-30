var query = require('../util/query');

module.exports = {
	/**
	 * 增
	 */
	add: function(user, callback) {
		var that = this;
		query('INSERT INTO user(username, password) VALUES (?, ?)', [user.username, user.password], function(err, rows) {
			if(err) return callback(err);

			var insertId = rows.insertId;
			that.findOne(insertId, function(err, user) {
				callback(err, user);
			});
		});
	},
	/**
	 * 查
	 */
	findOne: function(username, callback) {
		query('SELECT * FROM user WHERE username=?', [username], function(err, rows) {
			callback(err, rows&&rows[0]);
		});
	}
};