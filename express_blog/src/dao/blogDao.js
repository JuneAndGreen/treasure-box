var query = require('../util/query');

module.exports = {
	/**
	 * 增
	 */
	add: function(blog, callback) {
		var that = this;

		query('INSERT INTO blog(title, username, content) VALUES (?, ?, ?)', [blog.title, blog.username, blog.content], function(err, rows) {
			if(err) {
				console.error(err.stack);
				return callback(err);
			}

			var insertId = rows.insertId;
			that.findOne(insertId, callback);
		});
	},
	/**
	 * 删
	 */
	del: function(id, callback) {
		query('DELETE FROM blog WHERE id=?', [id], function(err, rows) {
			if(err) console.error(err.stack);
			callback(err, rows);
		});
	},
	/**
	 * 改
	 */
	update: function(blog, callback) {
		var that = this;

		query('UPDATE blog SET title=?, content=? WHERE id=?', [blog.title, blog.content, blog.id], function(err, rows) {
			if(err) {
				console.error(err.stack);
				return callback(err);
			}

			that.findOne(blog.id, callback);
		});
	},
	/**
	 * 查
	 */
	findAll: function(callback) {
		query('SELECT * FROM blog', [], function(err, rows) {
			if(err) console.error(err.stack);
			callback(err, rows);
		});
	},
	findOne: function(id, callback) {
		query('SELECT * FROM blog WHERE id=?', [id], function(err, rows) {
			if(err) console.error(err.stack);
			callback(err, rows&&rows[0]);
		});
	}
};